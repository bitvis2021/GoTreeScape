################################################################################
# json processing 
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
import json

def load_json_obj(filename):
    with open(filename) as json_file:
        data = json.load(json_file)
        return data

def save_json_obj(json_obj, filename):
    with open(filename, 'w') as json_file:
        json.dump(json_obj, json_file)
