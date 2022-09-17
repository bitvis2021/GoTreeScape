<template>
    <div class="search-uploading-file">
        <span class="intro">Upload the GoTree JSON file and locate it in the landscape!</span>
        <el-upload
          class="upload-demo"
          drag
          action="http://127.0.0.1:14452/"
          :http-request="getFile"
          :auto-upload="true"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-upload="onBeforeUpload"
          :on-success="handleUploadSuccess"
          :multiple="false"
          :show-file-list="true"
          multiple
          v-if="!disableUpload">
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
        </el-upload>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import { getUploadTreeVisProjectionPos } from '@/communication/sendData.js'

    export default {
        name: 'SearchTraditionalTreeVis',
        components: {
           
        },
        data() {
            return {
                activeName: 'first',
                disableUpload: window.disableUpload
            }
        },
        watch: {

        },
        created: function () {

        },
        beforeMount: function() {
        },
        mounted: function() {
           
        },
        computed: {
        },
        methods: {
            ...mapMutations([
                'UPDATE_SELECTED_DATASET_FILTER_LIST'
            ]),
            getFile: function() {
                console.log('upload file ok')
            },
            handlePreview: function(file) {
            },
            handleRemove: function() {
            },
            handleUploadSuccess: function(res, file) {
                console.log('upload success!')
            },
            onBeforeUpload: function(file) {
                let self = this
                const isJSON = file.type === 'application/json';
                const isLt2M = file.size / 1024 / 1024 < 2;
                // let fileNameArray = this.getFileNameArray()
                // let notExisted = (fileNameArray.indexOf(file.name) === -1)
                if (!isJSON) {
                  this.$message.error('The uploaded file must be JSON format!');
                  return
                }
                if (!isLt2M) {
                  this.$message.error('The file size can not exceed 2MB!');
                  return
                }
                
                var reader = new FileReader();
                reader.readAsText(file, 'utf-8');
                reader.onload = function(e) {
                    let treeJsonObj = JSON.parse(this.result)
                    console.log('treeJsonObj', treeJsonObj)
                    // uploading the searching query list
                    let searchTreeObjFileName = file['name']
                    let uploadingFileObjList = [{'label': searchTreeObjFileName, 'content': treeJsonObj, 'type': 'uploading-file'}]
                    self.UPDATE_SELECTED_DATASET_FILTER_LIST(uploadingFileObjList)
                    // let username = self.userInfoName
                    // let filename = file.name
                    // let treeInfoObj = getTreeDataInfo(treeJsonObj, username, filename)
                    // self.treeDataArray.push(treeInfoObj)
                    // if (self.userInfoName !== 'Login') {
                    //     console.log('treeInfoObj', treeInfoObj)
                    //     // If the username is not 'Login
                    //     addTreeDataset(treeInfoObj, self.addDataCallback)
                    // }
                }
                return (isJSON && isLt2M);
            }
        }
    }
</script>
<style lang="less">
    .search-uploading-file {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        .el-upload-dragger {
            width: 100% !important;
            height: 100px !important;
        }
        .el-upload {
            display: block !important;
        }
        .upload-demo {
            margin-top: 10px;
        }
    }
</style>