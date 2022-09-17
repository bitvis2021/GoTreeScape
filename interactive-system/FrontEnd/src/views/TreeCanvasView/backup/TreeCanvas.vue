<template>
  <div class='container' :id="treeCanvasContainerId">
    <svg class='tree-canvas-copy':id="treeCanvasSvgIdCopy" :viewBox="svgViewBoxAttr">
    </svg>
    <svg class='tree-canvas' ref="treeCanvas" :id="treeCanvasSvgId">
      <g :id="treeCanvasId"></g>
    </svg>
    <div id="NodeLabel"></div>
  </div>
</template>

<script>
/* eslint-disable no-console */
/* jshint esversion: 8 */
/* eslint-disable no-undef */
import { mapState, mapMutations, mapActions } from 'vuex'
import { Cartesian } from '@/coordinatesystem/cartesian.js'
import { Polar } from '@/coordinatesystem/polar.js'
import { getTreeLayout } from '@/data-processing/get_tree_layout.js'
import { getLayoutValue } from '@/data-processing/get_layout_value.js'
import { getNodeLinkAttr } from '@/data-processing/get_node_link_attr.js'
import { extractTreeIndexWithDSL } from '@/data-processing/extract_tree_index_with_dsl.js'
import { tweenPaths } from 'svg-tween'
import { tween } from 'svg-tween'
import OriginalDataView from './OriginalDataView.vue'
import { getTreeNodeStyle } from '@/treevis-style/get_tree_node_style.js'
import { getTreeLinkStyle } from '@/treevis-style/get_tree_link_style.js'
import { addDefaultCoordElement } from '@/data-processing/add_default_coord_element.js'
import { treeNodeValidate, treeLayoutValidate, areaDataValidate } from '@/error/ErrorValidate.js';
import { throwGoTreeError } from '@/error/GoTreeError.js';

export default {
  name: 'TreeCanvas',
  props: {
    treeCanvasKey: {
      type: Number
    },
    sendSVGData: {
      type: Boolean,
      default: false
    },
    dslObj: {
      type: Object
    },
    dslIndex: {
      type: Number
    }
  },
  data() {
    return {
      nodeArray: [],
      hierarchicalData: {},
      layoutParas: {},
      //  The ID of the SVG used to draw the visual form of the tree
      treeCanvasSvgId: 'tree-dsl-svg-canvas',
      //  A copy of SVG to draw a visual form of the tree
      treeCanvasSvgIdCopy: 'tree-dsl-svg-canvas-copy',
      //  The ID of the div outside the SVG used to draw the tree visualization
      treeCanvasContainerId: 'tree-dsl-canvas-container',
      //  The ID of G inside the SVG used to draw the visual form of the tree
      treeCanvasId: 'tree-dsl-canvas',
      //  The ID of the rectangle that shows the size of the tree that the user can draw
      treeCanvasRectId: 'canvas-region-outer-rect',
      //  How long it takes to animate the transform
      DURATION: 1000,
      //  The user clicks on the selected subtree object
      selectedItem: null,
      //  A collection of objects used to control the position and length of nodes in a subtree
      posLenCollectionObj: {},
      //  A collection of lines between cut subtrees
      regionOuterRectPos: {},
      //  Class of G added to SVG
      singleTreeG: 'tree-g',
      //  How long it takes to animate
      POSITION_DURATION: 900,
      colorAttr: 'depth',
      treeViewPosLenObj: {},
      currentRootID: 'index-0',
      treeGId: 'index-0-g',
      previewPanelOpen: false, // The initial Preview view is off
      hybridNodeObjectNum: 10,
      OPEN_PREVIEW_PANEL_DURATION: 500,
      horizontalArray: [0, 0.5, 1], //  Horizontal position of the control line
      verticalArray: [0, 0.5, 1], //  The position of the longitudinal control line
      treeViewWidth: 0, // Draws the width of the hierarchical data view
      treeViewHeight: 0, // Draws the height of the hierarchical data view
      viewWidth: 0, //  Width of view
      viewHeight: 0, //  Height of view
      layouts: {}, // The calculated node layout
      areaDataArray: [],  
      AreaData: {}, //  AreaData is an object to save all the positions and sizes of the visual element in tree visualization
      linkDataArray: [],  
      treeNodeErrorMessage: 'The width or height of tree nodes is less than zero.',
      treeNodeHintMessage: 'Please change the unit or reduce the value of margin or padding.',
      svgViewBoxAttr: "0 0 0 0"
    }
  },
  components: {
    OriginalDataView
  },
  created: function() {},
  mounted: function() {
    let self = this
    self.adjustTreeCanvas()
    self.addZoomFunc()
    self.updateSVGViewbox()
    console.log('dslObj', this.dslObj)
    console.log('dslIndex', this.dslIndex)
  },
  watch: {
    // The calculated layout is stored in the state's layout parameter, and if the data changes, the method is called and updated accordingly
    treeCanvasKey: function() {
      this.adjustTreeCanvas()
      this.updateTreeVisResults()
      this.updateSVGViewbox()
    },
    assignRecursiveMode: function() {
      this.highlightFocusedTreeObjIdArray(this.previewTreeObj)
    },
    assignNodeQuery: function() {
      this.highlightFocusedTreeObjIdArray(this.previewTreeObj)
    },
    changedDSLNameState: function() {
      let layoutParas = sysDatasetObj.getLayoutParas()
      let dslContentObject = layoutParas.treeDSLContentObj
      if ((typeof(dslContentObject) !== 'undefined') && (this.treeUnitDSLName != null)) {
        if (typeof(dslContentObject[this.treeUnitDSLName]) !== 'undefined') {
          this.updateTreeVisResults()
        }        
      }
    },
    treeCanvasLayoutState: function() {
      this.updateTreeVisResults()
    },
    currentTreeDSLArray: function() {
      if (this.currentTreeDSLArray.length === 0) {
        //  Clear the Treecanvas view
        d3.select(this.$el)
          .selectAll('.link').remove()
        d3.select(this.$el)
          .selectAll('.lineartree-node').remove()
        d3.select(this.$el)
          .selectAll('.node-label').remove()        
      }
    },
    selectedTreeDSLIndex: function() {
      this.adjustTreeCanvas()
      this.updateTreeVisResults()
      this.updateSVGViewbox()
    }
  },
  computed: {
    ...mapState([
      'treeDSLArray',
      'assignRecursiveMode',
      'assignNodeQuery',
      'focusedTreeObjArray',
      'changedDSLNameState',
      'treeUnitDSLName',
      'treeCanvasLayoutState',
      'previewTreeObj',
      'currentTreeDSLArray',
      'selectedTreeDSLIndex'
    ])
  },  
  methods: {
    updateTreeVisResults: function() {
      let self = this
      let layoutParas = JSON.parse(JSON.stringify(sysDatasetObj.getLayoutParas()))
      if (typeof(self.dslObj) !== 'undefined') {
        let selectedTreeDSLIndex = self.dslIndex
        let nodeArrayWithValueObj = sysDatasetObj.getNodeArrayWithValueObj()
        let treeIndexWithDSL = sysDatasetObj.computeAllNodeTreeIndexWithDSL(nodeArrayWithValueObj, selectedTreeDSLIndex)
        layoutParas.treeIndexWithDSL = treeIndexWithDSL
        let treeDSLContentObj = {}
        treeDSLContentObj[selectedTreeDSLIndex] = self.dslObj
        // assign the content
        layoutParas.treeIndexWithDSL = treeIndexWithDSL
        layoutParas.treeDSLContentObj = treeDSLContentObj
      }
      let nodeArray = sysDatasetObj.getNodeArray()
      let assignedAllNodesBoolean = assignedAllNodes(nodeArray, layoutParas.treeIndexWithDSL)
      let assignedAllDSLIndexBoolean = assignedAllDSLIndex(layoutParas.treeDSLContentObj, layoutParas.treeIndexWithDSL)
      if (!assignedAllNodesBoolean) {
        console.log('not assign all nodes')
      }
      if (!assignedAllDSLIndexBoolean) {
        console.log('not assign all DSL')
      }
      if (assignedAllNodesBoolean && assignedAllDSLIndexBoolean) {
        console.log('====================== local layoutParas ======================')
        console.log('layoutParas', layoutParas)
        getLayoutValue(layoutParas).then(function(treeLayout) {
          if (!treeLayoutValidate(treeLayout)) {
            self.clearTreeCanvas()
            console.log('not validated')
            throwGoTreeError(self.treeNodeErrorMessage)
            self.showHintMessage(self.treeNodeHintMessage, 'error')
            return 
          }
          self.layouts = treeLayout
          self.renderTreeVisResults(treeLayout)
        })
      } else {
        //  Reset the treeIndexWithDSL variable in layoutParas in State
        let layoutParas = sysDatasetObj.getLayoutParas()
        layoutParas.treeIndexWithDSL = {}
        //  Reset the currentTreeDSLArray variable in State
        let currentTreeDSLArray = sysDatasetObj.getCurrentTreeDSLArray(this.focusedTreeObjArray)
        self.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)
        //  Clear all drawn parts
        d3.select(this.$el)
          .select('#' + this.treeGId)
          .selectAll('*')
          .remove()
      }
      function assignedAllDSLIndex(treeDSLContentObj, treeIndexWithDSL) {
        // whether all the tree dsl are valid
        let assignedAllDSLIndex = true
        for (let nodeIndex in treeIndexWithDSL) {
          let treeDSLIndex = treeIndexWithDSL[nodeIndex]
          if (typeof(treeDSLContentObj[treeDSLIndex]) === 'undefined') {
            assignedAllDSLIndex = false
            return assignedAllDSLIndex
          }
        }
        return assignedAllDSLIndex
      }
      function assignedAllNodes(nodeArray, treeIndexWithDSL) {
        // whether all the nodes are assigned with treeDSLIndex
        let nodeIndexArray = []
        for(let i = 0;i < nodeArray.length;i++) {
          nodeIndexArray.push(nodeArray[i].data.index)
        }
        let dslIndexArray = []
        for(let item in treeIndexWithDSL) {
          dslIndexArray.push(item)
        }
        if ((nodeIndexArray.length === dslIndexArray.length) 
            && (nodeIndexArray.length !== 0) && (dslIndexArray.length !== 0)) {
          return true
        }
        return false
      }
    },
    //  Render the tree visualization based on the current parameters
    renderTreeVisResults: function(treelayout) {
      //  An array of nodes obtained by traversing the hierarchical data
      let nodeArray = sysDatasetObj.getNodeArray()
      this.nodeArray = nodeArray
      this.layoutParas = sysDatasetObj.getLayoutParas()
      this.hierarchicalData = this.layoutParas.hierarchicalData
      //  The index is the ID of the DSL, and the attribute value is the parameter of the DSL
      let dslContentObject = this.layoutParas.treeDSLContentObj
      this.dslContentObject = dslContentObject
      //  treeIndexWithDSLWithDefault; Index is the node ID, and the attribute value is the index of the DSL. Increasing the default value means that the default value is used if no value is assigned
      let treeIndexWithDSL = this.layoutParas.treeIndexWithDSL
      //  The treeIndexWithDSL object is the ID of the node whose index is and the attribute value is the ID of the DSL
      this.treeIndexWithDSL = treeIndexWithDSL
      let treeViewPosLenObj = this.treeViewPosLenObj
      let currentRootID = this.currentRootID
      //  get the attribute of whether the link display on the top of nodes
      this.linkDisplayTop = sysDatasetObj.getLinkDisplayTop(dslContentObject)
      //  Treelayout is further calculated to obtain the absolute coordinates of each node in Cartesian coordinate system
      if ((typeof(treeIndexWithDSL) === 'undefined') || (typeof(dslContentObject) === 'undefined') 
          || (treelayout == null) || (typeof(treelayout) === 'undefined')) {
        return
      }
      this.AreaData = getTreeLayout(treeIndexWithDSL, dslContentObject, treelayout, nodeArray, treeViewPosLenObj)
      if (!areaDataValidate(this.AreaData)) {
        this.clearTreeCanvas()
        throwGoTreeError(this.treeNodeErrorMessage)
        this.showHintMessage(this.treeNodeHintMessage, 'error')
        return 
      }
      //  Gets the link arguments for all LINEAR objects
      this.renderTree()
      //  Adjust the position of the visual form of the hierarchy
      this.adjustTreePos()
    },
    //  Add zoom function to SVG
    addZoomFunc: function() {
      let self = this
      let svgWidth = +$('#' + self.treeCanvasSvgId).width();
      let svgHeight = +$('#' + self.treeCanvasSvgId).height();
      var zoom = d3.zoom()
        .scaleExtent([0.001, 400])
        // .translateExtent([[-100, -100], [svgWidth + 90, svgHeight + 100]])
        .on("zoom", zoomed);
      //  Zoom over the view
      function zoomed() {
        let treeCanvasRect = d3.select('#' + self.treeCanvasRectId)
        d3.select('#' + self.treeCanvasId).attr("transform", d3.event.transform);
      }
      d3.select('#' + self.treeCanvasSvgId).call(zoom);
    },
    // update view box attribute of svg
    updateSVGViewbox: function() {
      let svgWidth = +this.$refs.treeCanvas.clientWidth
      let svgHeight = +this.$refs.treeCanvas.clientHeight
      let viewBoxAttrs = [0, 0, svgWidth, svgHeight]
      let viewBoxStr = viewBoxAttrs.join(" ")
      this.svgViewBoxAttr = viewBoxStr
    },
    //  Adjust the position of the visual form of the hierarchy
    adjustTreePos: function() {
      let currentRootGId = this.treeGId
      let treeViewPosLenObj = this.treeViewPosLenObj
      //  Reposition the view
      d3.select('#' + currentRootGId)
        .attr('transform', 'translate(' + treeViewPosLenObj.x + ',' + treeViewPosLenObj.y + ')')
    }, 
    /**
     * Determine the size of the view and the size of the rectangles inside the view
     */
    adjustTreeCanvas: function() {
      let self = this
      //  Add a background rectangle to SVG
      //  The width to height ratio of the background rectangle on SVG
      let widthHeightRatio = 1
      let miniPadding = 0.1
      let svgWidth = +this.$refs.treeCanvas.clientWidth
      let svgHeight = +this.$refs.treeCanvas.clientHeight
      this.viewWidth = svgWidth
      this.viewHeight = svgHeight
      let innerViewWidth = this.viewWidth * 0.88
      let innerViewHeight = this.viewHeight * 0.88
      if ((innerViewWidth * widthHeightRatio) >= innerViewHeight) {
        //  If the value calculated by innerViewWidth exceeds innerViewHeight, then innerViewHeight is computed
        innerViewWidth = innerViewHeight / widthHeightRatio
      } else {
        //  Otherwise, we do the innerViewWidth
        innerViewHeight = innerViewWidth * widthHeightRatio
      }
      this.treeWidth = innerViewWidth
      this.treeHeight = innerViewHeight
      this.viewPaddingTop = (this.viewHeight - this.treeHeight) / 2
      this.viewPaddingLeft = (this.viewWidth - this.treeWidth) / 2      
      let canvasOuterPosLenObj = {
        x: this.viewPaddingLeft,
        y: this.viewPaddingTop,
        width: this.treeWidth,
        height: this.treeHeight
      }
      if (d3.select('#' + this.treeCanvasId).select('#' + this.treeCanvasRectId).empty()) {
        d3.select('#' + this.treeCanvasId)
          .append('rect')
          .attr('class', 'canvas-region-outer')
          .attr('id', this.treeCanvasRectId)
          .attr('x', canvasOuterPosLenObj.x)
          .attr('y', canvasOuterPosLenObj.y)
          .attr('width', canvasOuterPosLenObj.width)
          .attr('height', canvasOuterPosLenObj.height)
          .on('click', function() {
            //  Close the Preview view for the tree visualization
            self.removeControlHighlight()
          })
      } else {
          d3.select('#' + this.treeCanvasId)
            .select('#' + this.treeCanvasRectId)
            .attr('x', canvasOuterPosLenObj.x)
            .attr('y', canvasOuterPosLenObj.y)
            .attr('width', canvasOuterPosLenObj.width)
            .attr('height', canvasOuterPosLenObj.height)
      }
      //  Calculate the size of the internal visual form
      // TODO, official version is 0.08
      let paddingRatio = 0.01
      this.treeViewPaddingTop = this.treeHeight * paddingRatio
      this.treeViewPaddingBottom = this.treeHeight * paddingRatio
      this.treeViewPaddingLeft = this.treeWidth * paddingRatio
      this.treeViewPaddingRight = this.treeWidth * paddingRatio
      this.treeViewWidth = this.treeWidth - this.treeViewPaddingLeft - this.treeViewPaddingRight
      this.treeViewHeight = this.treeHeight - this.treeViewPaddingTop - this.treeViewPaddingBottom
      //  Attribute information about the location and length of the boundingBox in the tree visualization form
      let treeViewPosLenObj = {
        x: this.treeViewPaddingLeft + this.viewPaddingLeft,
        y: this.treeViewPaddingTop + this.viewPaddingTop,
        width: this.treeViewWidth,
        height: this.treeViewHeight
      }
      this.treeViewPosLenObj = treeViewPosLenObj
      //  Move currentRootG position by adding G to SVG for drawing tree visualizable form
      d3.select(this.$el).select('#' + this.treeCanvasId).select('#' + this.treeGId).remove();
      d3.select(this.$el)
        .select('#' + this.treeCanvasId)
        .append('g')
        .attr('id', this.treeGId)
        .attr('class', this.singleTreeG)
        .attr('transform', 'translate(' + treeViewPosLenObj.x + ',' + treeViewPosLenObj.y + ')')
    },
    /**
     * After clicking on the background rectangle, unhighlight the rectangle that controls the size of the visual form
     */
    removeControlHighlight: function() {
      let self = this
      d3.select(this.$el)
        .select('#' + this.treeCanvasId)
        .selectAll('.resize-circle-g')
        .classed('highlight', false)
      d3.select('#' + this.treeCanvasId)
        .selectAll('.tree-vis-region-outer')
        .classed('highlight', false)
    },
    /**
     * Click the background rectangle to display the control point that controls the visual size of the book and the background rectangle
     */
    addControlHighlight: function() {
      let self = this
      d3.select(this.$el)
        .select('#' + self.treeCanvasId)
        .select('.resize-circle-g')
        .classed('highlight',true)
      d3.select('#' + self.treeCanvasId)
        .select('.tree-vis-region-outer')
        .classed('highlight',true)
    },
    /**
     * [clear the canvas of the GoTree rendering results]
     * @return {[Null]} [description]
     */
    clearTreeCanvas: function() {
      let self = this
      let currentRootGId = self.treeGId
      d3.select(this.$el)
        .select('#' + currentRootGId)
        .selectAll('*')
        .remove()
    },
    //  render links between  nodes
    renderTreeLink: function (linkDataArray) {
      let self = this
      let currentRootGId = self.treeGId
      d3.select(this.$el).select('#' + currentRootGId)
        .selectAll('.link').remove()
      //Draw the link
      let linkElements = d3.select(this.$el).select('#' + currentRootGId)
        .selectAll('.link')
        .data(linkDataArray.filter(function(d){
          return ((typeof(d.pathAttr) !== 'undefined') && (d.pathAttr.indexOf('NaN') === -1))
        }))
      //  Add visual elements
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
        .attr('stroke', '#606060')
      linkElements.exit().remove()
     },
    renderTreeNode: function(areaDataArray) {
      let self = this
      let nodeArray = self.nodeArray
      let currentRootGId = self.treeGId
      let treelayout = this.layouts
      //  not valid -> stop rendering and remove all the nodes
      if (!treeNodeValidate(areaDataArray)) {
        d3.select(this.$el)
          .select('#' + currentRootGId)
          .selectAll('.lineartree-node-g')
          .remove()
        let message = "The element of tree node is none. | TreeCanvas.js"
        throwGoTreeError(message)
        return
      } 
      d3.select(this.$el).selectAll('.lineartree-node-g').remove()
      //  A visual element representing a node
      let treeNodeElementG = d3.select(this.$el)
        .select('#' + currentRootGId)
        .selectAll('.lineartree-node-g')
        .data(areaDataArray, function(d, i) {
          return d.id
        })
      //  Creating visual elements
      treeNodeElementG.enter()
        .append('g')
        .attr('class', 'lineartree-node-g')
        .attr('id',function(d,i) {
          return 'nodeg'+d.id
        })
        .append('path')
        .attr('class', 'lineartree-node')
        .attr('id',function(d,i) {
          return 'rootnode'+d.id
        })
        .attr('d', function(d, i) {
          return d.element
        })
        .on("mousemove",this.mousemove)
        .on("mouseover",this.mouseover)
        .on("mouseout",this.mouseout)
        .on("click", function(d, i) {
          let dataObj = JSON.parse(JSON.stringify(d.data))
          dataObj.fatherID = d.fatherID
          self.onclick(dataObj)
        })
        .attr('fill', function(d) {
          return d.node_color
        })
        .style('stroke-width', function(d) {
          return d.stroke_width
        })
        .style("opacity",1)
      treeNodeElementG.exit().remove()
    },
    mousemove: function(d) {
      let treeViewPosLenObj = this.treeViewPosLenObj
      d3.select("#NodeLabel").style("visibility", "visible")
      d3.select("#NodeLabel").style("opacity", .9)
      let tooltipAttrArray = d.tooltip
      let offset = $('#tree-dsl-canvas-container').offset()
      if (tooltipAttrArray.length > 0) {
        d3.select("#NodeLabel").html(NodeLabelHtml(d, tooltipAttrArray))
          .style("left", (d3.event.pageX - offset.left) + "px")
          .style("top", (d3.event.pageY - offset.top) + "px")
        d3.select("#NodeLabel").style("visibility", "visible")
      } else {
        d3.select("#NodeLabel").style("visibility", "hidden")
      }
      // d3.select("#NodeLabel").style("left", (d3.event.pageX) + "px")
      //   .style("top", (d3.event.pageY - 28) + "px")
      //  Hover displays text typesetting in labels
      function NodeLabelHtml(d, tooltipAttrArray) {
        let innerContent = '<h4>'
        for (let i = 0; i < tooltipAttrArray.length; i++) {
          if (i === (tooltipAttrArray.length - 1)) {
            innerContent = innerContent + tooltipAttrArray[i] + ': ' + d[tooltipAttrArray[i]]
          } else {
            innerContent = innerContent + tooltipAttrArray[i] + ': ' + d[tooltipAttrArray[i]] + "<br/>"
          }
        }
        innerContent = innerContent + "</h4>"
        return innerContent
      }
    },
    mouseover: function(d) {
    },
    //  The event that the mouse moved away
    mouseout: function (d) {
      d3.select("#NodeLabel").style("visibility", "hidden")
    },
    //  Gets a single node, sibling nodes, or an array of nodes at the same level
    getSelectedTreeUnitRootIdArray: function(selectId) {
      let AreaData = this.AreaData
      let treelayout = this.layouts
      let viewSelectionMode = this.viewSelectionMode
      let assignNodeQuery = this.assignNodeQuery
      let selectedTreeUnitRootIdArray = []
      let assignNodeAttr = this.previewTreeObj[assignNodeQuery]
      for (let i = 0;i < this.areaDataArray.length;i++) {
        if (assignNodeQuery === 'fatherID') {
          if (this.areaDataArray[i][assignNodeQuery] === assignNodeAttr) {
            selectedTreeUnitRootIdArray.push(this.areaDataArray[i]['data'].index)
          }
        } else {
          if (this.areaDataArray[i]['data'][assignNodeQuery] === assignNodeAttr) {
            selectedTreeUnitRootIdArray.push(this.areaDataArray[i]['data'].index)
          }
        }
      }
      return selectedTreeUnitRootIdArray   
      //  Get sibling nodes
      function getSiblingNodeArray(selectId) {
        var nodeArray = []
        var sfatherid = AreaData[selectId].fatherID
        if (sfatherid != null) {
          for(let i=0;i<treelayout[sfatherid].subtreeLayout.length;i++){
            let siblingNodeId = treelayout[sfatherid].subtreeLayout[i].id
            nodeArray.push(siblingNodeId)
          }
        } else {
          nodeArray.push(selectId)
        }
        return nodeArray
      }
      //  Gets nodes of the same layer
      function getSameDepthNodeArray(selectid) {
         var nodeArray = []
         var selectObj = AreaData[selectId]
         for (let item in AreaData) {
            let areaDataObj = AreaData[item]
            if (areaDataObj.depth === selectObj.depth) {
              nodeArray.push(areaDataObj.id)
            }
         }
         return nodeArray
      }      
    },
    highlightFocusedTreeObjIdArray: function(dataObj) {
      let nodeId = dataObj.index
      if (dataObj.name !== 'A') {
        d3.select('#'+this.treeCanvasId)
          .selectAll('.select-root-node')
          .classed('select-root-node', false)
        //  Highlight only the nodes you click on
        d3.select('#'+this.treeCanvasId)
          .select('#'+"rootnode"+nodeId)
          .classed('select-root-node', true)
      }      
      //  Updates the object of the currently clicked node
      let nodeArray = this.getSelectedTreeUnitRootIdArray(nodeId)
      // Highlight the nodes in the array
      let focusedTreeObjIdArray = this.getFocusedTreeObjIdArray(nodeArray)
      this.UPDATE_FOCUS_TREE_OBJ_ARRAY(focusedTreeObjIdArray)
      //  Highlight the selected node
      d3.select('#'+this.treeCanvasId)
        .selectAll('.lineartree-node')
        .classed('clickhighlight', false)
        .classed('clickunhighlight', false)
      d3.select('#'+this.treeCanvasId)
        .selectAll('.lineartree-node')
        .classed('clickunhighlight',true)
      for (let i = 0; i < focusedTreeObjIdArray.length; i++) {
        d3.select('#'+this.treeCanvasId)
          .selectAll("#" + "rootnode" + focusedTreeObjIdArray[i])
          .classed('clickhighlight',true)
          .classed('clickunhighlight',false)
      }
    },
    //  Highlight the selected array of nodes
    getFocusedTreeObjIdArray: function (nodeArray) {
      let assignRecursiveMode = this.assignRecursiveMode   
      let treelayout = this.layouts
      let AreaData = this.AreaData  
      let focusedTreeObjIdArray = []
      for (let i = 0;i < nodeArray.length;i++) {
        let nodeId = nodeArray[i]
        let selectedNodeArray = []
        // Depending on whether it's recursive or not
        if (assignRecursiveMode === 'true') {

          selectedNodeArray = getDescendantNodeArray(nodeId)
        } else if (assignRecursiveMode === 'false') {
          selectedNodeArray = [nodeId]
        }
        for (let sI = 0; sI < selectedNodeArray.length; sI++) {
          if (focusedTreeObjIdArray.indexOf(selectedNodeArray[sI]) === -1) {
            focusedTreeObjIdArray.push(selectedNodeArray[sI])
          }
        }
      }
      return focusedTreeObjIdArray
      //  Gets the descendant node
      function getDescendantNodeArray(lightupID) {
        var node = []
        var allNodeArray = [lightupID]
        while(lightupID !== undefined){
          for(let i=0;i<treelayout[lightupID].subtreeLayout.length;i++){
            let SonID = treelayout[lightupID].subtreeLayout[i].id
            node.push(SonID)
            allNodeArray.push(SonID)
          }
          lightupID = node.shift()
        }
        return allNodeArray
      }
    },
    //  Deselect a node
    unhighlightSelectedNodeArray: function() {
      d3.select('#'+this.treeCanvasId)
        .selectAll('.lineartree-node')
        .classed('clickunhighlight',false)
        .classed('clickhighlight',false)
        .classed('select-root-node', false)
    },
    //  The node click event of the mouse
    onclick: function (dataObj) {
      let self = this
      let nodeId = dataObj.index
      //  Shows the control points behind the visual form of the tree
      self.addControlHighlight()   
      if (!d3.select('#'+self.treeCanvasId)
          .select('#' + "rootnode" + nodeId)
          .classed('select-root-node')) {
          //  Update the current selected node ID
          self.UPDATE_SELECTED_PREVIEW_NODE_ID(nodeId)
          //  need to obtain the ID of the parent node of the node and calculate the calculated attribute value
          //  Updates the hierarchy data for the current click
          self.UPDATE_PREVIEW_TREE_OBJ(dataObj)
          //  Highlight the selected node
          self.highlightFocusedTreeObjIdArray(dataObj)
      } else {
        self.removePreviewObjectSelection()
      }
      //  Updates the currently selected DSL array
      let currentTreeDSLArray = sysDatasetObj.getCurrentTreeDSLArray(this.focusedTreeObjArray)
      self.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)   
    },
    //  Deletes the selection of the current Preview Object
    removePreviewObjectSelection: function() {
      let self = this
      //  None Example Clear the ID of the selected node
      self.UPDATE_SELECTED_PREVIEW_NODE_ID(null)
      //  Unhighlight the nodes in the array
      self.unhighlightSelectedNodeArray()
      //  Unchecked, focusedTreeObjIdArray should be set to the entire node array
      let allTreeObjIdArray = sysDatasetObj.getAllTreeObjIdArray()
      self.UPDATE_FOCUS_TREE_OBJ_ARRAY(allTreeObjIdArray)
      //  need to obtain the ID of the parent node of the node and calculate the calculated attribute value
      //  Updates the hierarchy data for the current click
      let areaDataArray = self.areaDataArray
      if (areaDataArray.length > 0) {
        let previewAllDataObj = JSON.parse(JSON.stringify(areaDataArray[0].data))
        self.UPDATE_PREVIEW_TREE_OBJ(previewAllDataObj)
      }
    },
    /**
     * The method for rendering the final tree visualizations needs to ensure that only the pure tree visualizations are drawn in this method, and no other parts are included, so that the GoTree can be implemented as a library
     * Distinguish the part drawn by link from node
     */
    renderTree: function () {
        let self = this
        let treeIndexWithDSL = this.treeIndexWithDSL
        let dslContentObject = this.dslContentObject
        let treeViewPosLenObj = this.treeViewPosLenObj
        let treelayout = this.layouts
        let AreaData = this.AreaData
        let nodeArray = this.nodeArray
        let currentRootID = this.currentRootID
        let dslContentObjectWithDefault = addDefaultCoordElement(dslContentObject)
        //  The corresponding G of the node is obtained according to the ID of the node
        let [areaDataArray, linkDataArray] = getNodeLinkAttr(AreaData, dslContentObjectWithDefault, treeIndexWithDSL, treeViewPosLenObj, nodeArray)
        areaDataArray = getTreeNodeStyle(areaDataArray, dslContentObjectWithDefault, treeIndexWithDSL, nodeArray)
        linkDataArray = getTreeLinkStyle(linkDataArray, AreaData, dslContentObjectWithDefault, treeIndexWithDSL, nodeArray, this.treeViewWidth, this.treeViewHeight)
        this.areaDataArray = areaDataArray
        this.linkDataArray = linkDataArray
        /**
         * A method for drawing connecting edges between nodes
         */
        //  Call Draw tree to visualize upper nodes
        if (this.linkDisplayTop) {
          //  render nodes at first and then render links between nodes
          self.renderTreeNode(areaDataArray)
          self.renderTreeLink(linkDataArray)
        } else {
          //  render links at first and then render nodes
          self.renderTreeLink(linkDataArray) 
          self.renderTreeNode(areaDataArray)      
        }
    },
    //  Extract the file of the passed treeDsl
    extractDSLContentObject: function () {
      let treeDSLArray = this.treeDSLArray
      let dslContentObj = {}
      for (let tI = 0; tI < treeDSLArray.length; tI++) {
        let dslObj = treeDSLArray[tI]
        let editorId = dslObj.editorId
        let content = dslObj.content
        dslContentObj[editorId] = content
      }
      return dslContentObj
    },
    // ZWT ADD HERE
    getSvgCoordinates(g, x, y) {
      let svg = document.getElementById(this.treeCanvasSvgId);
      let pt = svg.createSVGPoint();
      pt.x = x;
      pt.y = y;
      let globalPoint = pt.matrixTransform(g.getScreenCTM().inverse());
      return globalPoint;
    },
    repositionResizeCircle: function (currentRootGId) {
      let self = this
      let g = d3.select('#'+self.treeCanvasId)
      let circleG = g.select('.resize-circle-g')
      let rect = g.select('.tree-vis-region-outer')
      let x = +rect.attr('x')
      let y = +rect.attr('y')
      let w = +rect.attr('width')
      let h = +rect.attr('height')
      circleG.select('.topleft')
        .attr("cx", x)
        .attr("cy", y)
      circleG.select('.bottomright')
        .attr("cx", x + w)
        .attr("cy", y + h)
    },
    //  The input is the ID of a group. This method adds control points inside the group to control the size of the visualization form
    appendResizeCircle: function (currentRootGId) {
      let self = this
      //  Select the Canvas that draws the tree
      let treeCanvas = d3.select('#'+self.treeCanvasId)
      //  Select the rectangle in G
      let rect = d3.select('#' + self.treeCanvasId)
        .select('.tree-vis-region-outer')
      //  Gets the property value of the rectangle in G
      let x = +rect.attr('x')
      let y = +rect.attr('y')
      let w = +rect.attr('width')
      let h = +rect.attr('height')
      //  Add resize control to this g
      let circleG = treeCanvas.append('g').attr('class', 'resize-circle-g')
      circleG.append("circle")
        .attr("class", "topleft")
        .attr("cx",  x)
        .attr("cy", y)
        .call(d3.drag()
          .container(d3.select('#'+self.treeCanvasId).node())
          .subject(function () {
            return {x: d3.event.x, y: d3.event.y}
          })
          .on("start end", rectResizeStartEnd)
          .on("drag", rectResizing)
        )
      circleG.append("circle")
        .attr("class", "bottomright")
        .attr("cx", x + w)
        .attr("cy", y + h)
        .call(d3.drag()
          .container(d3.select('#'+self.treeCanvasId).node())
          .subject(function () {
            return {x: d3.event.x, y: d3.event.y}
          })
          .on("start end", rectResizeStartEnd)
          .on("drag", rectResizing)
        )
      function rectResizeStartEnd() {
        let treeViewPosLenObj = self.treeViewPosLenObj
        let el = d3.select(this), isStarting = d3.event.type === "start"
        // d3.select(this)
        //   .classed("resizing", isStarting)
        //   .attr("r", isStarting || el.classed("hovering") ? circleActiveRadius : circleRadius)
        if (isStarting || el.classed("hovering")) {
          d3.select('#'+self.treeCanvasId)
            .select('.tree-vis-region-outer')
            .classed('resizing', true)
        } else {
          d3.select('#'+self.treeCanvasId)
            .select('.tree-vis-region-outer.resizing')
            .classed('resizing', false)
        }
        //  The response function at the beginning
        if (isStarting) {
          let rect = d3.select('#'+self.treeCanvasId)
          .select('.tree-vis-region-outer')
          let x = +rect.attr('x')
          let y = +rect.attr('y')
          let w = +rect.attr('width')
          let h = +rect.attr('height')
          self.regionOuterRectPos = {x: x, y: y, width: w, height: h}
        }
        // After dragging, print the modified x, y, width, height
        if (!isStarting) {
          let rect = d3.select('#'+self.treeCanvasId)
            .select('.tree-vis-region-outer')
          let x = +rect.attr('x')
          let y = +rect.attr('y')
          let w = +rect.attr('width')
          let h = +rect.attr('height')
          let diffX = x - self.regionOuterRectPos.x
          let diffY = y - self.regionOuterRectPos.y
          let diffWidth = w - self.regionOuterRectPos.width
          let diffHeight = h - self.regionOuterRectPos.height
          //  Change the range of g
          treeViewPosLenObj.x = treeViewPosLenObj.x + diffX
          treeViewPosLenObj.y = treeViewPosLenObj.y + diffY
          treeViewPosLenObj.width = treeViewPosLenObj.width + diffWidth
          treeViewPosLenObj.height = treeViewPosLenObj.height + diffHeight
          //  Rerequesting data
          let currentRootIndex = currentRootGId.replace('-g', '')
          //   Update the render after resizing
          self.updateTreeVisResults()
        }
      }
      // Restrict rectangle position and size
      let MAX_TRANSLATE_X = self.treeWidth + self.viewPaddingLeft
      let MIN_TRANSLATE_X = self.viewPaddingLeft
      let MAX_TRANSLATE_Y = self.treeHeight + self.viewPaddingTop
      let MIN_TRANSLATE_Y = self.viewPaddingTop
      let MIN_RECT_WIDTH = 0
      let MIN_RECT_HEIGHT = 0
      function rectResizing(d) {
        let pt = self.getSvgCoordinates(treeCanvas.node(), d3.event.sourceEvent.clientX, d3.event.sourceEvent.clientY)
        let dragX = Math.max(
          Math.min(pt.x, MAX_TRANSLATE_X),
          MIN_TRANSLATE_X
        );
        let dragY = Math.max(
          Math.min(pt.y, MAX_TRANSLATE_Y),
          MIN_TRANSLATE_Y
        );
        let rect = d3.select('#'+self.treeCanvasId)
          .select('.tree-vis-region-outer')
        let x = +rect.attr('x')
        let y = +rect.attr('y')
        let w = +rect.attr('width')
        let h = +rect.attr('height')
        if (d3.select(this).classed("topleft")) {
          let newWidth = Math.max(w + x - dragX, MIN_RECT_WIDTH)
          x += w - newWidth;
          w = newWidth;
          let newHeight = Math.max(h + y - dragY, MIN_RECT_HEIGHT)
          y += h - newHeight;
          h = newHeight;
          d3.select(this)
            .attr('cx', x)
            .attr('cy', y)
        } else {
          // w = Math.max(dragX - x, MIN_RECT_WIDTH)
          // h = Math.max(dragY - y, MIN_RECT_HEIGHT)
          w = dragX - x, h = dragY - y
          d3.select(this)
            .attr('cx', x + w)
            .attr('cy', y + h)
        }
        rect.attr('x', x)
          .attr('y', y)
          .attr('width', w)
          .attr('height', h)
      }
    },
    //  Displays the message of Message
    showHintMessage: function(message, type) {
      this.$message({
        showClose: true,
        message: message,
        type: type
      });
    },
    // ZWT ADD END
    ...mapMutations([
      'UPDATE_TREE_DSL_ARRAY_KEY',
      'UPDATE_FOCUS_TREE_OBJ_ARRAY',
      'UPDATE_PREVIEW_TREE_OBJ',
      'UPDATE_SELECTED_PREVIEW_NODE_ID',
      'UPDATE_CURRENT_TREE_DSL_ARRAY'
    ])
  }
}
</script>

<!-- ZWT ADD HERE -->
<style lang="less">
.resize-circle-g circle:hover {
  cursor: move;
  r: 0.2rem;
}
.resize-circle-g circle.resizing {
  fill: #fff;
  fill-opacity: 1;
}
.resize-circle-g circle {
  stroke: #dadada;
  stroke-width: 0.05rem;
  fill: #dadada;
  fill-opacity: 1;
  visibility: hidden;
  r: 0.3rem;
}
.resize-circle-g.highlight circle {
  stroke: #dadada;
  stroke-width: 0.05rem;
  fill: #dadada;
  fill-opacity: 1;
  visibility: visible;
  r: 0.3rem;
}
</style>
<!-- ZWT ADD END -->

<style lang="less">
  .lineartree-node {
    stroke: white;
    // stroke-width: 0.01rem;
  }
  .lineartree-node.clickunhighlight:not(.mouseoverhighlight) {
    fill: #ccc;
    stroke: white;
    // opacity: 0.3;
  }
  .lineartree-node.mouseoverunhighlight:not(.clickhighlight) {
    fill: #ccc;
    // opacity: 0.3;
  }
  .lineartree-node[class~=mouseoverhighlight] {
    opacity: 1 !important;
  }
  .lineartree-node[class~=clickhighlight] {
    opacity: 1 !important;
  }
  .lineartree-node[class~=unselecttree] {
    opacity: 0 !important;
  }
  .lineartree-node[class~=select-root-node] {
    stroke: #fdae61;
    stroke-width: 0.15rem !important;
  }
</style>

<style lang="less">
  .tree-canvas {
    .canvas-region-outer{
      fill: rgba(255, 255, 255, 0);
      // stroke: #9e9e9e;
      stroke-width: 0.05rem;
    }
    .mark-line {
      stroke: #dadada;
      fill: none;
    }
    .link {
      stroke: #606060;
      fill: none;
      &.unhighlight{
        opacity: 0.1;
      }
      shape-rendering: geometricPrecision;
    }
    .tree-vis-region-outer {
      fill: white;
      stroke-width: 0.1rem;
      &.highlight {
        stroke: #238af8;
      }
      &.hidden {
        opacity: 0;
      }
    }
    .resize-circle-g {
      &.hidden {
        opacity: 0 !important;
      }      
    }
    .partition-link-circle {
      fill: gray;
      r: 0.25rem;
      opacity: 0.3;
    }
    .partition-link-path {
      stroke: gray;
      stroke-width: 0.4rem;
      fill: none;
      opacity: 0.3;
    }
  }
</style>
<style scoped lang="less">
  // .container, .tree-canvas {
  //   margin: 0;
  //   height: 100%;
  //   width: 100%;
  //   overflow: hidden;
  // }
  .container {
    position: absolute;
    left: 0%;
    top: 0%;
    bottom: 0%;
    right: 0%;
    // border: solid 0.05rem #ccc;
    background: rgba(255, 255, 255, 0);
    touch-action: pinch-zoom;
    .tree-canvas {
      position: absolute;
      left: 0%;
      top: 0%;
      height: 100%;
      width: 100%;
      background: rgba(255, 255, 255, 0);
      // background: #f2f2f2;
    }
  }
  .container.highlight {
    background: #eeeeee;
  }
  .tree-node {
    stroke: white;
  }
  .Label {
    font: 8px sans-serif;
    text-anchor: middle;
  }
  #NodeLabel {   
    position: absolute;           
    text-align: left;
    padding: 20px;             
    margin: 10px;
    font: 12px sans-serif;        
    background: lightsteelblue;   
    border: 1px;      
    border-radius: 2px;           
    pointer-events: none;         
  }
  #NodeLabel h4{
    margin:0;
    font-size:14px;
  }
  #NodeLabel{
    background:rgba(0,0,0,0.9);
    border:1px solid grey;
    border-radius:5px;
    font-size:12px;
    width:auto;
    padding:4px;
    color:white;
    opacity:0;
  }
  #NodeLabel table{
    table-layout:fixed;
  }
  #NodeLabel tr td{
    padding:0;
    margin:0;
  }
  #NodeLabel tr td:nth-child(1){
    width:50px;
  }
  #NodeLabel tr td:nth-child(2){
    text-align:center;
  }

</style>