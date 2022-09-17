##################################################
## This code is for assigning the tree visualization item with the cluster index
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
import sys, os
from process_json import load_json_obj, save_json_obj
from process_csv import read_csv_data, save_csv_data

def get_projection_results():
    '''
        read files and send back the embedding results
    '''
    folder_name = 'mds'
    mds_projection_file_name = 'mds-projection-results.csv'
    mds_projection_results = read_csv_data(os.path.join(folder_name, mds_projection_file_name))
    return mds_projection_results[1:]

def extract_leaf_clusters(cluster_tree, leaf_cluster_list):
    '''
        extract the leaf node list from the cluster tree
    '''
    if 'left' not in cluster_tree and 'right' not in cluster_tree:
        cluster_index = len(leaf_cluster_list)
        leaf_cluster_list.append({'inner_leaf': cluster_tree['inner_leaf'], 'cluster_index': cluster_index}) #
    if 'left' in cluster_tree:
        extract_leaf_clusters(cluster_tree['left'], leaf_cluster_list)
    if 'right' in cluster_tree:
        extract_leaf_clusters(cluster_tree['right'], leaf_cluster_list)

def assign_item_cluster_index(leaf_cluster_list, projection_results):
    '''
        assign the cluster index to items
    '''
    clusterIndexSet = set()
    for leaf_cluster_obj in leaf_cluster_list:
        inner_leaf = leaf_cluster_obj['inner_leaf']
        cluster_index = leaf_cluster_obj['cluster_index']
        # add cluster index for the inner_leaf attribute
        for inner_leaf_index in inner_leaf:
            projection_results[inner_leaf_index].append(cluster_index)
            if cluster_index not in clusterIndexSet:
                clusterIndexSet.add(cluster_index)
        # add cluster index for the extended inner_leaf attribute
        if 'extend_inner_leaf' in leaf_cluster_obj:
            extend_inner_leaf = leaf_cluster_obj['extend_inner_leaf']
            for inner_leaf_index in extend_inner_leaf:
                projection_results[inner_leaf_index].append(cluster_index)
                if cluster_index not in clusterIndexSet:
                    clusterIndexSet.add(cluster_index)
    print('clusterIndexSet length', len(clusterIndexSet))

def load_clustering_tree(inner_folder_name, file_name):
    '''
        load the clustering results
    '''
    folder_name = "simplified_hierarchical_cluster"
    clustering_tree_result = load_json_obj(os.path.join(folder_name, inner_folder_name, file_name))
    return clustering_tree_result

def save_leaf_cluster_list(leaf_cluster_list, inner_folder_name):
    '''
        save the leaf cluster list
    '''
    folder_name = 'data'
    leaf_cluster_list_file_name = 'leaf-cluster-list.json'
    save_json_obj(os.path.join(folder_name, inner_folder_name, leaf_cluster_list_file_name), leaf_cluster_list)

def save_projection_results_with_index(projection_results):
    '''
        save the projection results which contains the cluster index attribute
    '''
    folder_name = 'mds'
    mds_projection_file_name = 'mds-projection-results_cluster-index.csv'
    save_csv_data(os.path.join(folder_name, mds_projection_file_name), projection_results)

if __name__ == '__main__':
    inner_folder_name = sys.argv[1] # 10_1631432994
    file_name = sys.argv[2] + '.json' # clustering-tree-simplified_519, clustering-tree-simplified_1039, clustering-tree-simplified_623
    projection_results = get_projection_results()
    clustering_tree = load_clustering_tree(inner_folder_name, file_name)
    leaf_cluster_list = []
    extract_leaf_clusters(clustering_tree, leaf_cluster_list)
    print('leaf cluster list length', len(leaf_cluster_list))
    # leaf_cluster_folder_name = 'hierarchical_cluster_leaf'
    # save_leaf_cluster_list(leaf_cluster_list, leaf_cluster_folder_name)
    assign_item_cluster_index(leaf_cluster_list, projection_results)
    save_projection_results_with_index(projection_results)



