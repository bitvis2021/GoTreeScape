##################################################
## compute the embeddings of tree visualizations after assigning the design features with different weights
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
# -*- coding: utf-8 -*-
import simplejson as json
import os, sys
import re
import nltk
import numpy as np
import h5py

import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

from vis_vae_weight import VisVAE, get_rules, get_specs
from vis_grammar import VisGrammar
from train_weight import MAX_LEN, BATCH # the amount of pairs in GoTree grammar is 57 and we add another one pair indicate Nothing

from sklearn.utils import shuffle
from rule_config import compute_rule_weight

def extract_rules(inputfile, outputfile):
    specs = []
    with open(inputfile, 'r') as inputs:
        for line in inputs:
            try:
                specs.append(json.loads(line))
            except Exception as e:
                print(line, e)

    print('length', len(specs))
    allrules = {}

    max_rulelen = 0
    for spec in specs:
        rules = []
        get_rules(spec, 'root', rules)
        for r in rules:
            if not r in allrules:
                allrules[r] = 0
            allrules[r] += 1
        max_rulelen = max(max_rulelen, len(rules))

    print('max len: %d' % max_rulelen)
    print(allrules)
    allrules = sorted(allrules.keys())
    allrules.append('Nothing -> None')

    with open(outputfile, 'w') as outf:
        for r in allrules:
            outf.write(r + '\n')

# generate the traning and testing datasets
def generate_datasets(inputfile, rulesfile, outputdir):
    data = []
    with open(inputfile, 'r') as inputs:
        for line in inputs:
            rules = []
            spec = json.loads(line)
            get_rules(spec, 'root', rules)
            data.append(rules)
    print('data', len(data[0]))

    rules = []
    with open(rulesfile, 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules.append(line)
    print('number of rules: %d' % len(rules))

    rule2index = {}
    for i, r in enumerate(rules):
        rule2index[r] = i

    one_hot = np.zeros((len(data), MAX_LEN, len(rules)), dtype=np.float32)
    print(one_hot.shape)
    for i, sentence_rules in enumerate(data):
        indices = [rule2index[r] for r in sentence_rules]
        # print('len(indices)', len(indices))
        one_hot[i][np.arange(len(indices)), indices] = 1
        one_hot[i][np.arange(len(indices), MAX_LEN), -1] = 1

    print(one_hot.shape)
    # change the order of the data items
    one_hot = shuffle(one_hot)

    split = int(0.1 * one_hot.shape[0])
    with h5py.File(outputdir + 'test.h5', 'w') as f:
        f.create_dataset('data', data=one_hot[0:split])
    
    with h5py.File(outputdir + 'train.h5', 'w') as f:
        f.create_dataset('data', data=one_hot[split:])
    
    with h5py.File(outputdir + 'dev.h5', 'w') as f:
        f.create_dataset('data', data=one_hot[0:1000])

# get rules weight
def get_rules_weight(mode_save_path):
    # set the file name of rule configuration weight
    # 
    file_path_item_list = mode_save_path.split("/")
    folder_name = file_path_item_list[1]
    rule_cfg_weight_file_index = folder_name.split("_")[0]
    rule_cfg_weight_file_name = 'trainingdata/rules-cfg-weight' + str(rule_cfg_weight_file_index) + '.txt'

    rules_weight = []
    with open(rule_cfg_weight_file_name, 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules_weight.append(float(line))
    return rules_weight


# test the accuracy of the model
def test_vaemodel(rulesfile, modelsave, datafile):
    rules = []
    with open(rulesfile, 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules.append(line)

    m = re.search(r'_L(\d+)_', modelsave)
    rules_weight = get_rules_weight(modelsave)
    print('rules_weight', rules_weight)
    visvae = VisVAE(modelsave, rules, rules_weight, MAX_LEN, BATCH, int(m.group(1)))

    h5f = h5py.File(datafile, 'r')
    data = h5f['data'][:]
    h5f.close()
    print(data.shape)

    output = visvae.vae.autoencoder.predict(data)
    count = np.sum(np.equal(np.argmax(data, axis=2), np.argmax(output, axis=2)))
    print('accuracy: ', count / float(data.shape[0] * data.shape[1]))

    return output

# helper function to check the trained encoder and decoder
def test_visvae(inputspec, rulesfile, modelsave):
    rules = []
    with open(rulesfile, 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules.append(line)

    m = re.search(r'_L(\d+)_', modelsave)
    rules_weight = get_rules_weight(modelsave)
    visvae = VisVAE(modelsave, rules, rules_weight, MAX_LEN, BATCH, int(m.group(1)))
    
    # print(inputspec)
    z = visvae.encode(inputspec)
    # print(z)
    outputspec = visvae.decode(z)
    # print(outputspec)

    return outputspec,z


# helper function to check the CFG
def test_grammar(rulesfile):
    rules = []
    with open(rulesfile, 'r') as inputs:
        rules = inputs.read().split('\n')[:-1]

    grammar = VisGrammar(rules)
    print(grammar.GCFG.start())
    print(len(grammar.GCFG.productions()))

if __name__ == '__main__':
    # The following codes need to be executed step by step
    # 1. build the CFG rules file
    # extract_rules('sourcedata/training.txt', 'trainingdata/rules-cfg.txt')
    # 2. generate the traning and testing datasets
    # generate_datasets('sourcedata/training.txt', 'trainingdata/rules-cfg.txt', 'trainingdata/')
    # # generate_datasets('sourcedata/vegaspecs-processed.txt', 'trainingdata/rules-cfg.txt', 'trainingdata/')
    # 3. generate the weighted file based on the rules-cfg
    # # runing this function need to set the filename of rules configuration object
    # we either need to call the function "compute_rule_weight" as following:
    # compute_rule_weight('trainingdata/rules-cfg-dict.json', 'trainingdata/rules-cfg.txt', 'trainingdata/rules-cfg-weight.txt')
    # or run the shell command:
    # "python rule_config.py 2", 2 means the weight_file_index
    # 4. train the model: see train.py
    # e.g., python train.py --hidden 256 --dense 256 --conv1 8 3 --conv3 8 3 --conv3 8 3 --latent 20
    # 5. train the weighted model: see train_weight.py
    # e.g., python train_weight.py --hidden 256 --dense 256 --conv1 8 3 --conv3 8 3 --conv3 8 3 --latent 20 --rulecfgindex 2
    # 6. test the model performance
    # test_vaemodel('trainingdata/rules-cfg.txt', 'trained/2_1628849300/vae_H256_D256_C888_333_L20_B200.hdf5', 'trainingdata/test.h5')
    # check if the CFG grammar works properly
    # test_grammar('trainingdata/rules-cfg.txt')
    # check if the model works properly
    folder_name = str(sys.argv[1])
    # folder_name = '2_1628849300' #3_1628854598, 2_1628849300, 1_1628846946
    inputspec = []
    with open('./sourcedata/training.txt', 'r') as inputs:
        for line in inputs:
            line = line.strip()
            inputspec.append(line)
    print('len(inputspec)', len(inputspec))
    inputspec = inputspec[0:len(inputspec)] # select 5 charts in the input to check the model output
    outputspec, embeddings = test_visvae(inputspec, 'trainingdata/rules-cfg.txt', 'trained/' + folder_name + '/vae_H256_D256_C888_333_L2_B200.hdf5')
    # with open('results.json', 'w') as outputs:
    #     outputs.write('{"input": [' + ','.join(inputspec) + '],')
    #     outputs.write('"output": [' + ','.join(outputspec) + ']}')
    np.save('embeddings/' + folder_name + '/embeddings.npy', embeddings)
    np.savetxt('embeddings/' + folder_name + '/embeddings-results.csv', embeddings, delimiter=",")
    # visualize_embedding('embeddings.npy', inputspec, './')


