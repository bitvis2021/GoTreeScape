<template>
  <div id="app" v-loading="loading">
    <div class="container" v-if="!loadingData && !loadingView">
      <TreeIllustratorTap v-if="displayTapName==='treeillustrator'"></TreeIllustratorTap>
      <GoTreeScapeTap v-show="displayTapName==='gotreescape'"></GoTreeScapeTap>
    </div>
  </div>
</template>

<script>
import GoTreeScapeTap from '@/views/MainTap/GoTreeScapeTap.vue'
import TreeIllustratorTap from '@/views/MainTap/TreeIllustratorTap.vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { getHierarchicalData } from '@/data-processing/get_hierarchical_data.js'
import { getTreeVisCollection } from '@/data-processing/get_treevis_collection.js'
import { getExistedTreeVisCollection } from '@/data-processing/get_projection_results.js'
import { Dataset } from '@/dataset/dataset.js'
import { getTreeDataInfo } from '@/data-processing/get_tree_data_info.js'

export default {
  name: 'app',
  components: {
    GoTreeScapeTap, TreeIllustratorTap
  },
  data() {
    return {
      appName: 'GoTreeScape',
      loadingData: true,
      loadingView: true,
      loading: true
    }
  },
  watch: {},
  created: function() {
      let self = this
  },
  beforeMount: function() {
    let self = this
    window.sysDatasetObj = new Dataset()
    let treeUnitDataDeferObj = $.Deferred(), treeDataDeferObj = $.Deferred(), treevisCollectionDeferObj = $.Deferred(),
      existedTreevisCollectionDeferObj = $.Deferred()
    // after loading treeunit data, original hierarchical data, and tree declarative language,
    // start computing the layout of tree visualizations
    $.when(treeUnitDataDeferObj, treeDataDeferObj, treevisCollectionDeferObj, existedTreevisCollectionDeferObj).then(async() => {
        self.loadingData = false
        self.loadingView = false
        self.loading = false
    })
    //  load the dataset for the thumbnail on the tree visualization landscape
    let thumbnailDataset = 'thumbnail.json'
    getHierarchicalData(thumbnailDataset).then(function(hierarchicalData) {
        // extract the data characteristic from the hierarchical dataset
        sysDatasetObj.updateTreeUnitDataset(hierarchicalData)
        treeUnitDataDeferObj.resolve()
    })
    // determine the name of the selected hierarchical dataset 
    // let selectHierarchicalDataName = 'flare.json'
    let selectHierarchicalDataName = 'treeunit-dataset.json'
    // the list of selected hierarchical dataset
    // load all dataset in the tree dataset list
    let initTreeDataNameList = ['treeunit-dataset.json']//'flare.json'
    let deferList = []
    for (let i = 0; i < initTreeDataNameList.length; i++) {
      deferList.push($.Deferred())
    }
    $.when(...deferList).then(function() {
      // update the underlying dataset of the preview panel and the selected panel
      sysDatasetObj.updateSelectDataset(selectHierarchicalDataName)
      sysDatasetObj.updateThumbnailDataset()
      sysDatasetObj.updatePreviewDataset()
      treeDataDeferObj.resolve()
    })
    for (let i = 0; i < initTreeDataNameList.length; i++) {
      let deferObj = deferList[i]
      let treeDataName = initTreeDataNameList[i]
      self.loadHierarchicalDataList(treeDataName, deferObj)
    } 
    // TODO, to test the setting panel in the App.vue, we comment the following parts as weel as treevisMapSVG
    // We also just change the states of two defers, treevisCollectionDeferObj, and treevisCollectionDeferObj
    getTreeVisCollection().then(function(treevisCollection) {
      sysDatasetObj.addTreeVisCollectionDataset(treevisCollection)
      treevisCollectionDeferObj.resolve()
    })
    getExistedTreeVisCollection().then(function(existedTreevisCollection) {
      sysDatasetObj.addExistedTreeVisCollectionDataset(existedTreevisCollection)
      existedTreevisCollectionDeferObj.resolve()
    })
    // update the traditional tree visualization object list
    sysDatasetObj.updateTraditionalTreeVisObjList()
  },
  mounted: function() {
  },
  computed: {
    ...mapState([
      'displayTapName'
    ])
  },
  methods: {
    ...mapMutations([]),
    loadHierarchicalDataList: function(treeDataName, deferObj) {
      let self = this
      let initUserName = 'root'
      getHierarchicalData(treeDataName).then(function(hierarchicalData) {
          // extract the data attribute from the hierarchical data
          let treeDataInfo = getTreeDataInfo(hierarchicalData, initUserName, treeDataName)
          sysDatasetObj.addTreeDataset(treeDataInfo)
          deferObj.resolve()
      })
    }
  }
}
</script>
<style scoped lang="less">
  #app {
    height: 100%;
    width: 100%;
    .container {
      height: 100%;
      width: 100%;
    }
  }
</style>
<style lang="less">
  @menu-height: 2.5rem; //
  html, body { 
    height: 100%;
    width: 100%;
    margin: 0px;
    overflow:hidden; 
  }
  .el-menu-item#login-icon {
    float: right;
  }
  .el-submenu {
    height: @menu-height;
    line-height: @menu-height;
    padding: 0 0px !important;
  }
  .el-submenu__title {
    height: @menu-height !important;
    line-height: @menu-height !important;
    padding: 0 10px !important;
    border-bottom-color: rgb(84, 92, 100) !important;
   }
  .el-menu-item {
    height: 40px !important;
  }
  .el-submenu__icon-arrow {
    // margin-top: 0px !important;
   }
  .el-loading-mask {
    background-color: #ffffff;
    .el-loading-spinner {
      margin-top: -5%;
      .circular {
        width: 8%;
        height: 8%;
      }
    }
  }
  // the selection dialog for the dataset
  #dataset-dialog {
    .el-dialog {
      width: 40%;
      .el-dialog__header {
        text-align: left;
      }
      .el-dialog__body {
        padding-top: 0px !important;
      }
    }
  }
  //  the selection dialog for the dsl selection
  #treedsl-dialog {
    .el-dialog {
      width: 80%;
      height: 70%;
      overflow-y: auto;
      .el-dialog__header {
        position: fixed;
        text-align: left;
        width: calc(~"80% - 40px");
        background-color: white;
        z-index: 100;
      }
      .el-dialog__body {
        padding-top: 54px !important;
      }
    }
  }
  //  the dialog for data exporting
  #export-dialog {
    .el-dialog {
      width: 40%;
      .el-dialog__header {
        text-align: left;
      }
      .el-dialog__body {
        padding-top: 0px !important;
      }
    }    
  }
  .dialog-drag{ 
      min-width:10em;
      background-color:#e6eee9;
      box-shadow:2px 2px 1px rgba(0,0,0,0.5)
  }
  .dialog-1.dialog-drag{
      border: rgb(103, 103, 103) solid 1px;
      background-color:#fff;
      box-shadow: none;
  }
  .dialog-1.dialog-drag .dialog-header{
      background-color: transparent;
  }
  .dialog-1.dialog-drag .dialog-header .buttons button{
      color: rgb(103, 103, 103);
      &.pin {
        display: none;
      }
      &.close:hover {
        color: red;
        cursor: pointer;
      }
  }
  .dialog-1.dialog-drag .dialog-header .title{
      display:none
  }
  .dialog-drag.dialog-1.fixed{
      border:#1aad8d solid 2px;
  }
  #setting-dialog {
    position: absolute;
    .setting-item {
      text-align: left;
    }
    #random-preview {
      .icon {
        cursor: pointer;
        &:hover {
          font-weight: bold;
          color: #409EFF;
        }
      }
      .el-checkbox__label {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        font-weight: 500;
        color: #606266;
      }
    }
  }
  .el-divider--horizontal {
    margin: 5px 0 !important;
  }
  .el-slider__button {
    width: 12px !important;
    height: 12px !important;
    border-color: #999999 !important;
    border-width: 1px !important;
    background-color: white;
  }
  .el-slider__bar {
    background-color: gray;
  }
  .el-slider__runway {
    background-color: gray;
    margin: 8px 0 !important;
  }
</style>