################################################################################
# Test MDS projection method
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
from process_json import load_json_obj, save_json_obj
import os

def load_cluster_result():
    '''
        load the cluster representative results
    '''
    global cluster_tree_with_depth_range_parent
    cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10.json'
    cluster_tree_with_depth_range_parent = load_json_obj(cluster_tree_result_path)
    return cluster_tree_with_depth_range_parent

def compute_inner_leaf_representative_diff(cluster_result, diff_dict):
    '''
        compute the different of inner leaf and representative difference
    '''
    node_index = 'node-' + str(cluster_result['index'])
    inner_leaf = cluster_result['inner_leaf']
    representative = cluster_result['representative']
    node_depth = cluster_result['depth']
    diff_dict[node_index] = {'inner_leaf': len(inner_leaf), 'representative': len(representative), 'diff': len(inner_leaf) - len(representative), 'node_depth': node_depth}
    if 'left' in cluster_result:
        compute_inner_leaf_representative_diff(cluster_result['left'], diff_dict)
    if 'right' in cluster_result:
        compute_inner_leaf_representative_diff(cluster_result['right'], diff_dict)
        
if __name__ == "__main__":
    cluster_result = load_cluster_result()
    diff_dict = {}
    compute_inner_leaf_representative_diff(cluster_result, diff_dict)
    save_json_obj(diff_dict, 'test/inner_leaf_representative_diff.json')
