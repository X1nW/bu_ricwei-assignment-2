import numpy as np
import random

class KMeans:
    def __init__(self, num_clusters=3, init_method='random'):
        self.num_clusters = num_clusters
        self.init_method = init_method
        self.colors = []
        self.manual_centroids = None

    def set_manual_centroids(self, centroids):
        """Set manual centroids directly from user input."""
        self.manual_centroids = centroids

    def initialize_centroids(self, data):
        if self.manual_centroids:
            return self.manual_centroids
        elif self.init_method == 'random':
            return random.sample(data, self.num_clusters)
        elif self.init_method == 'farthest_first':
            return self.farthest_first_initialization(data)
        elif self.init_method == 'kmeans++':
            return self.kmeans_plus_plus_initialization(data)

    def farthest_first_initialization(self, data):
        centroids = [random.choice(data)]
        while len(centroids) < self.num_clusters:
            farthest_point = max(data, key=lambda point: min(np.linalg.norm(np.array(point) - np.array(c)) for c in centroids))
            centroids.append(farthest_point)
        return centroids

    def kmeans_plus_plus_initialization(self, data):
        centroids = [random.choice(data)]  # Start with a random centroid
        for _ in range(1, self.num_clusters):
            # Calculate distances from points to the nearest centroid
            distances = [min(np.linalg.norm(np.array(point) - np.array(c)) ** 2 for c in centroids) for point in data]
            total_distance = sum(distances)
            probabilities = [d / total_distance for d in distances]  # Normalize the distances to probabilities
            # Select a new centroid with weighted probability
            cumulative_probabilities = np.cumsum(probabilities)
            random_value = random.random()
            for i, cum_prob in enumerate(cumulative_probabilities):
                if random_value < cum_prob:
                    centroids.append(data[i])
                    break
        return centroids

    def assign_clusters(self, data, centroids):
        clusters = {i: [] for i in range(self.num_clusters)}
        for point in data:
            distances = [np.linalg.norm(np.array(point) - np.array(c)) for c in centroids]
            cluster = distances.index(min(distances))  # Assign the closest centroid
            clusters[cluster].append(point)  # Append point to the correct cluster
        return clusters

    def recalculate_centroids(self, clusters):
        return [np.mean(points, axis=0).tolist() if points else random.choice(points) for points in clusters.values()]

    def fit(self, data):
        steps = []
        centroids = self.initialize_centroids(data)
        
        # Generate a list of distinct colors for each cluster
        self.colors = [f'rgb({random.randint(50,255)},{random.randint(50,255)},{random.randint(50,255)})' for _ in range(self.num_clusters)]
        
        for _ in range(10):  # Limit the number of iterations
            clusters = self.assign_clusters(data, centroids)
            cluster_points = {}
            
            # Collect points for each cluster along with corresponding colors
            for cluster_id, points in clusters.items():
                cluster_points[cluster_id] = {
                    'points': points,
                    'color': self.colors[cluster_id]  # Assign a color to each cluster
                }
            
            steps.append({
                'centroids': centroids, 
                'clusters': cluster_points,  # Include cluster points and colors
            })
            
            new_centroids = self.recalculate_centroids(clusters)
            if centroids == new_centroids:
                break
            centroids = new_centroids
        return steps
