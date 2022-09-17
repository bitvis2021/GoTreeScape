##################################################
## Modeling training of the weighted variational model scripts 
## This code is based on 
##      grammar-based VAE model (https://github.com/mkusner/grammarVAE) 
##      ChartSeer (https://github.com/jeffjianzhao/ChartSeer)
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################

from __future__ import print_function

import argparse
import os, sys
import random
import numpy as np
import time
import h5py
from model_vae_weight import ModelVAE
from keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, TensorBoard

MAX_LEN = 35 # 34
LATENT = 20
EPOCHS = 200
BATCH = 200

def get_arguments():
    params = {'hidden': 256, 'dense': 256, 'conv1': [8, 3], 'conv2': [8, 3], 'conv3': [8, 3], 'rulecfgindex': -1}

    parser = argparse.ArgumentParser(description='Vis autoencoder network')

    parser.add_argument('--epochs', type=int, metavar='N', default=EPOCHS)
    parser.add_argument('--latent', type=int, metavar='N', default=LATENT)
    parser.add_argument('--batch', type=int, metavar='N', default=BATCH)

    parser.add_argument('--index', type=int, metavar='N', default=100)
    parser.add_argument('--timestamp', type=str, metavar='N', default="00:00:00")

    parser.add_argument('--hidden', type=int, metavar='N', default=params['hidden'])
    parser.add_argument('--dense', type=int, metavar='N', default=params['dense'])
    parser.add_argument('--conv1', type=int, metavar='N', nargs=2, default=params['conv1'])
    parser.add_argument('--conv2', type=int, metavar='N', nargs=2, default=params['conv2'])
    parser.add_argument('--conv3', type=int, metavar='N', nargs=2, default=params['conv3'])

    # parse the index of rule weight configurations
    parser.add_argument('--rulecfgindex', type=int, metavar='N', default=params['rulecfgindex'])

    return parser.parse_args()

def main():
    # 0. load dataset and rules
    h5f = h5py.File('trainingdata/train.h5', 'r')
    data = h5f['data'][:]
    h5f.close()
    print('length', len(data))

    rules = []
    with open('trainingdata/rules-cfg.txt', 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules.append(line)

    # 1. get any arguments and define save file, then create the VAE model
    args = get_arguments()

    # set the file name of rule configuration weight
    rule_cfg_weight_file_index = args.rulecfgindex
    rule_cfg_weight_file_name = 'trainingdata/rules-cfg-weight' + str(rule_cfg_weight_file_index) + '.txt'
    print('rulecfgindex', rule_cfg_weight_file_index)
    print('filename', rule_cfg_weight_file_name)

    rules_weight = []
    with open(rule_cfg_weight_file_name, 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules_weight.append(float(line))

    model_index = args.index
    timestamp = args.timestamp
    random.seed(int(model_index))
    np.random.seed(int(model_index))

    # compute the item amount which is suitable for training, because we keep the weighted vector as static size
    item_amount = len(data)
    item_amount_reduced = (item_amount // (BATCH * 10)) * (BATCH * 10)
    print('data type', type(data))
    data = np.array(random.sample(list(data), item_amount_reduced))
    print('reduced length', len(data))

    params = {'hidden': args.hidden, 'dense': args.dense, 'conv1': args.conv1, 'conv2': args.conv2, 'conv3': args.conv3}
    model_save = 'trained/' + str(model_index) + '_' + timestamp +'/vae_H%d_D%d_C%d%d%d_%d%d%d_L%d_B%d.hdf5' % (args.hidden, args.dense, args.conv1[0], args.conv2[0], args.conv3[0], args.conv1[1], args.conv2[1], args.conv3[1], args.latent, args.batch)
    print('model_save', model_save)

    model = ModelVAE()
    
    print('BATCH', BATCH)
    # 2. if this results file exists already load it
    if os.path.isfile(model_save):
        model.load(rules, rules_weight, model_save, latent_rep_size = args.latent, max_length = MAX_LEN, batch_size = BATCH, hypers = params)
    else:
        model.create(rules, rules_weight, latent_rep_size = args.latent, max_length = MAX_LEN, batch_size = BATCH, hypers = params)

    # 3. only save best model found on a 10% validation set
    checkpointer = ModelCheckpoint(filepath = model_save, verbose = 1, save_best_only = True)

    reduce_lr = ReduceLROnPlateau(monitor = 'val_loss', factor = 0.2, patience = 1, min_lr = 0.00001)

    # 4. fit the vae
    model.autoencoder.fit(
        data,
        data,
        shuffle = True,
        epochs = args.epochs,
        batch_size = BATCH,
        callbacks = [checkpointer, reduce_lr, TensorBoard(log_dir='/tmp/visgvae')],
        validation_split = 0.1
    )

if __name__ == '__main__':
    main()
