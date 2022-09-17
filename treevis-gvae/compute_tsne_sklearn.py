##################################################
## compute the tsne projection results according to the embeddings
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
import os, sys
import numpy as np
np.set_printoptions(precision=3)
import pandas as pd
import json

from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.manifold import TSNE

from process_csv import save_csv_data, read_csv_data

def standardize(raw_values):
    # raw_values = df.to_numpy()
    scaler = StandardScaler()
    values = scaler.fit_transform(raw_values)
    return values
    # return pd.DataFrame(values, columns=dims)

def proj(X):
    # the range of perplexity should be in the range of [5, 50]
    Y = TSNE(n_components=2, perplexity=100, n_iter=2000).fit_transform(X)
    scaler = MinMaxScaler()
    Y = scaler.fit_transform(Y)
    Y = Y.tolist()
    # Y = np.round(Y, decimals=3).tolist()
    return Y

def add_tree_dsl_index(proj_item_list):
    '''
        the index of data item is the dsl index
    '''
    for i in range(len(proj_item_list)):
        proj_item = proj_item_list[i]
        proj_item.append(i)
    return proj_item_list

def compute_tsne_results(model_index, timestamp):
    folder_path = 'embeddings/'
    csv_name = 'embeddings-results.csv'
    folder_name = str(model_index) + '_' + str(timestamp)
    file_name = os.path.join(folder_path, folder_name, csv_name)

    df = pd.read_csv(file_name, header=None, index_col=False)
    arr = df.loc[:, :].to_numpy()
    standardize_arr = standardize(arr)

    dr_file_name = 'dr_tsne_2d_per100_' + csv_name
    dr_file_path_name = os.path.join(folder_path, folder_name, dr_file_name)
    proj_res = proj(standardize_arr)

    proj_res = add_tree_dsl_index(proj_res)
    save_csv_data(dr_file_path_name, proj_res)


if __name__ == "__main__":
    model_index = sys.argv[1]
    timestamp = sys.argv[2]
    compute_tsne_results(model_index, timestamp)

# X = np.array([[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]])
# X_embedded = TSNE(n_components=2).fit_transform(X)
