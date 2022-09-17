<template>
	<div class = "element-container">
		<div class = "label">
			<span class = "inner-title">Element</span>
		</div>
		<div class = "component-container">
			<el-tabs type="card" @tab-click="handleClick" stretch>
    			<el-tab-pane :label="nodeLabel">
    				<div class="component-panel" id="node-panel">		
	    				<div v-for="nodeType in nodeArray" class="component" 
	    					:id="nodeType.id" :name="nodeType.name" :type="nodeComponentType">
		    					<div class = "sketch-figure">
		    						<ElementSketchFigure :elementType="nodeType.name" category="node" v-if="showNodeComponents"/>
		    					</div>
			   					<div class = "component-title">
			   						<span class = "component-title-container" id="node-title">{{nodeType.name}}</span>
			   					</div>
	    				</div>	
    				</div>
    			</el-tab-pane>
    			<el-tab-pane :label="linkLabel">
    				<div class="component-panel" id="link-panel">
    					<div v-for="linkType in linkArray" class="component" 
    						:id="linkType.id" :name="linkType.name" :type="linkComponentType">
	    						<div class = "sketch-figure">
	    							<ElementSketchFigure :elementType="linkType.name" category="link" v-if="showLinkComponents"/>
	    						</div>
		    					<div class = "component-title">
		    						<span class = "component-title-container" id="link-title">{{linkType.name}}</span>
		    					</div>
    					</div>
    				</div>
    			</el-tab-pane>
  			</el-tabs>
		</div>
	</div>
</template>

<script>
  import ElementSketchFigure from '@/components/TreeModuleFigure/ElementSketchFigure.vue';
  import { mapMutations, mapState, mapActions } from 'vuex';

  export default {
	name: 'Element',
	components: {
		ElementSketchFigure
	},
	data() {
	  return {
	  	nodeArray: [
	  		{
	  			id: 'circle',
	  			name: 'circle'
	  		}, 
	  		{
	  			id: 'rectangle',
	  			name: 'rectangle'
	  		},
	  		{
	  			id: 'triangle',
	  			name: 'triangle'
	  		},
	  		{
	  			id: 'ellipse',
	  			name: 'ellipse'
	  		}
	  	],
	  	linkArray: [
	  		{
	  			id: 'straight',
	  			name: 'straight'
	  		},
	  		{
	  			id: 'curve',
	  			name: 'curve'
	  		},
	  		{
	  			id: 'curve-step-before',
	  			name: 'curveStepBefore'
	  		},
	  		{
	  			id: 'curve-step-after',
	  			name: 'curveStepAfter'
	  		},
	  		{
	  			id: 'orthogonal',
	  			name: 'orthogonal'
	  		},
	  		{
	  			id: 'arccurve',
	  			name: 'arccurve'
	  		}
	  	],
	  	nodeComponentType: 'Node', 
	  	linkComponentType: 'Link',
	  	elementNodeArray: [],
	  	elementLinkArray: [],
	  	coordinateSystemArray: [],
	  	showNodeComponents: false,
	  	showLinkComponents: false,
	  	nodeLabel: "Node",// (" + this.nodeArray.length + ')',
	  	linkLabel: "Link"//(" + this.linkArray.length + ')'
	  }	
	},
	watch: {
		treeUnitDSLName: function() {
			let self = this
			$('#link-panel .component').removeClass('selected')
			$('#link-panel .component').removeClass('unhighlight')
			$('#node-panel .component').removeClass('selected')
			$('#node-panel .component').removeClass('unhighlight')
			let editDSLObjArray = self.treeUnitDSLArray.filter(function(d, i) {
				return d.name === self.treeUnitDSLName
			})
			if (editDSLObjArray.length > 0) {
				let editDSLObj = editDSLObjArray[0].dslObj
				if (typeof (editDSLObj.Element) !== "undefined") {
					let linkCategory = editDSLObj.Element.Link
					let nodeCategory = editDSLObj.Element.Node
					if(typeof (linkCategory) !== 'undefined') {
						$('#link-panel .component').addClass('unhighlight')
						$('#link-panel .component#' + linkCategory).addClass('selected')
					}
					if(typeof (nodeCategory) !== 'undefined') {
						$('#node-panel .component').addClass('unhighlight')
						$('#node-panel .component#' + nodeCategory).addClass('selected')
					}
				}
			}
		}
	},
	created: function () {
	},
	beforeMount: function() {
		let viewWidth = $('.layout-container').width()
		this.nodeLabel = this.nodeLabel + " (" + this.nodeArray.length + ")"
		this.linkLabel = this.linkLabel + " (" + this.linkArray.length + ")"
	},
	mounted: function() {
		this.initNodePanel()
		this.initLinkPanel()
		this.showNodeComponents = true
		this.initClickEvent()
		// this.init22Size()
	},
	computed: {
		...mapState([
	      'treeUnitDSLName',
	      'treeUnitDSLArray'
	    ])
	},
	methods: {
		handleClick: function(tab, event) {
			if (tab.label === this.linkLabel) {
				this.showLinkComponents = true				
			}
		},
		initClickEvent: function() {
			let self = this
			$('.element-container .component').click(function() {
				let componentType = $(this).attr('type')
				let componentId = $(this).attr('id')
				let componentName = $(this).attr('name')
				if (componentType === self.nodeComponentType) {
					self.highlightSelectedNodeComponent(componentId, componentName)
					// self.UPDATE_NODE(componentId)
				} else if (componentType === self.linkComponentType) {
					self.highlightSelectedLinkComponent(componentId, componentName)
					// self.UPDATE_LINK(componentId)
				}
			})
		},
		highlightSelectedNodeComponent: function(selectedNodeComponentId, componentName) {
			let nodeComponent = "Node"
			if (typeof(selectedNodeComponentId) !== 'undefined') {
				if ($('#node-panel .component#' + selectedNodeComponentId).hasClass('selected')) {
					$('#node-panel .component#' + selectedNodeComponentId).removeClass('selected')
					this.removeDSLComponent(nodeComponent)
				} else {
					$('#node-panel .component').removeClass('selected')
					$('#node-panel .component#' + selectedNodeComponentId).addClass('selected')
					this.addNodeElementComponent(componentName)
				}
			}
			if ($('#node-panel .selected').length > 0) {
				$('#node-panel .component').addClass('unhighlight')
			} else {
				$('#node-panel .component').removeClass('unhighlight')				
			}
		},
		highlightSelectedLinkComponent: function(selectedLinkComponentId, componentName) {
			let linkComponent = "Link"
			if (typeof(selectedLinkComponentId) !== 'undefined') {
				if ($('#link-panel .component#' + selectedLinkComponentId).hasClass('selected')) {
					$('#link-panel .component#' + selectedLinkComponentId).removeClass('selected')
					this.removeDSLComponent(linkComponent)
				} else {
					$('#link-panel .component').removeClass('selected')
					$('#link-panel .component#' + selectedLinkComponentId).addClass('selected')
					this.addLinkElementComponent(componentName)
				}
			}
			if ($('#link-panel .selected').length > 0) {
				$('#link-panel .component').addClass('unhighlight')
			} else {
				$('#link-panel .component').removeClass('unhighlight')				
			}
		},
		addNodeElementComponent: function(componentName) {
			let nodeObj = {
				'Element': {
					'Node': componentName
				}
			}
			this.setDSLComponent(nodeObj)
		},
		addLinkElementComponent: function(componentName) {
			let linkObj = {
				'Element': {
					'Link': componentName
				}
			}
			this.setDSLComponent(linkObj)
		},
		initNodePanel: function() {
			let lengthPercentage = "25%", marginPercentage = "6.25%", 
				lengthNum = 0.25, marginNum = 0.0625
			let viewWidth = $('.element-container .component-container').width()
			let viewHeight = $('.element-container .el-tabs__content').height()
			//	Increment the padding-right value in the div that contains the Component
			$('#node-panel .component').css("width", lengthPercentage)
			$('#node-panel .component').css("margin-left", marginPercentage)
			let componentViewWidth = viewWidth * lengthNum
			let componentViewHeight = componentViewWidth * 1.14
			$('#node-panel .component').css("height", componentViewHeight + 'px')
			// let marginTop = (viewHeight - componentViewHeight) / 2
			// $('#node-panel .component').css("margin-top", marginTop + 'px')
			//	Calculate the height occupied by TITLE
			let titleHeight = componentViewHeight / 5
			let titleMarginTop = componentViewHeight - titleHeight
			//	Computes the entire height of the Component view
			$('#node-panel .component-title').css("height", titleHeight)
			//	Calculate the height of Sketch Figure
			let sketchFigureHeight = componentViewHeight * 4 / 5
			$('#node-panel .sketch-figure').css("height", sketchFigureHeight)
		},
		initLinkPanel: function() {
			let lengthPercentage = "25%", marginPercentage = "6.25%", 
				lengthNum = 0.25, marginNum = 0.0625
			let viewWidth = $('.element-container .component-container').width()
			let viewHeight = $('.element-container .el-tabs__content').height()
			//	Increment the padding-right value in the div that contains the Component
			$('#link-panel .component').css("width", lengthPercentage)
			$('#link-panel .component').css("margin-left", marginPercentage)
			let componentViewWidth = viewWidth * lengthNum
			let componentViewHeight = componentViewWidth * 1.14
			$('#link-panel .component').css("height", componentViewHeight + 'px')
			// let marginTop = (viewHeight - componentViewHeight) / 2
			// $('#link-panel .component').css("margin-top", marginTop + 'px')
			//	Calculate the height occupied by TITLE
			let titleHeight = componentViewHeight / 5
			let titleMarginTop = componentViewHeight - titleHeight
			//	Computes the entire height of the Component view
			$('#link-panel .component-title').css("height", titleHeight)
			//	Calculate the height of Sketch Figure
			let sketchFigureHeight = componentViewHeight * 4 / 5
			$('#link-panel .sketch-figure').css("height", sketchFigureHeight)
		}, 
		...mapMutations([
	      'UPDATE_DSL_COMPONENT_OBJECT_STATE',
	      'UPDATE_NODE',
          'UPDATE_LINK',
	    ]),
	    ...mapActions([
			'setDSLComponent',
			'removeDSLComponent'
		])
 	}
  }
</script>

<style lang="less">
	.element-container {
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
		  						flex-shrink: 0;
		  						cursor: pointer;
		  						margin-top: 1rem;
		  						.component-title {
		  							border-radius: 0px 0px 0.4rem 0.4rem;
		  							background-color: #eeeeee;
		  							display: table;
		  							width: 100%;
		  							font-size: 0.7rem;
		  							.component-title-container#link-title {
		  								display: table-cell;
		  								vertical-align: middle;
		  								font-size: 9px;
		  							}
		  							.component-title-container#node-title {
		  								display: table-cell;
		  								vertical-align: middle;
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
