document.addEventListener('DOMContentLoaded', () => {
    const plotDiv = document.getElementById('plot');
    let dataset = [];
    let kmeansSteps = [];
    let currentStep = 0;
    let manualCentroids = [];  // Store manually selected centroids

    // Generate a new random dataset
    document.getElementById('generate_data').addEventListener('click', () => {
        const numPoints = 100;  // Customize the number of points
        fetch('/generate_data', {
            method: 'POST',
            body: new URLSearchParams({ 'num_points': numPoints })
        })
        .then(response => response.json())
        .then(data => {
            dataset = data;
            manualCentroids = [];  // Reset manual centroids when new data is generated
            plotData(dataset);
            document.getElementById('step_through').disabled = true;
            document.getElementById('run_to_convergence').disabled = true;
            document.getElementById('reset').disabled = false;
        });
    });

    // Plot the dataset using Plotly
    function plotData(data, centroids = [], clusters = {}) {
        const traces = [];

        // Plot each cluster with its assigned color
        if (Object.keys(clusters).length > 0) {
            Object.keys(clusters).forEach((clusterIndex) => {
                const points = clusters[clusterIndex].points;
                const color = clusters[clusterIndex].color;  // Use the correct color for each cluster
                const traceData = {
                    x: points.map(point => point[0]),
                    y: points.map(point => point[1]),
                    mode: 'markers',
                    marker: { color: color },  // Assign the color
                    type: 'scatter',
                    name: `Cluster ${clusterIndex}`
                };
                traces.push(traceData);
            });
        } else {
            // If no clusters yet, plot the raw data points
            const traceData = {
                x: data.map(point => point[0]),
                y: data.map(point => point[1]),
                mode: 'markers',
                type: 'scatter'
            };
            traces.push(traceData);
        }

        // Plot manually selected centroids if available
        if (manualCentroids.length > 0) {
            const centroidTrace = {
                x: manualCentroids.map(c => c[0]),
                y: manualCentroids.map(c => c[1]),
                mode: 'markers',
                marker: { color: 'red', size: 12 },
                type: 'scatter',
                name: 'Manual Centroids'
            };
            traces.push(centroidTrace);
        }

        Plotly.newPlot(plotDiv, traces);  // Finally, plot the updated data
    }

    // Enable manual centroid selection via point-and-click
    plotDiv.on('plotly_click', (eventData) => {
        const initMethod = document.getElementById('init_method').value;

        // Only allow centroid selection in "manual" initialization mode
        if (initMethod === 'manual') {
            const clickedX = eventData.points[0].x;
            const clickedY = eventData.points[0].y;

            // Add the selected point as a centroid
            manualCentroids.push([clickedX, clickedY]);

            // Plot the dataset again to include the newly selected centroids
            plotData(dataset, manualCentroids);

            // Enable KMeans buttons once enough centroids have been selected
            if (manualCentroids.length === parseInt(document.getElementById('num_clusters').value)) {
                document.getElementById('step_through').disabled = false;
                document.getElementById('run_to_convergence').disabled = false;
            }
        }
    });

    // Step through the KMeans algorithm
    document.getElementById('step_through').addEventListener('click', () => {
        const numClusters = document.getElementById('num_clusters').value;
        const initMethod = document.getElementById('init_method').value;

        fetch('/run_kmeans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataset, num_clusters: numClusters, init_method: initMethod, manual_centroids: manualCentroids })
        })
        .then(response => response.json())
        .then(steps => {
            kmeansSteps = steps;
            stepThroughKMeans();
        });
    });

    // Step through KMeans process
    function stepThroughKMeans() {
        if (currentStep < kmeansSteps.length) {
            const step = kmeansSteps[currentStep];
            plotData(dataset, step.centroids, step.clusters);  // Include clusters with colors
            currentStep++;
        }
    }

    // Handle "Run to Convergence"
    document.getElementById('run_to_convergence').addEventListener('click', () => {
        const numClusters = document.getElementById('num_clusters').value;
        const initMethod = document.getElementById('init_method').value;

        fetch('/run_kmeans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataset, num_clusters: numClusters, init_method: initMethod, manual_centroids: manualCentroids })
        })
        .then(response => response.json())
        .then(steps => {
            kmeansSteps = steps;
            runToConvergence();
        });
    });

    // Function to loop through all steps at once
    function runToConvergence() {
        for (let i = 0; i < kmeansSteps.length; i++) {
            setTimeout(() => {
                const step = kmeansSteps[i];
                plotData(dataset, step.centroids, step.clusters);
            }, i * 1000);  // Add delay to simulate the process over time
        }
    }

    // Reset the algorithm to start over
    document.getElementById('reset').addEventListener('click', () => {
        currentStep = 0;
        manualCentroids = [];
        kmeansSteps = [];
        document.getElementById('step_through').disabled = true;
        document.getElementById('run_to_convergence').disabled = true;
        document.getElementById('reset').disabled = true;
        plotData(dataset);  // Reset the plot to show the raw data again
    });
});
