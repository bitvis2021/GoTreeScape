<template>
  <div class = "container" id = "tree-canvas-title">
    <span class = "text">{{title}}</span>
    <span class = "operation">
      <span class = "mode-selection">
        <el-tooltip content="clear" placement="top">
            <span class="icon iconfont icon-qingchu" @click="clearCanvas"></span>
        </el-tooltip> 
        <el-divider direction="vertical"></el-divider> 
        <el-tooltip content="assemble" placement="top">
            <span class="icon iconfont icon-assemble" :class="{selected:openAssembleDialog}" @click="openAssembleDialogHandler"></span>
        </el-tooltip>
        <el-divider direction="vertical"></el-divider>
        <el-tooltip content="selection" placement="top">
            <span class="icon iconfont icon-selection" :class="{selected:openSelectionDialog}" @click="openSelectionDialogHandler"></span>
        </el-tooltip>
        <div class="selection-controller" v-if="openSelectionDialog" :style="selectionStyleObject">
          <div class="spacing"></div>
          <el-row>
            <el-col :span="1"></el-col>
            <el-col class="selection-label" :offset="1" :span="7">Selection</el-col>
            <el-col :span="15">
                <el-select v-model="local_AssignNodeQuery" placeholder="please select" @change='changeNodeQuery'>
                  <el-option
                    v-for="item in nodeQueryAttrObjArray"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName">
                  </el-option>
                </el-select>
            </el-col>
          </el-row>
          <div class="small-spacing"></div>
          <el-row>
            <el-col :span="1"></el-col>
            <el-col :offset="1" :span="22">
              <el-input placeholder="Please select" type="textarea" :rows="1" disabled v-model="selectionNode" size="mini" class="input-with-select">
              </el-input>
            </el-col>
          </el-row>
          <div class="spacing"></div>
          <el-row>
            <el-col :span="1"></el-col>
            <el-col class="selection-label" :offset="1" :span="7">Recursive</el-col>
            <el-col :span="15">
              <el-radio-group id="recursive-mode" @change="changeRecursiveMode"  
                v-model="local_AssignRecursiveMode" size="mini">
                <el-radio-button label="true" ></el-radio-button>
                <el-radio-button label="false"></el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
          <div class="spacing"></div>          
          <el-row>
            <el-col :span="1"></el-col>
            <el-col class="selection-label" :offset="1" :span="7">Template</el-col>
            <el-col :span="15">
                <el-select v-model="local_AssignDSLName" placeholder="please select" @change="changeAssignDSLName">
                  <el-option
                    v-for="item in selectedDSLArray"
                    :key="item"
                    :label="item"
                    :value="item">
                  </el-option>
                </el-select>
            </el-col>
          </el-row>
        </div>
        <div class="assemble-controller" v-if="openAssembleDialog" :style="assembleStyleObject">
          <div class="spacing"></div>
          <el-row>
            <el-col :span="1"></el-col>
            <el-col class="selection-label" :offset="1" :span="10">Mode</el-col>
            <el-col :span="12">
              <el-radio-group id="assemble-mode" @change="changeAssembleMode" v-model="local_AssembleMode" size="mini">
                <el-radio-button label="bottom-up" ></el-radio-button>
                <el-radio-button label="top-down"></el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
          <div class="spacing"></div>
          <el-row>
            <el-col :span="1"></el-col>
            <el-col class="selection-label" :offset="1" :span="10">SubtreeWidth</el-col>
            <el-col :span="12">
                <el-select v-model="local_AssembleSubtreeWidth" placeholder="select" 
                  @change="changeSubtreeWidth" :disabled="local_AssembleMode==='bottom-up'">
                  <el-option
                    v-for="item in subtreeWidthHeightAttrObjArray"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName">
                  </el-option>
                </el-select>
            </el-col>
          </el-row>
          <div class="spacing"></div>
          <el-row>
            <el-col :span="1"></el-col>
            <el-col class="selection-label" :offset="1" :span="10">SubtreeHeight</el-col>
            <el-col :span="12">
                <el-select v-model="local_AssembleSubtreeHeight" placeholder="select" 
                  @change="changeSubtreeHeight" :disabled="local_AssembleMode==='bottom-up'">
                  <el-option
                    v-for="item in subtreeWidthHeightAttrObjArray"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName">
                  </el-option>
                </el-select>
            </el-col>
          </el-row>          
        </div>
      </span>
    </span>
  </div>
</template>

<!--                  -->

<script> 
import { mapState, mapMutations, mapActions } from 'vuex';
import { getHierarchicalData, getHierarchicalDataWithIndex, getNodeArray } 
      from '@/data-processing/get_hierarchical_data.js';

export default {
  name: 'TreeCanvasViewTitle',
  props: {
    title:{
      type: String,
    }
  },
  data() {
    return {
      operation: ['joint', 'partition_vertical', 'partition_horizontal'],
      subtreeWidthHeightAttrObjArray: [],
      nodeQueryAttrObjArray: [{
        attrName: 'depth',
        attrType: 'number'
      }, {
        attrName: 'height',
        attrType: 'number'
      }, {
        attrName: 'index',
        attrType: 'string'
      }],
      partitionDataCollection: {}, // Hierarchical data after cutting
      selectionStyleObject: {
        width: '200px', 
        height: '150px'
      },
      assembleStyleObject: {
        width: '280px', 
        height: '110px'
      },
      boldTextStyleObj: {
        fontWeight: 'normal',
        fontSize: '0.8rem'
      },
      radioButtonContainerStyle: {
        margin: '10px'
      },
      select: '',
      selectCriteria: "id",
      openSelectionDialog: false,
      openAssembleDialog: false,
      selectionNode: "",
      local_AssignDSLName: '',
      local_AssignRecursiveMode: 'true',
      local_AssignNodeQuery: 'index',
      local_AssembleMode: 'top-down',
      local_AssembleSubtreeWidth: 'adaptive',
      local_AssembleSubtreeHeight: 'adaptive',
      //  How long it takes to animate the transform
      DURATION: 1000
    }
  },
  created: function() {},
  beforeMount: function() {
  },
  mounted: function() {
    let self = this
    this.subtreeWidthHeightAttrObjArray = JSON.parse(JSON.stringify(this.attrObjArray))
    this.subtreeWidthHeightAttrObjArray.push({
      attrName: 'adaptive',
      attrType: 'number'
    })
    this.initAssembleDialog()
    setTimeout(function() {
      let popUpTop = $('.top-panel').height() + $('.el-menu-demo').height() + $('#tree-canvas-title').height()
      self.selectionStyleObject.top = popUpTop + 'px'
      self.selectionStyleObject.right = '0px'
      self.assembleStyleObject.top = popUpTop + 'px'
      self.assembleStyleObject.right = '0px'
    }, 500)
  },
  watch: {
    hierarchicalData: function() {
      this.partitionDataCollection[this.hierarchicalData.index] = this.hierarchicalData
    },
    previewTreeObj: function() {
      this.local_AssignNodeQuery = 'index'
      this.UPDATE_ASSIGN_NODE_QUERY(this.local_AssignNodeQuery)
      this.local_AssignRecursiveMode = 'true'
      this.UPDATE_ASSIGN_RECURSIVE_MODE(this.local_AssignRecursiveMode)
      // Update the content in areaData
      this.selectionNode = '= ' + this.previewTreeObj[this.local_AssignNodeQuery]
      let currentTreeDSLArray = this.currentTreeDSLArray
      let currentTreeDSLStr = ''
      for (let i=0; i<currentTreeDSLArray.length;i++) {
        if (currentTreeDSLStr === '') {
          currentTreeDSLStr = currentTreeDSLArray[i]
        } else {
          currentTreeDSLStr = currentTreeDSLStr + '-' + currentTreeDSLArray[i]
        }
      }
      this.local_AssignDSLName = currentTreeDSLStr
      if (d3.select('.select-root-node').empty()) {
        // If there is no node to click on, close the selection dialog box
        this.openSelectionDialog = false
      } else {
        //  If the selected node exists, click
        this.openSelectionDialog = true
        this.openAssembleDialog = false
      }
      //  Initializes the Assemble dialog box property values
      this.initAssembleDialog()
    },
    dslListSelectedDSLName: function() {
      //  Initializes the Assemble dialog box property values
      this.initAssembleDialog()
    }
  },
  computed: {
    ...mapState([
      'viewSelectionMode',
      'previewTreeObj',
      'focusedTreeObjArray',
      'currentTreeDSLArray',
      'hierarchicalData',
      'partitionValue',
      'layoutParas',
      'partitionDataObjDic',
      'attrObjArray',
      'selectedDSLArray',
      'assignNodeQuery',
      'assignRecursiveMode',
      'assignDSLName',
      'assembleMode',
      'assembleSubtreeWidth',
      'assembleSubtreeHeight',
      'treeUnitDSLArray',
      'treeUnitDSLName',
      'dslListSelectedDSLName'
    ])    
  },  
  methods: {
    changeNodeQuery: function() {
      if ((typeof(this.previewTreeObj) !== 'undefined') && (this.previewTreeObj != null)) {
        // Update selection criteria, as well as attribute values
        this.selectionNode = '= ' + this.previewTreeObj[this.local_AssignNodeQuery]
        //  Updates the way nodes are selected
        this.UPDATE_ASSIGN_NODE_QUERY(this.local_AssignNodeQuery)
        this.updateSelectedTreeDSL(this.local_AssignDSLName)
        console.log('this.local_AssignDSLName', this.local_AssignDSLName)
        // this.UPDATE_DSLLIST_SELECTED_DSL_NAME(this.local_AssignDSLName)
        // this.UPDATE_DSLLIST_SELECTED_DSL_STATE()
      }
    },
    changeAssignDSLName: function() {
      // Modify the DSL directly
      if ((typeof(this.previewTreeObj) !== 'undefined') && (this.previewTreeObj != null)) {
        console.log('this.local_AssignDSLName', this.local_AssignDSLName)
        this.updateSelectedTreeDSL(this.local_AssignDSLName)  
        // this.UPDATE_DSLLIST_SELECTED_DSL_NAME(this.local_AssignDSLName)
        // this.UPDATE_DSLLIST_SELECTED_DSL_STATE()      
      }
    },
    changeRecursiveMode: function() {
      if ((typeof(this.previewTreeObj) !== 'undefined') && (this.previewTreeObj != null)) {
        this.UPDATE_ASSIGN_RECURSIVE_MODE(this.local_AssignRecursiveMode)
        this.updateSelectedTreeDSL(this.local_AssignDSLName)
        // this.UPDATE_DSLLIST_SELECTED_DSL_NAME(this.local_AssignDSLName)
        // this.UPDATE_DSLLIST_SELECTED_DSL_STATE()        
      }
    },
    changeAssembleMode:  function() {
      this.updateAllDSLObj()
    },
    changeSubtreeHeight: function() {
      this.updateAllDSLObj()
    },
    changeSubtreeWidth: function() {
      this.updateAllDSLObj()
    },
    openSelectionDialogHandler: function() {
      this.openSelectionDialog = !this.openSelectionDialog
      if (this.openSelectionDialog) {
        this.openAssembleDialog = false
      }
    },
    clearCanvas: function() {
      let self = this
      // Uncheck all DSLS and clear the canvas
      let layoutParas = sysDatasetObj.getLayoutParas()
      layoutParas.treeDSLContentObj = {}
      layoutParas.treeIndexWithDSL = {}
      self.UPDATE_TREE_CANVAS_LAYOUT_STATE()
    },
    // Initialize parameter Settings for the Assemble dialog box
    initAssembleDialog: function() {
      if ((typeof(this.previewTreeObj) !== 'undefined') && (this.previewTreeObj != null)) {
        let previewTreeObjIndex = this.previewTreeObj.index
        let layoutParas = sysDatasetObj.getLayoutParas()
        let treeDSLContentObj = layoutParas.treeDSLContentObj
        let treeIndexWithDSL = layoutParas.treeIndexWithDSL
        if ((typeof(treeIndexWithDSL) !== 'undefined') && (typeof(treeDSLContentObj) !== 'undefined')) {
          let dslObj = treeDSLContentObj[treeIndexWithDSL[previewTreeObjIndex]]
          if (typeof(dslObj) !== 'undefined') {
            this.local_AssembleMode = dslObj.Layout.Mode
            //  Initialize the subtree properties
            this.local_AssembleSubtreeWidth = 'adaptive'
            this.local_AssembleSubtreeHeight = 'adaptive'
          }
        }
      }
    },
    // Update all DSL objects
    updateAllDSLObj: function() {
      for (let i = 0;i < this.treeUnitDSLArray.length;i++) {
          let treeUnitDSLObj = this.treeUnitDSLArray[i]
          if (treeUnitDSLObj.name === this.treeUnitDSLName) {
            treeUnitDSLObj.dslObj.Layout.Mode = this.local_AssembleMode
            treeUnitDSLObj.dslObj.Layout.SubtreeWidth = this.local_AssembleSubtreeWidth
            treeUnitDSLObj.dslObj.Layout.SubtreeHeight = this.local_AssembleSubtreeHeight
            console.log('treeUnitDSLObj.dslObj', treeUnitDSLObj.dslObj)
            // Update the TREEUNIT view after modifying the parameters
            this.UPDATE_TREE_UNIT_LAYOUT_STATE()  
            // Updates the DSL object in the Treecanvas view and triggers the signal update
            sysDatasetObj.updateTreeDSLContentObject(this.treeUnitDSLName, treeUnitDSLObj.dslObj)
            this.UPDATE_TREE_CANVAS_LAYOUT_STATE()
            // Updates the DSL object in the Preview view and triggers the signal update
            sysDatasetObj.updateSelectedDSLObject(this.treeUnitDSLName, treeUnitDSLObj.dslObj)
            this.UPDATE_TREE_PREVIEW_LAYOUT_STATE()
          }
      }
    },
    openAssembleDialogHandler: function() {
      this.openAssembleDialog = !this.openAssembleDialog
      let previewTreeObj = this.previewTreeObj
      if ((typeof(previewTreeObj) !== "undefined") && (previewTreeObj != null)) {
        let previewTreeObjIndex = previewTreeObj.index
        let layoutParas = sysDatasetObj.getLayoutParas()
        let treeIndexWithDSL = layoutParas.treeIndexWithDSL
        let treeDSLContentObj = layoutParas.treeDSLContentObj
        if (typeof(treeIndexWithDSL) !== 'undefined') {
          if (typeof(treeIndexWithDSL[previewTreeObjIndex]) !== "undefined") {
            let treeDSLObj = treeDSLContentObj[treeIndexWithDSL[previewTreeObjIndex]]
            let layoutMode = treeDSLObj.Layout.Mode
            this.local_AssembleMode = layoutMode
            if (layoutMode === 'top-down') {
              this.local_AssembleSubtreeWidth = treeDSLObj.Layout.SubtreeWidth
              this.local_AssembleSubtreeHeight = treeDSLObj.Layout.SubtreeHeight          
            }
          }
        }
        if (this.openAssembleDialog) {
          this.openSelectionDialog = false
        }              
      }
    },
    handleViewSelectionModeCommand: function(command) {
      this.UPDATE_VIEW_SELECTION_MODE(command)
    },
    test: function() {
    },
    //  iconClass
    iconClass: function(label) {
      let iconClass = "icon-" + label
      return iconClass
    },
    //  Updates the currently selected TreeDSL
    updateSelectedTreeDSL: function(dslItem) {
      let self = this
      if (dslItem.length !== 0) {
        //  Update the layout parameters of the tree visualization
        sysDatasetObj.updateLayoutParas(this.focusedTreeObjArray, dslItem)
        //  Updates the currently selected DSL array only for the current view
        let currentTreeDSLArray = sysDatasetObj.getCurrentTreeDSLArray(this.focusedTreeObjArray)
        this.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)
        // Updates the DSL array displayed in the TreeUnit view
        let treeUnitDSLArray = sysDatasetObj.updateTreeUnitDSLArray(this.currentTreeDSLArray, this.treeUnitDSLArray)
        this.UPDATE_TREEUNIT_DSL_ARRAY(treeUnitDSLArray)
        //  Update the display of the TreeUnit view
        setTimeout(function() {
            self.UPDATE_TREEUNIT_DSL_NAME(dslItem)
          }, 100)
        //  Update the view in TreeCanvas
        setTimeout(function() {
          self.UPDATE_TREE_CANVAS_LAYOUT_STATE()
        }, 300) 
      }
    },
    //  Use mapMutation to combine mutations in an array with other methods
    ...mapMutations([
      'UPDATE_TREEUNIT_DSL_NAME',
      'UPDATE_TREEUNIT_DSL_ARRAY',
      'UPDATE_CURRENT_TREE_DSL_ARRAY', 
      'UPDATE_VIEW_SELECTION_MODE',
      'UPDATE_PARTITION_VALUE',
      'UPDATE_ASSEMBLE_SUBTREE_HEIGHT',
      'UPDATE_ASSEMBLE_SUBTREE_WIDTH',
      'UPDATE_ASSEMBLE_MODE',
      'UPDATE_ASSIGN_DSL_NAME',
      'UPDATE_ASSIGN_NODE_QUERY',
      'UPDATE_ASSIGN_RECURSIVE_MODE',
      'UPDATE_DSLLIST_SELECTED_DSL_NAME',
      'UPDATE_DSLLIST_SELECTED_DSL_STATE',
      'UPDATE_TREE_UNIT_LAYOUT_STATE',
      'UPDATE_TREE_CANVAS_LAYOUT_STATE',
      'UPDATE_TREE_PREVIEW_LAYOUT_STATE'
    ]),
    //  Use mapMutation to combine the action in the array with the other methods
    ...mapActions([
      'getLayouts'
    ])
  }
}
</script>
<style lang="less">
  .container#tree-canvas-title {
    .icon-selection:hover, .icon-assemble:hover, .icon-qingchu:hover {
      background: #ccc !important;
    }
    .icon-selection.selected, .icon-assemble.selected, .icon-qingchu.selected {
      background: #ccc !important;
    }
    .el-divider.el-divider--vertical {
      margin: 1px 6px;
    }
    .icon.iconfont {
      cursor: pointer;
    }
    .selection-controller, .assemble-controller {
      font-size: 12px !important;
      position: fixed;
      z-index: 10;
      background: white;
      border: 0.1rem solid rgba(180, 180, 180, 0.3);
      .el-select .el-input {
        width: 70px;
      }
      .input-with-select .el-input-group__prepend {
        background-color: #fff;
      }
      .spacing {
        margin-top: 10px;
      }
      .small-spacing {
        margin-top: 5px;
      }
      .selection-label {
        line-height: 20px;
      }
      .el-textarea__inner {
        padding-left: 5px;
        padding-right: 5px;
      }
      .el-input__inner {
        height: 20px;
        line-height: 20px;
        font-size: 12px;
      }
      .el-input {
        width: 100% !important;
      }
      .el-input__icon {
        line-height: 20px;
      }
      .el-radio-button__inner#recursive-mode {
        padding-top: 3px !important;
        padding-bottom: 3px !important;
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
      .el-radio-button__inner#assemble-mode {
        padding: 1px !important;
      }
    }
  }
</style>
<style scoped lang="less">
  .container#tree-canvas-title {
    display: flex; 
    width: 100%; 
    height: 100%; 
    margin: auto; 
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    .text {
       padding-left: 0.5rem;
       margin-left: 0; /* Important */ 
       margin-right: 0; /* Important */ 
       margin-top: auto; /* Important */ 
       margin-bottom: auto; /* Important */ 
       text-align: left;
       font-weight: bold;
    }
    .operation {
       display: flex; 
       flex-direction: row;
       align-items: baseline;
       margin-top: auto; /* Important */ 
       margin-bottom: auto; /* Important */ 
       margin-right: 1rem;
       margin-left: auto;
       font-size: 14px;
       .operation-icon {
          padding: 0.2rem;
       }
       .mode-selection {
          margin-left: 0.8rem;
       }
    }
    .operation-icon:hover {
      background: #ccc !important;
    }
  }
</style>
