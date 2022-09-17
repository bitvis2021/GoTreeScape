################################################################################
# Find tree visualization dsl according to the index
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
import os, json
from load_data import load_txt_file
from process_json import load_json_obj, save_json_obj
from os import listdir
from os.path import isfile,join

existed_tree_vis_folder_path = './existed_tree_vis_example'

def load_dsl_collection():
    '''
        read the file of dsl collection
    '''
    all_dsl_file_path = './sourcedata'
    all_dsl_file_name = 'dsl_collection.txt'
    all_dsl_file_path_name = os.path.join(all_dsl_file_path, all_dsl_file_name)
    all_dsl_list = load_txt_file(all_dsl_file_path_name)
    return all_dsl_list

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

def load_existed_treevis_list():
    '''
        read existed tree visualizations in existed_tree_vis folder
    '''
    existed_treevis_dsl_file_name_list = [f for f in listdir(existed_tree_vis_folder_path) if isfile(join(existed_tree_vis_folder_path, f))]
    existed_treevis_dsl_list = []
    for existed_treevis_dsl_file_name in existed_treevis_dsl_file_name_list:
        existed_treevis_dsl_name = existed_treevis_dsl_file_name.replace('.json', '')
        existed_treevis_dsl_list.append(existed_treevis_dsl_name)
    return existed_treevis_dsl_list

def load_tree_vis_dsl_content (dsl_file_name):
    '''
    '''
    print('dsl_file_name', dsl_file_name)
    existed_treevis_dsl_folder_file_name = os.path.join(existed_tree_vis_folder_path, dsl_file_name+'.json')
    existed_treevis_dsl_content = load_json_obj(existed_treevis_dsl_folder_file_name)
    print('existed_treevis_dsl_content', existed_treevis_dsl_content)
    return existed_treevis_dsl_content

if __name__ == '__main__':
    axisLabelList = ["X", "Y"]
    dsl_collection = load_dsl_collection()
    existed_treevis_list = load_existed_treevis_list()
    existed_treevis_index_dict = {}
    for dsl_file_name in existed_treevis_list:
        if dsl_file_name != "Aggregate Tree Map": #outside-in hierarchy, ThreadArc
            continue
        existed_treevis_index_dict[dsl_file_name] = []
        treevis_dsl_content = load_tree_vis_dsl_content(dsl_file_name)
        if "Name" in treevis_dsl_content:
            del treevis_dsl_content["Name"]
        # del attribute in Element
        if "Element" in treevis_dsl_content:
            if "StaticThickness" in treevis_dsl_content["Element"]:
                del treevis_dsl_content['Element']['StaticThickness']
            if "ColorSchema" in treevis_dsl_content["Element"]:
                del treevis_dsl_content['Element']['ColorSchema']
            if "LinkWidth" in treevis_dsl_content["Element"]:
                del treevis_dsl_content["Element"]["LinkWidth"]
            if "LabelAnchor" in treevis_dsl_content["Element"]:
                del treevis_dsl_content["Element"]["LabelAnchor"]
            if "LinkDisplay" in treevis_dsl_content["Element"]:
                del treevis_dsl_content["Element"]["LinkDisplay"]
            # # BarcodeTree TODO
            # if "RootWidth" in treevis_dsl_content["Element"]:
            #     del treevis_dsl_content["Element"]["RootWidth"]
            # # Deep Tree TODO
            # if "Thickness" in treevis_dsl_content["Element"]:
            #     del treevis_dsl_content["Element"]["Thickness"]
            # if "MinThickness" in treevis_dsl_content["Element"]:
            #     del treevis_dsl_content["Element"]["MinThickness"]
            # if "MaxThickness" in treevis_dsl_content["Element"]:
            #     del treevis_dsl_content["Element"]["MaxThickness"]
            # Indentation
            # if "RootWidth" in treevis_dsl_content["Element"]:
            #     del treevis_dsl_content["Element"]["RootWidth"]
            # ThreadArc
            # if "ArcDirection" in treevis_dsl_content["Element"]:
            #     del treevis_dsl_content["Element"]["ArcDirection"]
        # del attribute in Layout
        if "Layout" in treevis_dsl_content:
            for axisLabel in axisLabelList:
                if axisLabel in treevis_dsl_content["Layout"]:
                    if "Root" in treevis_dsl_content["Layout"][axisLabel]:
                        if "Margin" in treevis_dsl_content["Layout"][axisLabel]["Root"]:
                            del treevis_dsl_content["Layout"][axisLabel]["Root"]["Margin"]
                        if "Padding" in treevis_dsl_content["Layout"][axisLabel]["Root"]:
                            del treevis_dsl_content["Layout"][axisLabel]["Root"]["Padding"]
                    if "Subtree" in treevis_dsl_content["Layout"][axisLabel]:
                        if "Margin" in treevis_dsl_content["Layout"][axisLabel]["Subtree"]:
                            del treevis_dsl_content["Layout"][axisLabel]["Subtree"]["Margin"]
        if "CoordinateSystem" in treevis_dsl_content:
            if treevis_dsl_content["CoordinateSystem"]["Category"] == "cartesian":
                if "PolarCenterPos" in treevis_dsl_content["CoordinateSystem"]:
                    del treevis_dsl_content["CoordinateSystem"]["PolarCenterPos"]
                if "PolarCenterType" in treevis_dsl_content["CoordinateSystem"]:
                    del treevis_dsl_content["CoordinateSystem"]["PolarCenterType"]
        print('simplified tree vis content', treevis_dsl_content)
        for dsl_obj_str_index in range(len(dsl_collection)):
            dsl_obj_str = dsl_collection[dsl_obj_str_index]
            dsl_obj_str = dsl_obj_str.replace('orthogonal', 'straight')
            dsl_obj_obj_in_collection = json.loads(dsl_obj_str)
            matching = check_subset(treevis_dsl_content, dsl_obj_obj_in_collection)
            if matching:
                print('dsl_obj_obj_in_collection', dsl_obj_obj_in_collection)
                existed_treevis_index_dict[dsl_file_name].append(dsl_obj_str_index)
    print(existed_treevis_index_dict)



