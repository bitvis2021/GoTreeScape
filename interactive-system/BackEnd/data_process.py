################################################################################
# data processing functions  
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
import json, os, csv

def load_json_obj(filename):
    with open(filename) as json_file:
        data = json.load(json_file)
        return data

def save_json_obj(json_obj, filename):
    with open(filename, 'w') as json_file:
        json.dump(json_obj, json_file)

def read_csv_data(file_name):
    data_item_list = []
    with open(file_name, newline='') as f:
        reader = csv.reader(f)
        for row in reader:
            data_item_list.append(row)
    return data_item_list

def save_csv_data(file_name, data_item_list):
    with open(file_name, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(data_item_list)

def save_svg_file(svg_folder_path, svg_file_name, svg_data):
    svg_file_path_name = os.path.join(svg_folder_path, svg_file_name)
    print('svg_file_path_name', svg_file_path_name)
    if not os.path.exists(svg_folder_path):
        os.mkdir(svg_folder_path)
    text_file = open(svg_file_path_name, "wt")
    svg_source_data = svg_data['source'][0]
    n = text_file.write(svg_source_data)
    text_file.close()
