<template>
	<div class = "layout-container">
		<div class = "label">
			<span class = "inner-title">Layout</span>
		</div>
		<div class = "component-container">
			<el-tabs type="card" @tab-click="handleClick" stretch>
    			<el-tab-pane :label="root">
    				<div class="component-panel" id="root-panel">
    					<div v-for="layout in layoutRootArray" class="component" 
    						:id="layout.id" :type="rootLayoutComponentType">
	    						<div class = "sketch-figure">
	    							<layoutSketchFigure :layout="layout.name" category="root" v-if="showRootComponents"/>
	    						</div>
	    						<div class = "component-title">
	    							<span class = "component-title-container" id="root-title">{{layout.name}}</span>
	    						</div>
    					</div>
    				</div>
    			</el-tab-pane>
    			<el-tab-pane :label="subtree">
    				<div class="component-panel" id="subtree-panel">
    					<div v-for="layout in layoutSubtreeArray" class="component" 
    						:id="layout.id" :type="subtreeLayoutComponentType">
	    						<div class = "sketch-figure">
	    							<LayoutSketchFigure :layout="layout.name" category="subtree" v-if="showSubtreeComponents"/>
	    						</div>
	    						<div class = "component-title">
	    							<span class = "component-title-container" id="subtree-title">{{layout.name}}</span>
	    						</div>
    					</div>
    				</div>
    			</el-tab-pane>
  			</el-tabs>
		</div>
	</div>
</template>

<script>
  import LayoutSketchFigure from '@/components/TreeModuleFigure/LayoutSketchFigure.vue';
  import { mapMutations, mapState, mapActions } from 'vuex'

  export default {
	name: 'Layout',
	components: {
		LayoutSketchFigure
	},
	data() {
	  return {
	  	rootLayoutComponentType: 'Root',
	  	subtreeLayoutComponentType: 'Subtree',
	  	layoutRootArray: [
	  		{
	  			id: 'x-include-y-within',
	  			name: 'X include | Y within'
	  		},
	  		{
	  			id: 'x-juxtapose-y-within',
	  			name: 'X juxtapose | Y within'
	  		},
	  		{
	  			id: 'x-within-y-within',
	  			name: 'X within | Y within'
	  		},
	  		{
	  			id: 'x-include-y-juxtapose',
	  			name: 'X include | Y juxtapose'
	  		},
	  		{
	  			id: 'x-juxtapose-y-juxtapose',
	  			name: 'X juxtapose | Y juxtapose'
	  		},
	  		{
	  			id: 'x-within-y-juxtapose',
	  			name: 'X within | Y juxtapose'
	  		},
	  		{
	  			id: 'x-include-y-include',
	  			name: 'X include | Y include'
	  		},
	  		{
	  			id: 'x-juxtapose-y-include',
	  			name: 'X juxtapose | Y include'
	  		},
	  		{
	  			id: 'x-within-y-include',
	  			name: 'X within | Y include'
	  		}
	  	],
	  	layoutSubtreeArray: [
	  		{
	  			id: 'x-align-y-flatten',
	  			name: 'X align | Y flatten'
	  		},
	  		{
	  			id: 'x-flatten-y-flatten',
	  			name: 'X flatten | Y flatten'
	  		},
	  		{
	  			id: 'x-align-y-align',
	  			name: 'X align | Y align'
	  		},
	  		{
	  			id: 'x-flatten-y-align',
	  			name: 'X flatten | Y align'
	  		}
	  	],
	  	elementNodeArray: [],
	  	elementLinkArray: [],
	  	coordinateSystemArray: [],
	  	padding: 2,
	  	showRootComponents: false,
	  	showSubtreeComponents: false,
	  	root: "root-subtree group",
	  	subtree: "subtree",
	  	layout3_3: {
	  		lengthPercentage: "25%",
	  		marginPercentage: "6.25%",
	  		lengthNum: 0.25,
	  		marginNum: 0.0625
	  	},
	  	layout2_2: {
	  		lengthPercentage: "40%",
	  		marginPercentage: "6.7%",
	  		lengthNum: 0.4,
	  		marginNum: 0.067
	  	}
	  }	
	},
	watch: {
		treeUnitDSLName: function() {
			let self = this
			//	Remove all selections as well as the unhighlight status
			$('#root-panel .component').removeClass('selected')
			$('#root-panel .component').removeClass('unhighlight')
			$('#subtree-panel .component').removeClass('selected')
			$('#subtree-panel .component').removeClass('unhighlight')
			let editDSLObjArray = self.treeUnitDSLArray.filter(function(d, i) {
				return d.name === self.treeUnitDSLName
			})
			if (editDSLObjArray.length > 0) {
				let editDSLObj = editDSLObjArray[0].dslObj
				let layoutObj = editDSLObj.Layout
				if(typeof (layoutObj) !== 'undefined') {
					if (typeof(layoutObj.X) !== 'undefined') {
						if (typeof(layoutObj.X.Root) !== 'undefined') {
							let rootCategory = 'x-' + layoutObj.X.Root.Relation + '-y-' + layoutObj.Y.Root.Relation
							$('#root-panel .component').addClass('unhighlight')
							$('#root-panel .component#' + rootCategory).addClass('selected')
						}
					}
					if (typeof(layoutObj.X) !== 'undefined') {
						if (typeof(layoutObj.X.Subtree) !== 'undefined') {
							let subtreeCategory = 'x-' + layoutObj.X.Subtree.Relation + '-y-' + layoutObj.Y.Subtree.Relation
							$('#subtree-panel .component').addClass('unhighlight')
							$('#subtree-panel .component#' + subtreeCategory).addClass('selected')	
						}
					}
				}
			}
		}
	},
	created: function () {
	},
	beforeMount: function() {
		this.root = this.root + " (" + this.layoutRootArray.length + ")"
		this.subtree = this.subtree + " (" + this.layoutSubtreeArray.length + ")"
		let viewWidth = $('.layout-container').width()
	},
	mounted: function() {
		let componentContainerWidth = +$('.component-container').width()
		let componentContainerHeight = +$('.component-container').height()
		//	Components in the Root Panel If the Container is high, change the 3*3 layout to 2*2 layout
		if (componentContainerHeight > (componentContainerWidth * 2)) {
			this.initRootPanelSize(this.layout2_2)	
		} else {
			this.initRootPanelSize(this.layout3_3)
		}
		this.initSubtreePanelize(this.layout2_2)
		this.showRootComponents = true
		this.initClickEvent()
	},
	computed: {
		...mapState([
	      'rootLayoutComponent',
	      'subtreeLayoutComponent',
	      'treeUnitDSLName',
	      'treeUnitDSLArray'
	    ])		
	},
	methods: {
		handleClick: function(tab, event) {
			if (tab.label === this.subtree) {
				this.showSubtreeComponents = true				
			}
		},
		initClickEvent: function() {
			let self = this
			$('.layout-container .component').click(function() {
				let componentType = $(this).attr('type')
				let componentId = $(this).attr('id')
				if (componentType === self.rootLayoutComponentType) {
					// self.UPDATE_ROOT_LAYOUT(componentId)
					self.highlightRootLayoutComponent(componentId)
				} else if (componentType === self.subtreeLayoutComponentType) {
					// self.UPDATE_SUBTREE_LAYOUT(componentId)
					// Build the Subtree DSL
					self.highlightSubtreeLayoutComponent(componentId)
				}
			})
		},
		highlightRootLayoutComponent: function(rootLayoutComponentId) {
			let rootComponent = 'Root'
			let componentArray = rootLayoutComponentId.split('-')
			if (typeof(rootLayoutComponentId) !== 'undefined') {
				if ($('#root-panel .component#' + rootLayoutComponentId).hasClass('selected')) {
					$('#root-panel .component#' + rootLayoutComponentId).removeClass('selected')	
					this.removeDSLComponent(rootComponent)
				} else {
					$('#root-panel .component').removeClass('selected')
					$('#root-panel .component#' + rootLayoutComponentId).addClass('selected')
					this.addRootLayoutComponent(componentArray)
				}		
			}
			if ($('#root-panel .selected').length > 0) {
				$('#root-panel .component').addClass('unhighlight')
			} else {
				$('#root-panel .component').removeClass('unhighlight')				
			}
		},
		highlightSubtreeLayoutComponent: function(subtreeLayoutComponentId) {
			let subtreeComponent = 'Subtree'
			let componentArray = subtreeLayoutComponentId.split('-')
			if (typeof(subtreeLayoutComponentId) !== 'undefined') {
				if ($('#subtree-panel .component#' + subtreeLayoutComponentId).hasClass('selected')) {
					$('#subtree-panel .component#' + subtreeLayoutComponentId).removeClass('selected')	
					this.removeDSLComponent(subtreeComponent)
				} else {
					$('#subtree-panel .component').removeClass('selected')
					$('#subtree-panel .component#' + subtreeLayoutComponentId).addClass('selected')	
					this.addSubtreeLayoutComponent(componentArray)
				}			
			} 
			if ($('#subtree-panel .selected').length > 0) {
				$('#subtree-panel .component').addClass('unhighlight')
			} else {
				$('#subtree-panel .component').removeClass('unhighlight')				
			}
		},
		addRootLayoutComponent: function(componentArray) {
			let rootLayoutObj = {
				"Layout": {
					"X": {
						"Root": {
							"Relation": componentArray[1]
						}
					},
					"Y": {
						"Root": {
							"Relation": componentArray[3]
						}
					}
				}
			}
			this.setDSLComponent(rootLayoutObj)
		},
		addSubtreeLayoutComponent: function(componentArray) {
			let subtreeLayoutObj = {
				"Layout": {
					"X": {
						"Subtree": {
							"Relation": componentArray[1]
						}
					},
					"Y": {
						"Subtree": {
							"Relation": componentArray[3]
						}
					}
				}
			}
			this.setDSLComponent(subtreeLayoutObj)
		},
		initRootPanelSize: function(layoutObj) {
			//	In the case of 3 by 3,
			let lengthPercentage = layoutObj.lengthPercentage, marginPercentage = layoutObj.marginPercentage, 
				lengthNum = layoutObj.lengthNum, marginNum = layoutObj.marginNum
			// let lengthPercentage = "40%", marginPercentage = "6.7%", 
			// 	lengthNum = 0.4, marginNum = 0.067
			let viewWidth = $('.component-container').width()
			let viewHeight = $('.el-tabs__content').height()
			$('#root-panel .component').css("width", lengthPercentage)
			$('#root-panel .component').css("margin-left", marginPercentage)
			let componentViewWidth = viewWidth * lengthNum
			let componentViewHeight = componentViewWidth * 1.14
			$('#root-panel .component').css("height", componentViewHeight + 'px')
			// let marginTop = (viewHeight - componentViewHeight * 3) / 4
			// $('#root-panel .component').css("margin-top", marginTop + 'px')
			//	Calculate the height occupied by TITLE
			let titleHeight = componentViewHeight / 5
			// let titleMarginTop = componentViewHeight - titleHeight + this.padding
			//	Computes the entire height of the Component view
			// $('#root-panel .component-title').css("margin-top", titleMarginTop)
			$('#root-panel .component-title').css("height", titleHeight)
			//	Calculate the height of Sketch Figure
			let sketchFigureHeight = componentViewHeight * 4 / 5
			$('#root-panel .sketch-figure').css("height", sketchFigureHeight)
		},
		initSubtreePanelize: function(layoutObj) {
			// In the 2 by 2 case
			let lengthPercentage = layoutObj.lengthPercentage, marginPercentage = layoutObj.marginPercentage, 
				lengthNum = layoutObj.lengthNum, marginNum = layoutObj.marginNum
			let viewWidth = $('.component-container').width()
			let viewHeight = $('.el-tabs__content').height()
			$('#subtree-panel .component').css("width", lengthPercentage)
			$('#subtree-panel .component').css("margin-left", marginPercentage)
			let componentViewWidth = viewWidth * lengthNum
			let componentViewHeight = componentViewWidth * 1.14
			$('#subtree-panel .component').css("height", componentViewHeight + 'px')
			// let marginTop = (viewHeight - componentViewHeight * 2) / 3
			// $('#subtree-panel .component').css("margin-top", marginTop + 'px')
			//	Calculate the height occupied by TITLE
			let titleHeight = componentViewHeight / 5
			// let titleMarginTop = componentViewHeight - titleHeight + this.padding
			//	Computes the entire height of the Component view
			// $('#subtree-panel .component-title').css("margin-top", titleMarginTop)
			$('#subtree-panel .component-title').css("height", titleHeight)
			//	Calculate the height of Sketch Figure
			let sketchFigureHeight = componentViewHeight * 4 / 5
			$('#subtree-panel .sketch-figure').css("height", sketchFigureHeight)
		},
		...mapMutations([
	      'UPDATE_ROOT_LAYOUT',
          'UPDATE_SUBTREE_LAYOUT',
	    ]),
	    ...mapActions([
			'setDSLComponent',
			'removeDSLComponent'
		])
 	}
  }
</script>

<style lang="less">
	.layout-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
		.label {
			text-align: left;
			padding-left: 10px;
			font-weight: bold;
			height: 2rem;
			display: table;
			.inner-title {
			  vertical-align: middle;
			  display: table-cell;
			}
		}
		.component-container {
			position: absolute;
			width: 100%;
			top: 2rem;
			bottom: 0%;
			left: 0%;
			display: flex;
			.el-tabs {
				width: 100%;
			}
			.el-tabs__nav {
				border-right: 0px !important;
			}
			.el-tabs--card>.el-tabs__header .el-tabs__nav {
				border-radius: 0 0 0 0;
			}
			.el-tabs__item, .el-tabs__item, .el-tabs__nav-next, .el-tabs__nav-prev {
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
					.component-panel {
						width: 100%;
						height: 100%;
						display: flex;
						flex-direction: row;
	  					flex-wrap: wrap;
	  					align-content: flex-start;
	  					overflow-y: auto;
	  					.component {
	  						border-radius: 0.4rem 0.4rem 0.4rem 0.4rem ;
	  						border: #eeeeee solid 1px;
	  						cursor: pointer;
	  						margin-top: 1.2rem;
	  						.sketch-figure {
	  							border-radius: 0.4rem 0.4rem 0rem 0rem;
	  							width: 100%;
	  						}
	  						.component-title {
	  							border-radius: 0px 0px 0.4rem 0.4rem;
	  							background-color: #eeeeee;
	  							display: table;
	  							width: 100%;
	  							.component-title-container#root-title{
	  								display: table-cell;
	  								vertical-align: middle;
	  								font-size: 8px;
	  							}
	  							.component-title-container#subtree-title{
	  								display: table-cell;
	  								vertical-align: middle;
	  								font-size: 0.7rem;
	  							}	  							
	  						}
	  						&:hover {
								box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
							}
	  					}
	  					.component[class~='selected'] {
	  						.component-title {
	  							background-color: steelblue !important;
	  							color: white;
	  							font-weight: bold;
	  						}
	  						opacity: 1 !important;
	  						box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	  					}
	  					.component[class~='unhighlight'] {
	  						opacity: 0.3;
	  					}
					}
				}
			}
		}
	}
</style>
