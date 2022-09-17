<template>
	<div class="data-view-container">
		<div class="title-container">
			<span class = "inner-title">Data Attributes</span>
		</div>
		<div class = "component-container">
			<drag class="drag" v-if="selectedDataset!=null" 
				@dragstart="dragStartHandler('attribute')"
				@dragend="dragEndHandler"
				v-for="attrObj in attrObjArray"
				:transfer-data="{ 'value': attrObj.attrName, 'type': 'attribute' }">
				<el-row class="row-container" :gutter="20" >
				  <el-col :offset="1" :span="1" class="row-bg col-container">
				  </el-col>
				  <el-col :span="3" class="row-bg col-container">
				  	<span class = "inner-label">
				  		<span v-if="(attrObj.attrType === 'string') || (attrObj.attrType === 'boolean')" class="icon iconfont icon-xingzhuang"></span>
				  		<span v-if="attrObj.attrType === 'number'" class="icon iconfont icon-chizi_o"></span>
				  	</span>
				  </el-col>
				  <el-col :span="15" class="row-bg col-container">
				  	<span class = "inner-label">
				  		{{attrObj.attrName}}
				  	</span>
				  </el-col>
				  <el-col :span="3" class="row-bg col-container filter-container">
				  	<span class="inner-label" :class="{active: attrObj.attrName === selectedAttrName}"
				  			@click="changeActiveAttr(attrObj.attrName)">
				  		<span class="icon iconfont icon-shaixuan"></span>
				  	</span>
				  </el-col>
				</el-row>
			</drag>
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
				fieldLabel: 'Attributes',
				selectedAttrName: null,
				emptyDataLabel: 'Please select dataset from Dataset Dialog.'
			}
		},
		watch: {

		},
		created: function () {

		},
		beforeMount: function() {

		},
		mounted: function() {
			console.log('selectedDataset', this.selectedDataset)
			console.log('attrObjArray', this.attrObjArray)
		},
		computed: {
		    ...mapState([
		      'selectedDataset',
		      'attrObjArray',
		      'currentDragComponent'
		    ])
		},
		methods: {
			changeActiveAttr: function(attrName) {
				if (this.selectedAttrName == attrName) {
					this.selectedAttrName = null
				} else {
					this.selectedAttrName = attrName
				}
			},
			dragStartHandler: function(type) {
				this.UPDATE_CURRENT_DARG_COMPONENT(type)
			},
			dragEndHandler: function() {
				let componentType = null
				this.UPDATE_CURRENT_DARG_COMPONENT(componentType)
			},
			...mapMutations([
		      'UPDATE_CURRENT_DARG_COMPONENT'
		    ])
		}
	}
</script>
<style lang="less">
	@border-style: 0.05rem solid rgba(180, 180, 180, 0.3);
	@content-font-size: 1rem;
	.data-view-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		.title-container {
			text-align: left;
			padding-left: 1rem;
			font-weight: bold;
			height: 2rem;
			right: 0%;
			display: table;
			.inner-title {
			  vertical-align: middle;
			  display: table-cell;
			}
		}
		.component-container {
			position: absolute;
			top: 2rem;
			bottom: 0%;
			left: 0rem;
			right: 0rem;
			border-top: @border-style;
			font-size: @content-font-size;
			overflow-y: auto;
			text-align: left;
			.inner-component-container {
				position: absolute;
				left: 0.2rem;
				right: 0.2rem;
				top: 0rem;
				bottom: 0rem;
			}
			.row-container {
				margin-left: 0 !important;
				margin-right: 0 !important;
			}
			.col-container {
				text-align: left;
				height: 2rem;
				right: 0%;
				display: table;
    			cursor: pointer;
    			padding: 0 !important;
				.inner-label {
				  vertical-align: middle;
				  display: table-cell;
				}
				.iconfont {
				  vertical-align: middle;
				  display: table-cell;
				}
			}
			.filter-container {
				.inner-label {
				  vertical-align: middle;
				  display: table-cell;
				  color: #ddd;
				  &.active {
				  	color: #000;
				  }
				}				
			}
			.el-row {
				&:first-child {
			      margin-top: 0.3rem;
			    }
			   	margin-bottom: 0.3rem;
			   	line-height: 2rem;
			}
			.row-bg {
    			background-color: #f9fafc;
  			}
		}
	}
</style>