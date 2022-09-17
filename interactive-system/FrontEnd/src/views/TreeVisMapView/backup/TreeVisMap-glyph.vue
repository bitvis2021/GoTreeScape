<template>
	<div class="tree-vis-map" :ref="treeVisMapContainerId" :id="treeVisMapContainerId">
		<svg ref="treevismapcanvas" :id="treeVisMapCanvasId">
			<g class="background-container"></g>
			<g class="contour-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
			</g>
			<g class="treevis-glyph-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
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
	import { computeTreevisCoordSystemGlyph, computeTreevisNodeElementGlyph } from '@/treevis-node-glyph/compute_treevis_node_path.js'
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
				circleR: 8,
				highlightedCircleR: 8, 
				baseCircleR: 8, // TODO 3
				baseHighlightedCircleR: 8,
				xScale: null,
				yScale: null,
				projectionPosResults: [],
				tooltipX: 0,
				tooltipY: 0,
				tooltipTipWidth: 300,
				tooltipTipHeight: 300, // it is used to set the position of tooltip
				highlightNodeIndex: -1, // index of the highlighted nodes
				treeCanvasKey: 0, // variable to update the tree visualization
				projectionDSLList: [],
				toolbarNavbarHeight: 64,
				transformRatio: 1,
				showTreevisNodeThreshold: 10
			}
		},
		watch: {},
		created: function () {},
		beforeMount: function() {},
		mounted: function() {
			let treeVisMapContainerId = this.treeVisMapContainerId
			let treeVisMapCanvasHeight = this.$refs[treeVisMapContainerId].clientHeight;
			let treeVisMapCanvasWidth = this.$refs[treeVisMapContainerId].clientWidth;
			let minCanvasLength = treeVisMapCanvasHeight>treeVisMapCanvasWidth?treeVisMapCanvasWidth:treeVisMapCanvasHeight
			this.circleR = this.highlightedCircleR = this.baseCircleR = this.baseHighlightedCircleR = Math.round(minCanvasLength / 100)
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
				    	.scaleExtent([0.8, 50])
				    	.on("zoom", zoom));
				function zoom() {
					var transform_event = d3.event.transform;
  					var transform_ratio = transform_event.k
  					self.transformRatio = transform_ratio
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
  					// resize the glyph displayed in the projection results
  					let glyphResizeRatio = (transform_ratio/5>1)?transform_ratio/5:1
  					self.circleR = self.baseCircleR * glyphResizeRatio
  					self.highlightedCircleR = self.baseHighlightedCircleR * glyphResizeRatio
  					// compute the opacity of the tree visualization glyph
    				let opacityScale = d3.scaleLinear().domain([1, 50]).range([1, 0.3]);
  					let treevisGlyphOpacity = opacityScale(transform_ratio).toFixed(2)
  					// show treevis node threshold
  					let showTreevisNodeThreshold = self.showTreevisNodeThreshold
  					// update the projection results
				  	let treeVisGlyph = d3.select('.treevis-glyph-container')
		          		.selectAll(".treevis-glyph")
		          		.data(projectionPosResultsRemained, function(d, i) {
		          			return 'node-' + d[2]
		          		})
		          	// append the tree vis glyph container
		          	let treeVisGlyphAddedContainer = treeVisGlyph.enter()
		          		.append('g')
		          		.attr('class', 'treevis-glyph')
		          		.attr('id', function(d, i) {
		          			return 'treevis-glyph-' + d[2]
		          		})
		          		.attr("transform", self.treeVisNodeTransform(transform_event))
		          	// append or update the visual element in the tree vis glyph container
		          	treeVisGlyphAddedContainer.append("path")
				        .attr('class', 'treevis-coord-system')
				        .attr("d", function (d, i) {
				          	return self.computeTreevisNodeCoordSystemPath(d)
				        })
				   		.style('opacity', treevisGlyphOpacity)
				        .on('click', function (d, i) {
				        	let clickedNode = this
				        	self.clickTreeVisNodeHandler(d, clickedNode)
				        })
			   		treeVisGlyphAddedContainer.append("path")
				        .attr('class', 'treevis-node')
				        .attr("d", function (d, i) {
				        	if (transform_ratio > showTreevisNodeThreshold) {
				        		return self.computeTreevisNodeElementPath(d)
				        	}
				        })
				        .on('click', function (d, i) {
				        	let clickedNode = this
				        	self.clickTreeVisNodeHandler(d, clickedNode)
				        })
				    // update the tree vis glyph container
		        	let treeVisGlyphUpdateContainer = treeVisGlyph.attr("transform", self.treeVisNodeTransform(transform_event))
		        	// update the coordinate system in the tree vis glyph container
			        treeVisGlyphUpdateContainer.selectAll(".treevis-coord-system")
			          	.attr("d", function (d, i) {
			          		return self.computeTreevisNodeCoordSystemPath(d)
			          	})
			          	.style('opacity', treevisGlyphOpacity)
		        	// update the visual element in the tree vis glyph container
			        treeVisGlyphUpdateContainer.selectAll(".treevis-node")
			          	.attr("d", function (d, i) {
			          		return self.computeTreevisNodeElementPath(d)
			          	})
			        // remove the extra visual element in the tree vis glyph container
		        	treeVisGlyph.exit().remove()
		        	// update the highlight state of the visual elements
		        	d3.select('.treevis-glyph-container')
				      .select('#treevis-glyph-' + self.highlightNodeIndex)
				      .selectAll(".treevis-coord-system")
				      .classed('selected', true)
				    d3.select('.treevis-glyph-container')
				      .selectAll('.treevis-coord-system')
				      .attr("d", function (d, i) {				      	
				      		return self.computeTreevisNodeCoordSystemPath(d)
				        })
				      .style('opacity', treevisGlyphOpacity)
				    d3.select('.treevis-glyph-container')
				      .selectAll('.treevis-node')
				      .attr("d", function (d, i) {
				      		if (transform_ratio > showTreevisNodeThreshold) {
				      			return self.computeTreevisNodeElementPath(d)
				      		}
				        })
		        	// update the tooltip position
		        	if (self.highlightNodeIndex != -1) {
		        		let svgElementTransformAttr = d3.select('.treevis-glyph-container')
				    		.select('#treevis-glyph-' + self.highlightNodeIndex)
				    	if (svgElementTransformAttr.empty()) {
				    		self.isShowTooltip = false
				    	} else {
				    		self.updateTooltipContent(self.highlightNodeIndex)
				    		self.isShowTooltip = true
				    	}
		        	}
				}
		    },
		    computeTreevisNodeCoordSystemPath: function(nodeObj) {
		    	let self = this
		    	if (nodeObj[2] === self.highlightNodeIndex) {
		    		return computeTreevisCoordSystemGlyph(nodeObj, self.highlightedCircleR)
	      		} else {
	      			return computeTreevisCoordSystemGlyph(nodeObj, self.circleR)
	      		}
		    },
		    computeTreevisNodeElementPath: function(nodeObj) {
		    	let self = this
		    	if (nodeObj[2] === self.highlightNodeIndex) {
		    		return computeTreevisNodeElementGlyph(nodeObj, self.highlightedCircleR)
	      		} else {
	      			return computeTreevisNodeElementGlyph(nodeObj, self.circleR)
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
		    	let treeVisGlyph = d3.select('.treevis-glyph-container')
		    		.selectAll(".treevis-glyph")
		        	.data(projectionPosResults, function(d, i) {
		        		return 'node-' + d[2]
		        	})
		        // append the tree vis glyph container
		        let treeVisGlyphAddedContainer = treeVisGlyph.enter()
		          .append('g')
		          .attr('class', 'treevis-glyph')
		          .attr('id', function(d, i) {
		          	return 'treevis-glyph-' + d[2]
		          })
		          .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity))
		        // append or update the visual element in the tree vis glyph container
	        	treeVisGlyphAddedContainer.append("path")
		          .attr('class', 'treevis-coord-system')
		          .attr("d", function (d, i) {
		          	return self.computeTreevisNodeCoordSystemPath(d)
		          })
		          .on('click', function (d, i) {
		          	let clickedNode = this
		          	self.clickTreeVisNodeHandler(d, clickedNode)
		          })
		        treeVisGlyphAddedContainer.append("path")
		          .attr('class', 'treevis-node')
		          .attr("d", function (d, i) {
		          	if (self.transformRatio > self.showTreevisNodeThreshold) {
		          		return self.computeTreevisNodeElementPath(d)
		          	}
		          })
		          .on('click', function (d, i) {
		          	let clickedNode = this
		          	self.clickTreeVisNodeHandler(d, clickedNode)
		          })
		        // update the tree vis glyph container
		        let treeVisGlyphUpdateContainer = treeVisGlyph.attr("transform", self.treeVisNodeTransform(d3.zoomIdentity))
		        // update the visual element in the tree vis glyph container
		        treeVisGlyphUpdateContainer.selectAll(".treevis-coord-system")
		          .attr("d", function (d, i) {
		          	return self.computeTreevisNodeCoordSystemPath(d)
		          })
		        treeVisGlyphUpdateContainer.selectAll(".treevis-node")
		          .attr("d", function (d, i) {
		          	if (self.transformRatio > self.showTreevisNodeThreshold) {
		          		return self.computeTreevisNodeElementPath(d)
		          	}
		          })
		        // remove the extra visual element in the tree vis glyph container
		        treeVisGlyph.exit().remove()
		    },
		    clickTreeVisNodeHandler: function (d, clickedNode) {
		    	let self = this
		    	let treeDSLIndex = d[2]
		    	if (self.highlightNodeIndex === treeDSLIndex) {
		    		self.highlightNodeIndex = -1
		    		self.isShowTooltip = false
		    		d3.select('#treevis-glyph-'+treeDSLIndex)
		    			.selectAll('*')
		    			.classed('selected', false)
		    		d3.select('#treevis-glyph-'+treeDSLIndex)
		    			.select('.treevis-coord-system')
		    			.attr("d", function (d, i) {
				      		return self.computeTreevisNodeCoordSystemPath(d)
				        })
				    d3.select('#treevis-glyph-'+treeDSLIndex)
		    			.select('.treevis-node')
		    			.attr("d", function (d, i) {
		    				if (self.transformRatio > self.showTreevisNodeThreshold) {
		    					return self.computeTreevisNodeElementPath(d)
		    				}			    	      	
				        })
		    	} else {
		    		self.highlightNodeIndex = treeDSLIndex
		    		// un-highlight all the nodes in the projection results
		    		d3.selectAll('.treevis-coord-system').classed('selected', false)
		    		d3.selectAll('.treevis-node').classed('selected', false)
	    			d3.selectAll('.treevis-coord-system')
	    			.attr("d", function (d, i) {				      	
			      		return self.computeTreevisNodeCoordSystemPath(d)
			        })
			        d3.selectAll('.treevis-node')
	    			.attr("d", function (d, i) {
	    				if (self.transformRatio > self.showTreevisNodeThreshold) {
	    					return self.computeTreevisNodeElementPath(d)
	    				}				      	
			        })
		    		d3.select('#treevis-glyph-'+treeDSLIndex)
		    			.selectAll('*')
		    			.classed('selected', true)
		    		d3.select('#treevis-glyph-'+treeDSLIndex)
		    			.select('.treevis-coord-system')
		    			.attr("d", function (d, i) {
			          		return self.computeTreevisNodeCoordSystemPath(d)
			          	})
			        d3.select('#treevis-glyph-'+treeDSLIndex)
		    			.select('.treevis-node')
		    			.attr("d", function (d, i) {
		    				if (self.transformRatio > self.showTreevisNodeThreshold) {
		    					return self.computeTreevisNodeElementPath(d)
		    				}
			          	})
		    		self.updateSelectedTreeDSLContent(treeDSLIndex)
		    	}
		    },
 			computeProjectionPosResults: function (projectionResult) {
	    		let projectionPosResults = []
	  			this.updatePosScale(projectionResult)
	    		for (let i = 0; i < projectionResult.length; i++) {
	    			let item = projectionResult[i]
	    			let itemPosX = this.xScale(item['x'])
	    			let itemPosY = this.yScale(item['y'])
	    			let itemIndex = item['index']
	    			let glyphAttrArray = eval(item['glyph'])
	    			projectionPosResults.push([itemPosX, itemPosY, itemIndex, glyphAttrArray])
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
		    computeSvgElementPos: function(treeDSLIndex) {
		    	let svgElementTransformAttr = d3.select('.treevis-glyph-container')
		    		.select('#treevis-glyph-' + treeDSLIndex)
		    		.attr('transform')
		    	let elePos = extractElePos(svgElementTransformAttr)
		    	return elePos
		    	// extract the element position from the attribute value
		    	function extractElePos(svgElementTransformAttr) {
		    		svgElementTransformAttr = svgElementTransformAttr.replace('translate(', '').replace(')', '')
		    		let elePosList = svgElementTransformAttr.split(',')
		    		for (let i = 0; i < elePosList.length; i++) {
		    			elePosList[i] = Number(elePosList[i])
		    		}
		    		return elePosList
		    	}
		    },
		    updateTooltipContent: function(treeDSLIndex) {
		    	this.treeCanvasKey = (this.treeCanvasKey + 1) % 2 // update the tree visualization canvas
				// setting the position of tooltip
				let svgElementPos = this.computeSvgElementPos(treeDSLIndex)
				const svg = this.$refs['treevismapcanvas']
				const pt = svg.createSVGPoint();
				// pass event coordinates
				pt.x = svgElementPos[0]
				pt.y = svgElementPos[1]
				const screenElementPos = pt.matrixTransform(svg.getScreenCTM());
				screenElementPos['y'] = screenElementPos['y'] - this.toolbarNavbarHeight 
				this.setTooltipPos(screenElementPos)
		    },
		    updateSelectedTreeDSLContent: function(treeDSLIndex) {
		    	let self = this
		    	let layoutParas = sysDatasetObj.getLayoutParas()
				let nodeArrayWithValueObj = sysDatasetObj.getNodeArrayWithValueObj()
				let treeIndexWithDSL = sysDatasetObj.computeAllNodeTreeIndexWithDSL(nodeArrayWithValueObj, treeDSLIndex)
				// set treeIndexWithDSL and treeDSLContentObj within layoutParas, then rendering tree visualization result
				layoutParas.treeIndexWithDSL = treeIndexWithDSL
				sysDatasetObj.loadTreeDSLContentObjFromServer(treeIndexWithDSL, function(treeDSLContentObj) {
					layoutParas.treeDSLContentObj = treeDSLContentObj
					self.updateTooltipContent(treeDSLIndex)
					// 1. show the tooltip with tree visualization results
		    		// 2. set the highlighted node
		    		self.isShowTooltip = true
					setTimeout(function() {
						self.UPDATE_SELECTED_TREE_DSL_INDEX(treeDSLIndex)
					}, 300)
				})
		    },
		    setTooltipPos: function(singlePointPos) {
		    	if (singlePointPos['x'] > this.treeVisMapCanvasWidth - this.tooltipTipWidth) {
		    		this.tooltipX = singlePointPos['x'] - this.tooltipTipWidth 
		    	} else {
		    		this.tooltipX = singlePointPos['x'] 
		    	}
		    	this.tooltipX = this.tooltipX + this.treeVisMapCanvasPaddingLeft
		    	if (singlePointPos['y'] > this.treeVisMapCanvasHeight - this.tooltipTipWidth) {
		    		this.tooltipY = singlePointPos['y']  - this.tooltipTipHeight
		    	} else {
		    		this.tooltipY = singlePointPos['y']
		    	}
		    	this.tooltipY = this.tooltipY + this.treeVisMapCanvasPaddingTop
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
				fill: #333333;
				&:hover {
					fill: #8b0000;
					stroke: #444444;
					stroke-width: 1px;
				}
				&.selected {
					fill: #8b0000;
					stroke: #444444;
					stroke-width: 1px;
				}
			}
			.treevis-coord-system {
				// fill: steelblue;
				stroke: #666666;
				stroke-width: 1px;
				fill: none;
				// stroke-dasharray: 2,1;
				&:hover {
					fill: #8b0000;
					stroke: #8b0000;
					stroke-width: 2px;
				}
				&.selected {
					fill: #8b0000;
					stroke: #8b0000;
					stroke-width: 2px;
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