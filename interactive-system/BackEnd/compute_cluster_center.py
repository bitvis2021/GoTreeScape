from data_process import read_csv_data  
import random, math, json
from process_json import load_json_obj, save_json_obj
from load_data import load_txt_file
import numpy as np

cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_2_3.json'
cluster_tree_result_path1 = 'sourcedata/mds_clustering1_tree_with_depth_range_parent_weight100_2_3.json'

def load_cluster_result():
    '''
        load the cluster representative results
    '''
    cluster_tree = load_json_obj(cluster_tree_result_path)
    return cluster_tree

def load_projection_results():
    '''
        read the projection results
    '''
    projection_results = read_csv_data('sourcedata/mds-projection-results.csv')
    return projection_results[1:]

def compute_cluster_center(cluster_tree, projection_results):
	'''
		compute the center of each cluster in the hierarchical clustering results
	'''
	inner_leaf = cluster_tree["inner_leaf"]
	item_list = []
	for item_index in inner_leaf:
		item = projection_results[item_index]
		item_list.append(item)
	item_list = np.array(item_list).astype(np.float)
	pos_avg = item_list.mean(axis=0)
	cluster_tree["cluster_center"] = pos_avg.tolist()
	if "left" in cluster_tree:
		compute_cluster_center(cluster_tree["left"], projection_results)
	if "right" in cluster_tree:
		compute_cluster_center(cluster_tree["right"], projection_results)


if __name__ == '__main__':
	cluster_tree = load_cluster_result()
	projection_results = load_projection_results()
	compute_cluster_center(cluster_tree, projection_results)
	save_json_obj(cluster_tree, cluster_tree_result_path1)