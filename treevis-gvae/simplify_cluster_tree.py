##################################################
## this code is for simplifying the hierarchical clustering results according to the threshold
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
import sys, os
from process_json import load_json_obj, save_json_obj
from process_csv import read_csv_data, save_csv_data
import numpy as np

def load_hierarchical_cluster(inner_folder_name):
    '''
    '''
    folder_name = 'hierarchical_cluster'
    clustering_tree_file_name = 'clustering-tree-simplified.json'
    hierarchical_cluster_tree = load_json_obj(os.path.join(folder_name, inner_folder_name, clustering_tree_file_name))
    return hierarchical_cluster_tree

def simplify_cluster_tree(cluster_tree, threshold):
    '''
        simplify the hierarchical dataset
    '''
    if 'inner_leaf' in cluster_tree:
        inner_leaf_length = len(cluster_tree['inner_leaf'])
        if inner_leaf_length > threshold:
            if 'left' in cluster_tree:
                simplify_cluster_tree(cluster_tree['left'], threshold)
            if 'right' in cluster_tree:
                simplify_cluster_tree(cluster_tree['right'], threshold)
        else:
            if 'left' in cluster_tree:
                del cluster_tree['left']
            if 'right' in cluster_tree:
                del cluster_tree['right']
    else:
        return

def save_simplified_cluster_tree(inner_folder_name, cluster_tree, threshold):
    '''
        save the simplified hierarchical data
    '''
    folder_name = 'simplified_hierarchical_cluster'
    clustering_tree_file_name = 'clustering-tree-simplified_' + str(threshold) + '.json'
    save_json_obj(os.path.join(folder_name, inner_folder_name, clustering_tree_file_name), cluster_tree)


if __name__ == "__main__":
    '''
        load the hierarchical data and simplify the clustering tree visualization 
    '''
    folder_name = str(sys.argv[1])
    cluster_num = int(sys.argv[2])
    cluster_tree = load_hierarchical_cluster(folder_name)
    # the sum of the whole tree visualization collection
    node_sum = len(cluster_tree['inner_leaf'])
    threshold = node_sum // cluster_num
    simplify_cluster_tree(cluster_tree, threshold)
    save_simplified_cluster_tree(folder_name, cluster_tree, threshold)

