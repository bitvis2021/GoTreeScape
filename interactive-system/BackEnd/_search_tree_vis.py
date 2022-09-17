################################################################################
# search for the target tree visualization according to the latent vector    
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
from dsl_collection import compute_tree_vis_index
from process_csv import read_csv_data, save_csv_data
from process_json import load_json_obj, save_json_obj
import numpy as np
from heapq import nsmallest
import os
from threading import Thread
import random, math

latent_vector_list = []
cluster_tree_umap_with_amount_avg = {}
cluster_content_umap = []
all_cluster_nearest_neighbor = {}
cluster_tree_node_dict = {}

node_index_leaf_cluster_dict = {}
leaf_cluster_interior_cluster_dict = {}

NEIGHBOR_AMOUNT = 500
FINAL_NEIGHBOR_AMOUNT = 50

def compute_vector_dist(subtree_avg_latent_vector, tree_vis_latent_vector):
    '''
    '''
    subtree_avg_latent_vector = np.array(subtree_avg_latent_vector)
    tree_vis_latent_vector = np.array(tree_vis_latent_vector)
    return np.linalg.norm(subtree_avg_latent_vector - tree_vis_latent_vector)

def traverse_tree_and_get_cluster(cluster_tree_umap, tree_vis_latent_vector):
    '''
        compute the interior cluster id according to the latent vector
    '''
    # if 'left' not in cluster_tree_umap and 'right' not in cluster_tree_umap:
    if 'left' in cluster_tree_umap and 'right' in cluster_tree_umap:
        left_avg_latent_vector = cluster_tree_umap['left']['avg_latent_vector']
        right_avg_latent_vector = cluster_tree_umap['right']['avg_latent_vector']
        distance_left = compute_vector_dist(left_avg_latent_vector, tree_vis_latent_vector)
        distance_right = compute_vector_dist(right_avg_latent_vector, tree_vis_latent_vector)
        if distance_left > distance_right:
            return traverse_tree_and_get_cluster(cluster_tree_umap['right'], tree_vis_latent_vector)
        elif distance_right > distance_left:
            return traverse_tree_and_get_cluster(cluster_tree_umap['left'], tree_vis_latent_vector)
    if 'left' not in cluster_tree_umap and 'right' not in cluster_tree_umap:
        return cluster_tree_umap["interior-cluster-index"]


def transform_list_str_to_float(tree_vis_latent_vector):
    '''
        transform string to float
    '''
    for i in range(len(tree_vis_latent_vector)):
        tree_vis_latent_vector[i] = float(tree_vis_latent_vector[i])
    return tree_vis_latent_vector

def save_traverse_path_cluster(traverse_path_clusters, tree_vis_cluster_index):
    '''
    '''
    traverse_path_cluster_folder_name = './traverse_path_cluster'
    if not os.path.exists(traverse_path_cluster_folder_name):
        os.makedirs(traverse_path_cluster_folder_name)
    save_json_obj(traverse_path_clusters, os.path.join(traverse_path_cluster_folder_name, str(tree_vis_cluster_index) + '.json'))


def compute_single_level_nearest_neighbor (interior_cluster_index, tree_vis_latent_vector, tree_vis_index, nearest_neighbor_res):
    '''
        compute the nearest neighbor of a single level
    '''
    interior_parent_cluster_index = cluster_tree_node_dict[interior_cluster_index]['parent']
    if interior_parent_cluster_index == -1 or interior_parent_cluster_index == '-1':
        return
    # continue the traverse
    interior_parent_cluster_index = str(interior_parent_cluster_index)
    sibling_cluster_list = cluster_tree_node_dict[interior_parent_cluster_index]['interior_cluster']
    parent_cluster_depth = cluster_tree_node_dict[interior_parent_cluster_index]['depth']
    for sibling_cluster_index in sibling_cluster_list:
        sibling_cluster_index = str(sibling_cluster_index)
        if sibling_cluster_index != interior_cluster_index:
            nearest_neighbor_list = compute_nearest_neighbor_from_interior_cluster(tree_vis_latent_vector, sibling_cluster_index, tree_vis_index)
            nearest_neighbor_res[parent_cluster_depth] = nearest_neighbor_list
    # save nearest_neighbor_res, and the name is the 
    save_traverse_path_cluster(nearest_neighbor_res, tree_vis_index)
    compute_single_level_nearest_neighbor(interior_parent_cluster_index, tree_vis_latent_vector, tree_vis_index, nearest_neighbor_res)

# def compute_nearest_neighbor_from_all_cluster(interior_cluster_index, tree_vis_latent_vector, tree_vis_index):
#     '''
#         this function enables to compute the nearest neighbor from all cluster from this cluster to the root cluster
#     '''
#     print('interior_cluster_index', interior_cluster_index)
#     interior_cluster_index = str(interior_cluster_index)
#     interior_cluster_depth = cluster_tree_node_dict[interior_cluster_index]['depth']
#     print('interior_cluster_depth', interior_cluster_depth)
#     nearest_neighbor_list = compute_nearest_neighbor_from_interior_cluster(tree_vis_latent_vector, interior_cluster_index)
#     nearest_neighbor_res = {}
#     nearest_neighbor_res[interior_cluster_depth] = nearest_neighbor_list
#     compute_single_level_nearest_neighbor(interior_cluster_index, tree_vis_latent_vector, nearest_neighbor_res, tree_vis_index)

def compute_deep_cluster_nearest_neighbor(interior_cluster_index, tree_vis_latent_vector, tree_vis_index):
    '''
        this function include two parts, first is compute the nearest neighbor from the belong cluster and then return the searching results,
        and at the same time, searching the neighbor results form the upper clusters
    '''
    # compute the nearest neighbor from different levels
    interior_cluster_index = str(interior_cluster_index)
    interior_cluster_depth = cluster_tree_node_dict[interior_cluster_index]['depth']
    nearest_neighbor_list = compute_nearest_neighbor_from_interior_cluster(tree_vis_latent_vector, interior_cluster_index, tree_vis_index)
    nearest_neighbor_list_res = {}
    nearest_neighbor_list_res[interior_cluster_depth] = nearest_neighbor_list
    thread = Thread(target=compute_single_level_nearest_neighbor, args=(interior_cluster_index, tree_vis_latent_vector, tree_vis_index, nearest_neighbor_list_res, ))
    thread.start()
    return nearest_neighbor_list

def compute_nearest_neighbor_from_interior_cluster(target_tree_vis_latent_vector, cluster_content, tree_vis_index):
    '''
        find the nearest neighbor form the the leaf cluster whose index is tree_vis_cluster_index
    '''
    neighbor_amount = NEIGHBOR_AMOUNT
    final_neighbor_amount = FINAL_NEIGHBOR_AMOUNT
    # cluster_content = []
    # interior_cluster_index = str(interior_cluster_index)
    # leaf_clusters = cluster_tree_node_dict[interior_cluster_index]['left_cluster']
    # for leaf_cluster_index in leaf_clusters:
    #     cluster_content = cluster_content + cluster_content_umap[leaf_cluster_index]
    dist_obj_list = []
    for treevis_index in cluster_content:
        treevis_index = int(treevis_index)
        treevis_latent_vector = latent_vector_list[treevis_index]
        treevis_latent_vector = transform_list_str_to_float(treevis_latent_vector)
        vec_dist = compute_vector_dist(treevis_latent_vector, target_tree_vis_latent_vector)
        dist_obj_list.append({'index': treevis_index, 'dist': vec_dist})
    # because just select FINAL_NEIGHBOR_AMOUNT item will only from some clusters, so we select NEIGHBOR_AMOUNT at first, and then select FINAL_NEIGHBOR_AMOUNT next
    neighbor_list = nsmallest(neighbor_amount, dist_obj_list, key=lambda dist_obj: abs(dist_obj['dist']))
    final_neighbor_list = neighbor_list
    if len(neighbor_list) > final_neighbor_amount:
        final_neighbor_list = random.sample(neighbor_list, final_neighbor_amount)
    neighbor_index_list = []
    for neighbor_item in final_neighbor_list:
        neighbor_index_list.append(neighbor_item['index'])
    # add the target tree vis index in the results
    if tree_vis_index not in neighbor_index_list:
        neighbor_index_list.append(tree_vis_index)
    return neighbor_index_list

def compute_tree_vis_projection_pos(search_target):
    '''
        the start of compute tree vis start position
        input is a json object:
            - transform json object to latent vector
            - locate the interior cluster index according to the latent vector
            - then compute the neighbor of different clusters, according to the latent vector and cluster index
    '''
    global all_cluster_nearest_neighbor
    # when the search target change, we need to reset all_cluster_nearest_neighbor dictionary
    all_cluster_nearest_neighbor = {}
    neighbor_amount = NEIGHBOR_AMOUNT
    # compute the index of target tree visualization
    tree_vis_index = compute_tree_vis_index(search_target)
    # compute the treevis latent vector in tree visualization 
    tree_vis_latent_vector = latent_vector_list[tree_vis_index]
    tree_vis_latent_vector = transform_list_str_to_float(tree_vis_latent_vector)
    # the variable traverse_path_clusters save all the clusters along the path
    interior_cluster_index = traverse_tree_and_get_cluster(cluster_tree_umap_with_amount_avg, tree_vis_latent_vector)
    interior_cluster_index = str(interior_cluster_index)
    # compute the cluster inner neighbor 
    deep_cluster_nearest_neighbor = compute_deep_cluster_nearest_neighbor(interior_cluster_index, tree_vis_latent_vector, tree_vis_index)
    # return the located treevis index, tree vis cluster index and the representative at the deepest level
    return tree_vis_index, interior_cluster_index, deep_cluster_nearest_neighbor

def compute_traverse_path_results_max_min_level(traverse_path_clusters_results):
    '''
        compute the max level along the traverse path
    '''
    max_level = 0
    min_level = 1000000
    for level_str in traverse_path_clusters_results:
        level_int = int(level_str)
        max_level = max(max_level, level_int)
        min_level = min(min_level, level_int)
    return max_level, min_level

def compute_neighbor_representative_by_node_index(treevis_index):
    '''
        compute node representatives according to the node index
         - compute interior cluster and leaf cluater according to node index
    '''
    leaf_cluster_index = node_index_leaf_cluster_dict[treevis_index]
    interior_cluster_index = leaf_cluster_interior_cluster_dict[leaf_cluster_index]
    tree_vis_latent_vector = latent_vector_list[int(treevis_index)]
    tree_vis_latent_vector = transform_list_str_to_float(tree_vis_latent_vector)
    deep_cluster_nearest_neighbor = compute_deep_cluster_nearest_neighbor(interior_cluster_index, tree_vis_latent_vector, treevis_index)
    return deep_cluster_nearest_neighbor, deep_cluster_nearest_neighbor

def compute_neighbor_representative(max_displayed_level, displayed_level, target_treevis_index):
    '''
        compute the neighbor representatives from the save data object
    '''
    displayed_level = round(displayed_level)
    traverse_path_clusters_results_file_path = './traverse_path_cluster/' + str(target_treevis_index) + '.json'
    if not os.path.exists(traverse_path_clusters_results_file_path):
        cluster_representative_index_list, cluster_preview_representative_index_list = compute_neighbor_representative_by_node_index(target_treevis_index)
        return cluster_representative_index_list, cluster_preview_representative_index_list
    # compute the representaitve and preview representative from the file
    traverse_path_clusters_results = load_json_obj(traverse_path_clusters_results_file_path)
    traverse_path_clusters_results_max_level, traverse_path_clusters_results_min_level = compute_traverse_path_results_max_min_level(traverse_path_clusters_results)
    # compute the diaplayed level, according to the displayed level
    displayed_cluster_level = traverse_path_clusters_results_max_level - (max_displayed_level - displayed_level)
    if displayed_cluster_level <= 0:
        displayed_cluster_level = 0
    # the the required level is lower than the save results, then we only show he most detailed level
    if displayed_cluster_level < traverse_path_clusters_results_min_level:
        displayed_cluster_level = str(traverse_path_clusters_results_min_level)
    else:
        # otherwise show the most detailed level
        displayed_cluster_level = str(displayed_cluster_level) 
    selected_cluster_index_list_displayed_level = traverse_path_clusters_results[displayed_cluster_level]
    # add cluster index from bottom to up
    selected_cluster_index_list = []
    # transfrom all required index object list to index list
    for level in range(traverse_path_clusters_results_max_level, int(displayed_cluster_level)-1, -1):
        level = str(level)
        nearest_neighbor_list = traverse_path_clusters_results[level]
        index_list = []
        for nearest_neighbor_item_index in nearest_neighbor_list:
            index_list.append(nearest_neighbor_item_index)
        selected_cluster_index_list.append(index_list)
    # add index to the cluster representative index list
    cluster_representative_index_list = []
    cluster_preview_representative_index_list = []
    for index_list in selected_cluster_index_list:
        cluster_representative_index_list = cluster_representative_index_list + index_list
        preview_representative_length = math.ceil(len(index_list) / 2)
        cluster_preview_representative_index_list = cluster_preview_representative_index_list + index_list[:preview_representative_length]
    # update cluster_representative and cluster_preview_representative_list
    # for selected_cluster_index in selected_cluster_index_list:
    #     selected_cluster_nearest_neighbor = all_cluster_nearest_neighbor[selected_cluster_index]
    #     preview_representative_length = math.ceil(len(selected_cluster_nearest_neighbor) / 2)
    #     cluster_representative_obj_list = cluster_representative_obj_list + selected_cluster_nearest_neighbor
    #     cluster_preview_representative_obj_list = cluster_preview_representative_obj_list + selected_cluster_nearest_neighbor[:preview_representative_length]
    # # transform object list to index list
    # cluster_representative_index_list = []
    # cluster_preview_representative_index_list = []
    # for representative_item in cluster_representative_obj_list:
    #     cluster_representative_index_list.append(representative_item['index'])
    # for preview_representative_item in cluster_preview_representative_obj_list:
    #     cluster_preview_representative_index_list.append(preview_representative_item['index'])
    return cluster_representative_index_list, cluster_preview_representative_index_list

def find_neighbor_representative(target_treevis_index, representative_list):
    '''
    '''
    compute_nearest_neighbor_from_interior_cluster
    
def traverse_find_neighbor_representative(displayed_level, target_treevis_index, cluster_tree):
    '''
        traverse the cluster tree and find neighbor representatives
    '''
    node_depth = cluster_tree["depth"]
    if displayed_level >= node_depth:
        representative_list = cluster_tree["representative"]
        return find_neighbor_representative(target_treevis_index, representative_list)
    else:
        if "left" in cluster_tree:
            return traverse_find_neighbor_representative(displayed_level, target_treevis_index, cluster_tree['left'])
        elif 'right' in cluster_tree:
            return traverse_find_neighbor_representative(displayed_level, target_treevis_index, cluster_tree['right'])


def compute_neighbor_representative_new(displayed_level, target_treevis_index, cluster_tree):
    '''
        compute the neighbor representative items of the target tree vis index by traversing the hierarchical data
    '''
    neighbor_representative_list = traverse_find_neighbor_representative(displayed_level, target_treevis_index, cluster_tree)
    return neighbor_representative_list


def init_node_index_leaf_cluster_dict(cluster_content_list):
    '''
        initialize the dictionary of node index and leaf cluster index
    '''
    global node_index_leaf_cluster_dict
    for leaf_cluster_index in range(len(cluster_content_list)):
        cluster_content = cluster_content_list[leaf_cluster_index]
        for node_index in cluster_content:
            node_index_leaf_cluster_dict[node_index] = leaf_cluster_index

def init_leaf_cluster_interior_cluster_dict():
    '''
        initialize the dictionary from leaf cluster to interior cluster
    '''
    global leaf_cluster_interior_cluster_dict
    for interior_cluster_index in cluster_tree_node_dict:
        cluster_obj = cluster_tree_node_dict[interior_cluster_index]
        interior_clusters = cluster_obj['interior_cluster']
        if len(interior_clusters) == 0:
            leaf_cluster = cluster_obj['left_cluster']
            for leaf_cluster_index in leaf_cluster:
                leaf_cluster_interior_cluster_dict[leaf_cluster_index] = interior_cluster_index

def init_latent_vector_results():
    '''
        initialize the latent vector collections
        it is an array, and each item is the computed latent vector of the tree visualization
    '''
    global latent_vector_list
    latent_vector_list = read_csv_data('./sourcedata/latent_vector_results.csv')

def init_clustering_tree_umap():
    '''
        initialize the latent vector collections, this is hierarchical structure and each node contains the avg latent vector, and also its parent
    '''
    global cluster_tree_umap_with_amount_avg
    cluster_tree_umap_with_amount_avg = load_json_obj('./sourcedata/clustering_tree-with_node_index_depth_parent_amount_avg.json')

def init_cluster_content_umap():
    '''
        initialize the cluster content umap, the content of each leaf cluster, it is an array
    '''
    global cluster_content_umap
    cluster_content_umap = read_csv_data('./sourcedata/cluster_content-umap.csv')
    init_node_index_leaf_cluster_dict(cluster_content_umap)

def init_clustering_tree_node_dict():
    '''
        initialize the dictionary of the node in clustering tree 
    '''
    global cluster_tree_node_dict
    cluster_tree_node_dict = load_json_obj('./sourcedata/clustering_tree-leaf_interior_cluster_dict_parent-with_range.json')
    init_leaf_cluster_interior_cluster_dict()

def init_dataset_for_locate_compute_neighbors():
    '''
        initialize the dataset in different categories
    '''
    init_latent_vector_results()
    init_clustering_tree_umap()
    init_clustering_tree_node_dict()
    init_cluster_content_umap()


