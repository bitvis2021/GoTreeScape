################################################################################
# compute the latent vector of each cluster in the clustering results    
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
from dsl_collection import compute_tree_vis_index
from process_csv import read_csv_data, save_csv_data
from process_json import load_json_obj, save_json_obj
import numpy as np

latent_vector_list = []
cluster_content_umap = []
cluster_tree_umap = []

def compute_leaf_cluster_avg_amount(leaf_cluster_index):
    '''
    '''
    cluster_content = cluster_content_umap[leaf_cluster_index]
    cluster_latent_vector_list = []
    for item_index in cluster_content:
        item_index = int(item_index)
        cluster_latent_vector_list.append(latent_vector_list[item_index])
    for i in range(len(cluster_latent_vector_list)):
        for j in range(len(cluster_latent_vector_list[i])):
            cluster_latent_vector_list[i][j] = float(cluster_latent_vector_list[i][j])
    # init cluster_latent_vector_list
    cluster_latent_vector_list = np.array(cluster_latent_vector_list)
    avg_cluster_latent_vector_list = []
    for i in range(len(cluster_latent_vector_list[0])):
        avg_cluster_latent_vector_val = np.mean(cluster_latent_vector_list[:,i])
        avg_cluster_latent_vector_list.append(avg_cluster_latent_vector_val)
    item_amount = len(cluster_content)
    return item_amount, avg_cluster_latent_vector_list

def compute_avg_latent_vector(cluster_tree_umap):
    '''
        compute the position of the latent vectors
    '''
    if 'left' not in cluster_tree_umap and 'right' not in cluster_tree_umap:
        inner_leaf = cluster_tree_umap['inner_leaf']
        leaf_cluster_index = inner_leaf[0]
        item_amount, avg_latent_vector = compute_leaf_cluster_avg_amount(leaf_cluster_index)
        cluster_tree_umap['item_amount'] = item_amount
        cluster_tree_umap['avg_latent_vector'] = avg_latent_vector
        return
    if 'left' in cluster_tree_umap:
        compute_avg_latent_vector(cluster_tree_umap['left'])
    if 'right' in cluster_tree_umap:
        compute_avg_latent_vector(cluster_tree_umap['right'])
    left_item_amount = 0
    right_item_amount = 0
    left_avg_latent_vector = np.array([])
    right_avg_latent_vector = []
    if 'left' in cluster_tree_umap:
        if 'item_amount' in cluster_tree_umap['left']:
            left_item_amount = cluster_tree_umap['left']['item_amount']
        if 'avg_latent_vector' in cluster_tree_umap['left']:
            left_avg_latent_vector = np.array(cluster_tree_umap['left']['avg_latent_vector'])
    if 'right' in cluster_tree_umap:
        if 'item_amount' in cluster_tree_umap['right']:
            right_item_amount = cluster_tree_umap['right']['item_amount']
        if 'avg_latent_vector' in cluster_tree_umap['right']:
            right_avg_latent_vector = np.array(cluster_tree_umap['right']['avg_latent_vector'])
    parent_avg_latent_vector = (left_avg_latent_vector * left_item_amount + right_avg_latent_vector * right_item_amount) / (left_item_amount + right_item_amount)
    cluster_tree_umap['avg_latent_vector'] = parent_avg_latent_vector.tolist()
    cluster_tree_umap['item_amount'] = left_item_amount + right_item_amount

def init_cluster_content_umap():
    global cluster_content_umap
    cluster_content_umap = read_csv_data('./sourcedata/cluster_content-umap.csv')

def init_cluster_tree_umap():
    global cluster_tree_umap
    cluster_tree_umap = load_json_obj('./sourcedata/clustering_tree-with_node_index_depth_parent.json') #clustering_tree-umap

def init_latent_vector_results():
    '''
        initialize the latent vector collections
    '''
    global latent_vector_list
    latent_vector_list = read_csv_data('./sourcedata/latent_vector_results.csv')
    
if __name__ == '__main__':
    init_cluster_content_umap()
    init_cluster_tree_umap()
    init_latent_vector_results()
    compute_avg_latent_vector(cluster_tree_umap)
    save_json_obj(cluster_tree_umap, './sourcedata/clustering_tree-with_node_index_depth_parent_amount_avg.json')


