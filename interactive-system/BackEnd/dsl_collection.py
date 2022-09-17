################################################################################
# processing the dsl collection 
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
import os, json
from load_data import load_txt_file
from process_csv import read_csv_data, save_csv_data
from process_json import load_json_obj, save_json_obj
from os import listdir
from os.path import isfile,join
import re

dsl_collection = []
existed_filter_criteria_list = []
existed_treevis_index_dict = {}

filter_results_folder_path = './filter-results'
existed_treevis_folder_path = './existed_tree_vis_collection'

def load_dsl_collection():
    '''
        read the file of dsl collection
    '''
    all_dsl_file_path = './sourcedata'
    all_dsl_file_name = 'dsl_collection_62340.txt'
    all_dsl_file_path_name = os.path.join(all_dsl_file_path, all_dsl_file_name)
    all_dsl_list = load_txt_file(all_dsl_file_path_name)
    return all_dsl_list

def compute_tree_vis_index(tree_vis_obj):
    '''
        compute the tree vis index according to the object
    '''
    tree_vis_str = str(tree_vis_obj)
    tree_vis_str = re.sub(' ', '', tree_vis_str)
    tree_vis_str = re.sub('\n', '', tree_vis_str)
    for tree_vis_index in range(len(dsl_collection)):
        target_treevis_str = re.sub(' ', '', dsl_collection[tree_vis_index])
        target_treevis_str = re.sub('\n', '', target_treevis_str)
        if str(tree_vis_str) == str(target_treevis_str):
            return tree_vis_index
    # print('tree_vis_str', tree_vis_str)
    # print('target_treevis_str', target_treevis_str)
    # print('same', str(tree_vis_str) == str(target_treevis_str))
    # for tree_vis_index in range(len(dsl_collection)):
    #     target_tree_vis_str = dsl_collection[290564]
    #     target_treevis_str = re.sub(' ', '', target_tree_vis_str)
    #     target_treevis_str = re.sub('\n', '', target_treevis_str)
    #     if str(tree_vis_str) == str(target_tree_vis_str):
    #         print('tree_vis_index', tree_vis_index)
    #         return tree_vis_index

def load_existed_filter_criteria_list():
    '''
        read existed filter criteria results in filter-results folder
    '''
    filter_results_file_list = [f for f in listdir(filter_results_folder_path) if isfile(join(filter_results_folder_path, f))]
    existed_filter_criteria_list = []
    for filter_results_file_name in filter_results_file_list:
        filter_results_criteria_name = filter_results_file_name.replace('.json', '')
        existed_filter_criteria_list.append(filter_results_criteria_name)
    return existed_filter_criteria_list

def load_existed_treevis():
    '''
        load existed tree visualization from the dataset
    '''
    global existed_treevis_index_dict
    existed_treevis_filename = 'existed_tree_index.json'
    existed_treevis_index_dict = load_json_obj(os.path.join(existed_treevis_folder_path, existed_treevis_filename))

def init_dsl_collection():
    '''
        initiaize the dsl_collection
    '''
    global dsl_collection
    global existed_filter_criteria_list
    dsl_collection = load_dsl_collection()
    existed_filter_criteria_list = load_existed_filter_criteria_list()

def check_subset(subset, superset):
    '''
        check whether the dsl object meet the criteria
    '''
    is_subset = True
    for item in subset:
        if item in superset:
            if isinstance(subset[item], str) or isinstance(superset[item], str) or isinstance(subset[item], float) or isinstance(superset[item], float) or isinstance(subset[item], int) or isinstance(superset[item], int):
                is_subset = (subset[item] == superset[item])
            else:
                is_subset = check_subset(subset[item], superset[item])
        else:
            is_subset = False
        if not is_subset:
            return is_subset
    return is_subset

def get_filter_dsl_collection(filter_criteria_dict_str):
    '''
    '''
    global existed_filter_criteria_list
    filter_dsl_collection_list = []
    filter_criteria_dict = json.loads(filter_criteria_dict_str)
    for filter_criteria_index in filter_criteria_dict:
        filter_criteria = filter_criteria_dict[filter_criteria_index]
        filter_criteria_str = json.dumps(filter_criteria)
        filter_results_file_name = filter_criteria_str+'.json'
        filter_results_folder_file_path = join(filter_results_folder_path, filter_results_file_name)
        filter_dsl_collection = []
        if filter_criteria_str not in existed_filter_criteria_list:
            filter_criteria = json.loads(filter_criteria_str)
            print('dsl collection length', len(dsl_collection))
            for i in range(len(dsl_collection)):
                dsl_text = dsl_collection[i]
                dsl_obj = json.loads(dsl_text)
                if check_subset(filter_criteria, dsl_obj):
                    filter_dsl_collection.append(i)
            save_json_obj(filter_dsl_collection, filter_results_folder_file_path)
            existed_filter_criteria_list.append(filter_criteria_str)
        else:
            filter_dsl_collection = load_json_obj(filter_results_folder_file_path)
        filter_dsl_collection_list.append(filter_dsl_collection)
    filter_dsl_result_set = set(filter_dsl_collection_list[0]).intersection(*filter_dsl_collection_list[1:])
    filter_dsl_result_list = list(filter_dsl_result_set)
    return filter_dsl_result_list

def query_dsl_obj(dsl_file_index):
    '''
        load the dsl object by the dsl file index
    '''
    dsl_file_index = int(dsl_file_index)
    json_obj_txt = ''
    if dsl_file_index != None and dsl_file_index < len(dsl_collection):
        json_obj_txt = dsl_collection[dsl_file_index]
    return json_obj_txt

def get_existed_treevis_collection():
    '''
        return the dsl collection
    '''
    existed_treevis_index_collection = []
    existed_treevis_index_name_dict = {}
    for treevis_name in existed_treevis_index_dict:
        treevis_name_index_collection = existed_treevis_index_dict[treevis_name]
        for treevis_index in treevis_name_index_collection:
            existed_treevis_index_name_dict[treevis_index] = treevis_name
        existed_treevis_index_collection = existed_treevis_index_collection + treevis_name_index_collection
    return existed_treevis_index_collection, existed_treevis_index_name_dict
