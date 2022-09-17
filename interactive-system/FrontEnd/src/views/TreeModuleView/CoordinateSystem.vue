<template>
	<div class = "coord-container">
		<div class = "label">
			<span class = "inner-title">Coordinate System</span>
		</div>
		<div class = "component-container">
    		<div class="component-panel" id="coordinate-panel">
	    		<div v-for="coordType in coordArray" class="component" 
	    			:id="coordType.id" :type="coordComponentType">
		    			<div class = "sketch-figure">
		    				<CoordSketchFigure :coordType="coordType.name" v-if="showCoordComponents"/>
		    			</div>
			    		<div class = "component-title">
			    			<span class = "component-title-container" id="coord-title">{{coordType.name}}</span>
			    		</div>
	    		</div>
    		</div>
		</div>
	</div>
</template>

<script>
  import CoordSketchFigure from '@/components/TreeModuleFigure/CoordSketchFigure.vue';
  import { mapMutations, mapState, mapActions } from 'vuex';

  export default {
	name: 'CoordinateSystem',
	components: {
		CoordSketchFigure,
	},
	data() {
	  return {
	  	coordArray: [
	  		{
	  			id: 'cartesian', 
	  			name: 'cartesian'
	  		},
	  		{
	  			id: 'polar',
	  			name: 'polar'
	  		}//,
	  		// {
	  		// 	id: 'triangle',
	  		// 	name: 'triangle'
	  		// },
	  		// {
	  		// 	id: 'rectangle',
	  		// 	name: 'rectangle'
	  		// }
	  	],
	  	coordComponentType: 'CoordinateSystem',
	  	elementNodeArray: [],
	  	elementLinkArray: [],
	  	coordinateSystemArray: [],
	  	showCoordComponents: false
	  }	
	},
	watch: {
		treeUnitDSLName: function() {
			let self = this
			$('.coord-container .component').removeClass('selected')
			$('.coord-container .component').removeClass('unhighlight')
			let editDSLObjArray = self.treeUnitDSLArray.filter(function(d, i) {
				return d.name === self.treeUnitDSLName
			})
			if (editDSLObjArray.length > 0) {
				let editDSLObj = editDSLObjArray[0].dslObj
				if (typeof(editDSLObj.CoordinateSystem) !== 'undefined') {
					let coordinateSystemCategory = editDSLObj.CoordinateSystem.Category
					if(typeof (coordinateSystemCategory) !== 'undefined') {
						$('.coord-container .component').addClass('unhighlight')
						$('.coord-container .component#' + coordinateSystemCategory).addClass('selected')
					}
				}
			}
		}
	},
	created: function () {
	},
	beforeMount: function() {
		let viewWidth = $('.layout-container').width()
	},
	mounted: function() {
		this.initCoordPanel()
		this.showCoordComponents = true
		this.initClickEvent()
	},
	computed: {
		...mapState([
	      'coordComponent',
	      'treeUnitDSLName',
	      'treeUnitDSLArray'
	    ])
	},
	methods: {
		highlightSelectedComponent: function(selectedCoordComponentId) {
			let coordComponent = "CoordinateSystem"
			if (typeof(selectedCoordComponentId) !== 'undefined') {
				if ($('.coord-container .component#' + selectedCoordComponentId).hasClass('selected')) {
					$('.coord-container .component#' + selectedCoordComponentId).removeClass('selected')
					this.removeDSLComponent(coordComponent)
				} else {
					$('.coord-container .component').removeClass('selected')
					$('.coord-container .component#' + selectedCoordComponentId).addClass('selected')
					this.addCoordComponent(selectedCoordComponentId)			
				}
			}
			if ($('.coord-container .selected').length > 0) {
				$('.coord-container .component').addClass('unhighlight')
			} else {
				$('.coord-container .component').removeClass('unhighlight')				
			}
		},
		addCoordComponent: function(componentId) {
			let coordObj = {
				"CoordinateSystem": {
				    "Category": componentId
				}
			}
			this.setDSLComponent(coordObj)
		},
		initClickEvent: function() {
			let self = this
			$('.coord-container .component').click(function() {
				let componentType = $(this).attr('type')
				let componentId = $(this).attr('id')
				// self.UPDATE_COORD(componentId)
				self.highlightSelectedComponent(componentId)
			})
		},
		initCoordPanel: function() {
			let lengthPercentage = "25%", marginPercentage = "6.25%", 
				lengthNum = 0.25, marginNum = 0.0625
			let viewWidth = $('.coord-container .component-container').width()
			let viewHeight = $('.coord-container .el-tabs__content').height()
			//	Increment the padding-right value in the div that contains the Component
			$('#coordinate-panel .component').css("width", lengthPercentage)
			$('#coordinate-panel .component').css("margin-left", marginPercentage)
			let componentViewWidth = viewWidth * lengthNum
			let componentViewHeight = componentViewWidth * 1.14
			$('#coordinate-panel .component').css("height", componentViewHeight + 'px')
			// let marginTop = (viewHeight - componentViewHeight) / 2
			// $('#coordinate-panel .component').css("margin-top", marginTop + 'px')
			//	Calculate the height occupied by TITLE
			let titleHeight = componentViewHeight / 5
			let titleMarginTop = componentViewHeight - titleHeight
			//	Computes the entire height of the Component view
			$('#coordinate-panel .component-title').css("height", titleHeight)
			//	Calculate the height of Sketch Figure
			let sketchFigureHeight = componentViewHeight * 4 / 5
			$('#coordinate-panel .sketch-figure').css("height", sketchFigureHeight)
		},
		...mapMutations([
	      'UPDATE_DSL_COMPONENT_OBJECT_STATE',
	      'UPDATE_COORD'
	    ]),
	    ...mapActions([
			'setDSLComponent',
			'removeDSLComponent'
		])
 	}
  }
</script>

<style lang="less" scoped>
	.coord-container {
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
			padding-bottom: 0.6rem;
			display: flex;
			border-top: 1px solid #E4E7ED;
			.component-panel {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				align-content: flex-start;
				overflow-y: auto;
				// border-top: #eeeeee solid 0.5px;
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
						.component-title-container#coord-title {
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
</style>
