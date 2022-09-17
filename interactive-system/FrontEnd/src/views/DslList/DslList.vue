<template>
	<div id="treedsl-container">
		<el-carousel indicator-position="outside" :autoplay="false">
		    <el-carousel-item v-for="(dslRow, index) in dslArrangement" :key="getPanelKey(index)" v-if="showPanel">
		      <div class="treedsls" :style="DSLsStyleObject">
		      	<div class="single-treedsl" 
		      		 v-for="dslItem in dslRow"
		      		 :id="dslItem"
               		 :class="{ selected: (currentTreeDSLArray.indexOf(dslItem) != -1) }"
		      		 :style="singleDSLStyleObject">
		      		<SinglePreviewFigure
		      			:key="dslItem"
		      			:dslId="dslItem"
		      			:getTreeDSLObj="getTreeDSLObj"
		      			:operation="operation"
		      			:defaultOperationFunc="updateSelectedTreeDSL"
		      			:removeTemplateFromDsllist="removeSelectedDSL"
		      			:addTemplate2Library="addTemplate2Library"
		      			:replaceExistedTree="updateSelectedTreeDSL">
		      			{{ dslItem }}
		      		</SinglePreviewFigure>
		      		<!-- <div class="remove-button-container"
		      			:style="deleteButtonContainerStyleObj">
			      		<el-button
			      			:style="buttonStyleObj"
			      			@click.stop="removeSelectedDSL(dslItem)"
			      			icon="el-icon-close" circle>
			      		</el-button>
		      		</div> -->
		      	</div>
		      </div>
		    </el-carousel-item>
		</el-carousel>
	</div>
</template>

<script>
  import SinglePreviewFigure from './SinglePreviewFigure.vue';
  import { Drag, Drop } from 'vue-drag-drop';
  import { mapState, mapMutations, mapActions } from 'vuex';
  import { addTreeTemplate } from '@/communication/sendData.js'

  export default {
	name: 'DSLList',
	components: {
		SinglePreviewFigure, Drag, Drop
	},
	data() {
	  return {
	  	treeDSLNum: 5,
	  	dslArrangement: [],
	  	showPanel: false,
	  	singleDSLStyleObject: {},
	  	deleteButtonContainerStyleObj: {},
	  	infoButtonContainerStyleObj: {},
	  	buttonStyleObj: {},
	  	DSLsStyleObject: {},
	  	singleDSLHorizontalSpace: 0,
	  	operation: ['replace', 'save2gallery', 'download', 'dsllist-remove'],
	  	galleryTreeDSLObjList: []
	  }
	},
	props: {
    	galleryDSLObjDict: {
    		type: Object
    	}
    },
	watch: {
		selectedDSLArray: {
			// update the selected dsl 
			handler: function() {
				this.updateDSLArrangement()
			},
			deep: true
		},
		// previewTreeObj: function() {
		// 	// if ((this.dslListSelectedDSLName != null) && (this.selectedPreviewNodeId != null)) {
		// 	// 	console.log('dslListSelectedDSLName', this.dslListSelectedDSLName)
		// 	// 	this.updateSelectedTreeDSL(this.dslListSelectedDSLName)				
		// 	// } else {
		// 	// 	this.updateCurrentDSLArray()
		// 	// }
		// 	let currentTreeDSLArray = sysDatasetObj.getCurrentTreeDSLArray(this.focusedTreeObjArray)
		// 	this.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)
		// },
		dslListSelectedDSLName: function() {
			if (this.dslListSelectedDSLName != null) {
				this.updateSelectedTreeDSL(this.dslListSelectedDSLName)				
			}
		},
		dslListSelectedDSLState: function() {
			if ((this.dslListSelectedDSLName != null) && (this.selectedPreviewNodeId != null)) {
				console.log('dslListSelectedDSLName', this.dslListSelectedDSLName)
				this.updateSelectedTreeDSL(this.dslListSelectedDSLName)				
			}
		},
		galleryDSLObjDict: function() {
			// extract the dsl array from the galleryTreeDSLObjList, 
			// and then update the arrangement of the dsl list
			this.updateGalleryTreeDSLObjList()
			this.updateDSLArrangement()
		}
	},
	created: function () {
	},
	beforeMount: function() {	
	},
	mounted: function() {
		this.updateGalleryTreeDSLObjList()
		this.updateDSLArrangement()
		this.showPanel = true
		console.log('currentTreeDSLArray', this.currentTreeDSLArray)
	},
	computed: {
		...mapState([
		  // all category need to be displayed 
		  'treeUnitDSLArray',
	      'selectedDSLArray',
	      'focusedTreeObjArray',
	      'previewTreeObj',
	      'selectedDataset',
	      'treeUnitDSLName',
	      'dslListSelectedDSLName',
	      'dslListSelectedDSLState',
	      'selectedPreviewNodeId',
	      'currentTreeDSLArray',
	      'userInfoName'
	    ])
	},
	methods: {
		//	get the key in each panel of the slide panel
		getPanelKey: function(index) {
			return 'row-' + index
		},
		//  compute the dsl object
	    getTreeDSLObj: function(dslItem) {
	      if (typeof(this.galleryDSLObjDict[dslItem]) !== 'undefined') {
	      	let dslObjList = this.galleryDSLObjDict[dslItem]
	      	if (dslObjList.length > 0) {
	      		return dslObjList[0]
	      	} else {
	      		console.log('the dsl object is empty')
	      	}
	      }
	    },
	    getTreeTemplateInfo: function(templateJsonObj, treename, username) {
			let self = this
			let dateStr = new Date().toISOString().split('T')[0]
			return {
				treename: treename,
				username: username,
				template: templateJsonObj,
				date: dateStr
			}
		},
	    addTemplate2Library: function(dslItem) {
	    	let userInfoName = this.userInfoName
	    	let dslObj = this.getTreeDSLObj(dslItem)
	    	let templateJsonObj = JSON.stringify(dslObj)
	    	let treeTemplateInfoObj = this.getTreeTemplateInfo(templateJsonObj, dslItem, userInfoName)
	    	let isTemplateExisted = sysDatasetObj.isTemplateExisted(dslItem)
	    	if (isTemplateExisted) {
	    		this.promptMessage('error', 'this template is existed')
	    	} else {
	    		sysDatasetObj.addTreeTemplateArray([treeTemplateInfoObj])
	    		if (userInfoName !== 'Login') {
	    			addTreeTemplate(treeTemplateInfoObj, this.addTreeTemplateCallback)
	    		}
	    	}
	    },
	    addTreeTemplateCallback: function() {
			this.promptMessage(resData.type, resData.message)
	    },
	    promptMessage: function(type, message) {
			this.$message({
              type: type,
              message: message
            })
		},
		//	set the icon for deleting
		initDeleteInfoIconStyleObj: function() {
			let singleDSLDivHeight = +(this.singleDSLStyleObject.height.replace('px', ''))
			let singleDSLDivWidth = +(this.singleDSLStyleObject.width.replace('px', ''))
			let singleDSLDivMarginTop = +this.singleDSLStyleObject.marginTop.replace('px')
			let removeButtonPadding = singleDSLDivWidth / 30,
				removeButtonFontSize = singleDSLDivWidth / 12
			let removeButtonRight = -(removeButtonPadding + removeButtonFontSize / 2)
			let removeButtonTop = -(singleDSLDivHeight + removeButtonPadding + removeButtonFontSize / 2)
			this.deleteButtonContainerStyleObj = {
				right: removeButtonRight + 'px',
				top: removeButtonTop + 'px'
			}
			this.infoButtonContainerStyleObj = {
				right: (-removeButtonRight) + 'px',
				top: removeButtonTop + 'px'
			}
			this.buttonStyleObj = {
				fontSize: removeButtonFontSize + 'px',
				padding: removeButtonPadding + 'px',
			}
		},
		//	update the view of dsl arrangement
		updateDSLArrangement: function() {
			this.initDSLNum()
			this.initDSLArrangement()
			this.setContainerPadding()
			this.initDeleteInfoIconStyleObj()
		},
		initDSLNum: function() {
			let treeDSLContainerHeight = $('#treedsl-container').height()
			let treeDSLContainerWidth = $('#treedsl-container').width()
			let marginTopBottom = 0.08
			let marginLeftRight = 0.1
			console.log('height', treeDSLContainerHeight, 'width', treeDSLContainerWidth)
			//	Calculate the height and vertical margin of the singleTreeDSL
			let singleTreeDSLHeight = treeDSLContainerHeight * (1 - 2 * marginTopBottom)
			let singleTreeDSLMarginTopBottom = treeDSLContainerHeight * marginTopBottom
			//	Calculate the width and horizontal margin of the singleTreeDSL 
			let singleTreeDSLWidth = singleTreeDSLHeight * 0.877
			let singleTreeDSLMarginLeftRight = singleTreeDSLWidth * marginLeftRight
			this.singleDSLHorizontalSpace = singleTreeDSLWidth + singleTreeDSLMarginLeftRight * 2
			//	Calculate how many single TreeDSLs can be horizontally arranged
			let treeDSLNum = treeDSLContainerWidth / this.singleDSLHorizontalSpace
			if ((treeDSLNum % 1) > 0.9) {
				treeDSLNum = Math.round(treeDSLNum)
			}
			treeDSLNum = Math.floor(treeDSLNum)
			this.treeDSLNum = treeDSLNum
			this.singleDSLStyleObject = {
				height: singleTreeDSLHeight + 'px',
				width: singleTreeDSLWidth + 'px',
				marginLeft: singleTreeDSLMarginLeftRight + 'px',
				marginRight: singleTreeDSLMarginLeftRight + 'px',
				marginTop: singleTreeDSLMarginTopBottom + 'px',
				marginBottom: singleTreeDSLMarginTopBottom + 'px'
			}			
		},
		updateGalleryTreeDSLObjList: function() {
            let galleryDSLObjDict = this.galleryDSLObjDict
            let galleryTreeDSLObjList = []
            for (let dslIndex in galleryDSLObjDict) {
                let dslObjList = galleryDSLObjDict[dslIndex]
                console.log('dslIndex', dslIndex, 'dslObjList', dslObjList)
                for (let i = 0; i < dslObjList.length; i++) {
                  galleryTreeDSLObjList.push(dslIndex)
                }
            }
            this.galleryTreeDSLObjList = galleryTreeDSLObjList
        },
		//	Initialize the layout of DSL
		initDSLArrangement: function() {
			let galleryTreeDSLObjList = this.galleryTreeDSLObjList
			console.log('galleryTreeDSLObjList', galleryTreeDSLObjList)
			let treeDSLNum = this.treeDSLNum
			let dslArrangement = []
			for (let i = 0; i < galleryTreeDSLObjList.length; i++) {
				if ((i % treeDSLNum) === 0) {
					dslArrangement.push([])
				}
				dslArrangement[dslArrangement.length - 1].push(galleryTreeDSLObjList[i])
			}
			this.dslArrangement = dslArrangement
		},
		//	Set the padding value of the DSL container
		setContainerPadding: function() {
			let treeDSLContainerWidth = $('#treedsl-container').width()
			let treeDSLNum = this.treeDSLNum
			let wholeOccupySpace = this.singleDSLHorizontalSpace * treeDSLNum
			if (treeDSLContainerWidth > wholeOccupySpace) {
				let paddingLeftRight = (treeDSLContainerWidth - wholeOccupySpace) / 2
				this.DSLsStyleObject = {
					paddingLeft: paddingLeftRight + 'px',
					paddingRight: paddingLeftRight + 'px'
				}
			}
		},
		//	enable the user clicks the delete DSL button to delete the selected DSL
		removeSelectedDSL: function(dslItem) {
			let dslItemIndex = this.galleryTreeDSLObjList.indexOf(dslItem)
			this.galleryTreeDSLObjList.splice(dslItemIndex, 1)
			this.$cookies.set('selected-dsl-array', this.galleryTreeDSLObjList)
		},
		//  update the selected treeDSL
		updateSelectedTreeDSL: function(dslItem, dslObj) {
			let self = this
			// let layoutParas = sysDatasetObj.getLayoutParas()
			// if (typeof (layoutParas.treeIndexWithDSL) === "undefined") {
			// 	layoutParas.treeIndexWithDSL = {}
			// }
			// let treeIndexWithDSL = layoutParas.treeIndexWithDSL
			// changeSingleDSLIndex(focusedTreeObjArray, treeIndexWithDSL, dslItem)
			// let treeDSLContentObj = {}
			// for(let item in treeIndexWithDSL) {
			// 	let dslName = treeIndexWithDSL[item]
			// 	treeDSLContentObj[dslName] = sysDatasetObj.getTreeDSLObject(dslName)
			// }
			// layoutParas.treeDSLContentObj = treeDSLContentObj
			// sysDatasetObj.updateLayoutParas(this.focusedTreeObjArray, dslItem)
			// let currentTreeDSLArray = sysDatasetObj.getCurrentTreeDSLArray(this.focusedTreeObjArray)
			if ((typeof(dslObj) === 'undefined') || (dslObj == null)) {
				return
			}
			let currentTreeDSLArray = [ dslItem ]
			this.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)
			// update the dsl list in the tree unit view
			// let treeUnitDSLArray = sysDatasetObj.updateTreeUnitDSLArray(this.currentTreeDSLArray, this.treeUnitDSLArray)
			let dslObjInTreeUnit = JSON.parse(JSON.stringify(dslObj))
			this.UPDATE_SELECTED_TREE_DSL_OBJ({'index': dslItem, 'dsl': dslObjInTreeUnit})
			this.UPDATE_TREEUNIT_DSL_ARRAY([{ "name": dslItem, "dslObj": dslObjInTreeUnit, "visible": true }])
			//	update tree unit view 
			setTimeout(function() {
		    	self.UPDATE_TREEUNIT_DSL_NAME(dslItem)
		    }, 200)
			// update the layout of tree unit view
		    setTimeout(function() {
		    	self.UPDATE_TREE_UNIT_LAYOUT_STATE()
		    }, 500)
			//	update treeunit and tree canvas view
			setTimeout(function() {
				self.UPDATE_TREE_CANVAS_LAYOUT_STATE()
			}, 900)
			// else {
			// 	// currentTreeDSLArray.splice(dslItemIndex, 1)
			// 	// this.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)	
			// }
			// let treeUnitDataset = sysDatasetObj.getTreeUnitDataset()
		 //    let treeUnitFormData = {
		 //       hierarchicalData: treeUnitDataset,
		 //       treeIndexWithDSL: treeIndexWithDSL,
		 //       treeDSLContentObj: treeDSLContentObj,
		 //    }
		 //    sysDatasetObj.updateTreeUnitLayoutParas(treeUnitFormData)
		    // function changeSingleDSLIndex(treeNodeObjArray, treeIndexWithDSL, dslItem) {
		    //     for (let i = 0; i < treeNodeObjArray.length; i++) {
		    //       let treeNodeObjIndex = treeNodeObjArray[i]
		    //       treeIndexWithDSL[treeNodeObjIndex] = dslItem
		    //     }
		    // }
		},
		// updateTreeUnitDSLArray: function(selectedDSLName) {
		// 	let self = this
	 //    	let treeUnitDSLArray = this.treeUnitDSLArray
	 //    	let currentTreeDSLArray = this.currentTreeDSLArray
	 //    	let treeUnitDSLArray = sysDatasetObj.updateTreeUnitDSLArray(currentTreeDSLArray, treeUnitDSLArray)
	 //    	this.UPDATE_TREEUNIT_DSL_ARRAY(treeUnitDSLArray)
	 //    	setTimeout(function() {
		//     	self.UPDATE_TREEUNIT_DSL_NAME(selectedDSLName)
		//     }, 100)
	 //    },
		getHybridNodeObjArrayNum: function() {
			return 0
		},
		...mapActions([
	      'getLayoutValue'
	    ]),
	    ...mapMutations([
	    	'UPDATE_TREEUNIT_DSL_ARRAY',
	    	'UPDATE_TREEUNIT_DSL_NAME',
	    	'UPDATE_TREE_CANVAS_LAYOUT_STATE',
	    	'UPDATE_TREE_UNIT_LAYOUT_STATE',
	    	'UPDATE_DSLLIST_SELECTED_DSL_NAME',
	    	'UPDATE_CURRENT_TREE_DSL_ARRAY', 
	    	'UPDATE_TREE_DSL_DIALOG_STATE',
	    	'UPDATE_SELECTED_TREE_DSL_OBJ'
     	])
 	}
  }
</script>

<style lang="less">
	@slide-control_width: 3%;
	#treedsl-title {
		
	}
	#treedsl-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
		.el-carousel {
			position: absolute;
			width: 100%;
			height: 100%;
			.el-carousel__container {
				position: absolute;
				height: 100%;
				width: 100%;
				.treedsls {
					position: absolute;
					left: 0px;
					top: 0%;
					right: 0px;
					height: 100%;
					display: flex;
					flex-direction: row;
					.single-treedsl {
						.remove-button-container {
							position: relative;
							float: right;
							visibility: hidden;
						}
						.info-button-container {
							position: relative;
							float: left;
						}
						.el-button.is-circle {
							padding: 6px;
						}
						&:hover {
							.remove-button-container {
								visibility: visible;
							}
							box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
						}
					}
					.single-treedsl[class~=selected] {
						box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);	
					}
				}
			}
		}
		.el-carousel__item {
		}

		.el-carousel__arrow--left {
			left: 5px;
		}

		.el-carousel__arrow--right {
			right: 5px;
		}

		.el-carousel__indicators {
			position: absolute;
			width: 100%;
			left: 0%;
			bottom: 0%;
			.el-carousel__indicator {
				padding: 3px 4px;
			}
		}
	}
</style>
