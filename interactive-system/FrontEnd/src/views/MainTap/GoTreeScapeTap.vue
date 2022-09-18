<template>
  <div id="container">
    <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#676767"
        text-color="#fff"
        :key="componentKey"
        :default-active="activeIndex"
        menu-trigger="click"
        active-text-color="#ffd04b">
        <el-menu-item class='labelIcon' id="title" index="title">
          {{appName}}
        </el-menu-item>
        <el-tooltip class='labelIcon' key="data" content="dataset dialog" effect="light">
          <el-menu-item @click="handleClickDataIcon" index="data">
            <i class="icon iconfont icon-data"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip class='labelIcon' key="export" content="export option dialog" effect="light">
          <el-menu-item @click="exportDialogVisible=true" index="export">
            <i class="icon iconfont icon-export"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip class='labelIcon' key="gallery" content="exploration history" effect="light">
          <el-menu-item @click="updateGalleryState" index="gallery" id="gallery-open" :class="{'active': galleryOpen}">
            <i class="icon iconfont icon-gallery-"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip class='labelIcon' key="settings" content="show settings configurations" effect="light">
          <el-menu-item @click="updateSettingState" index="setting" id="setting-open" :class="{'active': settingDialogOpen}">
            <i class="icon iconfont icon-setting1"></i>
          </el-menu-item>
        </el-tooltip>
    </el-menu>
    <!--main view-->
    <div class = "content-container">
        <div class = "content"
          @click="deactivateSearchTreeVis">
          <!-- <div class = "left-panel">
            <div class = "left-top-panel">
              <DataView></DataView>
            </div>
            <div class = "left-bottom-panel">
              <TopologyView></TopologyView>
            </div>
          </div>
          <div class = "middle-panel">
            <QueryView></QueryView>
          </div> -->
          <div class = "right-panel">
            <div class = "bottom-panel">
              <!-- <div id = "tree-canvas-view-title">
                <TreeVisMapTitle
                  :title="treeVisMapViewTitle">
                </TreeVisMapTitle>
              </div> -->
              <div id = "tree-canvas-view-body">  
               <!--  <div id = "treecanvas-content-view" :class="{'hide': this.displayedPanel==='map'}">
                  <TreeCanvas :treeCanvasKey="treeCanvasKey" :sendSVGData="true"></TreeCanvas>
                </div> -->
                <!-- <div id = "treemap-content-view" :class="{'hide': this.displayedPanel==='canvas'}">
                  <TreeVisMap :maxDslAmountIndex="maxDslAmountIndex" />
                </div> -->
                <div id = "treemap-content-view" :class="{'hide': this.displayedPanel==='canvas', 'gallery-open': galleryOpen, 'related-view-open': relatedViewOpen}">
                    <TreeVisMapSvg :underlyingDatasetSignal="underlyingDatasetSignal" :maxDslAmountIndex="maxDslAmountIndex" />
                </div>
                <div id = "treevis-gallery-view" :class="{'gallery-open': galleryOpen}">
                    <TreeVisGalleryView v-show="galleryOpen"></TreeVisGalleryView>
                </div>
                <div id = "treevis-related-view" :class="{'related-view-open': relatedViewOpen}">
                    <TreeVisRelatedView v-show="relatedViewOpen"></TreeVisRelatedView>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class = "search-view-container">
          <transition name="expand" mode="out-in">
            <div class="search-view" :class="{ bigger: showSearchContentPanel }" @click="activateSearchTreeVis">
              <i class="icon iconfont search icon-search" key="small"></i>
              <div class="search-view-content">
                <el-tag v-for="filterObj in selectedDatasetFilterList"
                          :type="computeFilterType(filterObj)"
                          @close="closeFilterObj(filterObj)"
                          closable
                          size="mini">
                    {{ processFilterContent(filterObj) }}
                </el-tag>
              </div>
            </div>
          </transition>
          <!-- TODO -->
          <div v-if="showSearchContentPanel" class="search-content-panel" :class="{ bigger: showSearchContentPanel }">
            <SearchContentView></SearchContentView>
          </div>
        </div>
    </div>
    <!--data dialog-->
    <el-dialog title="Dataset" id="dataset-dialog" :visible.sync="dataDialogVisible">
      <DataDialog
        :dataDialogKey="dataDialogKey"
        @updateSelectedTreeDatasetName="updateSelectedTreeDatasetName"
        @closeDataDialog="closeDataDialog">
      </DataDialog>
    </el-dialog>
    <!--export dialog-->
    <el-dialog title="Export" id="export-dialog" :destroy-on-close="true" :visible.sync="exportDialogVisible">
      <ExportDialog />
    </el-dialog>
    <dialog-drag 
      id="setting-dialog" class="dialog-1" v-show="settingDialogOpen"
      :options="settingOptionObj"
      @close="closeSettingDialog" @move="moveSettingDialog">
      <div class="setting-item">
          landmarks
      </div>
      <div class="setting-item" id="random-preview">
          <i class="icon el-icon-refresh" @click="refreshLandmarkPreview"></i><span class="el-checkbox__label">update</span>
      </div>
      <div class="setting-item">
          <el-checkbox v-model="localShowLandmarkPoint" @change="updateLandscapeSettings()">show point</el-checkbox>
      </div>
      <div class="setting-item">
          <el-checkbox v-model="localShowClusterBoundary" @change="updateLandscapeSettings()">show boundary</el-checkbox>
      </div>
      <div class="setting-item">
          <el-checkbox v-model="localShowLandmarkPreview" @change="updateLandscapeSettings()">show preview</el-checkbox>
      </div>
      <div class="setting-item">
          <span>
            amount:
          </span>
          <el-slider
            v-model="localLandmarkPreviewAmount"
            @change="changeLandmarkPreviewAmount"
            :min="localMinPreviewAmount"
            :max="localMaxPreviewAmount">
          </el-slider>
      </div>
      <el-divider></el-divider>
      <div class="setting-item">
          customized trees
      </div>
      <div class="setting-item">
          <el-checkbox v-model="localShowExistTreePoint" @change="updateLandscapeSettings()">show point</el-checkbox>
      </div>
      <div class="setting-item">
          <el-checkbox v-model="localShowExistTreePreview" @change="updateLandscapeSettings()">show preview</el-checkbox>
      </div>
    </dialog-drag>
  </div>
</template>

<script>
import TreeVisMap from '@/views/TreeVisMapView/TreeVisMap.vue'
import TreeVisMapSvg from '@/views/TreeVisMapView/TreeVisMapSvg.vue'
import SearchView from '@/views/SearchView/SearchView.vue'
import SearchContentView from '@/views/SearchView/SearchContentView.vue'
import TreeVisMapTitle from '@/views/TreeVisMapView/TreeVisMapTitle.vue'
import TreeVisGalleryView from '@/views/TreeGalleryView/TreeVisGalleryView.vue'
import TreeVisRelatedView from '@/views/TreeGalleryView/TreeVisRelatedView.vue'
// import DataView from './views/Components/DataView.vue'
// import TopologyView from './views/Components/TopologyView.vue'
// import QueryView from './views/Components/QueryView.vue'
import DataDialog from '@/views/Dialog/DataDialog.vue'
import ExportDialog from '@/views/Dialog/ExportDialog.vue'
import TreedslDialog from '@/views/Dialog/TreedslDialog.vue'
// import TreeCanvas from '@/views/TreeCanvasView/TreeCanvas.vue'
import { getHierarchicalData } from '@/data-processing/get_hierarchical_data.js'
import { getHierarchicalDSL } from '@/data-processing/get_hierarchical_dsl.js'
import { getTreeVisCollection } from '@/data-processing/get_treevis_collection.js'
import { getTreeDataInfo } from '@/data-processing/get_tree_data_info.js'
import { getTreeTemplate } from '@/data-processing/get_tree_template.js'
import { getLayoutValue } from '@/data-processing/get_layout_value.js'
import { getTreeLayout } from '@/data-processing/get_tree_layout.js'
import { addDefaultCoordElement } from '@/data-processing/add_default_coord_element.js'
import { getExistedTreeVisCollection } from '@/data-processing/get_projection_results.js'
import { getNodeLinkAttr } from '@/data-processing/get_node_link_attr.js'
import { getConfig } from '@/config/config.js'
import { Dataset } from '@/dataset/dataset.js'
import { mapState, mapMutations, mapActions } from 'vuex'
import * as lscgSolver from 'lscg-solver'
import { queryDataset, queryTemplate, addTreeTemplate } from '@/communication/sendData.js'
import saveSvgAsPng from 'save-svg-as-png'
import DialogDrag from 'vue-dialog-drag'

export default {
  name: 'gotreescape-tap',
  components: {
    DataDialog, ExportDialog, TreedslDialog,
    // DataView, TopologyView, QueryView, 
    TreeVisMap, 
    TreeVisMapTitle, 
    // TreeCanvas, 
    TreeVisMapSvg,
    SearchView, SearchContentView,
    TreeVisGalleryView, TreeVisRelatedView,
    DialogDrag
  },
  data() {
    return {
      appName: 'GoTreeScape',
      treeVisMapViewTitle: 'Overview',
      treeTemplateObj: null,
      activeIndex: null,
      componentKey: 0,
      dataDialogVisible: false,
      exportDialogVisible: false,
      loading: true,
      loadingData: true,
      loadingView: true,
      OPEN_PREVIEW_PANEL_DURATION: 1000,
      userInfoDialogKey: 0,
      dataDialogKey: 0,
      // treedslDialogUpdate: 1,
      dslNameIndex: 0,
      maxDslAmountIndex: 5, // TODO 200
      treeCanvasKey: 0,
      showSearchContentPanel: false,
      localShowLandmarkPoint: false,
      localShowLandmarkPreview: false,
      localShowExistTreePoint: false,
      localShowExistTreePreview: false,
      localShowClusterBoundary: false,
      settingDialogOpen: false,
      localLandmarkPreviewAmount: 40, 
      localMinPreviewAmount: 0,
      localMaxPreviewAmount: 100,
      settingDialogX: 50,
      settingDialogY: 50,
      underlyingDatasetSignal: 0, // the signal for undating the underlying dataset
      settingOptionObj: {
        centered: "viewport"
      }
      // galleryOpen: false,
      // relatedViewOpen: true
    }
  },
  watch: {},
  created: function() {
      let self = this
  },
  beforeMount: function() {
    let self = this
    // window.sysDatasetObj = new Dataset()
    // let treeUnitDataDeferObj = $.Deferred(), treeDataDeferObj = $.Deferred(), treevisCollectionDeferObj = $.Deferred(),
    //   existedTreevisCollectionDeferObj = $.Deferred()
    // // after loading treeunit data, original hierarchical data, and tree declarative language,
    // // start compute the layout of tree visualizations
    // $.when(treeUnitDataDeferObj, treeDataDeferObj, treevisCollectionDeferObj, existedTreevisCollectionDeferObj).then(async() => {
    //     self.loading = false
    //     self.loadingData = false
    //     self.loadingView = false
    // })
    // //  load the dataset for the thumbnail on the tree visualization landscape
    // let thumbnailDataset = 'thumbnail.json'
    // getHierarchicalData(thumbnailDataset).then(function(hierarchicalData) {
    //     //  extract the data characteristic from the hierarchical dataset
    //     sysDatasetObj.updateTreeUnitDataset(hierarchicalData)
    //     treeUnitDataDeferObj.resolve()
    // })
    // // determine the name of the selected hierarchical dataset 
    // let selectHierarchicalDataName = 'flare-vis.json'
    // let previewHierarchicalDataName = 'navitreetor_data3.json'
    // // the list of selected hierarchical dataset
    // // load all dataset in the tree dataset list
    // let initTreeDataNameList = ['navitreetor_data3.json', 'flare-vis.json']
    // let deferList = []
    // for (let i = 0; i < initTreeDataNameList.length; i++) {
    //   deferList.push($.Deferred())
    // }
    // $.when(...deferList).then(function () {
    //   // update the underlying dataset of the preview panel and the selected panel
    //   sysDatasetObj.updateSelectDataset(selectHierarchicalDataName)
    //   sysDatasetObj.updatePreviewDataset(previewHierarchicalDataName)
    //   // self.updateSelectedHierarchicalData(selectHierarchicalDataName)
    //   // self.updatePreviewHierarchicalData(previewHierarchicalDataName)
    //   treeDataDeferObj.resolve()
    // })
    // for (let i = 0; i < initTreeDataNameList.length; i++) {
    //   let deferObj = deferList[i]
    //   let treeDataName = initTreeDataNameList[i]
    //   self.loadHierarchicalDataList(treeDataName, deferObj)
    // } 
    // // TODO, to test the setting panel in the App.vue, we comment the following parts as weel as treevisMapSVG
    // // We also just change the states of two defers, treevisCollectionDeferObj, and treevisCollectionDeferObj
    // getTreeVisCollection().then(function(treevisCollection) {
    //   sysDatasetObj.addTreeVisCollectionDataset(treevisCollection)
    //   treevisCollectionDeferObj.resolve()
    // })
    // getExistedTreeVisCollection().then(function(existedTreevisCollection) {
    //   sysDatasetObj.addExistedTreeVisCollectionDataset(existedTreevisCollection)
    //   existedTreevisCollectionDeferObj.resolve()
    // })
    // // treevisCollectionDeferObj.resolve()
    // // existedTreevisCollectionDeferObj.resolve()
    // // update the traditiona tree visualization object list
    // this.updateTraditionalTreeVisObjList()
    // // initialize the settting about guidance on tree visualization landsacpe, including the points and previews
    this.initLandscapeSettings()
  },
  mounted: function() {
    //  Initialize the linear solver
    this.initializeLSCG()
  },
  computed: {
    ...mapState([
      'userInfoName',
      'treeViewUpdate',
      'currentTree',
      'treeDataViewFormat',
      'treeDslOption', 
      'previewTreeObj',
      'selectedDataset',
      'focusedTreeObjArray',
      'positionArray',
      'displayedPanel',
      'selectedDatasetFilterList',
      'galleryOpen',
      'relatedViewOpen',,
      'showLandmarkPoint',
      'showLandmarkPreview',
      'showExistTreePoint',
      'showExistTreePreview',
      'showClusterBoundary'
    ])
  },
  methods: {
    iconClass(operation) {
      return 'icon-' + operation
    },
    clickMenuItem(event) {
      console.log('event', event)
    },
    changeHandler(event1, event2) {
      console.log('event', event1, event2)
    },
    initLandscapeSettings: function() {
      // update local variable according to the variables in states
      this.localShowLandmarkPoint = this.showLandmarkPoint
      this.localShowLandmarkPreview = this.showLandmarkPreview
      this.localShowExistTreePoint = this.showExistTreePoint
      this.localShowExistTreePreview = this.showExistTreePreview
      this.localShowClusterBoundary = this.showClusterBoundary
    },
    onShow() {},
    loadHierarchicalDataList: function(treeDataName, deferObj) {
      let self = this
      let initUserName = 'root'
      getHierarchicalData(treeDataName).then(function(hierarchicalData) {
          //  Extract data attributes in hierarchicalData
          let treeDataInfo = getTreeDataInfo(hierarchicalData, initUserName, treeDataName)
          sysDatasetObj.addTreeDataset(treeDataInfo)
          deferObj.resolve()
      })
    },
    handleClickDataIcon: function() {
      this.dataDialogVisible = true
      this.dataDialogKey = (this.dataDialogKey + 1) % 2
    },
    promptMessage: function(type, message) {
      this.$message({
        type: type,
        message: message
      })
    },
    updateGalleryState: function() {
      let self = this
      if (this.galleryOpen) {
        // open -> close
        let galleryOpenState = false
        this.UPDATE_GALLERY_OPEN(galleryOpenState)
      } else {
        //  gallery close -> open, also close the related view when it is open
        let galleryOpenState = true
        this.UPDATE_RELATED_VIEW_OPEN(!galleryOpenState)
        this.UPDATE_GALLERY_OPEN(galleryOpenState)
      }
    },
    updateSettingState: function() {
      let self = this
      this.settingDialogOpen = !this.settingDialogOpen
    },
    updateLandscapeSettings: function(settingType) {
      let self = this
      this.UPDATE_SHOW_LAND_MARK_POINT_STATE(this.localShowLandmarkPoint)
      this.UPDATE_SHOW_LAND_MARK_PREVIEW_STATE(this.localShowLandmarkPreview)
      this.UPDATE_SHOW_EXISTED_TREE_POINT_STATE(this.localShowExistTreePoint)
      this.UPDATE_SHOW_EXISTED_TREE_PREVIEW_STATE(this.localShowExistTreePreview)
      this.UPDATE_SHOW_CLUSTER_BOUNDARY(this.localShowClusterBoundary)
    },
    refreshLandmarkPreview: function() {
      let self = this
      this.REFRESH_LANDMARK_PREVIEW()
    },
    // integrate different declarative language objects into one treeDSLcontentObj
    getTreeDSLContentObj: function(treeIndexWithDSL) {
      let treeDSLContentObj = {}
      for(let item in treeIndexWithDSL) {
       let dslName = treeIndexWithDSL[item]
       treeDSLContentObj[dslName] = sysDatasetObj.getTreeDSLObject(dslName)
      }
      return treeDSLContentObj
    },
    activateSearchTreeVis: function() {
      this.showSearchContentPanel = true
    },
    deactivateSearchTreeVis: function() {
      this.showSearchContentPanel = false
    },
    //  update name of the selected dataset
    //  update the selected hierarchical dataset in this function
    updateSelectedTreeDatasetName: function(selectedFileName) {
      let self = this
      console.log('========updateSelectedTreeDatasetName========', selectedFileName)
      sysDatasetObj.updateSelectDataset(selectedFileName)
      sysDatasetObj.updateThumbnailDataset()
      sysDatasetObj.updatePreviewDataset()
      self.underlyingDatasetSignal = (self.underlyingDatasetSignal + 1) % 2
      // self.updateSelectedHierarchicalData(selectedFileName)
    },
    // update the traditional tree visualizations in the dataset object
    updateTraditionalTreeVisObjList: function() {
      sysDatasetObj.updateTraditionalTreeVisObjList()
    },
    //  close the data dialog
    closeDataDialog: function() {
      this.dataDialogVisible = false
    },
    closeSettingDialog: function() {
      this.settingDialogOpen = false
    },
    moveSettingDialog: function(data) {

    },
    // add the tag to filters
    computeFilterType: function(filterObj) {
      let tagType = ''
      if (filterObj['type'] === 'design-feature') {
          tagType = 'success' // traditiona tree visualizations
      } else if (filterObj['type'] === 'traditional') {
          tagType = 'warning' // design features
      } else if (filterObj['type'] === 'uploading-file') {
          tagType = 'info' // uploading files
      }
      return tagType
    },
    // close the filter object
    closeFilterObj: function(filterObj) {
      let remainedDatasetFilterList = []
      for (let i = 0; i < this.selectedDatasetFilterList.length; i++) {
        let selectedDatasetFilter = this.selectedDatasetFilterList[i]
        if (selectedDatasetFilter['label'] !== filterObj['label']) {
          remainedDatasetFilterList.push(selectedDatasetFilter)
        }
      }
      this.UPDATE_SELECTED_DATASET_FILTER_LIST(remainedDatasetFilterList)
    },
    // compute the filter content
    processFilterContent: function(filterObj) {
      // extract the specific content of the filter
      if (filterObj['type'] === 'design-feature') {
        let filterContentList = filterObj['label'].split('> ')
        return filterContentList[1]
      } else {
          return filterObj['label']
      }
    },
    // //  update the selected hierarchical dataset in this function
    // updateSelectedHierarchicalData: function(selectedTreeDataName) {
    //   let self = this
    //   sysDatasetObj.updateDataset(selectedTreeDataName)
    //   // let allTreeObjIdArray = sysDatasetObj.getAllTreeObjIdArray()
    //   // let attrObjArray = sysDatasetObj.extractAttrArray()
    //   // self.UPDATE_ATTR_OBJ_ARRAY(attrObjArray)
    //   // self.UPDATE_FOCUS_TREE_OBJ_ARRAY(allTreeObjIdArray)
    //   console.log('UPDATE_SELECTED_DATASET', selectedTreeDataName)
    //   // self.UPDATE_SELECTED_DATASET(selectedTreeDataName)
    //   // update TreeIndexWithDsl object correspondingly after updating hierarchical data 
    //   // self.updateLayoutParas()
    //   // let layoutParas = sysDatasetObj.getLayoutParas()
    // },
    // updateLayoutParas: function() {
    //   let self = this
    //   let layoutParas = sysDatasetObj.getLayoutParas()
    //   let treeIndexWithDSL = layoutParas.treeIndexWithDSL
    //   let treeDSLContentObj = layoutParas.treeDSLContentObj
    //   if ((typeof(treeIndexWithDSL) !== 'undefined') && (typeof(treeDSLContentObj) !== 'undefined')) {
    //       let globalTreeDSL = treeIndexWithDSL['index-0']
    //       let allTreeObjIdArray = sysDatasetObj.getAllTreeObjIdArray()
    //       // Add treeDSL of new nodes
    //       for (let i = 0;i < allTreeObjIdArray.length;i++) {
    //         let treeNodeIndex = allTreeObjIdArray[i]
    //         if (typeof(treeIndexWithDSL[treeNodeIndex]) === 'undefined') {
    //           treeIndexWithDSL[treeNodeIndex] = globalTreeDSL
    //         }
    //       }
    //       for (let item in treeIndexWithDSL) {
    //         if (allTreeObjIdArray.indexOf(item) === -1) {
    //           // This node does not exist in the current hierarchy data
    //           delete treeIndexWithDSL[item]
    //         }
    //       }
    //   } 
    // },
    initializeLSCG: async function() {
       await lscgSolver.initialize().then(() => {
       });
       window.lscgSolver = lscgSolver
    },
    changeLandmarkPreviewAmount: function() {
      let self = this
      this.UPDATE_LAND_PREVIEW_AMOUNT(this.localLandmarkPreviewAmount)
    },
    //  Use mapMutation to combine mutations in an array with other methods
    ...mapMutations([
      'UPDATE_SELECTED_DATASET',
      'UPDATE_ATTR_OBJ_ARRAY',
      'UPDATE_FOCUS_TREE_OBJ_ARRAY',
      'UPDATE_TREE_CANVAS_LAYOUT_STATE',
      'UPDATE_SELECTED_DATASET_FILTER_LIST',
      'UPDATE_GALLERY_OPEN',
      'UPDATE_RELATED_VIEW_OPEN',
      'UPDATE_LAND_PREVIEW_AMOUNT',
      'UPDATE_SHOW_LAND_MARK_POINT_STATE',
      'UPDATE_SHOW_LAND_MARK_PREVIEW_STATE',
      'UPDATE_SHOW_EXISTED_TREE_POINT_STATE',
      'UPDATE_SHOW_EXISTED_TREE_PREVIEW_STATE',
      'REFRESH_LANDMARK_PREVIEW',
      'UPDATE_SHOW_CLUSTER_BOUNDARY'
    ])
  }
}
</script>
<style scoped lang="less">
@left_panel-width: 0px;//200px;
@middle_panel-width: 0px;//200px;
@background: #ffffff;//#f7f7f7;
@right_panel_bottom-height: 0px;//150px;
@left_panel_top-height: 50%;
@left_panel_middle-height: 25%;
@left_panel_bottom-height: 21%;
@tree_canvas_view_title-height: 0rem;//2rem;
@menu-height: 2.5rem; //
@border-style: 0rem solid;
@treevis_related_gallery_view_width: 200px;

.container {
  font-family: @font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: absolute;
  top: 0%;
  left: 0%;
  bottom: 0%;
  right: 0%;
  overflow-y: hidden;
  .iconfont {
    font-size: 1rem;
  }
  .el-menu.el-menu--horizontal {
    .el-menu-item {
      height: @menu-height;
      line-height: @menu-height;
    }
    .el-submenu, .el-menu-item {
      border-bottom-color: rgb(84, 92, 100) !important;
      font-weight: bolder;
      font-size: 1rem;
      color: #dadada !important;
      padding: 0 10px;
      // border-bottom-color: #f1f5f9 !important;
      .icon {
        color: #dadada !important;
      }
    }
    .el-menu-item#gallery-open {
      float: right;
      right: 5px;
    }
    .el-menu-item {
      &.active {
        background-color: #525252 !important;
      }
    }
  }
  .layout {
    width: 800px;
    height: 100%;
    // background: #f7f7f7;
  }
  .title {
    margin-top: 1rem;
  }
  .content-container {
    position: absolute;
    top: @menu-height;
    left: 0%;
    bottom: 0%;
    right: 0%;
    .search-view-container {
      position: absolute;
      top: 10px;
      left: 15px;
      width: 200px;
      // height: 370px;
      display: flex;
      flex-direction: column;
      .search-view {
        width: 200px;
        height: 30px;
        border: #dddddd solid 1px;
        text-align: left;
        cursor: pointer;
        display: flex;
        align-items: center;
        // background-color: #e2e8f0;
        background-color: white;
        .icon-search {
          margin-left: 3px;
          font-size: 1.5rem;
        }
        .search-view-content {
          width: 100%;
          height: 30px;
          display: inline-flex;
          align-items: center;
          overflow-x: auto;
        }
        &:hover {
          background-color: #cbd5e1;
        }
        .el-tag {
          margin-right: 2px;
        }
      }
      .bigger {
        transition: max-height 0.25s ease-out;
        width: 300px !important;
        transition-duration: 0.05s;
        transition-property: width;
      }
      .search-content-panel {
        width: 300px;
        height: 320px;
        border: #dddddd solid 1px;
        border-top: #dddddd solid 0px;
        background-color: white;
        // background-color: #e2e8f0;
      }
    }
    .content{
      position: absolute;
      top: 0%;
      left: 0%;
      bottom: 0%;
      right: 0%;
      .left-panel {
        position: absolute;
        left: 0px;
        top: 0%;
        width: @left_panel-width;
        bottom: 0%;
        display: flex;
        background-color: @background;
        .left-top-panel {
          position: absolute;
          top: 0%;
          height: @left_panel_top-height;
          left: 0%;
          width: 100%;
          border-bottom: @border-style;
        }
        .left-bottom-panel {
          position: absolute;
          top: @left_panel_top-height;
          bottom: 0%;
          left: 0%;
          width: 100%;
        }
      }
      .middle-panel {
        position: absolute;
        top: 0%;
        left: @left_panel-width;
        width: @middle_panel-width;
        bottom: 0%;
        border-left: @border-style;
      }
      .right-panel {
          position: absolute;
          left: @left_panel-width + @middle_panel-width;
          top: 0%;
          right: 0%;
          bottom: 0%;
          border-left: @border-style;
          background-color: @background;
          .bottom-panel {
            position: absolute;
            top: @right_panel_bottom-height;
            height: calc(~"100% -" @right_panel_bottom-height);
            left: 0%;
            width: 100%;
            #tree-canvas-view-title {
              position: absolute;
              top: 0%;
              height: @tree_canvas_view_title-height;
              left: 0%;
              width: 100%;
            }
            #tree-canvas-view-body {
              position: absolute;
              width: 100%;
              left: 0%;
              top: @tree_canvas_view_title-height;
              bottom: 0%;
              overflow: hidden;
              display: flex;
              background: white;
              border-top: @border-style;
                #original-data-view {
                  position: absolute;
                  height: auto;
                  width: 20%;
                  top: 0%;
                  left: -20%;
                  bottom: 0%;
                  background-color: white;
                  border-top: solid 1px #E4E7ED;
                  border-right: solid 1px #E4E7ED;
                  border-radius: 0 0 0 0;
                  display: flex;
                  flex-direction: column;
                }
                #treecanvas-content-view {
                  position: absolute;
                  right: 0%;
                  top: 0%;
                  bottom: 0%;
                  left: 0%;
                  background-color: white;
                }
                #treemap-content-view {
                  position: absolute;
                  right: 0px;
                  top: 0%;
                  bottom: 0%;
                  left: 0%;
                  background-color: white;
                  &.gallery-open {
                    right: @treevis_related_gallery_view_width;
                  }
                  &.related-view-open {
                    right: @treevis_related_gallery_view_width;
                  }
                }
                #treevis-gallery-view {
                  position: absolute;
                  width: 0%;
                  top: 0%;
                  bottom: 0%;
                  right: 0%;
                  border-left: solid 1px #E4E7ED;
                  background-color: white;
                  &.gallery-open {
                    width: @treevis_related_gallery_view_width;
                  }
                }
                #treevis-related-view {
                  position: absolute;
                  width: 0%;
                  top: 0%;
                  bottom: 0%;
                  right: 0%;
                  border-left: solid 1px #E4E7ED;
                  background-color: white;
                  &.related-view-open {
                    width: @treevis_related_gallery_view_width;
                  }
                }
                .hide {
                  opacity: 0;
                }
            }
          }     
      }
    }
  }
}
</style>
