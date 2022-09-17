<template>
  <div class="container">
    <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#676767"
        text-color="#fff"
        :key="componentKey"
        :default-active="activeIndex"
        active-text-color="#ffd04b">
        <el-menu-item class='labelIcon' id="title" index="title">
          {{appName}}
        </el-menu-item>
        <el-tooltip class='labelIcon' key="data" content="data" effect="light">
          <el-menu-item @click="handleClickDataIcon" index="data">
            <i class="icon iconfont icon-data"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip class='labelIcon' key="gallery" content="return to gotreescape" effect="light">
          <el-menu-item @click="backToGoTreeScape" index="gallery" id="back-to-gotreescape">
            <i class="icon iconfont icon-fanhui"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip class='labelIcon' key="treedsl" content="tree template" effect="light">
          <el-menu-item @click="handleClickTemplateIcon" index="treedsl">
            <i class="icon iconfont icon-gallery-"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip class='labelIcon' key="export" content="export" effect="light">
          <el-menu-item @click="exportDialogVisible=true" index="export">
            <i class="icon iconfont icon-export"></i>
          </el-menu-item>
        </el-tooltip>
    </el-menu>
    <!--main view-->
    <div class = "content-container">
        <div class = "content">
          <!--left panel of the main view-->
          <div class = "left-panel">
            <div class = "bottom-panel">
              <div class = "layout">
                <Layout />
              </div>
              <div class = "element">
                <Element />
              </div>
              <div class = "coordinate_system">
                <CoordinateSystem />
              </div>
            </div>
          </div>
          <div class = "middle-panel">
            <div class = "middle-title-panel">
              <TreeUnitViewParameterTitle></TreeUnitViewParameterTitle>
            </div>            
            <div class = "middle-content-panel">
              <TreeUnitParameterView ></TreeUnitParameterView>
            </div>
          </div>
          <div class = "right-panel">
            <div class = "top-panel">
              <div class = "dsl-list-title-panel">
                <DslListTitle />
              </div>
              <div class = "dsl-list-content-panel">
                <DslList :galleryDSLObjDict="galleryDSLObjDict" />
              </div>
            </div>
            <div class = "bottom-panel">
              <div id = "tree-canvas-view-title">
                <TreeCanvasViewTitle
                  :title="treeCanvasParas.title">
                </TreeCanvasViewTitle>
              </div>
              <div id = "tree-canvas-view-body">  
                <div id="original-data-view">
                  <OriginalDataView 
                    @openDataView="openDataView"
                    @closeDataView="closeDataView"/>
                </div> 
                <div id = "treecanvas-content-view">
                  <TreeCanvas
                    :dslIndex="Number(selectedTreeDSLObj['index'])"
                    :dslObj="selectedTreeDSLObj['dsl']"
                    :treeCanvasKey="treeCanvasKey"
                    :nodeArrayWithValueObj="nodeArrayWithValueObjSelect"
                    :nodeArrayWithValue="nodeArrayWithValueSelect"
                    :hierarchicalData="hierarchicalDataSelect"
                    :sendSVGData="false"
                    :canvasOpacity="false"
                    :initRender="true"
                    :aspectRatio="canvasAspectRatio" />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    <!--data dialog-->
    <el-dialog title="Dataset" id="dataset-dialog" :visible.sync="dataDialogVisible">
      <DataDialog
        :initTreeDataName="initTreeDataName"
        :dataDialogKey="dataDialogKey"
        @updateSelectedTreeDateName="updateSelectedTreeDateName"
        @closeDataDialog="closeDataDialog">
      </DataDialog>
    </el-dialog>
    <!--tree dsl dialog-->
    <el-dialog title="Tree Template" id="treedsl-dialog" :visible.sync="treedslDialogVisible">
      <TreedslDialog :treedslDialogUpdate="treedslDialogUpdate"/>
    </el-dialog>
    <!--export dialog-->
    <el-dialog title="Export" id="export-dialog" :destroy-on-close="true" :visible.sync="exportDialogVisible">
      <ExportDialog />
    </el-dialog>
  </div>
</template>

<script>
import TreeCanvas from '@/views/TreeCanvasView/TreeCanvas.vue'
import OriginalDataView from '@/views/TreeCanvasView/OriginalDataView.vue'
import TreeCanvasViewTitle from '@/views/TreeCanvasView/TreeCanvasViewTitle.vue'
import DataDialog from '@/views/Dialog/DataDialog.vue'
import ExportDialog from '@/views/Dialog/ExportDialog.vue'
import TreedslDialog from '@/views/Dialog/TreedslDialog.vue'
import CoordinateSystem from '@/views/TreeModuleView/CoordinateSystem.vue'
import Layout from '@/views/TreeModuleView/Layout.vue'
import Element from '@/views/TreeModuleView/Element.vue'
import DslList from '@/views/DslList/DslList.vue'
import DslListTitle from '@/views/DslList/DslListTitle.vue'
import TreeUnitViewParameterTitle from '@/views/TreeUnitParameterView/TreeUnitParameterTitle.vue'
import TreeUnitParameterView from '@/views/TreeUnitParameterView/TreeUnitParameterView.vue'
import { getHierarchicalData } from '@/data-processing/get_hierarchical_data.js'
import { getHierarchicalDSL } from '@/data-processing/get_hierarchical_dsl.js'
import { getLayoutValue } from '@/data-processing/get_layout_value.js'
import { getConfig } from '@/config/config.js'
import { Dataset } from '@/dataset/dataset.js'
import { mapState, mapMutations, mapActions } from 'vuex'
import * as lscgSolver from 'lscg-solver'
import { queryDataset, queryTemplate, addTreeTemplate } from '@/communication/sendData.js'

export default {
  name: 'tree-illustrator-tap',
  components: {
    //  view component
    TreeUnitViewParameterTitle, TreeCanvas, TreeCanvasViewTitle,
    DslList, DslListTitle, TreeUnitParameterView, OriginalDataView,
    //  dialog compoennt
    DataDialog, ExportDialog, TreedslDialog,
    // three different components of GoTree Grammar
    CoordinateSystem, Layout, Element
  },
  data() {
    return {
      appName: 'Tree Illustrator',
      treeCanvasParas: {
        title: "TreeCanvas"
      },
      leftPanelWidth: 0,
      treeDataArray: [],
      initTreeDataName: null,
      activeIndex: null,
      componentKey: 0,
      dataDialogVisible: false,
      treedslDialogVisible: false,
      exportDialogVisible: false,
      loginDialogVisible: false,
      signupDialogVisible: false,
      userInfoDialogVisible: false,
      OPEN_PREVIEW_PANEL_DURATION: 1000,
      treeCanvasKey: 0,
      systemUserName: 'root',
      userInfoDialogKey: 0,
      dataDialogKey: 0,
      systemTreeTemplateArray: [],
      userTreeTemplateArray: [],
      treedslDialogUpdate: 1,
      nodeArrayWithValueObjSelect: null,
      nodeArrayWithValueSelect: null,
      hierarchicalDataSelect: null,
      canvasAspectRatio: 0.668
    }
  },
  created: function() {
      let self = this
  },
  beforeMount: function() {
    let self = this
    self.initTreeCanvasParas()
  },
  mounted: function() {
    this.initializeLSCG()
    // this.initSystemDateset()
    // this.initSystemTemplate()
    console.log('galleryDSLObjDict', this.galleryDSLObjDict)
  },
  computed: {
    ...mapState([
      'userInfoName',
      'treeViewUpdate',
      'currentTree',
      'treeDataViewFormat',
      'treeDslOption', 
      'previewTreeObj',
      'galleryDSLObjDict',
      'selectedTreeDSLObj'
    ])
  },
  methods: {
    iconClass(operation) {
      return 'icon-' + operation
    },
    onShow() {
    },
    backToGoTreeScape: function() {
      let self = this
      let gotreeScapeTapName = 'gotreescape' // the tap name of tree illustrator is "treeillustrator"
      self.UPDATE_DISPLAY_TAP_NAME(gotreeScapeTapName) // change the displayed tap to gotreescape
    },
    initTreeCanvasParas: function() {
      // initialize the parameters of the tree visualization canvas
      let self = this
      self.nodeArrayWithValueObjSelect = sysDatasetObj.getNodeArrayWithValueObjSelect()
      self.hierarchicalDataSelect = sysDatasetObj.getTreeDatasetSelect()
      self.nodeArrayWithValueSelect = sysDatasetObj.getNodeArrayWithValueSelect()
    },
    initUserName: function() {
      if (this.$cookies.isKey('user-info-obj')) {
        let userInfoObj = this.$cookies.get('user-info-obj')
        let username = userInfoObj.username
        this.UPDATE_USER_INFO_OBJ(userInfoObj)
        this.UPDATE_USER_INFO_NAME(username) 
      }
    },
    handleClickUserIcon: function() {
      if (this.userInfoName === 'Login') {
        this.loginDialogVisible = true
      } else {
        this.userInfoDialogVisible = true
      }
      this.userInfoDialogKey = (this.userInfoDialogKey + 1) % 2
    },
    handleClickDataIcon: function() {
      this.dataDialogVisible = true
      this.dataDialogKey = (this.dataDialogKey + 1) % 2
    },
    handleClickTemplateIcon: function() {
      this.treedslDialogVisible = true
      this.treedslDialogUpdate = (this.treedslDialogUpdate + 1) % 2
    },
    showTooltip: function() {
      if (this.userInfoName === 'Login') {
        return 'click to login'
      } else {
        return 'username: ' + this.userInfoName
      }
    },
    promptMessage: function(type, message) {
      this.$message({
        type: type,
        message: message
      })
    },
    initSystemDateset: function (readTreeDataDeferObj) {
      let userInfo = {
        username: this.systemUserName
      }
      queryDataset(userInfo, this.getSystemDatesetCallBack, readTreeDataDeferObj)
    },
    initUserDataset: function (readTreeDataDeferObj, username) {
      let userInfo = {
        username: username
      }
      queryDataset(userInfo, this.getSystemDatesetCallBack, readTreeDataDeferObj)
    },
    getSystemDatesetCallBack: function (resData, readTreeDataDeferObj) {
      sysDatasetObj.addTreeDatasetArray(resData)
      readTreeDataDeferObj.resolve()
    },
    initSystemTemplate: function (readTreeTemplateDeferObj) {
      let userInfo = {
        username: this.systemUserName
      }
      queryTemplate(userInfo, this.getSystemTemplateCallBack, readTreeTemplateDeferObj)
    },
    initUserTemplate: function (readTreeTemplateDeferObj, username) {
      let userInfo = {
        username: username
      }
      queryTemplate(userInfo, this.getSystemTemplateCallBack, readTreeTemplateDeferObj)
    },
    getSystemTemplateCallBack: function (resData, readTreeTemplateDeferObj) {
      sysDatasetObj.addTreeTemplateArray(resData)
      readTreeTemplateDeferObj.resolve()
    },
    closeSignupDialog: function() {
      this.signupDialogVisible = false
    },
    openSignUpDialog: function() {
      this.signupDialogVisible = true
    },
    closeLoginDialog: function() {
      this.loginDialogVisible = false
    },
    closeUserInfoDialog: function() {
      this.userInfoDialogVisible = false
    },
    closeDataView: function() {
      let self = this
      let duration = self.OPEN_PREVIEW_PANEL_DURATION
      let subtreePreviewPanelWidth = $('#original-data-view').width() 
      $('#treecanvas-content-view').animate({
          left: '-=' + subtreePreviewPanelWidth,
      }, duration, function () {
        self.treeCanvasKey = (self.treeCanvasKey + 1) % 2
      })
    },
    openDataView: function() {
      let self = this
      let duration = self.OPEN_PREVIEW_PANEL_DURATION
      let subtreePreviewPanelWidth = $('#original-data-view').width() 
      $('#treecanvas-content-view').animate({
          left: '+=' + subtreePreviewPanelWidth,
      }, duration, function () {
        self.treeCanvasKey = (self.treeCanvasKey + 1) % 2
      })
    },
    //  update the selected hierarchical data
    updateSelectedTreeDateName: function(selectedFileName) {
      let self = this
      self.updateSelectedHierarchicalData(selectedFileName)
    },
    //  update the visiability of the data dialog
    closeDataDialog: function() {
      this.dataDialogVisible = false
    },
    //  update the selected hierarchical data
    updateSelectedHierarchicalData: function(selectedTreeDataName) {
      let self = this
      sysDatasetObj.updateDataset(selectedTreeDataName)
      let allTreeObjIdArray = sysDatasetObj.getAllTreeObjIdArray()
      let attrObjArray = sysDatasetObj.extractAttrArray()
      self.UPDATE_ATTR_OBJ_ARRAY(attrObjArray)
      self.UPDATE_FOCUS_TREE_OBJ_ARRAY(allTreeObjIdArray)
      self.UPDATE_SELECTED_DATASET(selectedTreeDataName)
      self.updateLayoutParas()
      let layoutParas = sysDatasetObj.getLayoutParas()
      this.UPDATE_TREE_CANVAS_LAYOUT_STATE()
    },
    //  update the layout parameters
    updateLayoutParas: function() {
      let self = this
      let layoutParas = sysDatasetObj.getLayoutParas()
      let treeIndexWithDSL = layoutParas.treeIndexWithDSL
      let treeDSLContentObj = layoutParas.treeDSLContentObj
      if ((typeof(treeIndexWithDSL) !== 'undefined') && (typeof(treeDSLContentObj) !== 'undefined')) {
          let globalTreeDSL = treeIndexWithDSL['index-0']
          let allTreeObjIdArray = sysDatasetObj.getAllTreeObjIdArray()
          // add new dsl object
          for (let i = 0;i < allTreeObjIdArray.length;i++) {
            let treeNodeIndex = allTreeObjIdArray[i]
            if (typeof(treeIndexWithDSL[treeNodeIndex]) === 'undefined') {
              treeIndexWithDSL[treeNodeIndex] = globalTreeDSL
            }
          }
          //  remove the redundant dsl
          for (let item in treeIndexWithDSL) {
            if (allTreeObjIdArray.indexOf(item) === -1) {
              delete treeIndexWithDSL[item]
            }
          }
      } 
    },
    initializeLSCG: async function(){
       await lscgSolver.initialize().then(() => {
       });
       window.lscgSolver = lscgSolver
    },
    ...mapMutations([
      'UPDATE_SELECTED_DATASET',
      'UPDATE_SELECTED_DSL_ARRAY',
      'UPDATE_ATTR_OBJ_ARRAY',
      'UPDATE_FOCUS_TREE_OBJ_ARRAY',
      //  PREVIOUS 
      'UPDATE_HIERARCHICAL_DATA',
      'UPDATE_NODE_ARRAY',
      'UPDATE_HIERARCHICAL_DSL',
      'UPDATE_TREE_DSL_OPTION',
      'UPDATA_DRAWER_VIEW_SELECTION_STATE',
      'UPDATE_TREE_CANVAS_LAYOUT_STATE',
      'UPDATE_USER_INFO_OBJ',
      'UPDATE_USER_INFO_NAME',
      'UPDATE_DISPLAY_TAP_NAME'
    ])
  }
}
</script>
<style scoped lang="less">
@left_panel-width: 300px;
@middle_panel-width: 320px;
@background: #ffffff;//#f7f7f7;
@right_panel_bottom-height: 150px;
@left_panel_top-height: 54%;
@left_panel_middle-height: 25%;
@left_panel_bottom-height: 21%;

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
  @menu-height: 2.5rem;
  @border-style: 1px solid rgba(180, 180, 180, 0.3);

  .iconfont {
    font-size: 1rem;
  }

  .el-menu.el-menu--horizontal {
    .el-menu-item {
      height: @menu-height;
      line-height: @menu-height;
    }
    .el-menu-item {
      border-bottom-color: rgb(84, 92, 100) !important;
      font-weight: bolder;
      font-size: 1rem;
      color: #dadada !important;
      padding: 0 10px;
      .icon {
        color: #dadada !important;
      }
    }
    .el-menu-item#back-to-gotreescape {
      float: right;
      right: 5px;
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
          .top-panel {
            position: absolute;
            top: 0%;
            left: 0%;
            width: 100%;
            height: 0%;
            border-bottom: @border-style;
          }
          .bottom-panel {
            position: absolute;
            left: 0%;
            width: 100%;
            top: 0%;
            bottom: 0%;
            .layout {
              position: absolute;
              top: 0%;
              left: 0%;
              width: 100%;
              height: @left_panel_top-height;
              border-bottom: @border-style;
            }
            .element {
              position: absolute;
              top: @left_panel_top-height;
              left: 0%;
              width: 100%;
              height: @left_panel_middle-height;
              border-bottom: @border-style;
            }
            .coordinate_system {
              position: absolute;
              top: @left_panel_top-height + @left_panel_middle-height;
              left: 0%;
              width: 100%;
              height: @left_panel_bottom-height;
              border-bottom: @border-style;
            }
          }
      }
      .middle-panel {
          position: absolute;
          left: @left_panel-width;
          top: 0%;
          width: @middle_panel-width;
          bottom: 0%;
          border-left: @border-style;
          background-color: @background;
          min-width: 300px;
          .middle-title-panel {
            position: absolute;
            top: 0%;
            height: 2rem;
            left: 0%;
            width: 100%;
          }
          .middle-content-panel {
            position: absolute;
            top: 2rem;
            bottom: 0%;
            left: 0%;
            width: 100%;
          }
      }
      .right-panel {
          position: absolute;
          left: @left_panel-width + @middle_panel-width;
          top: 0%;
          right: 0%;
          bottom: 0%;
          border-left: @border-style;
          background-color: @background;
          .top-panel {
            position: absolute;
            top: 0%;
            height: @right_panel_bottom-height;
            left: 0%;
            width: 100%;
            border-bottom: @border-style;
            .dsl-list-title-panel {
              position: absolute;
              top: 0%;
              height: 2rem;
              left: 0%;
              width: 100%;
              border-bottom: @border-style;
            }
            .dsl-list-content-panel {
              position: absolute;
              width: 100%;
              left: 0%;
              top: 2rem;
              bottom: 0%;
              overflow: auto;
              display: flex;
            }
          }
          .bottom-panel {
            position: absolute;
            top: @right_panel_bottom-height;
            height: calc(~"100% -" @right_panel_bottom-height);
            left: 0%;
            width: 100%;
            #tree-canvas-view-title {
              position: absolute;
              top: 0%;
              height: 2rem;
              left: 0%;
              width: 100%;
              border-bottom: @border-style;
            }
            #tree-canvas-view-body {
              position: absolute;
              width: 100%;
              left: 0%;
              top: 2rem;
              bottom: 0%;
              overflow: auto;
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
                  height: auto;
                  right: 0%;
                  top: 0%;
                  bottom: 0%;
                  left: 0%;
                }
            }
          }     
      }
    }
  }
}
</style>
