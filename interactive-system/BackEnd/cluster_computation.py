################################################################################
# compute the relative positions according to the zooming ranges    
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
from search_tree_vis import compute_neighbor_representative_new
from compute_relative_pos_state import compute_relative_pos_state

# the representative results of the cluster
cluster_tree_with_depth_range_parent = {}

# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10_0.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10_1.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10_2.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10_3.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10_4.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight10_5.json'


# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_1_1.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_1_2.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_1_3.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_1_4.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_1_5.json'

# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_2_1.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_2_2.json'
cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_2_3.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_2_4.json'
# cluster_tree_result_path = 'sourcedata/mds_clustering_tree_with_depth_range_parent_weight100_2_5.json'

PREVIEW_REPRESENTATIVE_AMOUNT = 50


def load_cluster_result():
    '''
        load the cluster representative results
    '''
    global cluster_tree_with_depth_range_parent
    cluster_tree_with_depth_range_parent = load_json_obj(cluster_tree_result_path)

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
    # displayed_level_base_ratio = compute_dispayed_level_by_zooming_ratio(zoom_ratio)
    displayed_level_base_ratio = round(zoom_ratio - 1)
    # displayed_level_base_ratio = 13
    # if current displayed has be detailed enough, then just keep current displayed level
    # otherwise, change the displayed level to the displayed_level_base_ratio
    if dispayed_level < displayed_level_base_ratio:
        dispayed_level = displayed_level_base_ratio
    return dispayed_level

def traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree, finding_cluster_result):
    '''
        compute cluster representative according to displayed data range
    '''
    cluster_index = clustering_tree["index"]
    cluster_index = str(cluster_index)
    cluster_depth = clustering_tree["depth"]
    cluster_pos_range = clustering_tree["pos_range"]
    relative_pos_state = compute_relative_pos_state(displayed_data_range, cluster_pos_range)
    # print(interior_cluster_index, cluster_depth, relative_pos_state, interior_cluster_pos_range, displayed_data_range)
    if relative_pos_state == 'displayed_range_contain_cluster_range':
        # if cluster range is larger than displayed range, then we need to find the cluster further
        if cluster_depth >= displayed_level or ('left' not in clustering_tree and 'right' not in clustering_tree):
            # when the cluster depth is larger than or equal to the displayed level, then we add the interior cluster
            finding_cluster_result.append(clustering_tree)
            # print('interior_cluster_index', interior_cluster_index, 'relative_pos_state', relative_pos_state)
        elif cluster_depth < displayed_level:
            # when the cluster depth is smaller than the displayed level, then we continue the traversal
            if 'left' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['left'], finding_cluster_result)
            if 'right' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['right'], finding_cluster_result)
    elif relative_pos_state == 'displayed_range_within_cluster_range':
        # when the displayed range is smaller than cluster range, 
        #   if cluster_depth >= displayed_level, compute the finding_cluster_result directly.
        #   if cluster_depth < displayed_level, find the cluster further.
        if cluster_depth >= displayed_level:
            finding_cluster_result.append(clustering_tree)
        else:
            if 'left' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['left'], finding_cluster_result)
            if 'right' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['right'], finding_cluster_result)
            if 'left' not in clustering_tree and 'right' not in clustering_tree:
                finding_cluster_result.append(clustering_tree)
    elif relative_pos_state == 'displayed_range_intersect_cluster_range':
        # judge whether continur the traversal or just append the results
        if cluster_depth >= displayed_level or ('left' not in clustering_tree and 'right' not in clustering_tree):
            # when the cluster depth is larger than or equal to the displayed level, then we add the interior cluster
            finding_cluster_result.append(clustering_tree)
            # print('interior_cluster_index', interior_cluster_index, 'relative_pos_state', relative_pos_state)
        elif cluster_depth < displayed_level:
            # when the cluster depth is smaller than the displayed level, then we continue the traversal
            if 'left' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['left'], finding_cluster_result)
            if 'right' in clustering_tree:
                traverse_tree_find_related_cluster(displayed_data_range, displayed_level, clustering_tree['right'], finding_cluster_result)
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


def compute_cluster_representative(displayed_data_range, displayed_level):
    '''
        compute the cluster representative list according to the displayed data range, clustering tree and displayed level
    '''
    global cluster_tree_with_depth_range_parent
    finding_cluster_result = []
    traverse_tree_find_related_cluster(displayed_data_range, displayed_level, cluster_tree_with_depth_range_parent, finding_cluster_result)
    cluster_representative_result = []
    for cluster in finding_cluster_result:
        representative = cluster['representative']
        cluster_representative_result = cluster_representative_result + representative
    return cluster_representative_result

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
        cluster_representative_list = compute_cluster_representative(displayed_data_range, displayed_level)
    elif representative_item_type == 'neighbor':
        # TODO
        target_treevis_index = int(target_treevis_index)
        # max_displayed_level = 14
        # cluster_representative_list, cluster_preview_representative_index_list = compute_neighbor_representative(max_displayed_level, displayed_level, target_treevis_index)
        cluster_representative_list = compute_neighbor_representative_new(displayed_level, target_treevis_index, cluster_tree_with_depth_range_parent, displayed_data_range)
    # query the dsl object of the preview representative items
    # cluster_preview_representative_obj_list = get_cluster_preview_representative_obj_list(cluster_preview_representative_index_list)
    # return cluster_content_list, cluster_representative_list, cluster_preview_representative_obj_list
    return cluster_representative_list


