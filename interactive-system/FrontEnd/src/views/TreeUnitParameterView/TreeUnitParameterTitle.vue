<template>
  <div class = "treeunit-view-title">
    <span class = "text">{{title}}</span>
    <span class = "operation">
      <el-tooltip class='labelIcon' content="new" effect="light"> 
        <span class = "operation-icon" @click.stop.prevent="newDSL">
          <span class="icon iconfont icon-xinjian"></span>
        </span>
      </el-tooltip>      
      <!-- <el-divider direction="vertical"></el-divider>
      <el-tooltip class='labelIcon' content="save" effect="light"> 
        <span class = "operation-icon" @click.stop.prevent="saveDSL">
          <span class="icon iconfont icon-baocun"></span>
        </span>
      </el-tooltip> -->
      <!-- <el-divider direction="vertical"></el-divider>
    	<el-tooltip class='labelIcon' content="remove" effect="light"> 
	        <span class = "operation-icon">
		        <span class="icon iconfont icon-iconfontshanchu"
		                  @click.stop.prevent="removeCurrentDSL"></span>
	        </span>
      </el-tooltip> -->
    	<el-divider direction="vertical"></el-divider>
    	<el-tooltip class='labelIcon' content="save as" effect="light"> 
	    	<span class = "operation-icon" @click.stop.prevent="saveAsNewDSL">
	    		<span class="icon iconfont icon-lingcunwei"></span>
	    	</span>
    	</el-tooltip>
    </span>
    <el-dialog
      id="dsl-name-dialog"
      title="GoTree Name"
      :visible.sync="saveDialogVisible"
      @opened="initShowDSLName"
      width="30%">
      <div id="dsl-name-hint">Please enter the name of the GoTree DSL. You can use letters ( <b>A-Z</b>, <b>a-z</b> ), numbers ( <b>0-9</b> ) & underline ( <b>_</b> ). </div>
      <el-input placeholder="GoTreeExample1" v-model="gotreeName" :autofocus="true" @change="changeGoTreeName"></el-input>
      <div id="dsl-name-warning-hint">{{dslNameWarningHint}}</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelGoTreeName">Cancel</el-button>
        <el-button type="primary" @click="confirmGoTreeName">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- "Save as" dialog box -->
    <el-dialog
      id="dsl-name-dialog"
      title="GoTree Template Rename"
      :visible.sync="saveAsDialogVisible"
      @opened="initShowDSLName"
      width="30%">
      <!-- Confirmation dialog box to override existing DSLS -->
      <el-dialog
          width="30%"
          title="Warning"
          :visible.sync="overlapDSLDialogVisible"
          append-to-body>
          <div id="dsl-name-hint">Do you want to overwrite the existing 
            <span class="highlight"><b>{{ gotreeName }}</b></span> DSL?
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="cancelOverlapExistingDSL">Cancel</el-button>
            <el-button type="primary" @click="confirmOverlapExistingDSL">Confirm</el-button>
          </span>
      </el-dialog>
      <div id="dsl-name-hint">Please enter the name of the GoTree DSL. You can use letters ( <b>A-Z</b>, <b>a-z</b> ), numbers ( <b>0-9</b> ) & underline ( <b>_</b> ). </div>
      <el-input placeholder="GoTreeExample1" v-model="gotreeName" :autofocus="true" @change="changeGoTreeName"></el-input>
      <div id="dsl-name-warning-hint">{{dslNameWarningHint}}</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelGoTreeName">Cancel</el-button>
        <el-button type="primary" @click="confirmGoTreeName">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- Dialog box that prompts you to create a DSL -->
    <el-dialog
      id="selection-alert-dialog"
      title="Warning"
      :visible.sync="selectionAlertDialog"
      width="30%">
      <div id="dsl-name-hint">Please select one GoTree DSL from GoTreeListView or select components to create one GoTree DSL. </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="selectionAlertDialog = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script> 
import { mapState, mapMutations } from 'vuex';
import { getConfig } from '@/config/config.js'
import { addDslDefaultSetting } from '@/dsl-processing/add_dsl_default_setting.js'

export default {
  name: 'TreeUnitParameterTitle',
  props: {
  },
  data() {
    return {
    	title: 'TreeUnitView',
      saveAsDialogVisible: false,
      saveDialogVisible: false,
      selectionAlertDialog: false,
      overlapDSLDialogVisible: false,
      gotreeName: '',
      dslNameDialogComponentKey: 1,
      dslNameWarningHint: ''
    }
  },
  created: function() {},
  beforeMount: function() {
    // Example Initialize the name of GoTreeName
  },
  mounted: function() {
  },
  watch: {
  },
  computed: { 
    ...mapState([
      'treeUnitDSLArray',
      'treeUnitDSLName',
      'dslListSelectedDSLName',
      'selectedDSLArray',
      'selectedTreeDSLObj',
      'galleryDSLObjDict'
    ])
  }, 
  methods: {
    newDSL: function() {
      let maximumIndex = 0
      // Find the maximum index of all unnamed DSL objects in treeUnitDSLArray
      // for (let i = 0;i < this.treeUnitDSLArray.length;i++) {
      //   let treeUnitDSLObj = this.treeUnitDSLArray[i]
      //   let name = treeUnitDSLObj.name
      //   let untitledIndex = +name.replace('untitled','')
      //   if (untitledIndex > maximumIndex) {
      //     maximumIndex = untitledIndex
      //   }
      // }
      for (let i = 0;i < this.selectedDSLArray.length;i++) {
        let name = this.selectedDSLArray[i]
        let untitledIndex = +name.replace('untitled','')
        if (untitledIndex > maximumIndex) {
          maximumIndex = untitledIndex
        }
      }
      console.log('newTreeDSLObj', newTreeDSLObj)
      let treeUnitDSLObj = {}
      treeUnitDSLObj.name = "untitled" + (maximumIndex + 1)
      let newTreeDSLObj = this.get_new_tree_dsl_obj(treeUnitDSLObj.name)
      treeUnitDSLObj.dslObj = newTreeDSLObj
      console.log('newTreeDSLObj', newTreeDSLObj)
      // {
      //   Name: treeUnitDSLObj.name,
      //   Layout:{
      //     Category: "AxisIndependent",
      //     Mode: "bottom-up",
      //     X: {
      //       Subtree: {
      //         Relation: 'flatten'
      //       },
      //       Root: {
      //         Relation: 'juxtapose'
      //       }
      //     },
      //     Y: {
      //       Subtree: {
      //         Relation: 'align'
      //       },
      //       Root: {
      //         Relation: 'within'
      //       }
      //     }
      //   },
      //   CoordinateSystem: {
      //     Category: "cartesian"
      //   },
      //   Element: {
      //     Node: "circle"
      //   }
      // }
      //  Update the DSL array and name
      this.treeUnitDSLArray.push(treeUnitDSLObj)
      console.log('treeUnitDSLArray', this.treeUnitDSLArray)
      //  Updates the selected DSL object
      sysDatasetObj.updateSingleSelectedDSLObject(treeUnitDSLObj.name, treeUnitDSLObj.dslObj)
      //  Adds the DSL name to the selected array of DSLS
      this.selectedDSLArray.push(treeUnitDSLObj.name)
      // sysDatasetObj.updateTreeDSLContentObject(treeUnitDSLObj.name, treeUnitDSLObj.dslObj)
      // Updates the selected DSL object in DSLlist
      this.UPDATE_TREEUNIT_DSL_NAME(treeUnitDSLObj.name)
      // If the DSL object currently selected in DSLlist is null, then the current selection is updated, otherwise it is not updated
      if (this.dslListSelectedDSLName == null) {
        this.UPDATE_DSLLIST_SELECTED_DSL_NAME(treeUnitDSLObj.name)
      }
    },
    //  Initialize a new DSL object
    get_new_tree_dsl_obj: function(dslName) {
      let newTreeDSLObj = {}
      addDslDefaultSetting(newTreeDSLObj)
      newTreeDSLObj.Name = dslName
      return newTreeDSLObj
    },
    saveDSL: function() {
      let config = getConfig()
      let cartesianDSLArray = config.cartesianDSLArray
      let polarDSLArray = config.polarDSLArray
      let goTreeName = this.goTreeName
      if (typeof(goTreeName) === 'undefined') {
        goTreeName = this.treeUnitDSLName
      }
      if (this.treeUnitDSLName == null) {
        // You are prompted to create a new DSL or select a DSL
        this.selectionAlertDialog = true
      } else {
        let polarDSLArrayExist = (polarDSLArray.indexOf(goTreeName) !== -1)
        let cartesianDSLArrayExist = (cartesianDSLArray.indexOf(goTreeName) !== -1)
        if ((sysDatasetObj.isDSLObjectExist(goTreeName)) && (!polarDSLArrayExist) && (!cartesianDSLArrayExist)) {
          //  If the currently edited object exists in the selected DSL object and is not an object that exists in Gallary, then update directly
          this.updateSelectedDSLArray()
        } else {
          //  Otherwise, a dialog box is displayed asking you whether to edit the name
          this.saveDialogVisible = true
        }
      }
    },
  	saveAsNewDSL: function() {
      let self = this
      if (this.treeUnitDSLName == null) {
        // You are prompted to create a new DSL or select a DSL
        this.selectionAlertDialog = true
      } else {
        this.saveAsDialogVisible = true
        // this.initShowDSLName()
      }
  	},
    cancelOverlapExistingDSL: function() {
      this.overlapDSLDialogVisible = false
    },
    confirmOverlapExistingDSL: function() {
      this.overlapDSLDialogVisible = false
      this.updateDSLArray()
      // Close the dialog box for updating the current DSL
      this.saveAsDialogVisible = false
    },
  	removeCurrentDSL: function() {
  		console.log('remove')
  	},
    cancelGoTreeName: function(GoTree) {
      // Do not change the current DSL name
      this.saveAsDialogVisible = false
    },
    confirmGoTreeName: function() {
      let config = getConfig()
      let cartesianDSLArray = config.cartesianDSLArray
      let polarDSLArray = config.polarDSLArray
      let goTreeName = this.goTreeName
      if (typeof(goTreeName) === 'undefined') {
        goTreeName = this.treeUnitDSLName
      }
      // console.log('polarDSLArray', polarDSLArray, 'cartesianDSLArray', cartesianDSLArray, 'goTreeName', this.goTreeName)
      // Determine if the name meets the requirements, or duplicates an existing name
      let polarDSLArrayExist = (polarDSLArray.indexOf(goTreeName) !== -1)
      let cartesianDSLArrayExist = (cartesianDSLArray.indexOf(goTreeName) !== -1)
      if (checkDSLName(goTreeName)) {
        if (polarDSLArrayExist || cartesianDSLArrayExist) {
          this.dslNameWarningHint = "The name already exists in the Gallary. Please use another name."          
        } else {
          this.dslNameWarningHint = ""
          if (sysDatasetObj.isDSLObjectExist(goTreeName)) {
            //  If the selected DSL exists in the current system, a prompt pops up asking the user whether to override the current DSL
            this.overlapDSLDialogVisible = true
          } else {
            //  Save the name of the selected DSL if it does not exist
            this.updateDSLArray()
            this.saveAsDialogVisible = false
            this.saveDialogVisible = false
          }
        }
      } else {
        this.dslNameWarningHint = "The name does not match the above rule."
      }
      function checkDSLName(dslName) {  
        var re =  /^[0-9a-zA-Z]\w*$/;  //Determines whether the string is a combination of digits and letters
        if (!re.test(dslName)) {  
          return false;  
        } else {  
          return true;  
        }  
      }  
    },
    //  Update all relevant DSL data in the system
    updateDSLArray: function() {
      this.updateTreeUnitDSLArray()
      this.updateSelectedDSLArray()
    },
    //  Update the current DSL name
    updateTreeUnitDSLArray: function() {
      let self = this
      let updateDSLName = this.gotreeName
      let galleryDSLObjDict = JSON.parse(JSON.stringify(this.galleryDSLObjDict))
      // Update the name information in the treeUnitDSLArray view
      for (let i = 0;i < this.treeUnitDSLArray.length;i++) {
        let treeUnitDSLObj = this.treeUnitDSLArray[i]
        if (treeUnitDSLObj.name === this.treeUnitDSLName) {
          let treeUnitDSLObjSaveAs = JSON.parse(JSON.stringify(treeUnitDSLObj))
          treeUnitDSLObjSaveAs.name = updateDSLName
          // save the modified tree dsl object as a new one
          galleryDSLObjDict[updateDSLName] = [treeUnitDSLObjSaveAs['dslObj']]
          this.UPDATE_SELECTED_TREE_DSL_OBJ({'index': updateDSLName, 'dsl': treeUnitDSLObjSaveAs['dslObj']})
          this.UPDATE_TREEUNIT_DSL_ARRAY([{ "name": updateDSLName, "dslObj": treeUnitDSLObjSaveAs['dslObj'], "visible": true }])
          // update the gallery view and also update the tree dsl list view
          this.UPDATE_GALLERY_DSL_OBJ_DICT(galleryDSLObjDict)
          //  Update the currently displayed DSLName and select the updated object
          setTimeout(function() {
            self.UPDATE_TREEUNIT_DSL_NAME(updateDSLName)
          }, 200)
          // update the layout of tree unit view
          setTimeout(function() {
            self.UPDATE_TREE_UNIT_LAYOUT_STATE()
          }, 500)
          //  update the tree canvas view
          setTimeout(function() {
            self.UPDATE_TREE_CANVAS_LAYOUT_STATE()
          }, 900)
          break;
        }
      }      
    },
    // Update the DSL preview view and DSL in the DSLlist view
    updateSelectedDSLArray: function() {
      let toSavedDSLName = this.gotreeName
      // sysObj updateSelectedDSLObject
      for (let i = 0;i < this.treeUnitDSLArray.length;i++) {
        if (this.treeUnitDSLArray[i].name === toSavedDSLName) {
          //  This is the new DSL to save
          let dslObj = this.treeUnitDSLArray[i].dslObj
          sysDatasetObj.updateSelectedDSLObject(toSavedDSLName, dslObj)
          sysDatasetObj.updateTreeDSLContentObject(toSavedDSLName, dslObj)          
        }
      }
      // store selectedDSLArray
      if (this.selectedDSLArray.indexOf(toSavedDSLName) === -1) {
        this.selectedDSLArray.push(toSavedDSLName)
      }
      //  Signal that the DSL has been updated
      this.UPDATE_CHANGED_DSL_NAME_STATE()
    },
    changeGoTreeName: function(name) {
      if (typeof(name) !== 'undefined') {
        this.goTreeName = name
      }
    },
    initShowDSLName: function() {
      console.log('initShowDSLName', this.treeUnitDSLName)
      this.gotreeName = this.treeUnitDSLName
      console.log('initShowDSLName this.goTreeName', this.gotreeName)
    },
    ...mapMutations([
      "UPDATE_TREEUNIT_DSL_ARRAY",
      "UPDATE_TREEUNIT_DSL_NAME",
      "UPDATE_CHANGED_DSL_NAME_STATE",
      "UPDATE_DSLLIST_SELECTED_DSL_NAME",
      "UPDATE_GALLERY_DSL_OBJ_DICT",
      "UPDATE_SELECTED_TREE_DSL_OBJ", 
      "UPDATE_TREE_UNIT_LAYOUT_STATE", 
      "UPDATE_TREE_CANVAS_LAYOUT_STATE"
    ])
  }
}
</script>

<style scoped lang="less">
  .treeunit-view-title {
    display: flex; 
    width: 100%; 
    height: 100%; 
    margin: auto; 
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    border-bottom: 1px solid #E4E7ED;
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
       margin-right: 0.5rem;
       margin-left: auto;
       font-size: 14px;
       .operation-icon {
          padding: 0.2rem;
       }
       .operation-icon:hover {
    	  background: #ccc !important;
  	   }
       .mode-selection {
          margin-left: 0.8rem;
       }
    }
    #dsl-name-dialog {
      text-align: left;
      #dsl-name-hint {
        padding-bottom: 15px;
        .highlight {
          color: red;
        }
      }
      #dsl-name-warning-hint {
        color: red;
      }
    }
    #selection-alert-dialog {
      text-align: left;
    }
  }
 //  .treeunit-view-title {
	// 	
	// 	width: 100%;
	// 	height: 100%;
	// 	border-bottom: 1px solid #E4E7ED;
	// 	.label {
	// 		text-align: left;
	// 		padding-left: 10px;
	// 		font-weight: bold;
	// 		font-size: 1.2rem;
	// 		height: 2rem;
	// 		display: table;
	// 		.inner-title {
	// 		  vertical-align: middle;
	// 		  display: table-cell;
	// 		}
	// 	}
	// 	.operation {
	// 		text-align: right;
	// 		padding-right: 10px;
	// 		font-weight: bold;
	// 		font-size: 1.2rem;
	// 		height: 2rem;
	// 		display: table;
	// 		.inner-title {
	// 		  vertical-align: middle;
	// 		  display: table-cell;
	// 		}
	// 	}
	// }
</style>
