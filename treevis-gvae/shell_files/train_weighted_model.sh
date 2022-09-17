##################################################
## This shell file is for training the weighted model
##################################################
## Author: Guozheng Li
## Contact: guozhg.li@gmail.com
##################################################
now=$(date +%s)
# before train the weighted vae model, adding the rule-cfg-dict.json
# 2 - test the manual cross_entropy with weight - 1, 10, 5, 1, 1
# 3 - test the manual cross_entropy with weight - 1, 10, 5, 1, 0
# 4 - test the manual cross_entropy with weight - 1, 10, 5, 1, 0.5
# 5 - test the manual cross_entropy with weight - 1, 10, 5, 1, 0.1
# 6 - test the manual cross_entropy with weight - 1, 1000, 100, 10, 1
# 7 - test the manual cross_entropy with weight - 1, 100, 50, 1, 0.1 
# 8 - test the manual cross_entropy with weight - 1, 1000, 100, 10, 0.1 
# 9 - test the manual cross_entropy with weight - 0.1, 10, 1, 0.1, 0.01 
# 10 - test the manual cross_entropy with weight - 1, 10000, 100, 1, 0.1 
# 11 - test the manual cross_entropy with weight - 1, 10000, 100, 1, 0.1 
# 12 - test the manual cross_entropy with weight - 1, 10000, 100, 1, 0.1 
# 13 - test the manual cross_entropy with weight - 1, 10000, 100, 1, 0.1 
model_index=4
echo $now
echo $model_index
dir="./trained/${model_index}_${now}"
if [[ ! -e $dir ]]; then
    mkdir $dir
else
    echo "$dir already exists"
fi
nohup python rule_config.py $model_index > "$dir/generate_weighted_rules.log" 2>&1
nohup python train_weight.py --hidden 256 --dense 256 --conv1 8 3 --conv3 8 3 --conv3 8 3 --latent 2 --index $model_index --rulecfgindex $model_index --timestamp $now > "$dir/output.log" 2>&1 &