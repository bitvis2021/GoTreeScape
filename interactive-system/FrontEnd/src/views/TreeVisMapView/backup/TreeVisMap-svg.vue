<template>
	<div class="tree-vis-map" :ref="treeVisMapContainerId" :id="treeVisMapContainerId">
		<svg ref="treevismapcanvas" :id="treeVisMapCanvasId">
			<g class="background-container"></g>
			<g class="contour-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
			</g>
			<g class="point-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
				<!-- <circle v-for="(singlePointPos, index) in projectionPosResults" 
						class="treevis-node"
						:class="{'selected': highlightNodeIndex==index}"
						:cx="singlePointPos[0]" 
						:cy="singlePointPos[1]" 
						:r="circleR"
						:transform="point_transform(singlePointPos)"
						@click="updateSelectedTreeDSLContent(index)">
				</circle> -->
			</g>
		</svg>
      	<el-card
        	id="tooltip"
        	v-if="isShowTooltip"
        	:style="'transform: translate(' + this.tooltipX + 'px,' + this.tooltipY + 'px);'">
        	<TreeCanvas :treeCanvasKey="treeCanvasKey" :sendSVGData="false">
        	</TreeCanvas>
      	</el-card>
	</div>
</template>
<script>
	import { mapState, mapMutations, mapActions } from 'vuex'
	import { getTreeDistanceMatrix } from '@/data-processing/get_tree_distance_matrix.js'
	import { getTSNEProjectionResult } from '@/data-processing/get_tsne_projection_result.js'
	import { getProjectionResults, getProjectionDSLList } from '@/data-processing/get_projection_results.js'
	import { computeTreevisNodePath } from '@/treevis-node-glyph/compute_treevis_node_path.js'
	import TreeCanvas from '@/views/TreeCanvasView/TreeCanvas.vue'
	import d3_save_svg from 'd3-save-svg'
	import createScatterplot from 'regl-scatterplot'
	import { translatePath } from '@/computation/translate_path.js'

	export default {
		name: 'TreeVisMap',
		components: {
			TreeCanvas
		},
		props: {
			maxDslAmountIndex: {
			  	type: Number
			}
		},
		data() {
			return {
				treeVisMapCanvasId: 'tree-vis-map-canvas',
				treeVisMapContainerId: 'tree-vis-map-canvas-container',
				treeVisMapCanvasWidth: 0,
				treeVisMapCanvasHeight: 0,
				treeVisMapCanvasPaddingTop: 0,
				treeVisMapCanvasPaddingBottom: 0,
				treeVisMapCanvasPaddingLeft: 0,
				treeVisMapCanvasPaddingRight: 0,
				treeVisMapCanvasPadding: {'left': 0.02, 'right': 0.02, 'top': 0.02, 'bottom': 0.02},
				finishComputeProjectionResult: true,
				isShowTooltip: false,
				circleR: 3,
				highlightedCircleR: 8,
				xScale: null,
				yScale: null,
				projectionPosResults: [],
				tooltipX: 0,
				tooltipY: 0,
				tooltipHeader: "",
				tooltipTipWidth: 300,
				tooltipTipHeight: 300, // it is used to set the position of tooltip
				highlightNodeIndex: -1, // index of the highlighted nodes
				treeCanvasKey: 0, // variable to update the tree visualization
				projectionDSLList: []
			}
		},
		watch: {},
		created: function () {},
		beforeMount: function() {},
		mounted: function() {
			let treeVisMapContainerId = this.treeVisMapContainerId
			let treeVisMapCanvasHeight = this.$refs[treeVisMapContainerId].clientHeight;
			let treeVisMapCanvasWidth = this.$refs[treeVisMapContainerId].clientWidth;
			// record the original height and width of tree vis map canvas
			this.treeVisMapCanvasWholeHeight = treeVisMapCanvasHeight
			this.treeVisMapCanvasWholeWidth = treeVisMapCanvasWidth
			// initialize the paddings (left, right, top, bottom), canvas width, and canvas height
			this.treeVisMapCanvasPaddingTop = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['top']
			this.treeVisMapCanvasPaddingBottom = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['bottom']
			this.treeVisMapCanvasPaddingLeft = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['left']
			this.treeVisMapCanvasPaddingRight = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['right']
			this.treeVisMapCanvasHeight = treeVisMapCanvasHeight - this.treeVisMapCanvasPaddingTop - this.treeVisMapCanvasPaddingBottom
			this.treeVisMapCanvasWidth = treeVisMapCanvasWidth - this.treeVisMapCanvasPaddingLeft - this.treeVisMapCanvasPaddingRight
      		this.loadProjectionResults()
		},
		computed: {
		    ...mapState([
		    	'selectedTreeDSLIndex'
		    ])
		},
		methods: {
			...mapMutations([
				'UPDATE_SELECTED_TREE_DSL_INDEX'
		    ]),
		    point_transform: function (d) {
		    	return "translate(" + d3.zoomIdentity.apply(d) + ")";
		    },
		    updatePosScale: function(projectionResult) {
		    	let valueExtentX = d3.extent(projectionResult, function(d, i) {
		    		return d['x']
		    	})
		    	let valueExtentY = d3.extent(projectionResult, function(d, i) {
		    		return d['y']
		    	})
      			// initialize the scale of vertical position and horizontal position
		    	let treeVisMapCanvasWidth = this.treeVisMapCanvasWidth
		    	let treeVisMapCanvasHeight = this.treeVisMapCanvasHeight
		    	this.xScale = d3.scaleLinear()
				  .domain(valueExtentX)
				  .range([0, treeVisMapCanvasWidth])
				this.yScale = d3.scaleLinear()
				  .domain(valueExtentY)
				  .range([0, treeVisMapCanvasHeight])
		    },
		    loadProjectionResults: function() {
		    	let self = this
		    	getProjectionResults().then(function(projectionResults) {
		    		let projectionPosItemList = self.computeProjectionPosResults(projectionResults)
		    		self.projectionPosResults = projectionPosItemList
		    		// TODO
		    		self.renderTreeVisNodeGlyph()
		    		self.renderZoomedRect()
		    		// self.renderContour(projectionResults)
		    		self.finishComputeProjectionResult = true
		    	})
		    	getProjectionDSLList().then(function(projectionDSLList) {
		    		self.projectionDSLList = projectionDSLList
		    	})
		    },
		    renderContour: function(projectionResult) {
		    	let height = this.treeVisMapCanvasHeight, width = this.treeVisMapCanvasWidth
		    	let xScale = this.xScale, yScale = this.yScale
		    	let self = this
		    	d3.select('.contour-container')
		          .selectAll("path")
		          .remove()
		    	let contour = d3
			       .contourDensity()
			       .x((d) => xScale(d.x)) //  + this.treeVisMapCanvasPaddingLeft
			       .y((d) => yScale(d.y)) //  + this.treeVisMapCanvasPaddingTop
			       .size([width, height])
			       .bandwidth(12)
			       .weight(1);
		        d3.select('.contour-container')
		          .selectAll(".contour")
		          .data(contour(projectionResult))
		          .enter()
		          .append("path")
		          .attr('class', 'contour')
		          .attr("d", d3.geoPath())
		          .attr("stroke-width", 1)
		          .attr("stroke-opacity", 0.5)
		          .attr("fill-opacity", 0);
		    },
		    renderZoomedRect: function() {
		    	/**
		    	 * plot the rectangle to support zooming function
		    	 */
		    	let self = this
		    	d3.select('.background-container')
		    		.append("rect")
		    		.attr('class', 'zoomable-rectangle')
				    .attr("fill", "none")
				    .attr("pointer-events", "all")
				    .call(d3.zoom()
				    	.scaleExtent([0.8, 8])
				    	.on("zoom", zoom));
				function zoom() {
					var transform_event = d3.event.transform;
  					var transform_ratio = transform_event.k
  					let projectionPosResults = self.projectionPosResults
  					// filter the remained projection items
  					let projectionPosResultsRemained = []
  					let treeVisMapCanvasWholeHeight = self.treeVisMapCanvasWholeHeight
  					let treeVisMapCanvasWholeWidth = self.treeVisMapCanvasWholeWidth
  					for (let i = 0; i < projectionPosResults.length; i++) {
  						let projectionPos = projectionPosResults[i]
  						let projectionPosUpdate = transform_event.apply(projectionPos)
  						let projectionPosX = projectionPosUpdate[0]
  						let projectionPosY = projectionPosUpdate[1]
  						// if the node positions exceed the screen space, then remove the nodes
  						if ((projectionPosX >= 0) && (projectionPosX <= treeVisMapCanvasWholeWidth) && (projectionPosY >= 0) && (projectionPosY <= treeVisMapCanvasWholeHeight)) {
  							projectionPosResultsRemained.push(projectionPos)
  						}
  					}
  					// update the projection results
				  	let projectionTreeItems = d3.select('.point-container')
		          		.selectAll(".treevis-node")
		          		.data(projectionPosResultsRemained, function(d, i) {
		          			return 'node-' + d[2]
		          		})
		          	projectionTreeItems.enter()
		          		.append("path")
		          		.attr("d", function (d, i) {
				          	return computeTreevisNodePath(d)
				        })
				        .attr('class', 'treevis-node')
		          		.attr("transform", self.treeVisNodeTransform(d3.zoomIdentity));
		          	projectionTreeItems.attr("transform", self.treeVisNodeTransform(transform_event));
		          	projectionTreeItems.exit().remove()
		          	
				}
		    },
		    treeVisNodeTransform: function (t) {
			    return function(d) {
					return "translate(" + t.apply(d) + ")";
			    };
		  	},
		    renderTreeVisNodeGlyph: function() {
		    	/**
		    	 * plot the projection results
		    	 */
		    	let self = this
		    	let projectionPosResults = self.projectionPosResults
		    	d3.select('.point-container')
		          .selectAll(".treevis-node")
		          .data(projectionPosResults, function(d, i) {
		          	return 'node-' + d[2]
		          })
		          .enter()
		          .append("path")
		          .attr('class', 'treevis-node')
		          .attr("d", function (d, i) {
		          	return computeTreevisNodePath(d)
		          })
		          .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity));
		    },
 			computeProjectionPosResults: function (projectionResult) {
	    		let projectionPosResults = []
	  			this.updatePosScale(projectionResult)
	    		for (let i = 0; i < projectionResult.length; i++) {
	    			let item = projectionResult[i]
	    			let itemPosX = this.xScale(item['x'])
	    			let itemPosY = this.yScale(item['y'])
	    			projectionPosResults.push([itemPosX, itemPosY, i])
	    		}
	    		return projectionPosResults
	    	},
	    	addColorAttribute: function(projectionPosResults) {
	    		let color = '#00ff00'
	    		for (let i = 0; i < projectionPosResults.length; i++) {
	    			let projectionPosItem = projectionPosResults[i]
	    			projectionPosItem.push(color)
	    		}
	    		return projectionPosResults
	    	},
		    computeHorizontalPos: function(pos) {
		    	return this.xScale(pos)
		    },
		    computeVerticalPos: function(pos) {
		    	return this.yScale(pos)
		    },
		    updateTooltipContent: function(dslNameIndex) {
		    	this.treeCanvasKey = (this.treeCanvasKey + 1) % 2 // update the tree visualization canvas
		    	let selectedNodeIndex = this.projectionDSLList.indexOf(dslNameIndex)
				// setting the position of tooltip
				let singlePointPos = this.projectionPosResults[selectedNodeIndex]
				this.tooltipHeader = 'tree visualization ' + dslNameIndex
				this.setTooltipPos(singlePointPos)
		    	// 1. show the tooltip with tree visualization results
		    	// 2. set the highlighted node
		    	if (this.highlightNodeIndex == dslNameIndex) {
		    		this.highlightNodeIndex = -1
		    		this.isShowTooltip = false
		    	} else {
		    		this.highlightNodeIndex = dslNameIndex
		    		this.isShowTooltip = true
		    	}
		    },
		    updateSelectedTreeDSLContent: function(selectedNodeIndex) {
		    	console.log('selectedNodeIndex', selectedNodeIndex)
		    	// console.log('projectionDSLList', this.projectionDSLList[selectedTreeDSLIndex])
		  //   	let self = this
		  //   	let selectedTreeDSLIndex = this.projectionDSLList[selectedNodeIndex]
		  //   	selectedTreeDSLIndex = +selectedTreeDSLIndex
		  //   	let layoutParas = sysDatasetObj.getLayoutParas()
				// let nodeArrayWithValueObj = sysDatasetObj.getNodeArrayWithValueObj()
				// let treeIndexWithDSL = sysDatasetObj.computeAllNodeTreeIndexWithDSL(nodeArrayWithValueObj, selectedTreeDSLIndex)
				// // set treeIndexWithDSL and treeDSLContentObj within layoutParas, then rendering tree visualization result
				// layoutParas.treeIndexWithDSL = treeIndexWithDSL
				// sysDatasetObj.loadTreeDSLContentObjFromServer(treeIndexWithDSL, function(treeDSLContentObj) {
				// 	layoutParas.treeDSLContentObj = treeDSLContentObj
				// 	self.updateTooltipContent(selectedTreeDSLIndex)
				// 	setTimeout(function() {
				// 		self.UPDATE_SELECTED_TREE_DSL_INDEX(selectedTreeDSLIndex)
				// 	}, 300)
				// 	console.log('self.selectedTreeDSLIndex', self.selectedTreeDSLIndex)
				// })
		    },
		    setTooltipPos: function(singlePointPos) {
		    	if (singlePointPos[0] > this.treeVisMapCanvasWidth - this.tooltipTipWidth) {
		    		this.tooltipX = singlePointPos[0] - this.tooltipTipWidth - this.highlightedCircleR / 2
		    	} else {
		    		this.tooltipX = singlePointPos[0] + this.highlightedCircleR / 2
		    	}
		    	if (singlePointPos[1] > this.treeVisMapCanvasHeight - this.tooltipTipWidth) {
		    		this.tooltipY = singlePointPos[1]  - this.tooltipTipHeight - this.highlightedCircleR / 2
		    	} else {
		    		this.tooltipY = singlePointPos[1] + this.highlightedCircleR / 2
		    	}
		    },
		    hideTooltip: function() {
		    	// hide tooltip for each point, which represents one tree visualization
		    	this.isShowTooltip = false
		    }
		}
	}

</script>
<style lang="less">
	@border-style: 0.05rem solid rgba(180, 180, 180, 0.3);
	.tree-vis-map {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
		background-color: white;
		.el-card__body {
			padding: 0px;
			height: 100%;
		}
		.zoomable-rectangle {
			width: 100%;
			height: 100%;
			fill: white;
		}
		#tree-vis-map-canvas {
			width: 100%;
			height: 100%;
			background-color: white;
			.treevis-node {
				fill: steelblue;
				&:hover {
					fill: #8b0000;
				}
				&.selected {
					fill: #8b0000;
				}
			}
			.contour {
				stroke: gray;
			}
		}
		#tooltip {
		  position: absolute;
		  left: 0;
		  top: 0;
		  width: 300px;
		  height: 300px;
		  word-wrap: break-word;
		  // height: 200px;
		  // background: rgba(145, 145, 143, 0.5);
		  max-height: 600px;
		  overflow-y: auto;
		  .title {
		  	font-size: 14px;
		    max-height: 300px;
		    overflow-y: auto;
		  }
		}
	}
</style>