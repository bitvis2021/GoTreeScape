<template>
	<svg class = "sketch-figure-svg">
	</svg>
</template>

<script>
  export default {
	name: 'CartesianSketchFigure',
	components: {
	},
	data() {
	  return {
	  	coordArray: [
	  		'cartesian', 'polar', 'triangle', 'rectangle'
	  	]
	  }	
	},
	props: {
		coordType: {
			type: String
		}
    },
    watch: {
    	coordType: function() {
    		this.renderSketchFigure()
    	}
    },
	created: function () {
	},
	beforeMount: function() {
	},
	mounted: function() {
		this.renderSketchFigure()
	},
	computed: {
	},
	methods: {
		renderSketchFigure: function() {
			let self = this
			setTimeout(function() {
				self.renderCoordSketchFigure()
			}, 300)
		},
		renderCoordSketchFigure: function() {
			let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
				marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08,
				canvasWidth = $(this.$el).width() - marginLeft - marginRight,
				canvasHeight = $(this.$el).height() - marginTop - marginBottom
			//	Draw Root nodes and Subtree group nodes in SVG based on size and location
			d3.select(this.$el).select('.coord-canvas').remove()
			let coordG = d3.select(this.$el)
				.append('g')
				.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
				.attr('class', 'coord-canvas')
			switch (this.coordType) {
				case 'cartesian':
					drawCartesian()
				break;
				case 'polar':
					drawPolar()
				break;
				case 'triangle':
					drawTriangle()
				break;
				case 'rectangle':
					drawEllipse()
				break;
			}
			function drawCartesian() {
				coordG.append("svg:defs")
					.append("svg:marker")
					.attr("id", "arrow")	
					.attr("refX", 2)
					.attr("refY", 6)
					.attr("markerWidth", 13)
					.attr("markerHeight", 13)
					.attr("orient", "auto")
					.append("svg:path")
					.attr("d", "M2,2 L2,11 L10,6 L2,2");
				coordG.append("line")
					.attr('class', 'axis')
		            .attr("x1",  0)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth * 0.9)
		            .attr("y2", canvasHeight / 2)
		            .attr("marker-end", "url(#arrow)");
		        coordG.append("line")
		    		.attr('class', 'axis')
		            .attr("x1", canvasWidth / 2)
		            .attr("y1", canvasHeight)
		            .attr("x2", canvasWidth / 2)
		            .attr("y2", canvasHeight * 0.1)
		            .attr("marker-end", "url(#arrow)");
			}
			function drawPolar() {
				let radius = canvasWidth>canvasHeight?canvasHeight/2:canvasWidth/2
				coordG.append("line")
					.attr('class', 'polar-axis')
		            .attr("x1",  0)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth)
		            .attr("y2", canvasHeight / 2)
		        coordG.append("circle")
					.attr('class', 'polar-circle')
		            .attr("cx", canvasWidth / 2)
		            .attr("cy", canvasHeight / 2)
		            .attr("r", radius * 2 / 3)
		        coordG.append("line")
		        	.attr('class', 'axis')
		            .attr("x1", canvasWidth / 2)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth * 0.9)
		            .attr("y2", canvasHeight * 0.1)
		            .attr("marker-end", "url(#arrow)");
		     }
			function drawRectangle() {
				let length = canvasWidth>canvasHeight?canvasHeight:canvasWidth
				let x = (canvasWidth - length) / 2
				let y = (canvasHeight - length) / 2
				coordG.append('rect')
					.attr('class', 'node')
					.attr('x', x)
					.attr('y', y)
					.attr('width', length)
					.attr('height', length)
			}
			function drawTriangle() {
				let length = canvasWidth>canvasHeight?canvasHeight:canvasWidth
				let triangle = d3.symbol()
		            .type(d3.symbolTriangle)
		            .size(length * length / 3)
		        coordG.append("line")
					.attr('class', 'polar-axis')
		            .attr("x1",  0)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth)
		            .attr("y2", canvasHeight / 2)
		        coordG.append('path')
					.attr('class', 'polar-axis')
		        	.attr("d", triangle)
		        	.attr('transform', 'translate(' + canvasWidth / 2 + ',' + canvasHeight * 0.58 + ')')
		        coordG.append("line")
		        	.attr('class', 'axis')
		            .attr("x1", canvasWidth / 2)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth * 0.9 )
		            .attr("y2", canvasHeight * 0.1)
		            .attr("marker-end", "url(#arrow)");
			}
			function drawEllipse() {
				let length = (canvasWidth>canvasHeight?canvasHeight:canvasWidth) * 3 / 4
				let x = (canvasWidth - length) / 2
				let y = (canvasHeight - length) / 2
				let triangle = d3.symbol()
		            .type(d3.symbolTriangle)
		            .size(length * length / 3)
		        coordG.append("line")
					.attr('class', 'polar-axis')
		            .attr("x1",  0)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth)
		            .attr("y2", canvasHeight / 2)
		        coordG.append('rect')
					.attr('class', 'polar-axis')
					.attr('x', x)
					.attr('y', y)
					.attr('width', length)
					.attr('height', length)
				coordG.append("line")
		        	.attr('class', 'axis')
		            .attr("x1", canvasWidth / 2)
		            .attr("y1", canvasHeight / 2)
		            .attr("x2", canvasWidth * 0.9 )
		            .attr("y2", canvasHeight * 0.1)
		            .attr("marker-end", "url(#arrow)");
			}
		}
	}
  }
</script>

<style lang="less">
 	@strokeWidth: 1.2px;
	.sketch-figure-svg {
		@axisColor: #888888;
		width: 100%;
		height: 100%;
		.node {
			fill: #d1d3d4;
		}
		#arrow {
			fill: @axisColor;
		}
		.axis {
			stroke-width: @strokeWidth;
			stroke: @axisColor;
			fill: none;
		}
		.polar-axis {
		 	stroke-dasharray: 3px 3px;
			stroke: @axisColor;
			stroke-width: @strokeWidth;
			fill: none;
		}
		.polar-circle {
			stroke-dasharray: 3px 3px;
			fill: none;
			stroke: @axisColor;
			stroke-width: @strokeWidth;
		}
	}
</style>
