################################################################################
# compute the cluster and their latent vector of each cluster    
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
from data_process import read_csv_data  
import random, math, json
import os
from dsl_collection import query_dsl_obj
from os.path import isfile,join
from os import listdir
from process_json import load_json_obj, save_json_obj
from dsl_collection import get_existed_treevis_collection
from search_tree_vis import compute_neighbor_representative

cluster_result = []
# leaf_cluster_representative_umap = []

# clustering_tree_with_node_index_depth = {}
# clustering_tree_node_dict_with_range = {}
# cluster_representative_list = []
# cluster_content_list = []
# dsl_umap_projection_pos = []

existed_displayed_level_cluster_representative_list = []
existed_displayed_level_cluster_preview_representative_list = []

cluster_representative_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent.json'
# ================================================================
# clustering_tree_with_node_index_depth_folder_file_path = 'sourcedata/clustering_tree-with_node_index_depth_parent.json'
# clustering_tree_node_dict_with_range_folder_file_path = 'sourcedata/clustering_tree-leaf_interior_cluster_dict-with_range.json'

# # interior_cluster_representative_list_folder_file_path = 'sourcedata/interior_cluster_representative_umap.csv'
# interior_cluster_representative_list_folder_file_path = 'sourcedata/interior_cluster_representative_umap_num=500_ratio=100.csv'
# cluster_content_folder_file_path = 'sourcedata/cluster_content-umap.csv'
# dsl_umap_projection_pos_file_path = 'sourcedata/dsl_umap_projection_pos.csv'

PREVIEW_REPRESENTATIVE_AMOUNT = 50

# def load_cluster_result():
#     '''
#         load the clustering results, and other computations are based on the clustering results
#     '''
#     global cluster_result
#     # file_name = 'dsl_amount_314640-cudatsne_per50_ite3000-dbscan_eps_0.005-hierarchical_levels.csv'
#     file_name = 'dsl_amount_314640-umap-dbscan_eps_0.2-hierarchical_levels.csv'
#     folder_path = './cluster-results/'
#     cluster_result_path_name = os.path.join(folder_path, file_name)
#     cluster_result = read_csv_data(cluster_result_path_name)
#     # remove the header of csv file
#     cluster_result = cluster_result[1:]
#     return cluster_result

# def change_str_to_int(cluster_representative_dsl_list):
#     '''
#     '''
#     for cluster_index in range(len(cluster_representative_dsl_list)):
#         for dsl_index in range(len(cluster_representative_dsl_list[cluster_index])):
#             cluster_representative_dsl_list[cluster_index][dsl_index] = int(cluster_representative_dsl_list[cluster_index][dsl_index])
#     return cluster_representative_dsl_list

def load_cluster_representative_result():
    '''
        load the cluster representative results
    '''
    global cluster_representative_result
    cluster_representative_result = load_json_obj(cluster_representative_result_path)


# def load_cluster_representative_result():
#     '''
#         load the representative results of different clusters, including the leaf clusters and interior clusters
#     '''
#     global clustering_tree_with_node_index_depth
#     global clustering_tree_node_dict_with_range
#     global cluster_representative_list
#     global cluster_content_list
#     global dsl_umap_projection_pos
#     # 
#     clustering_tree_with_node_index_depth = load_json_obj(clustering_tree_with_node_index_depth_folder_file_path)
#     clustering_tree_node_dict_with_range = load_json_obj(clustering_tree_node_dict_with_range_folder_file_path)
#     cluster_representative_list = read_csv_data(interior_cluster_representative_list_folder_file_path)
#     cluster_content_list = read_csv_data(cluster_content_folder_file_path)
#     dsl_umap_projection_pos = read_csv_data(dsl_umap_projection_pos_file_path)


def compute_dispayed_level_by_zooming_ratio(zoom_ratio):
    '''
    '''
    # segamentation function, the followings are detailed setting of the function:
    #   1-3 -> 0-4
    #   4-7 -> 5-8
    #   9-10 -> 9-14
    displayed_level = 0
    if zoom_ratio <= 1:
        # 1. zoom_ratio is (0.8, 1) => display_level = 0
        displayed_level = 0 
    elif 1 < zoom_ratio <= 3:
        # 2. zoom_ratio is (1, 3) => (0, 4)
        displayed_level = (zoom_ratio - 1) * 2
    elif 3 < zoom_ratio <= 6:
        # 3. zoom_ratio is (4, 7) => (5, 8)
        displayed_level = (zoom_ratio - 3) * 1 + 4
    elif 6 < zoom_ratio <= 20:
        # 4. zoom_ratio is (9, 19) => (9, 14)
        displayed_level = (zoom_ratio - 6) / 2 + 7
    return displayed_level

def compute_displayed_level(current_displayed_level, zoom_ratio):
    # compute the displayed level according to the zoom ratio
    dispayed_level = current_displayed_level
    # compute the displayed level based on zoom ratio
    displayed_level_base_ratio = compute_dispayed_level_by_zooming_ratio(zoom_ratio)
    # displayed_level_base_ratio = 13
    # if current displayed has be detailed enough, then just keep current displayed level
    # otherwise, change the displayed level to the displayed_level_base_ratio
    if dispayed_level < displayed_level_base_ratio:
        dispayed_level = displayed_level_base_ratio
    return dispayed_level


def compute_relative_pos_state(displayed_data_range, interior_cluster_pos_range):
    '''
        compute the relative positions of two rectaugular space
        {"x": [-14.37596, 20.67741], "y": [-14.279471, 21.032482]}
    '''
    display_min_x = displayed_data_range['x'][0]
    display_max_x = displayed_data_range['x'][1]
    display_min_y = displayed_data_range['y'][0]
    display_max_y = displayed_data_range['y'][1]
    cluster_min_x = interior_cluster_pos_range['x'][0]
    cluster_max_x = interior_cluster_pos_range['x'][1]
    cluster_min_y = interior_cluster_pos_range['y'][0]
    cluster_max_y = interior_cluster_pos_range['y'][1]
    if (cluster_min_x <= display_min_x <= display_max_x <= cluster_max_x) and (cluster_min_y <= display_min_y <= display_max_y <= cluster_max_y):
        return 'displayed_range_within_cluster_range'
    if (display_min_x <= cluster_min_x <= cluster_max_x <= display_max_x) and (display_min_y <= cluster_min_y <= cluster_max_y <= display_max_y): 
        return 'displayed_range_contain_cluster_range'
    if (display_min_x > cluster_max_x) or (display_max_x < cluster_min_x) or (display_min_y > cluster_max_y) or (display_max_y < cluster_min_y):
        return 'displayed_range_apart_cluster_range'
    return 'displayed_range_intersect_cluster_range'

def traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree, finding_cluster_index_result):
    '''
        compute cluster representative according to displayed data range
    '''
    interior_cluster_index = clustering_tree["interior-cluster-index"]
    interior_cluster_index = str(interior_cluster_index)
    interior_cluster_depth = clustering_tree["depth"]
    interior_cluster_pos_range = clustering_tree_node_dict_with_range[interior_cluster_index]["pos_range"]
    relative_pos_state = compute_relative_pos_state(displayed_data_range, interior_cluster_pos_range)
    # print(interior_cluster_index, interior_cluster_depth, relative_pos_state, interior_cluster_pos_range, displayed_data_range)
    if relative_pos_state == 'displayed_range_contain_cluster_range':
        # if cluster range is larger than displayed range, then we need to find the cluster further
        if interior_cluster_depth >= displayed_level or ('left' not in clustering_tree and 'right' not in clustering_tree):
            # when the cluster depth is larger than or equal to the displayed level, then we add the interior cluster
            finding_cluster_index_result.append(interior_cluster_index)
            # print('interior_cluster_index', interior_cluster_index, 'relative_pos_state', relative_pos_state)
        elif interior_cluster_depth < displayed_level:
            # when the cluster depth is smaller than the displayed level, then we continue the traversal
            if 'left' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['left'], finding_cluster_index_result)
            if 'right' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['right'], finding_cluster_index_result)
    elif relative_pos_state == 'displayed_range_within_cluster_range':
        # if the displayed range is smaller than cluster range, then we need to find the cluster further
        if 'left' in clustering_tree:
            traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['left'], finding_cluster_index_result)
        if 'right' in clustering_tree:
            traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['right'], finding_cluster_index_result)
        if 'left' not in clustering_tree and 'right' not in clustering_tree:
            finding_cluster_index_result.append(interior_cluster_index)
    elif relative_pos_state == 'displayed_range_intersect_cluster_range':
        # judge whether continur the traversal or just append the results
        if interior_cluster_depth >= displayed_level or ('left' not in clustering_tree and 'right' not in clustering_tree):
            # when the cluster depth is larger than or equal to the displayed level, then we add the interior cluster
            finding_cluster_index_result.append(interior_cluster_index)
            # print('interior_cluster_index', interior_cluster_index, 'relative_pos_state', relative_pos_state)
        elif interior_cluster_depth < displayed_level:
            # when the cluster depth is smaller than the displayed level, then we continue the traversal
            if 'left' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['left'], finding_cluster_index_result)
            if 'right' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['right'], finding_cluster_index_result)
    elif relative_pos_state == 'displayed_range_apart_cluster_range':
        return

def remove_dsl_index_outside_display(cluster_representative_dsl_index_list, displayed_data_range):
    '''
    '''
    display_min_x = displayed_data_range['x'][0]
    display_max_x = displayed_data_range['x'][1]
    display_min_y = displayed_data_range['y'][0]
    display_max_y = displayed_data_range['y'][1]
    cluster_representative_within_screen_dsl_index_list = []
    for dsl_index in cluster_representative_dsl_index_list:
        dsl_index = int(dsl_index)
        dsl_proj_pos = dsl_umap_projection_pos[dsl_index]
        dsl_proj_pos_x = float(dsl_proj_pos[0])
        dsl_proj_pos_y = float(dsl_proj_pos[1])
        if (display_min_x <= dsl_proj_pos_x <= display_max_x) and (display_min_y <= dsl_proj_pos_y <= display_max_y):
            cluster_representative_within_screen_dsl_index_list.append(dsl_index)
    return cluster_representative_within_screen_dsl_index_list


def compute_cluster_representative(displayed_data_range, clustering_tree, displayed_level):
    '''
    '''



# def compute_cluster_representative2(displayed_data_range, clustering_tree, displayed_level):
#     # TODO
#     finding_cluster_index_result = []
#     displayed_data_range = json.loads(displayed_data_range)
#     # print('=============compute_cluster_representative2==============')
#     # print('displayed_level', displayed_level)
#     # print('displayed_data_range', displayed_data_range)
#     traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree, finding_cluster_index_result)
#     # finding_cluster_index_result = [701]
#     cluster_representative_dsl_index_list = []
#     for cluster_index in finding_cluster_index_result:
#         cluster_index = int(cluster_index)
#         cluster_representative_dsl_index_list = cluster_representative_dsl_index_list + cluster_representative_list[cluster_index]
#     cluster_representative_within_screen_dsl_index_list = remove_dsl_index_outside_display(cluster_representative_dsl_index_list, displayed_data_range)
#     # cluster_representative_within_screen_dsl_index_list = cluster_content_list[34] 795, 939, 940, 941, 942|2183
#     # cluster_representative_within_screen_dsl_index_list = cluster_representative_list[942]
#     return cluster_representative_within_screen_dsl_index_list
#     # TEST
#     # cluster_content_dsl_index_list = []
#     # interior_cluster_index = "2179"
#     # leaft_cluster_index_list = clustering_tree_node_dict_with_range[interior_cluster_index]["left_cluster"]
#     # for cluster_index in leaft_cluster_index_list:
#     #     print('cluster_index', cluster_index)
#     #     cluster_index = int(cluster_index)
#     #     cluster_content_dsl_index_list = cluster_content_dsl_index_list + cluster_content_list[cluster_index]
#     # return cluster_content_dsl_index_list
    

def get_cluster_preview_representative_obj_list(cluster_preview_representative_index_list):
    '''
    '''
    cluster_preview_representative_obj_list = []
    existed_treevis_collection, existed_treevis_index_name_dict = get_existed_treevis_collection()
    # add existed tree vis node
    for existed_treevis_index in existed_treevis_collection:
        existed_treevis_obj = {'index': existed_treevis_index, 'type': 'existed'}
        cluster_preview_representative_obj_list.append(existed_treevis_obj)
    # add preview tree vis node
    for representative_index in cluster_preview_representative_index_list:
        # query dsl object according to index
        # representative_dsl_obj = query_dsl_obj(representative_index)
        # organize the representative object by dsl and index 
        representative_obj = {'index': representative_index, 'type': 'preview'}
        cluster_preview_representative_obj_list.append(representative_obj)
    # ===================================
    # for single_cluster_preview_representative_index_list in cluster_preview_representative_index_list:
    #     single_cluster_preview_representative_obj_list = []
    #     for representative_index in single_cluster_preview_representative_index_list:
    #         # query dsl object according to index
    #         representative_dsl_obj = query_dsl_obj(representative_index)
    #         # organize the representative object by dsl and index 
    #         representative_obj = {'index': representative_index, 'dsl': representative_dsl_obj}
    #         single_cluster_preview_representative_obj_list.append(representative_obj)
    #     cluster_preview_representative_obj_list.append(single_cluster_preview_representative_obj_list)
    return [cluster_preview_representative_obj_list]

def get_content_representative(current_displayed_level, zoom_ratio, target_treevis_index, representative_item_type, displayed_data_range):
    '''
    '''
    displayed_level = compute_displayed_level(current_displayed_level, zoom_ratio)
    # init cluster representatives
    cluster_representative_list = []
    cluster_preview_representative_index_list = []
    if representative_item_type == 'coverage':
        # displayed_level = 4
        # cluster_content_list = compute_cluster_content(cluster_result, displayed_level)
        # cluster_representative_list, cluster_preview_representative_index_list = compute_cluster_representative(displayed_level)
        cluster_representative_list = compute_cluster_representative(displayed_data_range, clustering_tree_with_node_index_depth, displayed_level)
    elif representative_item_type == 'neighbor':
        # TODO
        max_displayed_level = 14
        cluster_representative_list, cluster_preview_representative_index_list = compute_neighbor_representative(max_displayed_level, displayed_level, target_treevis_index)
    # query the dsl object of the preview representative items
    cluster_preview_representative_obj_list = get_cluster_preview_representative_obj_list(cluster_preview_representative_index_list)
    # return cluster_content_list, cluster_representative_list, cluster_preview_representative_obj_list
    return cluster_representative_list


