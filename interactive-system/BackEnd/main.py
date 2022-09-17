################################################################################
# The entry of the GoTreescape backend 
# handle requests from the front end 
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import math, json
from config import GRAMMAR_PATH
from data_process import load_json_obj, save_svg_file
from cluster_computation import get_content_representative, load_cluster_result
from dsl_collection import init_dsl_collection, query_dsl_obj, get_filter_dsl_collection, get_existed_treevis_collection, load_existed_treevis
from search_tree_vis import compute_tree_vis_projection_pos, init_dataset_for_locate_compute_neighbors

import os, random

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADER'] = 'Content-Type'

@app.route('/template/query/gotree', methods=['GET'])
@cross_origin()
def queryTemplate():
    dsl_name = request.args.get('dslName')
    dsl_file_index = int(dsl_name)
    # initialize json_object text
    json_obj_txt = query_dsl_obj(dsl_file_index)
    json_obj_txt = json_obj_txt.replace('orthogonal', 'straight')
    # folder_name = math.floor(dsl_file_index / 10000)
    # result_path = os.path.join(GRAMMAR_PATH, str(folder_name), str(dsl_name) + '.json')
    # result_obj = load_json_obj(result_path)
    return json_obj_txt

@app.route('/template/query/filter', methods=['GET'])
def queryFilterDSLCollection():
    filter_criteria_dict = request.args.get('criteria')
    print('criteria', filter_criteria_dict)
    filter_dsl_collection = get_filter_dsl_collection(filter_criteria_dict)
    return {'collection': filter_dsl_collection}

@app.route('/existed', methods=['GET'])
def queryExistedTreeVisCollection():
    existed_treevis_collection, existed_treevis_index_name_dict = get_existed_treevis_collection()
    return {'collection': existed_treevis_collection, 'index2name': existed_treevis_index_name_dict}

@app.route('/cluster/level', methods=['GET'])
@cross_origin()
def queryClusterResultByLevel():
    displayed_level = request.args.get('level')
    zooming_ratio = request.args.get('zoomRatio')
    representative_item_type = request.args.get('type')
    target_treevis_index = request.args.get('treevisIndex')
    displayed_data_range = request.args.get('displayedDataRange')
    if type(displayed_data_range) is str:
        displayed_data_range = json.loads(displayed_data_range)
    # change the format of the displayed level and zooming ratio, from str to int
    displayed_level = int(displayed_level)
    zooming_ratio = float(zooming_ratio)
    print('displayed_level', displayed_level, 'zooming_ratio', zooming_ratio)
    # compute the content and representative from the clusters
    cluster_representative_list = get_content_representative(displayed_level, zooming_ratio, target_treevis_index, representative_item_type, displayed_data_range)
    # return {'content': cluster_content, 'representative': cluster_representative, 'preview-representative': cluster_preview_representative_obj_list}
    # if len(cluster_representative_list) > 200:
    #     cluster_representative_list = random.sample(cluster_representative_list, 200)
    return {'representative': cluster_representative_list}

@app.route('/search', methods=['GET'])
@cross_origin()
def getUploadTreeVisProjectionPos():
    search_target = request.args.get('target')
    # change the format of the displayed level and zooming ratio, from str to int
    print('search_target', search_target)
    # compute the content and representative from the clusters
    tree_vis_index, interior_cluster_index, deep_cluster_nearest_neighbor = compute_tree_vis_projection_pos(search_target)
    return { "tree_vis_index": tree_vis_index, "cluster_index": interior_cluster_index, 'cluster_inner_neighbor': deep_cluster_nearest_neighbor }
    # return {'content': cluster_content, 'representative': cluster_representative, 'preview-representative': cluster_preview_representative_obj_list}
    # return {'treevispos': uploadTreeVisProjectionPos}

if __name__ == "__main__":
    print('run 0.0.0.0:14449')
    # preprocess the dataset
    init_dsl_collection()
    init_dataset_for_locate_compute_neighbors()
    load_cluster_result()
    # load_existed_representative_list_display_level()
    load_existed_treevis()
    random.seed(1)
    # app.run(threaded=True, host='0.0.0.0', port=14453)
    app.run(host='0.0.0.0', port=14449)
