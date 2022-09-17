<template>
  <div class='single-preview-figure-container' ref="dslPreviewContainer" 
        @mouseover="parentMouseover" @mouseout="parentMouseout" @click="parentClick">
      <div class="dsl-figure">
        <svg class="dsl-preview-canvas" ref="dslPreviewCanvas">
          <g class='tree-preview-g' :id="treeGId"></g>
        </svg>
      </div>
      <div class="dsl-name">{{dslId}}</div>
      <div class="icon-group" ref="previewIconGroup" :style="iconStyleObject">
        <div class="icon iconfont icon-check operation-replace"
              :class="{ hovering: defaultOperation === 'replace'}"
              v-if="existedInOperation('replace')" 
              @click="_replaceExistedTree($event)" @mouseover="childHover"></div>
        <div class="icon iconfont icon-shoucangmiaobian operation-save2gallery" 
              :class="{ hovering: defaultOperation === 'save2gallery'}"
              v-if="existedInOperation('save2gallery') && (!existedInGallery())" 
              @click="_addTemplate2Library($event)" @mouseover="childHover"></div>
        <div class="icon iconfont icon-shoucang operation-save2gallery"
              :class="{ hovering: defaultOperation === 'save2gallery'}" 
              v-if="existedInOperation('save2gallery') && (existedInGallery())" 
              @click="_addTemplate2Library($event)" @mouseover="childHover"></div>
        <div class="icon iconfont icon-xiazai operation-download" 
              :class="{ hovering: defaultOperation === 'download'}" 
              v-if="existedInOperation('download')" 
              @click="_downloadTemplate($event)" @mouseover="childHover"></div>
        <div class="icon iconfont icon-tianjia operation-add2dsllist" 
              :class="{ hovering: defaultOperation === 'add2dsllist'}" 
              v-if="existedInOperation('add2dsllist')" 
              @click="_add2DSLList($event)" @mouseover="childHover"></div>
        <div class="icon iconfont icon-iconfontshanchu operation-dsllist-remove" 
              :class="{ hovering: defaultOperation === 'dsllist-remove'}" 
              v-if="existedInOperation('dsllist-remove')" 
              @click="_removeTemplateFromDsllist($event)" @mouseover="childHover"></div>
        <div class="icon iconfont icon-iconfontshanchu operation-gallery-remove"
              :class="{ hovering: defaultOperation === 'gallery-remove'}" 
              v-if="existedInOperation('gallery-remove')" 
              @click="_removeTemplateFromGallery($event)" @mouseover="childHover"></div>
      </div>
  </div>
</template>

<script> 
  import { mapState, mapActions } from 'vuex';
  import { extractTreeIndexWithDSL } from '@/data-processing/extract_tree_index_with_dsl.js'
  import { getTreeLayout } from '@/data-processing/get_tree_layout.js'
  import { getNodeLinkAttr } from '@/data-processing/get_node_link_attr.js'
  import { getLayoutValue } from '@/data-processing/get_layout_value.js'
  import { getLinkStrokeWidth } from '@/treevis-style/get_link_stroke_width.js'
  import { tweenPaths } from 'svg-tween'
  import { tween } from 'svg-tween'
  import { getTreeNodeStyle } from '@/treevis-style/get_tree_node_style.js'
  import { getTreeLinkStyle } from '@/treevis-style/get_tree_link_style.js'
  import { addDefaultCoordElement } from '@/data-processing/add_default_coord_element.js'
  import SimplifyDsl from '@/data-processing/simplify_dsl'

  export default {
    name: 'SinglePreviewFigure',
    components: {
    },
    props: {
      dslId: {
        type: String
      },
      getTreeDSLObj: {
        type: Function
      },
      operation: {
        type: Array
      },
      replaceExistedTree: {
        type: Function
      },
      addTemplate2Library: {
        type: Function
      },
      downloadTemplate: {
        type: Function
      },
      removeTemplateFromDsllist: {
        type: Function
      },
      removeTemplateFromGallery: {
        type: Function
      },
      add2DSLList: {
        type: Function
      },
      defaultOperationFunc: {
        type: Function
      }
    },
    data() {
      return {
        treeGId: 'preview-g',
        treeViewPosLenObj: {},
        currentTreeDSLArray: [],
        AreaData: {},
        focusedTreeNodeArray: [],
        DURATION: 1000,
        iconStyleObject: {left: 0, right: 0},
        IconWidth: 30,
        defaultOperation: null,
        replaceExistedTreeTip: 'replace current GoTree template',
        addTemplate2LibraryTip: 'add GoTree template to library',
        downloadTemplateTip: 'download GoTree template',
        add2DSLListTip: 'add GoTree template to DSLList panel',
        removeTemplateFromDsllistTip: 'remove GoTree template from DSLList panel',
        removeTemplateFromGalleryTip: 'remove GoTree template from gallery'
      }
    },
    created: function() {},
    mounted: function() {
      let self = this
      setTimeout(function() {
        self.updateElementAttr()
        self.initTreePreviewCanvas()
        self.getPreViewTreeLayout()
        self.adjustIconGroup2Center()
      }, 50)
    },
    updated: function() {
      let self = this
    },
    watch: {
      changedDSLNameState: function() {
        // this.getPreViewTreeLayout()
        if (this.treeUnitDSLName === this.dslId) {
          this.getPreViewTreeLayout()
        }
      },
      treePreviewLayoutState: function() {
        if (this.treeUnitDSLName === this.dslId) {
          this.getPreViewTreeLayout()
        }
      },
      operation: function() {
        this.adjustIconGroup2Center()
      }
    },
    computed: {
      ...mapState([
        'changedDSLNameState',
        'treeUnitDSLName',
        'treePreviewLayoutState'
      ])
    },
    methods: {
      _replaceExistedTree: function(event) {
        event.stopPropagation()
        if (typeof(this.replaceExistedTree) !== 'undefined') {
          let dslId = this.dslId
          let treeDSLObj = this.getTreeDSLObj(dslId)
          this.replaceExistedTree(dslId, treeDSLObj)
        }
      },
      _addTemplate2Library: function(event) {
        event.stopPropagation()
        if (typeof(this.addTemplate2Library) !== 'undefined') {
          let dslId = this.dslId
          this.addTemplate2Library(dslId)
        }
      },
      _downloadTemplate: function(event) {
        event.stopPropagation()
        if (typeof(this.downloadTemplate) !== 'undefined') {
          this.downloadTemplate()
        } else {
          // local function to save the dsl object as json file
          this.save_as_json()
        }
      },
      _removeTemplateFromDsllist: function(event) {
        event.stopPropagation()
        if (typeof(this.removeTemplateFromDsllist) !== 'undefined') {
          this.removeTemplateFromDsllist(this.dslId)
        }
      },
      _removeTemplateFromGallery: function(event) {
        event.stopPropagation()
        if (typeof(this.removeTemplateFromGallery) !== 'undefined') {
          this.removeTemplateFromGallery(this.dslId)
        }
      },
      _add2DSLList: function(event) {
        event.stopPropagation()
        if (typeof(this.add2DSLList) !== 'undefined') {
          this.add2DSLList(this.dslId)
        }
      },
      childHover: function(event) {
        event.stopPropagation()
      },
      parentMouseover: function() {
        if (this.operation.length > 0) {
          this.defaultOperation = this.operation[0]
        }
      },
      parentMouseout: function() {
        this.defaultOperation = null
      },
      parentClick: function() {
        this.defaultOperationFunc(this.dslId)
      },
      existedInGallery: function() {
        let existedStateInGallery = sysDatasetObj.isTemplateExisted(this.dslId)
        return existedStateInGallery
      },
      existedInOperation: function(operation_name) {
        if (this.operation.indexOf(operation_name) !== -1) {
          return true
        } else {
          return false
        }
      },
      preview_hovering: function() {
        console.log('preview_hovering')
      },
      save_as_json: function() {
          let dslId = this.dslId
          let treeDSLObj = this.getTreeDSLObj(dslId)
          let simplifyDSLObj = SimplifyDsl(treeDSLObj)
          let fileName = 'GoTree-template-' + this.dslId + '.json'
          download(simplifyDSLObj, fileName, 'text/json');
          function download(content, fileName, contentType) {
              let contentStr = JSON.stringify(content)
              var a = document.createElement("a");
              var file = new Blob([contentStr], {type: contentType});
              a.href = URL.createObjectURL(file);
              a.download = fileName;
              a.click();
          }
      },
      updateElementAttr: function() {
        this.dslPreviewCanvasHeight = this.$refs.dslPreviewCanvas.clientHeight
        this.dslPreviewCanvasWidth = this.$refs.dslPreviewCanvas.clientWidth
        this.dslPreviewContainerHeight = this.$refs.dslPreviewContainer.clientHeight
        this.dslPreviewContainerWidth = this.$refs.dslPreviewContainer.clientWidth
        this.previewIconGroupHeight = this.$refs.previewIconGroup.clientHeight
      },
      adjustIconGroup2Center: function() {
        let self = this
        let previewIconGroupHeight = this.previewIconGroupHeight
        let previewIconGroupWidth = this.IconWidth //this.$refs.previewIconGroup.clientWidth
        let operationNum = this.operation.length
        if (operationNum > 1) {
          previewIconGroupWidth = this.IconWidth * 2
        }
        let dslPreviewContainerHeight = this.dslPreviewContainerHeight
        let dslPreviewContainerWidth = this.dslPreviewContainerWidth
        let posLeft = (dslPreviewContainerWidth - previewIconGroupWidth) / 2
        let posTop = (dslPreviewContainerHeight - previewIconGroupHeight) / 2
        this.iconStyleObject = {
          left: posLeft + 'px',
          top: posTop + 'px'
        }
      },
      initTreePreviewCanvas: function() {
        let dslPreviewCanvasHeight = this.dslPreviewCanvasHeight
        let dslPreviewCanvasWidth = this.dslPreviewCanvasWidth
        let paddingLeft = dslPreviewCanvasWidth * 0.05, paddingRight = dslPreviewCanvasWidth * 0.05,
            paddingTop = dslPreviewCanvasHeight * 0.05, paddingBottom = dslPreviewCanvasHeight * 0.05;
        let dslPreviewWidth = dslPreviewCanvasWidth - paddingLeft - paddingRight
        this.dslPreviewWidth = dslPreviewWidth
        let dslPreviewHeight = dslPreviewCanvasHeight - paddingTop - paddingBottom
        this.dslPreviewHeight = dslPreviewHeight
        d3.select(this.$el)
          .select('.tree-preview-g')
          .attr('transform', 'translate(' + paddingLeft + ',' + paddingTop + ')')
        this.treeViewPosLenObj = {
          x: 0, y: 0,
          width: dslPreviewWidth,
          height: dslPreviewHeight
        }
      },
      updateCurrentDSLArray: function() {
        let self = this
        let currentTreeDSLArray = []
        let focusedTreeObjArray = this.focusedTreeObjArray
        let layoutParas = sysDatasetObj.getLayoutParas()
        let treeIndexWithDSL = layoutParas.treeIndexWithDSL
        for (let i = 0; i < focusedTreeObjArray.length; i++) {
          let treeObjIndex = focusedTreeObjArray[i]
          let dslItem = treeIndexWithDSL[treeObjIndex] 
          if (typeof(dslItem) === "undefined") {
            dslItem = treeIndexWithDSL.default
          }
          if (currentTreeDSLArray.indexOf(dslItem) === -1) {
            currentTreeDSLArray.push(dslItem)
          }
        }
        this.currentTreeDSLArray = currentTreeDSLArray
      },
      generateTreeIndexWihDSL: function(focusedTreeNodeArray, dslId) {
        let treeIndexWithDSL = {}
        for(let i = 0;i < focusedTreeNodeArray.length;i++) {
          let treeIndex = focusedTreeNodeArray[i].data.index
          treeIndexWithDSL[treeIndex] = dslId
        }
        return treeIndexWithDSL
      },
      getPreViewTreeLayout: function() {
        let self = this
        let treeUnitDataObj = sysDatasetObj.getTreeUnitDataset()
        if (!('x' in this.treeViewPosLenObj)) {
          return
        }
        let dslId = this.dslId
        if (typeof(treeUnitDataObj) !== 'undefined') {
            // let treeIndexWithDSL = {default: dslId}
            let focusedTreeNodeArray = sysDatasetObj.computeNodeArray(treeUnitDataObj)
            let treeIndexWithDSL = self.generateTreeIndexWihDSL(focusedTreeNodeArray, dslId)
            this.focusedTreeNodeArray = focusedTreeNodeArray
            let dslContentObject = {}
            dslContentObject[dslId] = this.getTreeDSLObj(dslId)
            if (typeof(dslContentObject[dslId]) === 'undefined') {
              return;
            }
            let dslContentObjectWithDefault = addDefaultCoordElement(dslContentObject)
            let parasObj = {
              hierarchicalData: treeUnitDataObj, 
              treeDSLContentObj: dslContentObjectWithDefault, 
              treeIndexWithDSL: treeIndexWithDSL
            }
            getLayoutValue(parasObj).then(function(treeLayouts) {
              self.renderPreViewTree(treeLayouts, dslContentObjectWithDefault, treeIndexWithDSL, focusedTreeNodeArray, parasObj)
            })
        }
      },
      //  render the preview Tree panel
      renderPreViewTree: function(treeLayouts, dslContentObject, treeIndexWithDSL, focusedTreeNodeArray, parasObj) {
        let treeViewPosLenObj = this.treeViewPosLenObj
        let AreaData = getTreeLayout(treeIndexWithDSL, dslContentObject, treeLayouts, focusedTreeNodeArray, treeViewPosLenObj)
        this.AreaData = AreaData
        let dslPreviewWidth = this.dslPreviewWidth, dslPreviewHeight = this.dslPreviewHeight
        let [areaDataArray, linkDataArray] = getNodeLinkAttr(AreaData, dslContentObject, treeIndexWithDSL, treeViewPosLenObj, focusedTreeNodeArray)
        areaDataArray = getTreeNodeStyle(areaDataArray, dslContentObject, treeIndexWithDSL, focusedTreeNodeArray)
        linkDataArray = getTreeLinkStyle(linkDataArray, AreaData, dslContentObject, treeIndexWithDSL, focusedTreeNodeArray,dslPreviewWidth, dslPreviewHeight)
        //  calculate the parameters in the axis
        this.renderTreeLink(linkDataArray, parasObj)
        this.renderTreeNode(areaDataArray)
        // this.renderTreeNodeLabel(areaDataArray)
      },
      //  render the link between different nodes
      renderTreeLink: function (linkDataArray, parasObj) {
        let self = this
        let currentRootGId = self.treeGId
        // render the link
        let linkElements = d3.select(this.$el)
          .select('#' + currentRootGId)
          .selectAll('.link')
          .data(linkDataArray) 
        // render the nodes
        linkElements.enter()
          .append('path')
          .attr('id', function(d, i) {
            return 'link' + d.beginid + 'to' + d.endid
          })
          .attr('class', function(d, i) {
            return 'link' + ' link-parent-' + d.beginid + ' link-child-' + d.endid
          })
          .attr('d', function(d, i){
            return d.pathAttr
          })
          .attr('stroke-width', function(d, i) {
            return d.link_width
          })
          .attr('fill', 'none')
        let fromLinkArray = []
        let toLinkArray = []
        let linkPathArray = []
        linkElements.each(function(d, i) {
          let currentPath = d3.select(this).attr("d")
          if ((currentPath != null) && (typeof(currentPath) !== 'undefined')) {
            fromLinkArray.push(currentPath)
          }
          let targetPath = d.pathAttr
          if ((targetPath != null) && (typeof(targetPath) !== 'undefined')) {
            toLinkArray.push(targetPath)              
          }
          linkPathArray.push(d3.select(this).node())
          //  Animation transition of other styles except for the path shape
          d3.select(this)
            .transition()
            .duration(self.DURATION)
            .attr('stroke-width', function(d, i) {
              return d.link_width
            })
            .attr('fill','none')
        })
        linkElements.exit().remove()
        //  Animation of deformation of the path connected between nodes
        let tweenLinkPathsCallback = function () {
          linkElements.each(function(d, i) {
            d3.select(this)
              .attr('d', d.pathAttr)
          })
        }
        //  Determine whether the objects in fromLinkArray and toLinkArray are null
        if ((fromLinkArray.length > 0) && (toLinkArray.length > 0)) {
          if ((fromLinkArray.length === toLinkArray.length) && (fromLinkArray[0] != null) && (toLinkArray[0] != null) && 
              (typeof(fromLinkArray[0]) !== 'undefined') && (typeof(toLinkArray[0]) !== 'undefined')) {
          tweenPaths({duration: self.DURATION, complete: tweenLinkPathsCallback, from: fromLinkArray, to: toLinkArray, next: (d, i) => linkPathArray[ i ].setAttribute('d', d)})
          }
        } else {
          tweenLinkPathsCallback()
        }
      },
      renderTreeNodeLabel: function (areaDataArray) {
        let currentRootGId = this.treeGId
        let treeNodeLabelElement = d3.select(this.$el)
          .select('#'+currentRootGId)
          .selectAll('.node-label')
          .data(areaDataArray, function(d, i) {
            return d.id
          })
        treeNodeLabelElement.enter()
          .append('text')
          .attr('class','node-label')
          .attr('id',function(d){
            return 'node-label-'+d.id
          })
          // .attr('dy','.35em')
          .attr('transform', function(d) {
            return 'translate(' + d.labelPos.x + ',' + d.labelPos.y + ')rotate(' + d.rotation +')' 
          })
          .style('text-anchor', function(d) {
            return d.textAnchor
          })
          .style('alignment-baseline', 'middle')
          .style('font-size', function(d) {
            return d.fontSize
          })
          .text(function(d, i) {
            if (typeof(d.labelValue) !== 'undefined') {
              if (d.labelValue.length > 2) {
                return d.labelValue.substring(0, 1) + ' .'
              }
              return d.labelValue
            }
          })
        treeNodeLabelElement.transition()
          .duration(self.DURATION)
          // .attr('dy','.35em')
          .attr('transform', function(d) {
            return 'translate(' + d.labelPos.x + ',' + d.labelPos.y + ')rotate(' + d.rotation +')' 
          })
          .style('text-anchor', function(d) {
            return d.textAnchor
          })
          .style('font-size', function(d) {
            return d.fontSize
          })
          .text(function(d, i) {
            if (typeof(d.labelValue) !== 'undefined') {
              if (d.labelValue.length > 2) {
                return d.labelValue.substring(0, 1) + ' .'
              }
              return d.labelValue
            }
          })
          treeNodeLabelElement.exit().remove()
      },
      //  render the nodes in the tree
      renderTreeNode: function (areaDataArray) {
        let self = this
        let currentRootGId = self.treeGId
        //  Calculate the maximum depth of hierarchical data
        let maxdepth = 1
        let existedNaN = false
        for (let i = 0; i < areaDataArray.length; i++) {
          if (maxdepth < areaDataArray[i].depth) {
            maxdepth = areaDataArray[i].depth
          }
          if (areaDataArray[i].element.indexOf('NaN') !== -1) {
            existedNaN = true
          }
        }
        if (existedNaN) {
          return
        }
        let treeNodeElement = d3.select(this.$el)
          .select('#' + currentRootGId)
          .selectAll('.lineartree-node')
          .data(areaDataArray, function(d, i) {
            return d.id
        })
        //  create visual elements
        treeNodeElement.enter()
          .append('path')
          .attr('class', 'lineartree-node')
          .attr('id',function(d,i) {
            return 'rootnode'+d.id
          })
          .attr('d', function(d, i) {
            return d.element
          })
          // .on("dblclick",doubleclick)
          .attr('fill', function(d) {
            return d.node_color
          })
          .style('stroke-width', function(d, i) {
            return d.link_width
          })
          .style("opacity",1)  
          let fromArray = []
          let toArray = []
          let pathArray = []
          treeNodeElement.each(function(d, i) {
            let targetAnimationPath = d.element
            let currentAnimationPath = d3.select(this).attr("d")
            pathArray.push(d3.select(this).node())
            fromArray.push(currentAnimationPath)
            toArray.push(targetAnimationPath)
            //  Animation transition of other styles except path
            d3.select(this)
              .transition()
              .duration(self.DURATION)
              .attr('fill', function (d) { return d.node_color })
              .style('stroke-width', function(d, i) {
                return d.link_width
              })
              .style("opacity",1)
          })
          let tweenPathsCallback = function () {
            treeNodeElement.each(function(d, i) {
              let targetPath = d.element
              d3.select(this)
                // .attr('transform', targetTransform)
                .attr('d', targetPath)
            })
          }
          if ((fromArray.length > 0) && (toArray.length > 0)) {
            if ((fromArray.length === toArray.length) && (fromArray[0] != null) && (toArray[0] != null) && 
                (typeof(fromArray[0]) !== 'undefined') && (typeof(toArray[0]) !== 'undefined')) {
            tweenPaths({duration: self.DURATION, complete: tweenPathsCallback, from: fromArray, to: toArray, next: (d, i) => pathArray[ i ].setAttribute('d', d)})
            }
          } else {
            tweenPathsCallback()
          }
          //  remove the redundant visual elements
          treeNodeElement.exit().remove()  
          //  the mouse over events
          function mouseover(d) {
            d3.select("#NodeLabel").style("visibility", "visible")
            d3.select("#NodeLabel").style("opacity", .9)
            let value = 0
            let name = 'a'
            for (let i=0; i < nodeArray.length; i++) {
              if (nodeArray[i].data.index === d.id) {
                value = nodeArray[i].data.value
                name = nodeArray[i].data.name
                break
              }
            }
            d3.select("#NodeLabel").html(NodeLabelHtml(name,value))
              .style("left", (d3.event.pageX - 28) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
          }
          //  Hover displays text layout in label
          function NodeLabelHtml(name,value) {
            return "<h4>"+"name: "+name+"<br/>"+"value: "+value+"</h4><table>";
          }
          //  the mouseout event
          function mouseout(d) {
            d3.select("#NodeLabel").style("visibility", "hidden")
          }
      }
    }
  }
</script>
<style lang="less">
  .single-preview-figure-container {
    .dsl-figure {
      .dsl-preview-canvas {
        .link {
          stroke: black;
        }
      }
    }
  }
</style>
<style scoped lang="less">
  .single-preview-figure-container {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    position: relative;
    width: 100%;
    height: 100%;
      .dsl-figure {
        width: 100%;
        height: 75%;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat; 
        .dsl-preview-canvas {
          width: 100%;
          height: 100%;
        }
      }
      .dsl-name {
        width: 100%;
        height: 15%;
        font-size: 12px;
        text-align: center;
      }
  }
  .single-preview-figure-container:after {
    content: '\A';
    position: absolute;
    width: 100%; 
    height:100%;
    top:0; 
    left:0;
    background:rgba(0,0,0);
    opacity: 0;
    transition: all 0.3s;
    -webkit-transition: all 0.3s;
  }
  .single-preview-figure-container:hover:after {
    opacity: 0.5;
    background: black;
  }
  .single-preview-figure-container:hover > .icon-group {
    visibility: visible !important;
    .iconfont {
      color: white;
    }
  }    
  .icon-group {
    z-index: 10;
    max-width: 60px;
    position: absolute;
    cursor: pointer;
    visibility: hidden;
    .iconfont {
      margin: 6.5px;
      display: inline-block;
      &:hover {
        color: red !important;
      }
      &.hovering {
        color: red !important;
      }
    }
  }
</style>