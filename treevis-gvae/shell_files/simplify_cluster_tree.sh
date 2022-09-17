##################################################
## This shell file is for simplifying the clustering tree
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
mkdir simplified_hierarchical_cluster/10_1631432994
nohup python simplify_cluster_tree.py 10_1631432994 1000 > simplified_hierarchical_cluster/10_1631432994/simplify_cluster_tree.log 2>&1 &
