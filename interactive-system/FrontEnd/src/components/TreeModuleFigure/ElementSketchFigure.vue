<template>
	<svg class = "sketch-figure-svg">
	</svg>
</template>

<script>
  export default {
	name: 'LayoutSketchFigure',
	components: {
	},
	data() {
	  return {
	  	nodeArray: [
	  		'circle', 'rectangle', 'triangle', 'ellipse'
	  	],
	  	linkArray: [
	  		'straight', 'curve', 'curveStepBefore', 'curveStepAfter', 'orthogonal', 'arccurve'
	  	]
	  }	
	},
	props: {
		category: {
			type: String
		},
		elementType: {
			type: String
		}
    },
    watch: {
    	elementType: function() {
    		this.renderSketchFigure()
    	}
    },
	created: function () {
	},
	beforeMount: function() {
	},
	mounted: function() {
		let self = this
		self.renderSketchFigure()
	},
	computed: {
	},
	methods: {
		renderSketchFigure: function() {
			let self = this
			setTimeout(function() {
				if (self.category === 'node') {
					self.renderNodeSketchFigure()
				} else if (self.category === 'link') {
					self.renderLinkSketchFigure()			
				}
			}, 400)
		},
		renderNodeSketchFigure: function() {
			let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
				marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08,
				canvasWidth = $(this.$el).width() - marginLeft - marginRight,
				canvasHeight = $(this.$el).height() - marginTop - marginBottom
			//	Draw Root nodes and Subtree group nodes in SVG based on size and location
			d3.select(this.$el).select('.node-canvas').remove()
			let nodeG = d3.select(this.$el)
				.append('g')
				.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
				.attr('class', 'node-canvas')
			console.log('elementType', this.elementType)
			switch (this.elementType) {
				case 'circle':
					drawCircle()
				break;
				case 'rectangle':
					drawRectangle()
				break;
				case 'triangle':
					drawTriangle()
				break;
				case 'ellipse':
					drawEllipse()
				break;
			}
			function drawCircle() {
				let radius = canvasWidth>canvasHeight?canvasHeight/2:canvasWidth/2
				nodeG.append('circle')
					.attr('class', 'node')
					.attr('cx', canvasWidth / 2)
					.attr('cy', canvasHeight / 2)
					.attr('r', radius)
			}
			function drawRectangle() {
				let length = canvasWidth>canvasHeight?canvasHeight:canvasWidth
				let x = (canvasWidth - length) / 2
				let y = (canvasHeight - length) / 2
				nodeG.append('rect')
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
		            .size(length * length / 2)
		        nodeG.append('path')
					.attr('class', 'node')
		        	.attr("d", triangle)
		        	.attr('transform', 'translate(' + canvasWidth / 2 + ',' + canvasHeight * 2 / 3 + ')')
			}
			function drawEllipse() {
				nodeG.append('ellipse')
					.attr('class', 'node')
					.attr('cx', canvasWidth / 2)
					.attr('cy', canvasHeight / 2)
					.attr('rx', canvasWidth / 2)
					.attr('ry', canvasHeight / 4)
			}
		},
		renderLinkSketchFigure: function() {
			let self = this
			let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
				marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08,
				canvasWidth = $(this.$el).width() - marginLeft - marginRight,
				canvasHeight = $(this.$el).height() - marginTop - marginBottom
			console.log('canvasWidth', canvasWidth, 'canvasHeight', canvasHeight)
			//	Draw Root nodes and Subtree group nodes in SVG based on size and location
			d3.select(this.$el).select('.link-canvas').remove()
			let linkG = d3.select(this.$el)
				.append('g')
				.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
				.attr('class', 'link-canvas')
			let length = canvasWidth>canvasHeight?canvasHeight:canvasWidth
			let radius = length / 15
			let beginx = radius * 2
			let beginy = radius * 2
			let endx = canvasWidth - radius * 2
			let endy = canvasHeight - radius * 2
			let lineData = getLineData()
			linkG.append('path')
				.attr('class', 'node-link')
                .attr('d', lineData)
			linkG.append('circle')
				.attr('class', 'node')
				.attr('cx', beginx)
				.attr('cy', beginy)
				.attr('r', radius)
			linkG.append('circle')
				.attr('class', 'node')
				.attr('cx', endx)
				.attr('cy', endy)
				.attr('r', radius)
			//	Gets the d property of the connector
			function getLineData() {
				let PosData;
				let lineGenerator;
				let lineData;
				switch (self.elementType) {
					case 'straight':
						PosData = []
		                PosData.push([beginx, beginy])
		                PosData.push([endx, endy])
		                lineGenerator = d3.line()
		                lineData = lineGenerator(PosData)
					break;
					case 'curve':
						PosData = {source:[beginx,beginy],target:[endx,endy]}
	                	lineGenerator = d3.linkVertical()
	                	lineData = lineGenerator(PosData)
					break;
					case 'curveStepBefore':
						PosData = []
	               	 	PosData.push([beginx,beginy])
	                	PosData.push([endx,endy])
	                	lineGenerator = d3.line().curve(d3.curveStepBefore)
	                	lineData = lineGenerator(PosData)
	               	    console.log('lineData curveStepBefore', lineData)
					break;
					case 'curveStepAfter': 
						PosData = []
	               	 	PosData.push([beginx,beginy])
	                	PosData.push([endx,endy])
	                	lineGenerator = d3.line().curve(d3.curveStepAfter)
	                	lineData = lineGenerator(PosData)
	                	console.log('lineData curveStepAfter', lineData)
					break;
					case 'orthogonal':
						PosData = []
               			PosData.push([beginx,beginy])
                		PosData.push([beginx,(beginy+endy)/2])
                		PosData.push([endx,(beginy+endy)/2])
                		PosData.push([endx,endy])
                		lineGenerator = d3.line()
                		lineData = lineGenerator(PosData)
					break;
					case 'arccurve':
						beginx = radius * 2
						endx = canvasWidth - radius * 2
						beginy = canvasHeight * 3 / 4
						endy = canvasHeight * 3 / 4
						let arcRadius = (beginx - endx)/2
		                let BeginX = beginx
		                let BeginY = beginy
		                let EndX = endx
		                let EndY = endy
		                if (arcRadius < 0) {
		                  arcRadius = -arcRadius
		                  BeginX = endx
		                  BeginY = endy
		                  EndX = beginx
		                  EndY = beginy
		                }
		                lineData = "M"+BeginX+","+BeginY+" A"+arcRadius+","+arcRadius+" 0 0 0 "+EndX+","+EndY
					break;
				}
				return lineData
			}
						
 		}
	}
  }
</script>

<style lang="less">
 	@strokeWidth: 1.2px;
	.sketch-figure-svg {
		width: 100%;
		height: 100%;
		.root {
			fill: #d1d3d4;
		}
		.sg {
			fill: none;
			stroke: black;
			stroke-width: 1px;
			stroke-dasharray: 3px 3px;
		}
		.subtree {
			fill: #d1d3d4;
			stroke: black;
			stroke-width: 1px;
		}
		.node-link{
			stroke-width: @strokeWidth;
			stroke: #ddd;
			fill: none;
		}
		.node {
			fill: #d1d3d4;
		}
	}
</style>
