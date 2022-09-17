##################################################
## This shell file is for computing the embedding with assigning different weights of design features
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
# # change the foldername of model1
# # uncomment data_utils_weight.py - line 185 - 196 
# # change the model name 'trained/1_1628846946/vae_H256_D256_C888_333_L20_B200.hdf5' 
# mkdir embeddings/1_1628846946
# nohup python compute_embeddings_weighted.py 1_1628846946 > trained/1_1628846946/test_model_output2.log 2>&1 &
# # # change the foldername of model2
# # uncomment data_utils_weight.py - line 185 - 196 
# # change the model name 'trained/2_1628849300/vae_H256_D256_C888_333_L20_B200.hdf5'
# mkdir embeddings/2_1628849300
# nohup python compute_embeddings_weighted.py 2_1628849300 > trained/2_1628849300/test_model_output2.log 2>&1 &
# # # # change the foldername of model3
# # # uncomment data_utils_weight.py - line 181
# # # change the model name 'trained/3_1628854598/vae_H256_D256_C888_333_L20_B200.hdf5' 
# mkdir embeddings/3_1628854598
# nohup python compute_embeddings_weighted.py 3_1628854598 > trained/3_1628854598/test_model_output2.log 2>&1 &
# # # change the foldername of model4
# # uncomment data_utils_weight.py - line 185 - 196 
# # change the model name 'trained/4_1629103924/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/4_1631513911
nohup python compute_embeddings_weighted.py 4_1631513911 > trained/4_1631513911/test_model_output2.log 2>&1 &
# # change the foldername of model5
# uncomment data_utils_weight.py - line 185 - 196 
# change the model name 'trained/5_1629104059/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/5_1631513889
nohup python compute_embeddings_weighted.py 5_1631513889 > trained/5_1631513889/test_model_output2.log 2>&1 &
# # change the foldername of model5
# uncomment data_utils_weight.py - line 185 - 196 
# change the model name 'trained/6_1629897000/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/6_1631513857
nohup python compute_embeddings_weighted.py 6_1631513857 > trained/6_1631513857/test_model_output2.log 2>&1 &
# # change the foldername of model5
# uncomment data_utils_weight.py - line 185 - 196 
# change the model name 'trained/7_1631513831/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/7_1631513831
nohup python compute_embeddings_weighted.py 7_1631513831 > trained/7_1631513831/test_model_output2.log 2>&1 &
# # change the foldername of model5
# uncomment data_utils_weight.py - line 185 - 196 
# change the model name 'trained/8_1630570538/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/8_1631433579
nohup python compute_embeddings_weighted.py 8_1631433579 > trained/8_1631433579/test_model_output2.log 2>&1 &
# # change the foldername of model5
# uncomment data_utils_weight.py - line 185 - 196 
# change the model name 'trained/9_1630570636/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/9_1631433543
nohup python compute_embeddings_weighted.py 9_1631433543 > trained/9_1631433543/test_model_output2.log 2>&1 &
# # change the foldername of model5
# uncomment data_utils_weight.py - line 185 - 196 
# change the model name 'trained/10_1630570730/vae_H256_D256_C888_333_L20_B200.hdf5'
mkdir embeddings/10_1631432994
nohup python compute_embeddings_weighted.py 10_1631432994 > trained/10_1631432994/test_model_output2.log 2>&1 &

mkdir embeddings/10_1632445661
nohup python compute_embeddings_weighted.py 10_1632445661 > trained/10_1632445661/test_model_output2.log 2>&1 &

