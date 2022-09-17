<template>
	<div class = "treedsl-parameter">
		<el-divider v-if="this.rootLayoutComponent !== false" content-position="left" class="haveatry">Root-Subtree</el-divider>
<!-- 		<div class="head-component-divider"/> -->
		<el-row v-if="this.rootLayoutComponent !== false" type="flex" align="middle" id="root_panel" justify="space-around"
			:class="hoverRoot ? 'hoverComponent' : ''">
			<el-col :span="1"></el-col>
			<el-col :span="5" class="panel_img">
				<layout-sketch-figure category="root" :layout="'X ' + dslObj.Layout.X.Root.Relation + ' | Y '
				+ dslObj.Layout.Y.Root.Relation"/>
			</el-col>
			<el-col :span="18">
				<el-divider content-position="right">{{'x - ' + dslObj.Layout.X.Root.Relation}}</el-divider>
				<el-row type="flex" align="middle" justify="space-around">
					<el-col :span="24">
						<include-para v-if="dslObj.Layout.X.Root.Relation==='include'" 
							:axisDsl="dslObj.Layout.X.Root" axis="X" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
						<juxtapose-para v-if="dslObj.Layout.X.Root.Relation==='juxtapose'" 
							:axisDsl="dslObj.Layout.X.Root" axis="X" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
						<within-para v-if="dslObj.Layout.X.Root.Relation==='within'" 
							:axisDsl="dslObj.Layout.X.Root" axis="X" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
					</el-col>
				</el-row>
				<el-divider content-position="right">{{'y - ' + dslObj.Layout.Y.Root.Relation}}</el-divider>
				<el-row type="flex" align="middle" justify="space-around">
					<el-col :span="24">
						<include-para v-if="dslObj.Layout.Y.Root.Relation==='include'" 
							:axisDsl="dslObj.Layout.Y.Root" axis="Y" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
						<juxtapose-para v-if="dslObj.Layout.Y.Root.Relation==='juxtapose'" 
							:axisDsl="dslObj.Layout.Y.Root" axis="Y" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
						<within-para v-if="dslObj.Layout.Y.Root.Relation==='within'" 
							:axisDsl="dslObj.Layout.Y.Root" axis="Y" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
					</el-col>
				</el-row>
			</el-col>
		</el-row>
<!-- 		<div class="component-divider" 
			v-if="(this.rootLayoutComponent !== false) && (this.subtreeLayoutComponent == false)"/> -->

		<el-divider v-if="this.subtreeLayoutComponent !== false" content-position="left">
			Subtrees
		</el-divider>
		<el-row v-if="this.subtreeLayoutComponent !== false" type="flex" align="middle" id="subtree_panel" justify="space-around" :class="hoverSubtree ? 'hoverComponent' : ''">
			<el-col :span="1"></el-col>
			<el-col :span="5" class="panel_img">
				<layout-sketch-figure category="subtree" :layout="'X ' + dslObj.Layout.X.Subtree.Relation + ' | Y '
				+ dslObj.Layout.Y.Subtree.Relation"/>
			</el-col>
			<el-col :span="18">
				<el-divider content-position="right">{{'x - ' + dslObj.Layout.X.Subtree.Relation}}</el-divider>
				<el-row type="flex" align="middle" justify="space-around">
					<!-- <el-col :span="2" class="panel_axis">X</el-col> -->
					<el-col :span="24">
						<align-para v-if="dslObj.Layout.X.Subtree.Relation==='align'" 
							:axisDsl="dslObj.Layout.X.Subtree" axis="X" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
						<flatten-para v-if="dslObj.Layout.X.Subtree.Relation==='flatten'" 
							:axisDsl="dslObj.Layout.X.Subtree" axis="X" 
							:changeDSL="changeDSL" :valueList="valueList" :changeCanvas="changeCanvas"/>
					</el-col>
				</el-row>
				<el-divider content-position="right">{{'y - ' + dslObj.Layout.Y.Subtree.Relation}}</el-divider>
				<el-row type="flex" align="middle" justify="space-around">
					<!-- <el-col :span="2" class="panel_axis">Y</el-col> -->
					<el-col :span="24">
						<align-para v-if="dslObj.Layout.Y.Subtree.Relation==='align'" 
							:axisDsl="dslObj.Layout.Y.Subtree" axis="Y" 
							:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
						<flatten-para v-if="dslObj.Layout.Y.Subtree.Relation==='flatten'" 
							:axisDsl="dslObj.Layout.Y.Subtree" axis="Y" 
							:changeDSL="changeDSL" :valueList="valueList" :changeCanvas="changeCanvas"/>
					</el-col>
				</el-row>
			</el-col>
		</el-row>
		<!-- <div class="component-divider" v-if="this.subtreeLayoutComponent !== false"/> -->

		<el-divider v-if="this.nodeComponent !== false" content-position="left">Node</el-divider>

		<el-row v-if="this.nodeComponent !== false" type="flex" align="middle" id="node_panel" justify="space-around">
			<el-col :span="1"></el-col>
			<el-col :span="5" class="panel_img">
				<element-sketch-figure category="node" :elementType="dslObj.Element.Node"/>
			</el-col>
			<el-col :span="18">
				<rect-para v-if="dslObj.Element.Node==='rectangle'" :elementDsl="dslObj.Element"
					:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
				<circle-para v-if="dslObj.Element.Node==='circle'" :elementDsl="dslObj.Element"
					:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
				<triangle-para v-if="dslObj.Element.Node==='triangle'" :elementDsl="dslObj.Element"
					:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
				<ellipse-para v-if="dslObj.Element.Node==='ellipse'" :elementDsl="dslObj.Element"
					:changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
			</el-col>
		</el-row>
		<!-- <div class="component-divider" v-if="this.nodeComponent !== false"/> -->

		<el-divider v-if="this.linkComponent !== false" content-position="left">Link</el-divider>
		<el-row v-if="this.linkComponent !== false" type="flex" align="middle" id="link_panel" justify="space-around">
			<el-col :span="1"></el-col>
			<el-col :span="5" class="panel_img">
				<element-sketch-figure category="link" :elementType="dslObj.Element.Link"/>
			</el-col>
			<el-col :span="18">
				<link-para :elementDsl="dslObj.Element" :changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
			</el-col>
		</el-row>
		<!-- <div class="component-divider" v-if="this.linkComponent !== false"/> -->

		<el-divider v-if="this.coordComponent !== false" content-position="left">Coordinate System</el-divider>
		<el-row v-if="this.coordComponent !== false" type="flex" align="middle" id="coord_panel" justify="space-around">
			<el-col :span="1"></el-col>
			<el-col :span="5" class="panel_img">
				<coord-sketch-figure :coordType="dslObj.CoordinateSystem.Category"/>
			</el-col>
			<el-col :span="18">
				<polar-para v-if="dslObj.CoordinateSystem.Category==='polar'" 
					:CoordDsl="dslObj.CoordinateSystem" :changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
				<tri-coord-para v-if="dslObj.CoordinateSystem.Category==='triangle'" 
					:CoordDsl="dslObj.CoordinateSystem" :changeDSL="changeDSL" :changeCanvas="changeCanvas"/>
				<span v-if="dslObj.CoordinateSystem.Category==='cartesian'">no parameter</span>
			</el-col>
		</el-row>
		<div class="component-divider" v-if="(this.coordComponent !== false) 
			|| (this.rootLayoutComponent !== false) || (this.subtreeLayoutComponent !== false) 
			|| (this.nodeComponent !== false) || (this.linkComponent !== false)"/>
		</div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import IncludePara from './layout/IncludePara.vue'
import JuxtaposePara from './layout/JuxtaposePara.vue'
import WithinPara from './layout/WithinPara.vue'
import AlignPara from './layout/AlignPara.vue'
import FlattenPara from './layout/FlattenPara.vue'
import RectPara from './element/RectPara'
import CirclePara from './element/CirclePara'
import TrianglePara from './element/TrianglePara'
import EllipsePara from './element/EllipsePara'
import LinkPara from './element/LinkPara'
import PolarPara from './coord/PolarPara'
import ElementSketchFigure from '@/components/TreeModuleFigure/ElementSketchFigure'
import CoordSketchFigure from '@/components/TreeModuleFigure/CoordSketchFigure'
import LayoutSketchFigure from '@/components/TreeModuleFigure/LayoutSketchFigure'
import SimplifyDsl from '@/data-processing/simplify_dsl'

export default {
	name: 'ParameterView',
	components: {
		IncludePara,
		JuxtaposePara,
		WithinPara,
		AlignPara,
		FlattenPara,
		RectPara,
		CirclePara,
		TrianglePara,
		EllipsePara,
		LinkPara,
		PolarPara,
		ElementSketchFigure,
		CoordSketchFigure,
		LayoutSketchFigure
	},
	data() {
		return {
			valueList: [],
			staticValueList: [],
			Element: {},
			CoordinateSystem: {},
			Layout: {},
			relationDic: {
				'x-include-y-within': ['include', 'within'],
				'x-juxtapose-y-within': ['juxtapose', 'within'],
				'x-within-y-within': ['within', 'within'],
				'x-include-y-juxtapose': ['include', 'juxtapose'],
				'x-juxtapose-y-juxtapose': ['juxtapose', 'juxtapose'],
				'x-within-y-juxtapose': ['within', 'juxtapose'],
				'x-include-y-include': ['include', 'include'],
				'x-juxtapose-y-include': ['juxtapose', 'include'],
				'x-within-y-include': ['within', 'include'],
				'x-align-y-flatten': ['align', 'flatten'],
				'x-flatten-y-flatten': ['flatten', 'flatten'],
				'x-align-y-align': ['align', 'align'],
				'x-flatten-y-align': ['flatten', 'align']
			}
		}
	},
	props: {
		dslName: {
			type: String
		},
		dslObj: {
			type: Object
		}
	},
	watch: {
		attrObjArray: function() {
			this.valueList = [ {
				attrName: 'adaptive',
				attrType: 'default'
			} ]
			this.attrObjArray.forEach((attr) => { 
				this.valueList.push({...attr})
			})
			this.staticValueList = [ {
				attrName: 'static',
				attrType: 'default'
			} ]
			this.attrObjArray.forEach((attr) => { 
				this.staticValueList.push({...attr})
			})
		},
		treeUnitLayoutState: function() {
	        if (this.dslName === this.treeUnitDSLName) {
	          this.updateTreeUnitView()
	        }
	    }
		// manipulatePara: function() {
		// 	console.log('manipulateParaValue', this.manipulatePara)
		// },
		// manipulateValue: function() {
		// 	console.log('manipulateParaValue', this.manipulateValue)
		// },
		// hoverParam: function() {
		// 	console.log('hoverParam', this.hoverParam, this.hoverParamAxis)
		// }
	},
	created: function () {
	},
	beforeMount: function() {	
		this.Element = this.dslObj.Element
		this.CoordinateSystem = this.dslObj.CoordinateSystem
		this.Layout = this.dslObj.Layout
	},
	mounted: function() {
		// this.initParameterView()
	},
	created: function () {
		this.valueList = [ {
			attrName: 'adaptive',
			attrType: 'default'
		} ]
		this.attrObjArray.forEach((attr) => { 
			this.valueList.push({...attr})
		})
	},
	computed: {
		...mapState([
	    //   'rootLayoutComponent',
    	//   'subtreeLayoutComponent',
    	//   'nodeComponent',
   	 	//   'linkComponent',
		//   'coordComponent',
		  'attrObjArray',
		  'selectParaName',
		  'hoverParam',
		  'hoverParamAxis',
		  'manipulatePara',
		  'manipulateValue'
		]),
		hoverRoot() {
			return this.hoverParam === 'root' ? true : false
		},
		hoverSubtree() {
			return this.hoverParam === 'subtree' ? true : false
		},
		rootLayoutComponent: function() {
			// if ('Layout' in this.dslObj) {
			// 	if ('X' in this.dslObj.Layout) {
			// 		if ('Root' in this.dslObj.Layout.X) {
			// 			let root = this.dslObj.Layout.X.Root
			// 			if ('Padding' in root) {
			// 				if (isNaN(root.Padding[0])) {
			// 					root.Padding_ = [root.Padding[0].slice(-1), '']
			// 					root.Padding[0] = +root.Padding[0].slice(0, -1)
			// 				}
			// 				if (isNaN(root.Padding[1])) {
			// 					root.Padding_[1] = root.Padding[1].slice(-1)
			// 					root.Padding[1] = +root.Padding[1].slice(0, -1)
			// 				}
			// 			}
			// 			if ('Margin' in root) {
			// 				if (isNaN(root.Margin)) {
			// 					root.Margin_ = root.Margin.slice(-1)
			// 					root.Margin = +root.Margin.slice(0, -1)
			// 				}
			// 			}
			// 			root = this.dslObj.Layout.Y.Root
			// 			if ('Padding' in root) {
			// 				if (isNaN(root.Padding[0])) {
			// 					root.Padding_ = [root.Padding[0].slice(-1), '']
			// 					root.Padding[0] = +root.Padding[0].slice(0, -1)
			// 				}
			// 				if (isNaN(root.Padding[1])) {
			// 					root.Padding_[1] = root.Padding[1].slice(-1)
			// 					root.Padding[1] = +root.Padding[1].slice(0, -1)
			// 				}
			// 			}
			// 			if ('Margin' in root) {
			// 				if (isNaN(root.Margin)) {
			// 					root.Margin_ = root.Margin.slice(-1)
			// 					root.Margin = +root.Margin.slice(0, -1)
			// 				}
			// 			}
			// 			this.Layout = this.dslObj.Layout
			// 			return true
			// 		}
			// 	}
			// }
			// This component is only displayed when the root-layout parameter Relation is not 'Undefined' for the DSL
			if ('Layout' in this.dslObj) {
				// 	Assign a value to Layout for DSLObj
				if (('X' in this.dslObj.Layout) && ('Y' in this.dslObj.Layout)) {
					if (('Root' in this.dslObj.Layout.X) && ('Root' in this.dslObj.Layout.Y)) {
						if (('Relation' in this.dslObj.Layout.X.Root) 
								&& ('Relation' in this.dslObj.Layout.Y.Root)) {
							if ((this.dslObj.Layout.X.Root.Relation !== 'Undefined') 
								&& (this.dslObj.Layout.Y.Root.Relation !== 'Undefined')) {
								return true
							}
						}
					}
				}
			}
			return false
		},
		subtreeLayoutComponent: function() {
			// if ('Layout' in this.dslObj) {
			// 	if ('X' in this.dslObj.Layout) {
			// 		if ('Subtree' in this.dslObj.Layout.X) {
			// 			let subtree = this.dslObj.Layout.X.Subtree
			// 			if ('Margin' in subtree) {
			// 				if (isNaN(subtree.Margin)) {
			// 					subtree.Margin_ = subtree.Margin.slice(-1)
			// 					subtree.Margin = +subtree.Margin.slice(0, -1)
			// 				}
			// 			}
			// 			subtree = this.dslObj.Layout.Y.Subtree
			// 			if ('Margin' in subtree) {
			// 				if (isNaN(subtree.Margin)) {
			// 					subtree.Margin_ = subtree.Margin.slice(-1)
			// 					subtree.Margin = +subtree.Margin.slice(0, -1)
			// 				}
			// 			}
			// 			this.Layout = this.dslObj.Layout
			// 			return true
			// 		}
			// 	}
			// }
			// This component is only displayed when the DSL subtree-Layout parameter Relation is not 'Undefined'
			if ('Layout' in this.dslObj) {
				// 	Assign a value to Layout for DSLObj
				if (('X' in this.dslObj.Layout) && ('Y' in this.dslObj.Layout)) {
					if (('Subtree' in this.dslObj.Layout.X) && ('Subtree' in this.dslObj.Layout.Y)) {
						if (('Relation' in this.dslObj.Layout.X.Subtree) 
								&& ('Relation' in this.dslObj.Layout.Y.Subtree)) {
							if ((this.dslObj.Layout.X.Subtree.Relation !== 'Undefined') 
								&& (this.dslObj.Layout.Y.Subtree.Relation !== 'Undefined')) {
								return true
							}
						}
					}
				}
			}
			return false
		},
		nodeComponent: function() {
			if ('Element' in this.dslObj) {
				if ('Node' in this.dslObj.Element) {
					if (this.dslObj.Element.Node !== 'hidden') {
						this.Element = this.dslObj.Element
						return true
					}
				}
			}
			return false
		},
		linkComponent: function() {
			if ('Element' in this.dslObj) {
				if ('Link' in this.dslObj.Element) {
					if (this.dslObj.Element.Link !== "hidden") {
						this.Element = this.dslObj.Element
						return true
					}
				}
			}
			return false
		},
		coordComponent: function() {
			if ('CoordinateSystem' in this.dslObj) {
				this.CoordinateSystem = this.dslObj.CoordinateSystem
				return true
			} else {
				return false
			}
		}
	},
	methods: {
		...mapActions([
			'updateTreeUnitLayout'
		]),
		...mapMutations([
			'UPDATE_TREE_UNIT_LAYOUT_STATE',
			'UPDATE_TREE_CANVAS_LAYOUT_STATE',
			'UPDATE_TREE_PREVIEW_LAYOUT_STATE'
		]),
		changeDSL: function() {
			// let dsl={
			// 	Element: {...this.Element},
			// 	CoordinateSystem: {...this.CoordinateSystem},
			// 	Layout: {...this.Layout}
			// }
			// if (this.rootLayoutComponent !== false &&
			// 	this.subtreeLayoutComponent !== false &&
			// 	this.nodeComponent !== false &&
			// 	this.linkComponent !== false &&
			// 	this.coordComponent !== false) {
			// 	let dsl={
			// 		Element: {...this.Element},
			// 		CoordinateSystem: {...this.CoordinateSystem},
			// 		Layout: {...this.Layout}
			// 	}
			// }
			//	Update the TreeUnit view
			this.UPDATE_TREE_UNIT_LAYOUT_STATE()
		},
		changeCanvas: function() {
			// console.log('tianmin test', this.dslObj.Layout.X.Root.Padding)
			sysDatasetObj.updateTreeDSLContentObject(this.dslName, this.dslObj)
			this.UPDATE_TREE_CANVAS_LAYOUT_STATE()
			// 	Updates the DSL object selected in the DSLlist view
			sysDatasetObj.updateSelectedDSLObject(this.dslName, this.dslObj)
			this.UPDATE_TREE_PREVIEW_LAYOUT_STATE()
		}
 	}
  }
</script>

<style lang="less">
	.treedsl-parameter {
		.head-component-divider {
			display: block;
			height: 1px;
			width: 100%;
			margin-top: 8px;
			margin-bottom: 5px;
			position: relative;
		}
		.component-divider {
			display: block;
			height: 1px;
			width: 100%;
			margin-top: 5px;
			margin-bottom: 5px;
			background-color: #DCDFE6;
			position: relative;
		}
		.el-divider--horizontal {
			margin-top: 15px !important;
			margin-bottom: 10px !important;
			margin-left: 5px !important;
		}
		.el-divider__text {
			color: lightgray !important;
			font-weight: bold !important;
		}
		.el-divider {
			background-color: lightgray !important;
		}
		.el-color-picker--mini {
			vertical-align: middle;
		}
	}

</style>
<style scoped lang="less">
.treedsl-parameter {
	overflow-y: auto;
	overflow-x: hidden;
}
#root_panel {
	width: 100%;
}
.el-row {
    margin-bottom: 5px;
}
.panel_img {
	// background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.4rem;
	height: 5rem;
}
.panel_axis {
	// background: antiquewhite;
	// border: 1px solid rgb(148, 144, 144);
	// border-radius: 0.4rem;
	height: 100%;
}
.hoverComponent {
	padding: 3px 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    transition: ease 0.75s;
}
</style>
