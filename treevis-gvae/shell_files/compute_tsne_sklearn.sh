##################################################
## This shell file is for computing the embedding with assigning different weights of design features
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
nohup python tsne-sklearn.py 2 > ./embedding/2/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 3 > ./embedding/3/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 4 > ./embedding/4/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 5 > ./embedding/5/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 6 > ./embedding/6/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 7 > ./embedding/7/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 8 > ./embedding/8/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 9 > ./embedding/9/tsne_compute.log 2>&1 &
nohup python tsne-sklearn.py 10 > ./embedding/10/tsne_compute.log 2>&1 &

_

nohup python compute_tsne_sklearn.py 10 1631432994 > embeddings/10/compute_tsne_sklearn.log 2>&1 &

nohup python compute_tsne_sklearn.py 9 1631433543 > embeddings/9_1633504316/compute_tsne_sklearn.log 2>&1 &

nohup python compute_tsne_sklearn.py 4 1631513911 > embeddings/4_1633504371/compute_tsne_sklearn.log 2>&1 &

