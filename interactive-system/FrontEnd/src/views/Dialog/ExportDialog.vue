<template>
 	<el-row :gutter="24" class="export-panel">
        <el-col :offset="2" :span="20">
          <el-card shadow="hover">
            <div size='mini' class='grid-content' type='text' @click='save_as_png'>
              <span><i class='icon iconfont icon-png download-icon' slot='suffix'></i></span>
              &nbsp;
              <span class="grid-content-title">Export as PNG</span>
              <br />
              <br />
              <span class="grid-content-main">
                PNG is a bitmap image format which made up of a fixed number of pixels. They have a fixed resolution and cannot be scaled. 
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col :offset="2" :span="20">
          <el-card shadow="hover">
            <div size='mini' class='grid-content' type='text' @click='save_as_svg'>
              <span><i class='icon iconfont icon-svg download-icon' slot='suffix'></i></span>
              &nbsp;
              <span class="grid-content-title">Export as SVG</span>
              <br />
              <br />
              <span class="grid-content-main">
                SVG is a vector image format which uses geometric forms to represent differet parts as discrete objects and are infinitely scalable. 
              </span>
            </div>
          </el-card>
        </el-col>
        <el-col :offset="2" :span="20">
          <el-card shadow="hover">
            <div size='mini' class='grid-content' type='text' @click='save_as_json'>
              <span><i class='icon iconfont icon-format1 download-icon' slot='suffix'></i></span>
              &nbsp;
              <span class="grid-content-title">Export as JSON</span>
              <br />
              <br />
              <span class="grid-content-main">
                JSON is a lightweight data-interchange format. This serves as the visualization template. 
              </span>
            </div>
          </el-card>
        </el-col>
    </el-row> 
</template>

<script>
  import saveSvgAsPng from 'save-svg-as-png'
  import d3_save_svg from 'd3-save-svg'
  import SimplifyDsl from '@/data-processing/simplify_dsl'
  import { mapMutations, mapState } from 'vuex'
  export default {
	name: 'ExportDialog',
	components: {

	},
	data() {
		return {
			appName: 'gotree'
		}
	},
	created: function () {
	
	},
	mounted: function() {

	},
	computed: {
		...mapState([
		  'layoutParas',
		  'selectedDataset',
		  'focusedTreeObjArray'
		])
	},
	methods: {
		save_as_png: function() {
	        let imageName = this.getDownloadFileName()
	        let treeCanvasSvgId = 'tree-dsl-svg-canvas'
	        let treeCanvasId = 'tree-dsl-canvas'
	        let treeSvg = d3.select(document.getElementById(treeCanvasSvgId))
	        let treeCanvasG = treeSvg.select('#' + treeCanvasId)
	        treeCanvasG.selectAll('.mark-line').attr('display', 'none')
	        // treeCanvasG.selectAll('.canvas-region-outer').attr('display', 'none')
	        treeCanvasG.select('.tree-g').selectAll('.resize-circle-g').attr('display', 'none')
	        saveSvgAsPng.saveSvgAsPng(treeSvg.node(), imageName).then(function () {
	          treeCanvasG.selectAll('.mark-line').attr('display', null)
	          // treeCanvasG.selectAll('.canvas-region-outer').attr('display', null)
	          treeCanvasG.select('.tree-g').selectAll('.resize-circle-g').attr('display', null)
	        })
	    },
		save_as_svg: function() {
			var config = {
			    filename: this.getDownloadFileName()
			}
			$('#tree-dsl-svg-canvas #index-0-g').clone().appendTo($('#tree-dsl-svg-canvas-copy'));
			// let svgInfo = d3_save_svg.getSVG(d3.select('#tree-dsl-svg-canvas-copy').node(), config);
            d3_save_svg.save(d3.select('#tree-dsl-svg-canvas-copy').node(), config);
			setTimeout(function() {
				$('#tree-dsl-svg-canvas-copy #index-0-g').remove();
			}, 1000)
			// $('#tree-dsl-svg-canvas-copy #index-0-g').remove();
			// let treeRenderResults = d3.select('#tree-dsl-svg-canvas').select('#index-0-g').node()
			// d3.select('#tree-dsl-svg-canvas-copy').append(treeRenderResults)
			// d3.select('#tree-dsl-svg-canvas-copy').node()
			// console.log('#index-0-g', d3.select('#tree-dsl-svg-canvas').select('#index-0-g').node())
			// console.log('tree-dsl-svg-canvas', d3.select('#tree-dsl-svg-canvas').node())
			// d3_save_svg.save(d3.select('#tree-dsl-svg-canvas').select('#index-0-g').node(), config);
		},
		save_as_json: function() {
	        let layoutParas = sysDatasetObj.getLayoutParas()
	        let treeDSLContentObj = layoutParas.treeDSLContentObj
	        for (let item in treeDSLContentObj) {
	        	let dslObj = treeDSLContentObj[item]
				// console.log('????', dslObj.Layout.X.Root.Padding)
				// console.log('!!!', treeDSLContentObj)
	        	let simplifyDSLObj = SimplifyDsl(dslObj)
	        	let fileName = 'GoTree-template-' + item + '.json'
	        	download(simplifyDSLObj, fileName, 'text/json');
	        }
	        function download(content, fileName, contentType) {
	            let contentStr = JSON.stringify(content)
	            var a = document.createElement("a");
	            var file = new Blob([contentStr], {type: contentType});
	            a.href = URL.createObjectURL(file);
	            a.download = fileName;
	            a.click();
	        }
	    },
	    getDownloadFileName: function() {
	    	let currentTreeDSLName = this.getCurrentDSLName()
            let selectedTreeDataName = sysDatasetObj.selectedTreeDataName
	    	let datasetName = selectedTreeDataName.replace('.json', '')
	    	return 'GoTree-' + datasetName + currentTreeDSLName
	    },
	    getCurrentDSLName: function() {
			let currentTreeDSLArray = []
			let layoutParas = sysDatasetObj.getLayoutParas()
			let focusedTreeObjArray = this.focusedTreeObjArray
			let treeIndexWithDSL = layoutParas.treeIndexWithDSL
			for(let item in treeIndexWithDSL) {
				//  confirm it is the selected node
				if (focusedTreeObjArray.indexOf(item) !== -1) {
					let dslName = treeIndexWithDSL[item]
					if (currentTreeDSLArray.indexOf(dslName) === -1) {
			            currentTreeDSLArray.push(dslName)
			        }
				}
			}
			let currentTreeDSLName = ''
			// update the selected dsl list
			this.currentTreeDSLArray = currentTreeDSLArray
			for (let i = 0; i < currentTreeDSLArray.length; i++) {
				currentTreeDSLName = currentTreeDSLName + '-' + currentTreeDSLArray[i]
			}
			return currentTreeDSLName
		}
	}
  }
</script>

<style lang="less">
	.el-col.el-col-20 {
		margin-top: 10px;
		margin-bottom: 10px;
		cursor: pointer;
	}
</style>
