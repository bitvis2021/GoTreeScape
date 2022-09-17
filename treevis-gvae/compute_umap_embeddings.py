##################################################
## compute the umap projection results according to the embeddings
##################################################
import sys, os
import umap
from process_csv import read_csv_data, save_csv_data

import numpy as np
import random

def compute_umap_embedding_results(model_index, timestamp):
    embedding_results_file_name = 'embeddings-results.csv'
    # parameters of the umap configuration
    n_neighbors = 100
    min_dist = 1
    n_components = 2
    umap_embedding_results_file_name = 'umap-embeddings-results_' + str(n_neighbors) + '_' + str(min_dist) + '_' + str(n_components) + '.csv'
    folder_path = os.path.join('embeddings', str(model_index) + '_' + timestamp)
    print('folder_path', folder_path)
    embedding_results = read_csv_data(os.path.join(folder_path, embedding_results_file_name))
    # embedding = umap.UMAP().fit_transform(embedding_results)
    embedding = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, metric='euclidean').fit_transform(embedding_results)
    save_csv_data(os.path.join(folder_path, umap_embedding_results_file_name), embedding)

# umap.plot.points(embedding)
if __name__ == '__main__':
    model_index = sys.argv[1]
    timestamp = sys.argv[2]
    random.seed(int(model_index))
    np.random.seed(int(model_index))
    print('compute_umap_embeddings', model_index)
    compute_umap_embedding_results(model_index, timestamp)