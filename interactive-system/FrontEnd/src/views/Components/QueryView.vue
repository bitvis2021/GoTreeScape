<template>
	<div class = "query-container">
		<div class = "label">
			<span class = "inner-title">Query</span>
		</div>
		<div class = "component-container">
			<el-row class="row-container subtitle" :gutter="20">
				<el-col :span="6" class="row-bg col-container component-subtitle">
					Layout: 
			  	</el-col>
			</el-row>
			<drop class="drop" 
				@drop="handleDropX"
				@dragover="dragOverX = true"
				@dragleave="dragOverX = false">
				<el-row class="row-container parameter-container" 
					:class = "{allowed: (currentDragComponent != null && (!dragOverStateFunc())), dragOver: dragOverX}" 
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						x
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compX"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleXClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<drop class="drop" 
				@drop="handleDropY"
				@dragover="dragOverY = true"
				@dragleave="dragOverY = false">
				<el-row class="row-container parameter-container"
					:class = "{allowed: (currentDragComponent != null && (!dragOverStateFunc())), dragOver: dragOverY}" 
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						y
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compY"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleYClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<el-divider></el-divider>	
			<el-row class="row-container subtitle" :gutter="20">
				<el-col :span="6" class="row-bg col-container component-subtitle">
					Node: 
			  	</el-col>
			  	<el-col :offset="3" :span="15" class="row-bg col-container component-subtitle-select">
					<el-select v-model="nodeValue" placeholder="Select" class="option-list">
					    <el-option
					      v-for="item in nodeOptions"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					</el-select>
			  	</el-col>
			</el-row>
			<drop class="drop" 
				@drop="handleDropWidth"
				@dragover="dragOverWidth = true"
				@dragleave="dragOverWidth = false">
				<el-row class="row-container parameter-container"
					:class = "{allowed: (currentDragComponent === 'attribute' && (!dragOverStateFunc())), dragOver: dragOverWidth}" 
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						width
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compWidth"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleWidthClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<drop class="drop" @drop="handleDropHeight"
				@dragover="dragOverHeight = true"
				@dragleave="dragOverHeight = false">
				<el-row class="row-container parameter-container"
					:class = "{allowed: currentDragComponent === 'attribute' && (!dragOverStateFunc()), dragOver: dragOverHeight}" 
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						height
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compHeight"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleHeightClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<drop class="drop" @drop="handleDropShape"
				@dragover="dragOverShape = true"
				@dragleave="dragOverShape = false">
				<el-row class="row-container parameter-container" 
					:class = "{allowed: currentDragComponent === 'attribute' && (!dragOverStateFunc()), dragOver: dragOverShape}"
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						shape
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compShape"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleShapeClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<drop class="drop" @drop="handleDropColor"
				@dragover="dragOverColor = true"
				@dragleave="dragOverColor = false">			
				<el-row class="row-container parameter-container" 
					:class = "{allowed: currentDragComponent === 'attribute' && (!dragOverStateFunc()), dragOver: dragOverColor}"
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						color
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compColor"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleColorClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<el-divider></el-divider>
			<el-row class="row-container subtitle" 
				:gutter="20">
				<el-col :span="6" class="row-bg col-container component-subtitle">
					Link: 
			  	</el-col>
			  	<el-col :offset="3" :span="15" class="row-bg col-container component-subtitle-select">
					<el-select v-model="linkValue" placeholder="Select" class="option-list">
					    <el-option
					      v-for="item in linkOptions"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value"
					      @close="handleLinkClose(comp)">
					    </el-option>
					</el-select>
			  	</el-col>
			</el-row>
			<drop class="drop" @drop="handleDropStroke"
				@dragover="dragOverStroke = true"
				@dragleave="dragOverStroke = false">	
				<el-row class="row-container parameter-container" 
					:class = "{allowed: currentDragComponent === 'attribute' && (!dragOverStateFunc()), dragOver: dragOverStroke}"
					:gutter="20">
					<el-col :span="24" class="row-bg col-container parameter-container-title">
						stroke
				  	</el-col>
				  	<el-col :span="24" class="row-bg col-container parameter-container-body">
				  		<el-tag
						  v-for="comp in compStroke"
						  :key="comp.value"
						  closable
						  :type="transformType(comp.type)"
						  @close="handleStrokeClose(comp)">
						  {{comp.value}}
						</el-tag>
				  	</el-col>
				</el-row>
			</drop>
			<el-divider></el-divider>
			<el-row class="row-container subtitle" :gutter="20">
				<el-col :span="6" class="row-bg col-container component-subtitle">
					Coordinate System: 
			  	</el-col>
			  	<el-col :offset="6" :span="12" class="row-bg col-container component-subtitle-select">
					<el-select v-model="coordinateSystemValue" placeholder="Select" class="option-list">
					    <el-option
					      v-for="item in coordinateSystemOptions"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					</el-select>
			  	</el-col>
			</el-row>
		</div>
	</div>
</template>
<script>
	import { mapState, mapMutations, mapActions } from 'vuex'
	import { Drag, Drop } from 'vue-drag-drop'

	export default {
		name: 'DataView',
		components: {
			Drag, Drop
		},
		data() {
			return {
				compX: [],
				compY: [],
				compWidth: [],
				compHeight: [],
				compShape: [],
				compColor: [],
				compStroke: [],
				dragOverX: false,
				dragOverY: false,
				dragOverWidth: false,
				dragOverHeight: false,
				dragOverShape: false, 
				dragOverColor: false, 
				dragOverStroke: false, 
		        nodeOptions: [
		       	 	{
			          value: 'auto',
			          label: 'auto'
			        },
			        {
			          value: 'circle',
			          label: 'circle'
			        }, {
			          value: 'rectangle',
			          label: 'rectangle'
			        }, {
			          value: 'triangle',
			          label: 'triangle'
			        }, {
			          value: 'ellipse',
			          label: 'ellipse'
			        }
		        ],
		        linkOptions: [
		        	{
			          value: 'auto',
			          label: 'auto'
			        },
			        {
			          value: 'straight',
			          label: 'straight'
			        }, {
			          value: 'curve',
			          label: 'curve'
			        }, {
			          value: 'curveStepBefore',
			          label: 'curveStepBefore'
			        }, {
			          value: 'curveStepAfter',
			          label: 'curveStepAfter'
			        }, {
			          value: 'orthogonal',
			          label: 'orthogonal'
			        },  {
			          value: 'arccurve',
			          label: 'arccurve'
			        }],
			    coordinateSystemOptions: [
			    	{
			          value: 'auto',
			          label: 'auto'
			        }, {
			          value: 'cartesian',
			          label: 'cartesian'
			        }, {
			          value: 'polar',
			          label: 'polar'
			        }
		        ],
		        linkValue: 'auto',
		        nodeValue: 'auto',
		        coordinateSystemValue: 'auto'
			}
		},
		watch: {

		},
		created: function () {
		},
		beforeMount: function() {

		},
		mounted: function() {

		},
		computed: {
			...mapState([
		      'currentDragComponent'
		    ])
		},
		methods: {
			filteredItems() {
		      return this.autocompleteItems.filter(i => {
		        return i.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
		      });
		    },
		    dragOverStateFunc: function() {
		    	return (this.dragOverX || this.dragOverY || this.dragOverWidth 
		    			|| this.dragOverHeight || this.dragOverShape 
		    			|| this.dragOverColor || this.dragOverStroke)
		    },
		    handleDropX: function(comp) {
		    	if ((comp.type === 'parent-child-relation') || (comp.type === 'sibling-relation')) {
		    		let compIndex = this.compX.map(function(e) { return e.type; }).indexOf(comp.type)
		    		if (compIndex !== -1) {
		    			this.compX.splice(compIndex, 1)
		    		}
		    		this.compX.push(comp)
		    	} else {
		    		if (this.compX.map(function(e) { return e.value; }).indexOf(comp.value) === -1) {
			    		this.compX.push(comp)
			    	}
		    	}
		    	this.dragOverX = false
			},
			handleDropY:  function(comp) {
				if ((comp.type === 'parent-child-relation') || (comp.type === 'sibling-relation')) {
		    		let compIndex = this.compY.map(function(e) { return e.type; }).indexOf(comp.type)
					if (compIndex !== -1) {
		    			this.compY.splice(compIndex, 1)
		    		}
		    		this.compY.push(comp)
		    	} else if (this.compY.map(function(e) { return e.value; }).indexOf(comp.value) === -1) {
		    		this.compY.push(comp)
		    	}
		    	this.dragOverY = false
			},
			handleDropWidth: function(comp) {
		    	if ((this.compWidth.map(function(e) { return e.value; }).indexOf(comp.value) === -1) && 
		    		((comp.type !== 'parent-child-relation') && (comp.type !== 'sibling-relation'))) { 
		    		this.compWidth.push(comp)
		    	}
		    	this.dragOverWidth = false
			},
			handleDropHeight: function(comp) {
		    	if ((this.compHeight.map(function(e) { return e.value; }).indexOf(comp.value) === -1) &&
		    		((comp.type !== 'parent-child-relation') && (comp.type !== 'sibling-relation'))) { 
		    		this.compHeight.push(comp)
		    	}
				this.dragOverHeight = false
			},
			handleDropShape: function(comp) {
		    	if ((this.compShape.map(function(e) { return e.value; }).indexOf(comp.value) === -1) && 
		    		((comp.type !== 'parent-child-relation') && (comp.type !== 'sibling-relation'))) {
		    		this.compShape.push(comp)
		    	}
		    	this.dragOverShape = false
			},
			handleDropColor: function(comp) {
		    	if ((this.compColor.map(function(e) { return e.value; }).indexOf(comp.value) === -1) && 
		    		((comp.type !== 'parent-child-relation') && (comp.type !== 'sibling-relation'))) {
		    		this.compColor.push(comp)
		    	}
		    	this.dragOverColor = false
			},
			handleDropStroke: function(comp) {
		    	if ((this.compStroke.map(function(e) { return e.value; }).indexOf(comp.value) === -1) &&
		    		((comp.type !== 'parent-child-relation') && (comp.type !== 'sibling-relation'))) {
		    		this.compStroke.push(comp)
		    	}
		    	this.dragOverStroke = false
			},
			// close function
			handleXClose: function(comp) {
		    	this.compX.splice(this.compX.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			handleYClose:  function(comp) {
		    	this.compY.splice(this.compY.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			handleWidthClose: function(comp) {
		    	this.compWidth.splice(this.compWidth.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			handleHeightClose: function(comp) {
		    	this.compHeight.splice(this.compHeight.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			handleShapeClose: function(comp) {
				this.compShape.splice(this.compShape.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			handleColorClose: function(comp) {
				this.compColor.splice(this.compColor.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			handleStrokeClose: function(comp) {
				this.compStroke.splice(this.compStroke.map(function(e) { return e.value; }).indexOf(comp.value), 1)
			},
			transformType: function(type) {
				if (type === 'parent-child-relation') {
					return ''
				} else if (type === 'sibling-relation') {
					return 'warning'
				} else if (type === 'attribute') {
					return 'info'
				}
			}
		}
	}
</script>
<style lang="less">
  	@border-style: 0.05rem solid rgba(180, 180, 180, 0.3);
	.query-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
		.label {
			text-align: left;
			padding-left: 10px;
			font-weight: bold;
			height: 2rem;
			right: 0%;
			display: table;
			.inner-title {
			  vertical-align: middle;
			  display: table-cell;
			}
		}
		.component-container{
			position: absolute;
			width: 100%;
			top: 2rem;
			bottom: 0%;
			left: 0%;
			overflow-y: auto;
			// display: -webkit-flex; 
			// display: flex;
			// flex-direction: row;
			border-top: @border-style;
			.inner-component {
				height: 2rem;
				width: 100%;
			}
			.row-container {
				margin-left: 10px !important;
				margin-right: 10px !important;
				margin-top: 5px !important;
				margin-bottom: 5px !important;
				.tag-container-label {
					line-height: 29px;
					// background-color: #eee;
				}
				.component-subtitle {
					padding-left: 0px !important;
					padding-right: 0px !important;
					text-align: left;
				}
				.component-subtitle-select {
					text-align: right;
				}
			}
			.el-tag {
				height: 25px;
				line-height: 25px;
				padding: 0 4px;
				margin: 4px;
				cursor: pointer;
				.el-icon-close {
					right: 0px;
				}
			}
			.parameter-container-title {
				background-color: #f9fafc;
				border: 1px solid #f9fafc;
			}
			.parameter-container {
				border: 1px solid #f9fafc;
				&.allowed {
					border: 1px dashed steelblue;
				}
				&.dragOver {
					border: 1px dashed steelblue;
				}
			}
			.parameter-container-body {
				margin-top: 0px;
				margin-bottom: 0px;
				padding-left: 0px !important;
				padding-right: 0px !important;
			}
			.tag-container-label {
				padding-left: 0px !important;
				padding-right: 0px !important;
			}
			.component-subtitle-select {
				padding-left: 0px !important;
				padding-right: 0px !important;
			}
			.el-input__inner {
				height: 20px;
				line-height: 20px;
				font-size: 10px;
			}
			.el-input__icon {
				line-height: 20px !important;
			}
			.el-divider--horizontal {
				margin: 15px 10px;
				width: auto;
			}
		}
	}
	.el-select-dropdown {
		.el-select-dropdown__item {
			font-size: 10px !important;
			padding: 0 10px;
			height: 20px;
			line-height: 20px;
		}
	}
</style>