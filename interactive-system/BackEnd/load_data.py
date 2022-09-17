################################################################################
# load the text file
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
def load_txt_file(filename):
    with open(filename) as f:
        lines = f.readlines()
        return lines