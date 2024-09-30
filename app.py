from flask import Flask, render_template, jsonify, request
import numpy as np
from kmeans import KMeans

app = Flask(__name__)

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route to generate a new random dataset
@app.route('/generate_data', methods=['POST'])
def generate_data():
    num_points = int(request.form.get('num_points', 100))
    data = np.random.randn(num_points, 2).tolist()
    return jsonify(data)

# Route to run KMeans and return step-by-step results
@app.route('/run_kmeans', methods=['POST'])
def run_kmeans():
    data = request.json['data']
    num_clusters = int(request.json['num_clusters'])
    init_method = request.json['init_method']
    
    # If manual centroids are provided, use them instead of initializing
    manual_centroids = request.json.get('manual_centroids', None)
    
    kmeans = KMeans(num_clusters=num_clusters, init_method=init_method)
    
    # If manual initialization, set centroids directly
    if init_method == 'manual' and manual_centroids:
        kmeans.set_manual_centroids(manual_centroids)
    
    # Run KMeans and get steps
    steps = kmeans.fit(data)
    return jsonify(steps)

if __name__ == '__main__':
    app.run(debug=True, port=3000)
