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
	  	layoutRootArray: [
	  		'X include | Y within', 'X juxtapose | Y within', 'X within | Y within', 
	  		'X include | Y juxtapose', 'X juxtapose | Y juxtapose', 'X within | Y juxtapose', 
	  		'X include | Y include', 'X juxtapose | Y include', 'X within | Y include',
	  	],
	  	layoutSubtreeArray: [
	  		'X align | Y flatten', 'X flatten | Y flatten',
	  		'X align | Y align', 'X flatten | Y align'
	  	],
	  	DURATION: 1000
	  }	
	},
	props: {
		category: {
			type: String
		},
		layout: {
			type: String
		}
    },
	created: function () {
	},
	beforeMount: function() {
	},
	watch: {
    	layout: function() {
    		this.renderSketchFigure()
    	}
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
				if (self.category === 'root') {
					self.appendRootG()
					self.renderRootSketchFigure()
				} else if (self.category === 'subtree') {
					self.appendSubtreeG()
					self.renderSubtreeSketchFigure()			
				}
			}, 500)
		},
		appendRootG: function() {
			let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
				marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08
			this.canvasWidth = $(this.$el).width() - marginLeft - marginRight
			this.canvasHeight = $(this.$el).height() - marginTop - marginBottom
			d3.select(this.$el)
				.append('g')
				.attr('class', 'root-g')
				.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
		},
		appendSubtreeG: function () {
			let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
				marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08
			this.canvasWidth = $(this.$el).width() - marginLeft - marginRight
			this.canvasHeight = $(this.$el).height() - marginTop - marginBottom
			let subtreeG = d3.select(this.$el)
				.append('g')
				.attr('class', 'subtree-g')				
				.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
		},
		renderRootSketchFigure: function() {
			//	Calculate the size and location of the two root and SG parts
			let xyLayoutArray = this.layout.split(' | ')
			let xLayout = xyLayoutArray[0].replace('X ', '')
			let yLayout = xyLayoutArray[1].replace('Y ', '')
			let rootXRange = this.computeRootXRange(xLayout)
			let sgXRange = this.computeSGXRange(xLayout)
			let rootYRange = this.computeRootYRange(yLayout)
			let sgYRange = this.computeSGYRange(yLayout)
			let canvasHeight = this.canvasHeight
			let canvasWidth = this.canvasWidth
			// let width = $(this.$el).width()
			// let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
			// 	marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08,
			// 	canvasWidth = $(this.$el).width() - marginLeft - marginRight,
			// 	canvasHeight = $(this.$el).height() - marginTop - marginBottom
			//	Draw Root nodes and Subtree group nodes in SVG based on size and location
			// let rootG = d3.select(this.$el)
			// 	.append('g')
			// 	.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
			let rootG = d3.select(this.$el).select('.root-g')
			if (rootG.select('.root').empty()) {
				rootG.append('rect')
					.attr('class', 'root')
					.attr('x', rootXRange[0] * canvasWidth)
					.attr('width', (rootXRange[1] - rootXRange[0]) * canvasWidth)	
					.attr('y', rootYRange[0] * canvasHeight)
					.attr('height', (rootYRange[1] - rootYRange[0]) * canvasHeight)
			} else {
				rootG.select('.root')
					.transition()
					.duration(this.DURATION)
					.attr('x', rootXRange[0] * canvasWidth)
					.attr('width', (rootXRange[1] - rootXRange[0]) * canvasWidth)	
					.attr('y', rootYRange[0] * canvasHeight)
					.attr('height', (rootYRange[1] - rootYRange[0]) * canvasHeight)
			}

			if (rootG.select('.sg').empty()) {
				rootG.append('rect')
					.attr('class', 'sg')
					.attr('x', sgXRange[0] * canvasWidth)
					.attr('width', (sgXRange[1] - sgXRange[0]) * canvasWidth)	
					.attr('y', sgYRange[0] * canvasHeight)
					.attr('height', (sgYRange[1] - sgYRange[0]) * canvasHeight)
			} else {
				rootG.select('.sg')
					.transition()
					.duration(this.DURATION)	
					.attr('x', sgXRange[0] * canvasWidth)
					.attr('width', (sgXRange[1] - sgXRange[0]) * canvasWidth)	
					.attr('y', sgYRange[0] * canvasHeight)
					.attr('height', (sgYRange[1] - sgYRange[0]) * canvasHeight)				
			}
			//	在component上增加标记
			let markXRange = this.computeMarkXRange(xLayout)	
		},
		renderSubtreeSketchFigure: function() {
			//	Calculate the size and location of the two root and SG parts
			let xyLayoutArray = this.layout.split(' | ')
			let xLayout = xyLayoutArray[0].replace('X ', '')
			let yLayout = xyLayoutArray[1].replace('Y ', '')
			let node1XRange = this.computeNode1XRange(xLayout)
			let node2XRange = this.computeNode2XRange(xLayout)
			let node1YRange = this.computeNode1YRange(yLayout)
			let node2YRange = this.computeNode2YRange(yLayout)
			let canvasHeight = this.canvasHeight
			let canvasWidth = this.canvasWidth
			// let marginLeft = (+$(this.$el).width()) * 0.08, marginRight = (+$(this.$el).width()) * 0.08,
			// 	marginTop = (+$(this.$el).height()) * 0.08, marginBottom = (+$(this.$el).height()) * 0.08,
			// 	canvasWidth = $(this.$el).width() - marginLeft - marginRight,
			// 	canvasHeight = $(this.$el).height() - marginTop - marginBottom
			//	Draws nodes in Subtree on SVG based on size and location
			// let subtreeG = d3.select(this.$el)
			// 	.append('g')
			// 	.attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
			let subtreeG = d3.select(this.$el).select('.subtree-g')
			if (subtreeG.select('.subtree1').empty()) {
				subtreeG.append('rect')
					.attr('class', 'subtree subtree1')
					.attr('x', node1XRange[0] * canvasWidth)
					.attr('width', (node1XRange[1] - node1XRange[0]) * canvasWidth)	
					.attr('y', node1YRange[0] * canvasHeight)
					.attr('height', (node1YRange[1] - node1YRange[0]) * canvasHeight)
			} else {
				subtreeG.select('.subtree')
					.transition()
					.duration(this.DURATION)
					.attr('x', node1XRange[0] * canvasWidth)
					.attr('width', (node1XRange[1] - node1XRange[0]) * canvasWidth)	
					.attr('y', node1YRange[0] * canvasHeight)
					.attr('height', (node1YRange[1] - node1YRange[0]) * canvasHeight)
			}
			if (subtreeG.select('.subtree2').empty()) {
				subtreeG.append('rect')
					.attr('class', 'subtree subtree2')
					.attr('x', node2XRange[0] * canvasWidth)
					.attr('width', (node2XRange[1] - node2XRange[0]) * canvasWidth)	
					.attr('y', node2YRange[0] * canvasHeight)
					.attr('height', (node2YRange[1] - node2YRange[0]) * canvasHeight)
			} else {
				subtreeG.select('.subtree2')
					.transition()
					.duration(this.DURATION)
					.attr('x', node2XRange[0] * canvasWidth)
					.attr('width', (node2XRange[1] - node2XRange[0]) * canvasWidth)	
					.attr('y', node2YRange[0] * canvasHeight)
					.attr('height', (node2YRange[1] - node2YRange[0]) * canvasHeight)
			}
		},
		computeRootXRange: function(xLayout) {
			switch (xLayout) {
				case 'include': 
					return [0.0, 1.0]
					break;
				case 'juxtapose':
					return [0.0, 0.2]
					break;
				case 'within': 
					return [0.4, 0.6]
					break;
			}
		},
		computeSGXRange: function(xLayout) {
			switch (xLayout) {
				case 'include': 
					return [0.2, 0.8]
					break;
				case 'juxtapose':
					return [0.4, 1.0]
					break;
				case 'within': 
					return [0.0, 1.0]
					break;
			}
		},
		computeRootYRange: function(yLayout) {
			switch (yLayout) {
				case 'include': 
					return [0, 1]
					break;
				case 'juxtapose':
					return [0, 0.2]
					break;
				case 'within': 
					return [0.4, 0.6]
					break;
			}
		},
		computeSGYRange: function(yLayout) {
			switch (yLayout) {
				case 'include': 
					return [0.2, 0.8]
					break;
				case 'juxtapose':
					return [0.4, 1.0]
					break;
				case 'within': 
					return [0.0, 1.0]
					break;
			}
		},
		computeNode1XRange: function(xLayout) {
			switch (xLayout) {
				case 'align': 
					return [0.0, 1.0]
					break;
				case 'flatten':
					return [0.0, 0.4]
					break;
			}
		},
		computeNode2XRange: function(xLayout) {
			switch (xLayout) {
				case 'align': 
					return [0.25, 0.75]
					break;
				case 'flatten':
					return [0.6, 1]
					break;
			}
		},
		computeNode1YRange: function(yLayout) {
			switch (yLayout) {
				case 'align': 
					return [0.0, 1.0]
					break;
				case 'flatten':
					return [0.0, 0.4]
					break;
			}
		},
		computeNode2YRange: function(yLayout) {
			switch (yLayout) {
				case 'align': 
					return [0.25, 0.75]
					break;
				case 'flatten':
					return [0.6, 1]
					break;
			}
		},
		computeMarkXRange: function(xLayout) {
			switch (xLayout) {
				case 'include': 
					return [[0, 0.2], [0.8, 1]]
					break;
				case 'juxtapose':
					return [0.2, 0.4]
					break;
				case 'within': 
					return 0.5
					break;
			}
		},
		computeMarkYRange: function(yLayout) {
			switch (yLayout) {
				case 'include': 
					return [[0, 0.2], [0.8, 1]]
					break;
				case 'juxtapose':
					return [0.2, 0.4]
					break;
				case 'within': 
					return 0.5
					break;
			}
		},
	}
  }
</script>

<style lang="less">
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
	}
</style>
