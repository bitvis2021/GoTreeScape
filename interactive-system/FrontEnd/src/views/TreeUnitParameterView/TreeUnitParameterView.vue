<template>
	<div id="treeunit-parameter-container">
		<el-tabs type="card"  v-model="editableDSLName" @tab-click="handleClick" 
			closable @tab-remove="removeTab">
             <el-tab-pane :label="dsl.name" :name="dsl.name"
             	v-for="(dsl, index) in treeUnitDSLArray">
               <div class="top-panel" :style="topPanelStyleObj">
                 <TreeUnitView v-if="dsl.visible" :dslName="dsl.name" :dslObj="dsl.dslObj"/>
               </div>
               <div class="bottom-panel" :style="bottomPanelStyleObj">
                 <ParameterView v-if="dsl.visible" :dslName="dsl.name" :dslObj="dsl.dslObj"/>
               </div>
             </el-tab-pane>
        </el-tabs>
	</div>
</template>

<script>
  import TreeUnitView from './TreeUnitView.vue'
  import { mapMutations, mapState } from 'vuex';
  import ParameterView from '@/views/ParameterView/ParameterView.vue'

  export default {
	name: 'TreeUnitParameterView',
	components: {
		TreeUnitView, ParameterView
	},
	data() {
	  return {
	  	topPanelStyleObj: null,
	  	bottomPanelStyleObj: null,
	  	editableDSLName: 0
	  }	
	},
	watch: {
		treeUnitDSLArray: {
			handler() {
    		},
    		deep: true
		},
		//	After the DSL object is selected from the DSLlist view, the DSL object needs to be updated in the parameters view
    	treeUnitDSLName: function() {
            console.log('treeUnitDSLName', this.treeUnitDSLName, 'treeUnitDSLArray', this.treeUnitDSLArray)
    		let treeUnitDSLName = this.treeUnitDSLName
      		if ((treeUnitDSLName != null) && (typeof(treeUnitDSLName) !== 'undefined')) {
      			this.selectCurrentTreeUnitDSL(treeUnitDSLName)
      		}
    	}
	},
	created: function () {
	},
	beforeMount: function() {
	},
	mounted: function() {
		this.initializePanelAttr()
	},
	computed: {
		...mapState([
			'treeUnitDSLArray',
			'treeUnitDSLName',
			'focusedTreeObjArray',
			'currentTreeDSLArray'
	    ])
	},
	methods: {
		//	Delete a TAB
		removeTab: function(targetDSLName) {
			let treeUnitDSLArray = this.treeUnitDSLArray;
	        let activeDSLName = this.editableDSLName;
	        if (activeDSLName === targetDSLName) {
	          treeUnitDSLArray.forEach((treeUnitDSLObj, index) => {
	            if (treeUnitDSLObj.name === targetDSLName) {
	              let nextTreeUnitDSLObj = treeUnitDSLArray[index + 1] || treeUnitDSLArray[index - 1];
	              if (nextTreeUnitDSLObj) {
	                activeDSLName = nextTreeUnitDSLObj.name;
	              }
	            }
	          });
	          if (activeDSLName === targetDSLName) {
	          	activeDSLName = null
	          }
	        }
	        this.editableDSLName = activeDSLName;
	        this.UPDATE_TREEUNIT_DSL_NAME(activeDSLName)
	        let newTreeUnitDSLArray = treeUnitDSLArray.filter(treeUnitDSLObj => treeUnitDSLObj.name !== targetDSLName);
	        this.UPDATE_TREEUNIT_DSL_ARRAY(newTreeUnitDSLArray)
	        let currentTreeDSLArray = JSON.parse(JSON.stringify(this.currentTreeDSLArray))
	        currentTreeDSLArray.splice(currentTreeDSLArray.indexOf(targetDSLName), 1)
	        this.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)
		},
		selectCurrentTreeUnitDSL: function(treeUnitDSLName) {
			let treeUnitDSLArray = this.treeUnitDSLArray
			// Updates the currently displayed DSL name
			this.editableDSLName = treeUnitDSLName;
			for (let i = 0;i < treeUnitDSLArray.length;i++) {
				if (treeUnitDSLArray[i].name === treeUnitDSLName) {
					//	Simulate TAB clicks in the TreeUnit view
					this.handleClick({index: i})
                    console.log('i', i, 'selectCurrentTreeUnitDSL')
				}
			}
		},
		handleClick: function(tab, event) {
	      let dslIndex = tab.index
	      for (let i = 0;i < this.treeUnitDSLArray.length;i++) {
	        this.treeUnitDSLArray[i].visible = false
	      }
	      let dslName = this.treeUnitDSLArray[dslIndex].name
	      this.UPDATE_TREEUNIT_DSL_NAME(dslName)
	      this.treeUnitDSLArray[dslIndex].visible = true
	      this.$forceUpdate()
	    },
	    //  Initialize the location and size of the TreeUnit view and the Parameter view
	    initializePanelAttr: function() {
	      let middlePanelWidth = $('#treeunit-parameter-container').width()
	      let middleTopPanelHeight = middlePanelWidth * 0.9
	      this.topPanelStyleObj = {height: middleTopPanelHeight + 'px'}//this.middleTopPanelHeight
	      this.bottomPanelStyleObj = {top: middleTopPanelHeight + 'px'}//this.middleTopPanelHeight

	      // let treeDSLDialogHeight = +$('#treedsl-dialog').height()
	      // let treeDSLDialogMarginTop = treeDSLDialogHeight * 0.1
	      // $('#treedsl-dialog .el-dialog').css({'margin-top': treeDSLDialogMarginTop + 'px'})
	    },
		...mapMutations([
	      'UPDATE_TREEUNIT_DSL_ARRAY',
	      'UPDATE_TREEUNIT_DSL_NAME',
	      'UPDATE_TREE_CANVAS_LAYOUT_STATE',
	      'UPDATE_CURRENT_TREE_DSL_ARRAY'
	    ])
 	}
  }
</script>
<style lang="less">
#treeunit-parameter-container {
    .el-tabs {
      width: 100%;
      height: 100%;
    }
    .el-tabs__nav {
      // border-right: 0px !important;
      border-left: 0px !important;
    }
    .el-tabs--card>.el-tabs__header .el-tabs__nav {
      border-radius: 0 0 0 0;
    }
    .el-tabs__item, .el-tabs__nav-next, .el-tabs__nav-prev {
      line-height: 2rem;
      height: 2rem;
    }
    .el-tabs__header {
      margin: 0px;
    }
    .el-tabs__content {
      height: calc(100% - 2.5em);
      width: 100%;
        .el-tab-pane {
          width: 100%;
          height: 100%;
        }
    }
    .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
      border-bottom-color: #FFF;
    }
}
</style>
<style lang="less" scoped>
	#treeunit-parameter-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
  		.top-panel {
          position: absolute;
          top: 0%;
          left: 0%;
          height: 35%;
          width: 100%;
          border-bottom: 1px solid #E4E7ED;
        }
        .bottom-panel {
          position: absolute;
          left: 2%;
          top: 35%;
          width: 96%;
          bottom: 0%;
          overflow-y: auto;
        }
	}
</style>
