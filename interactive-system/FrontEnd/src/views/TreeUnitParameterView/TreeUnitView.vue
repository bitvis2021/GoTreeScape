<template>
  <div class='treeunit-container' ref="treeUnitContainer">
    <svg class='tree-unit-canvas' width='100%' height='100%' :id="treeCanvasId">
      <g :id="treeUnitContainerId">
        <g id="tree-unit-region-g"></g>
        <g class='tree-unit-g' :id="treeGId"></g>
      </g>
    </svg>
  </div>
</template>

<script> 
  import { mapState, mapActions, mapMutations} from 'vuex';
  import { getTreeLayout } from '@/data-processing/get_tree_layout.js'
  import { getLayoutValue } from '@/data-processing/get_layout_value.js'
  import { getTreeUnitLayout } from '@/data-processing/get_tree_unit_layout.js'
  import { addDefaultCoordElement } from '@/data-processing/add_default_coord_element.js'
  import { extractTreeIndexWithDSL } from '@/data-processing/extract_tree_index_with_dsl.js'
  import { getNodeLinkAttr } from '@/data-processing/get_node_link_attr.js'
  import { getTreeNodeStyle } from '@/treevis-style/get_tree_node_style.js'
  import { getTreeLinkStyle } from '@/treevis-style/get_tree_link_style.js'
  import { tweenPaths } from 'svg-tween'
  import { tween } from 'svg-tween'
  import { throwGoTreeError } from '@/error/GoTreeError.js';
  import { treeNodeValidate, treeLayoutValidate, areaDataValidate } from '@/error/ErrorValidate.js';

  export default {
    name: 'TreeUnitView',
    components: {
    },
    data() {
      return {
        treeCanvasId: "tree-canvas",
        treeGId: 'tree-unit-g',
        treeUnitContainerId: 'tree-unit-container',
        rootLayoutComponentType: 'root-layout',
        subtreeLayoutComponentType: 'subtree-layout',
        nodeComponentType: 'node', 
        linkComponentType: 'link',
        coordComponentType: 'coordinate_system',
        treeViewPosLenObj: {},
        DURATION: 1000,
        PARAS_DURATION: 1000,
        manipulationDuration: 200,
        defaultDuration: 1000,
        nodeFillColor: 'steelblue',
        treeUnitLayoutParas: {},
        initialDSLObj: {}, //The original DSL object
        paraCursorObj: {
          'root': 'pointer',
          'subtree-group': 'pointer',
          'subtree': 'pointer',
          'RootMargin': 'resize',
          'RootLeftPadding': 'resize',
          'RootRightPadding': 'resize',
          'RootAlignment': 'context-menu',
          'SubtreeMargin': 'resize',
          'SubtreeAlignment': 'context-menu'
        },
        paraResizeCursorObj: {
          'x': 'ew-',
          'y': 'ns-'
        },
        paraAdjustState: false,
        startPosition: [],
        treeUnitCanvasWidth: 0,
        treeUnitCanvasHeight: 0,
        horizontalUnit: 1,
        verticalUnit: 1,
        positionPadding: 0,
        _dslObj: {} //  The DSL object is copied
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
    created: function() {},
    mounted: function() {
      let self = this
      setTimeout(function() {
        self.initTreeUnitViewConfig()
        self.addZoomFunc()
        self.updateTreeUnitView()
      }, 400)
    },
    updated: function() {
    },
    watch: {
      treeUnitLayoutState: function() {
        if (this.dslName === this.treeUnitDSLName) {
          this.addZoomFunc()
          this.updateTreeUnitView()
        }
      }
    },
    computed: {
      ...mapState([
        'hierarchicalData',
        'nodeArray',
        'hierarchicalDSL',
        'hoveringDSLItem',
        'focusedDSLObj',
        'focusedDSLObjIndex',
        'dslComponentObject',
        'treeUnitLayoutState',
        'treeUnitDSLName',
        'selectParaName'
      ])
    },
    methods: {
      ...mapMutations([
          'UPDATE_ROOT_LAYOUT',
          'UPDATE_SUBTREE_LAYOUT',
          'UPDATE_NODE',
          'UPDATE_LINK',
          'UPDATE_COORD',
          'UPDATE_SELECT_PARA_NAME',
          'UPDATE_HOVER_PARAM',
          'UPDATE_TREE_CANVAS_LAYOUT_STATE',
          'UPDATE_TREE_PREVIEW_LAYOUT_STATE',
          'MANIPULATE_PARA',
          'MANIPULATE_VALUE'
      ]),
      cancelParasSelection: function() {
        d3.select(this.$el).selectAll('.selected').classed('selected', false)
        this.UPDATE_SELECT_PARA_NAME(null)
      },
      //  Add zoom function to SVG
      addZoomFunc: function() {
        let self = this
        let svgWidth = +$('#' + self.treeCanvasSvgId).width();
        let svgHeight = +$('#' + self.treeCanvasSvgId).height();
        var zoom = d3.zoom()
          .scaleExtent([0.5, 3])
          // .translateExtent([[-100, -100], [svgWidth + 90, svgHeight + 100]])
          .on("zoom", zoomed);
        //  Zoom over the view
        function zoomed() {
          let treeCanvasRect = d3.select(self.$el).select('#' + self.treeCanvasRectId)
          d3.select(self.$el).select('#' + self.treeUnitContainerId).attr("transform", d3.event.transform);
        }
        d3.select(self.$el).select('#' + self.treeCanvasId).call(zoom);
        // reset the zooming level
        d3.select(self.$el).select('#' + self.treeCanvasId).call(zoom.transform, d3.zoomIdentity);
      },
      updateTreeUnitView: function() {
        let self = this
        // self.initTreeUnitViewConfig()
        self.updateTreeUnitLayoutParas()
        let treeUnitLayoutParas = this.treeUnitLayoutParas
        getLayoutValue(treeUnitLayoutParas).then(function(treeUnitLayout) {
          // console.log('treeUnitLayout', treeUnitLayout)
          if (!treeLayoutValidate(treeUnitLayout)) {
            self.clearTreeCanvas()
            return
          }
          self.renderTreeUnit(treeUnitLayout)
        })
      },
      initTreeUnitViewConfig: function() {
        // initialize the configuration of the TreeUnitView, including its size, positions, etc. 
        let self = this
        let positionPadding = self.positionPadding
        let treeUnitCanvasWidth = self.$refs.treeUnitContainer.clientWidth;
        let treeUnitCanvasHeight = self.$refs.treeUnitContainer.clientHeight;
        self.treeUnitCanvasWidth = treeUnitCanvasWidth
        self.horizontalUnit = treeUnitCanvasWidth / 100
        self.treeUnitCanvasHeight = treeUnitCanvasHeight
        self.verticalUnit = treeUnitCanvasWidth / 100
        d3.select(self.$el).select('#tree-unit-region-g')
          .append('rect')
          .attr('class', 'outer-bg')
          .attr('x', positionPadding)
          .attr('y', positionPadding)
          .attr('width', treeUnitCanvasWidth - positionPadding * 2)
          .attr('height', treeUnitCanvasHeight - positionPadding * 2)
          .on('click', self.cancelParasSelection)
        let treeUnitCanvasTop = treeUnitCanvasHeight * 0.15,
           treeUnitCanvasBottom = treeUnitCanvasHeight * 0.15,
           treeUnitCanvasLeft = treeUnitCanvasWidth * 0.15,
           treeUnitCanvasRight = treeUnitCanvasWidth * 0.15
        self.treeViewPosLenObj = {
          x: 0, y: 0,
          width: treeUnitCanvasWidth - treeUnitCanvasLeft - treeUnitCanvasRight,
          height: treeUnitCanvasHeight - treeUnitCanvasTop - treeUnitCanvasBottom
        }
        d3.select(self.$el).select('#tree-unit-region-g')
          .append('rect')
          .attr('class', 'inner-bg')
          .attr('x', treeUnitCanvasWidth * 0.05)
          .attr('y', treeUnitCanvasHeight * 0.05)
          .attr('width', treeUnitCanvasWidth * 0.9)
          .attr('height', treeUnitCanvasHeight * 0.9)
          .on('click', self.cancelParasSelection)
        d3.select(self.$el)
          .select('.tree-unit-g')
          .attr('transform', 'translate(' + treeUnitCanvasLeft + ',' + treeUnitCanvasTop + ')')
      },
      updateTreeUnitLayoutParas: function() {
        let treeUnitDataset = sysDatasetObj.getTreeUnitDataset()
        let treeUnitNodeArray = sysDatasetObj.getTreeUnitNodeArray()  
        //  初始化treeDSLContentObj
        let treeDSLContentObj = {}      
        let dslName = this.dslName
        let dslObj = this.dslObj
        this.initialDSLObj = JSON.parse(JSON.stringify(dslObj))
        treeDSLContentObj[dslName] = dslObj
        //   初始化treeIndexWithDSL
        let treeIndexWithDSL = {}
        for (let i = 0; i < treeUnitNodeArray.length; i++) {
          let nodeIndex = treeUnitNodeArray[i].data.index
          treeIndexWithDSL[nodeIndex] = dslName
        }
        // console.log('treeUnitDataset', treeUnitDataset, 'treeIndexWithDSL', treeIndexWithDSL, 'treeDSLContentObj', treeDSLContentObj)
        this.treeUnitLayoutParas = {
          hierarchicalData: treeUnitDataset,
          treeIndexWithDSL: treeIndexWithDSL,
          treeDSLContentObj: treeDSLContentObj
        }
      },
      changeParasCoordinatesystemCenter: function(dslContentObject) {
        for (let dsl in dslContentObject) {
          let dslObj = dslContentObject[dsl]
          dslObj['CoordinateSystem']['PolarCenterType'] = 'root'
        }
        return dslContentObject
      },
      renderTreeUnit: function(treeUnitLayout) {
        //  The DSL object in the initial case
        let initialDslObj = this.initialDSLObj
        let treeUnitLayoutParas = this.treeUnitLayoutParas
        let treeIndexWithDSL = treeUnitLayoutParas.treeIndexWithDSL
        let treeUnitNodeArray = sysDatasetObj.getTreeUnitNodeArray()
        let dslContentObject = JSON.parse(JSON.stringify(treeUnitLayoutParas.treeDSLContentObj))
        let treeViewPosLenObj = this.treeViewPosLenObj 
        let treeUnitViewWidth = this.treeViewPosLenObj.width
        let treeUnitViewHeight = this.treeViewPosLenObj.height
        if ((typeof(treeIndexWithDSL) === 'undefined') || (typeof(dslContentObject) === 'undefined')) {
          return
        }
        //  judge whether the link should diaply on the top
        let linkDisplayTop = sysDatasetObj.getLinkDisplayTop(dslContentObject)
        this.linkDisplayTop = linkDisplayTop
        // todo
        let AreaData = getTreeUnitLayout(treeIndexWithDSL, dslContentObject, treeUnitLayout, treeUnitNodeArray, treeViewPosLenObj)
        if (!areaDataValidate(AreaData)) {
          this.clearTreeCanvas()
          return 
        }
        // The areaData range of the Subtree group is adjusted based on the margin size
        let dslContentObjectWithDefault = addDefaultCoordElement(dslContentObject)
        let [areaDataArray, linkDataArray] = getNodeLinkAttr(AreaData, dslContentObjectWithDefault, treeIndexWithDSL, treeViewPosLenObj, treeUnitNodeArray)
        areaDataArray = getTreeNodeStyle(areaDataArray, dslContentObjectWithDefault, treeIndexWithDSL, treeUnitNodeArray)
        linkDataArray = getTreeLinkStyle(linkDataArray, AreaData, dslContentObjectWithDefault, treeIndexWithDSL, treeUnitNodeArray, treeUnitViewWidth, treeUnitViewHeight)
        //  ================Here are the parameters for rendering====================
        // Extract the elements of the range corresponding to the node from AreaData
        let parasSpaceData = this.getParasSpaceData(AreaData)
        let parasTreeIndexWithDSL = this.getParasTreeIndexWithDSL(treeIndexWithDSL, parasSpaceData)
        //  Set the node type of DSLobject after the initial value to Rectangle, because all the arguments are rectangle
        let parasDslContentObjectWithDefault = this.getParasDslContentObjectWithDefault(dslContentObjectWithDefault)
        parasDslContentObjectWithDefault = this.changeParasCoordinatesystemCenter(parasDslContentObjectWithDefault)
        let [parasAreaDataArray, parasLinkDataArray] = getNodeLinkAttr(parasSpaceData, parasDslContentObjectWithDefault, parasTreeIndexWithDSL, treeViewPosLenObj, treeUnitNodeArray)
        let parasAreaDataArray_xy = parasAreaDataArray.filter(parasAreaObj => parasAreaObj.parameterAxis === 'xy')
        let parasAreaDataArray_x_y = parasAreaDataArray.filter(parasAreaObj => ((parasAreaObj.parameterAxis === 'x') || (parasAreaObj.parameterAxis === 'y')))
        // let parasAreaDataArray_align = parasAreaDataArray.filter(parasAreaObj =>  
        //   (parasAreaObj.elementName === 'RootAlignment') || (parasAreaObj.elementName == 'SubtreeAlignment'))
        // console.log('parasAreaDataArray', parasAreaDataArray, 'parasAreaDataArray_xy', parasAreaDataArray_xy, 'parasAreaDataArray_x_y', parasAreaDataArray_x_y)
        this.addDirectManipulation()
        //  Draw the parameters on the coordinate axis
        // this.renderTreeParas_xy(parasAreaDataArray_xy)
        //  ================The following is to draw the specific elements according to the user's selection====================
        if ('Element' in initialDslObj) {
          if ('Link' in initialDslObj['Element']) {
            let nodeExist = d3.select('#' + this.treeGId).select('.lineartree-node').empty()
            let linkExist = d3.select('#' + this.treeGId).select('.link').empty()
            //  If the node exists and the link does not, remove the node, then add the node
            if ((!nodeExist) && (linkExist)) {
              this.removeTreeNode()
              this.removeTreeNodeLabel()
            }
            this.renderTreeLink(linkDataArray)
            //  If a node exists, remove it and then add it
            // if ('Node' in initialDslObj['Element']) { 
            //   this.renderTreeNode(areaDataArray)
            // }
          } else {
            this.removeTreeLink()
          }
          if ('Node' in initialDslObj['Element']) {
            this.renderTreeNode(areaDataArray)
            // this.renderTreeNodeLabel(areaDataArray)
          } else {
            this.removeTreeNode()
            // this.removeTreeNodeLabel()
          }
        }
        //  =================Here are the visual elements that take up less space to render========================
        this.renderTreeParas_x_y(parasAreaDataArray_x_y)
      },
      //  Adjust the scope of the TreeUnit
      adjustTreeUnitRange: function(AreaData) {
        let rootDataObj = AreaData['index-0']
        //  Adjust the width of the TreeUnit based on the width of the subtreeMargin
        if (typeof(rootDataObj.others.X) !== 'undefined') {
          if ('SubtreeMargin' in rootDataObj.others.X) {
            let subtreeMargin = rootDataObj.others.X.SubtreeMargin
            let subtreeMarginWidth = subtreeMargin[0].width
            if (subtreeMarginWidth < 0) {
              rootDataObj.Width = rootDataObj.Width + (-subtreeMarginWidth)
              rootDataObj.SubtreesWidth = rootDataObj.SubtreesWidth + (-subtreeMarginWidth)
              // rootDataObj.SubtreesX = rootDataObj.SubtreesX + (-subtreeMarginWidth) / 2
            }
          }
        }
        //  Adjust the height of the TreeUnit based on the height of the subtreeMargin
        if (typeof(rootDataObj.others.Y) !== "undefined") {
          if ('SubtreeMargin' in rootDataObj.others.Y) {
            let subtreeMargin = rootDataObj.others.Y.SubtreeMargin
            let subtreeMarginHeight = subtreeMargin[0].height
            if (subtreeMarginHeight < 0) {
              rootDataObj.SubtreesY = rootDataObj.SubtreesY + subtreeMarginHeight
              rootDataObj.Height = rootDataObj.Height + (-subtreeMarginHeight)
              // rootDataObj.SubtreesHeight = rootDataObj.SubtreesHeight + (-subtreeMarginHeight)
            }
          }
        }
      },
      parasVisibility: function(elementClass, elementName) {
        let dslObj = this.initialDSLObj
        if ((elementName === 'root') || (elementName === 'RootMargin') 
            || (elementName === 'RootLeftPadding') || (elementName === 'RootRightPadding') 
            || (elementName === 'RootAlignment')) {
          if ('Layout' in dslObj) {
            if (('X' in dslObj['Layout']) && ('Y' in dslObj['Layout'])) {
              if (('Root' in dslObj['Layout']['X']) && ('Root' in dslObj['Layout']['Y'])) {
                return 'visible'
              }
            }
          }
        }
        if (elementName === 'subtree-group') {
          if ('Layout' in dslObj) {
            if (('X' in dslObj['Layout']) && ('Y' in dslObj['Layout'])) {
              return 'visible'
            }
          }
        }
        if ((elementName === 'SubtreeMargin') || (elementName === 'SubtreeAlignment')) {
          if ('Layout' in dslObj) {
            if (('X' in dslObj['Layout']) && ('Y' in dslObj['Layout'])) {
              if (('Subtree' in dslObj['Layout']['X']) && ('Subtree' in dslObj['Layout']['Y'])) {
                return 'visible'
              }
            }
          }
        }
        if (elementName === 'subtree') {
          if ('Layout' in dslObj) {
            if (('X' in dslObj['Layout']) && ('Y' in dslObj['Layout'])) {
              if (('Subtree' in dslObj['Layout']['X']) && ('Subtree' in dslObj['Layout']['Y'])) {
                return 'visible'
              }
            }
          }
        }
        return 'hidden'
      },
      //  Add directly manipulated functions
      addDirectManipulation: function() {
        let self = this
        let treeCanvasId = self.treeCanvasId
        //  A visual element representing a node
        d3.select('#' + treeCanvasId)
          .on('mousedown', function(d, i) {
            let selectParaAttr = self.selectParaName
            // The guarantee starts with the selection of the visual element representing parameter
            if (selectParaAttr != null) {
              let paraAttrArray = selectParaAttr.split('-')
              let paraName = paraAttrArray[0]
              let paraAxis = paraAttrArray[1]
              let cursorType = self.paraCursorObj[paraName]
              if (cursorType === 'resize') {
                let resizeType = self.paraResizeCursorObj[paraAxis]
                cursorType = resizeType + cursorType
              }
              let position = d3.mouse(this)
              self.startPosition = position
              self.paraAdjustState = true
              self.duplicateCurrentDslObj()
              $('html,body').css('cursor',cursorType);
              self.DURATION = self.manipulationDuration
              self.PARAS_DURATION = self.manipulationDuration
            }
          })
        .on('mousemove', function(d, i) {
          let selectParaAttr = self.selectParaName
          let verticalUnit = self.verticalUnit
          let horizontalUnit = self.horizontalUnit
          if (self.paraAdjustState) {
            let adjustPosition = d3.mouse(this)
            let startPosition = self.startPosition
            let paraAttrArray = selectParaAttr.split('-')
            let paraAxis = paraAttrArray[1]
            let diffValue = 0
            if (paraAxis === 'x') {
              diffValue = (adjustPosition[0] - startPosition[0]) / horizontalUnit
            } else if (paraAxis === 'y') {
              diffValue = -(adjustPosition[1] - startPosition[1]) / verticalUnit
            }
            //  Change the value in DSLObj accordingly
            let endDslValue = self.adjustDslObj(selectParaAttr, diffValue)
            let endDslValuePercentage = Math.round(endDslValue * 100)
            self.MANIPULATE_PARA(selectParaAttr)
            self.MANIPULATE_VALUE(endDslValuePercentage)
            //  Updating DSL objects
            self.updateTreeUnitView()
          }
        })
        .on('mouseup', function(d, i) {
          $('html,body').css('cursor','default');
          self.paraAdjustState = false
          //  Update the DSLObj read in the TreeCanvas view to update the update on the TreeCanvas view
          sysDatasetObj.updateTreeDSLContentObject(self.dslName, self.dslObj)
          self.UPDATE_TREE_CANVAS_LAYOUT_STATE()
          //  Updates the DSL object selected in the DSLlist view
          sysDatasetObj.updateSelectedDSLObject(self.dslName, self.dslObj)
          self.UPDATE_TREE_PREVIEW_LAYOUT_STATE()
          self.DURATION = self.defaultDuration
          self.PARAS_DURATION = self.defaultDuration
          // Deselect the parameters
          self.cancelParasSelection()
        })
      },
      renderTreeParas_x_y: function(parasAreaDataArray) {
        let self = this
        let currentRootGId = self.treeGId
        let treeCanvasId = self.treeCanvasId
        // parasAreaDataArray = parasAreaDataArray.reverse()
        let parasNodeElement = d3.select('#' + currentRootGId)
          .selectAll('.paras-node-x-y')
          .data(parasAreaDataArray, function(d, i) {
            return d.elementName
          })
        //  Creating visual elements
        parasNodeElement.enter()
          .append('path')
          .attr('id',function(d, i) {
            return 'parasnode'+d.id
          })
          .attr('class', function(d, i) {
            return 'paras-node-x-y ' + d.elementClass + ' ' + d.elementName.toLowerCase()
          })
          .attr('property', function(d, i) {
            return d.parameterAxis
          })
          .attr('d', function(d, i) {
            return d.element
          })
          .attr('visibility', function(d, i) {
            return self.parasVisibility(d.elementClass, d.elementName)
          })
          // .on('mouseover', function(d, i) {
          //   let property = d3.select(this).attr('property')
          //   self.UPDATE_HOVER_PARAM({
          //     param: d.elementName,
          //     axis: property
          //   })
          // })
          .on('mousedown', function(d, i) {
            if (!d3.select(this).classed('selected')) {
              d3.select(self.$el).selectAll('.selected').classed('selected', false)
              d3.select(this).classed('selected', true)
              let property = d3.select(this).attr('property')
              let selectedParaName = d.elementName + '-' + property
              self.UPDATE_SELECT_PARA_NAME(selectedParaName)
            }  
          })
          //  The nodes are transitioned by animation transformation
        let fromArray = []
        let toArray = []
        let pathArray = []
        parasNodeElement.each(function(d, i) {
            let targetAnimationPath = d.element
            let currentAnimationPath = d3.select(this).attr("d")
            pathArray.push(d3.select(this).node())
            fromArray.push(currentAnimationPath)
            toArray.push(targetAnimationPath)
            //  Animation transitions other than path style
            d3.select(this)
              // .transition()
              // .duration(self.PARAS_DURATION)
              .attr('visibility', function(d, i) {
                return self.parasVisibility(d.elementClass, d.elementName)
              })
          })
        //  Transition after the end of the method
        let tweenPathsCallback = function () {
          parasNodeElement.each(function(d, i) {
            let targetPath = d.element
            d3.select(this)
              .attr('d', targetPath)
          })
        }
        if ((fromArray.length > 0) && (toArray.length > 0)) {
            if ((fromArray.length === toArray.length) && (fromArray[0] != null) && (toArray[0] != null) && 
                (typeof(fromArray[0]) !== 'undefined') && (typeof(toArray[0]) !== 'undefined')) {
          tweenPaths({duration: self.PARAS_DURATION, complete: tweenPathsCallback, from: fromArray, to: toArray, next: (d, i) => pathArray[ i ].setAttribute('d', d)})
          }
        } else {
          tweenPathsCallback()
        }
        //  Remove unnecessary visual elements
        parasNodeElement.exit().remove()
      },
      renderTreeParas_xy: function(parasAreaDataArray) {
        let self = this
        let currentRootGId = self.treeGId
        let treeCanvasId = self.treeCanvasId
        // parasAreaDataArray = parasAreaDataArray.reverse()
        let parasNodeElement = d3.select('#' + currentRootGId)
          .selectAll('.paras-node-xy')
          .data(parasAreaDataArray, function(d, i) {
            return d.elementName
          })
        //  Creating visual elements
        parasNodeElement.enter()
          .append('path')
          .attr('id',function(d, i) {
            return 'parasnode'+d.id
          })
          .attr('class', function(d, i) {
            return 'paras-node-xy ' + d.elementClass + ' ' + d.elementName.toLowerCase()
          })
          .attr('property', function(d, i) {
            return d.parameterAxis
          })
          .attr('d', function(d, i) {
            return d.element
          })
          .attr('visibility', function(d, i) {
            return self.parasVisibility(d.elementClass, d.elementName)
          })
          .on('mousedown', function(d, i) {
            if (!d3.select(this).classed('selected')) {
              d3.select(self.$el).selectAll('.selected').classed('selected', false)
              d3.select(this).classed('selected', true)
              let property = d3.select(this).attr('property')
              let selectedParaName = d.elementName + '-' + property
              self.UPDATE_SELECT_PARA_NAME(selectedParaName)
            }  
          })
          //  The nodes are transitioned by animation transformation
        let fromArray = []
        let toArray = []
        let pathArray = []
        parasNodeElement.each(function(d, i) {
            let targetAnimationPath = d.element
            let currentAnimationPath = d3.select(this).attr("d")
            pathArray.push(d3.select(this).node())
            fromArray.push(currentAnimationPath)
            toArray.push(targetAnimationPath)
            //  Animation transitions other than path style
            d3.select(this)
              // .transition()
              // .duration(self.PARAS_DURATION)
              .attr('visibility', function(d, i) {
                return self.parasVisibility(d.elementClass, d.elementName)
              })
          })
        //  Transition after the end of the method
        let tweenPathsCallback = function () {
          parasNodeElement.each(function(d, i) {
            let targetPath = d.element
            d3.select(this)
              .attr('d', targetPath)
          })
        }
        if ((fromArray.length > 0) && (toArray.length > 0)) {
          if ((fromArray.length === toArray.length) && (fromArray[0] != null) && (toArray[0] != null) && 
              (typeof(fromArray[0]) !== 'undefined') && (typeof(toArray[0]) !== 'undefined')) {
          tweenPaths({duration: self.PARAS_DURATION, complete: tweenPathsCallback, from: fromArray, to: toArray, next: (d, i) => pathArray[ i ].setAttribute('d', d)})
          }
        } else {
          tweenPathsCallback()
        }   
        //  Remove unnecessary visual elements
        parasNodeElement.exit().remove()  
      },
      duplicateCurrentDslObj: function() {
        this._dslObj = JSON.parse(JSON.stringify(this.dslObj))
      },
      //  Change the value of DSLobj
      adjustDslObj: function(selectParaAttr, diffValue) {
        let self = this
        let paraAttrArray = selectParaAttr.split('-')
        let paraName = paraAttrArray[0]
        let paraAxis = paraAttrArray[1].toUpperCase()
        diffValue = diffValue / 100
        //  All changes are based on previous changes
        if ('Layout' in this.dslObj) {
          if (paraName === 'RootMargin') {
            if (typeof(this.dslObj['Layout'][paraAxis]['Root']) !== 'undefined') {
              this.dslObj['Layout'][paraAxis]['Root']['Margin'] = this._dslObj['Layout'][paraAxis]['Root']['Margin'] + diffValue
            }
            return this.dslObj['Layout'][paraAxis]['Root']['Margin']
          } else if (paraName === 'RootLeftPadding') {
            if (typeof(this.dslObj['Layout'][paraAxis]['Root']) !== 'undefined') {
              this.dslObj['Layout'][paraAxis]['Root']['Padding'][0] = this._dslObj['Layout'][paraAxis]['Root']['Padding'][0] + diffValue
            }
            return this.dslObj['Layout'][paraAxis]['Root']['Padding'][0]
          } else if (paraName === 'RootRightPadding') {
            if (typeof(this._dslObj['Layout'][paraAxis]['Root']) !== 'undefined') {
              this.dslObj['Layout'][paraAxis]['Root']['Padding'][1] = this._dslObj['Layout'][paraAxis]['Root']['Padding'][1] + diffValue
            }
            return this.dslObj['Layout'][paraAxis]['Root']['Padding'][1]
          } else if (paraName === 'SubtreeMargin') {
            if (typeof(this._dslObj['Layout'][paraAxis]['Subtree']) !== 'undefined') {
              this.dslObj['Layout'][paraAxis]['Subtree']['Margin'] = this._dslObj['Layout'][paraAxis]['Subtree']['Margin'] + diffValue
            }
            return this.dslObj['Layout'][paraAxis]['Subtree']['Margin']
          }
        }
      },
      getParasDslContentObjectWithDefault: function(dslContentObjectWithDefault) { 
        let parasDslContentObjectWithDefault = JSON.parse(JSON.stringify(dslContentObjectWithDefault))
        for (let item in parasDslContentObjectWithDefault) {
          parasDslContentObjectWithDefault[item].Element.Node = 'rectangle'
        }
        return parasDslContentObjectWithDefault
      },
      //  Compute the TreeIndex that contains the parameter
      getParasTreeIndexWithDSL: function(treeIndexWithDSL, parasSpaceData) {
        let parasTreeIndexWithDSL = JSON.parse(JSON.stringify(treeIndexWithDSL))
        let dslName = parasTreeIndexWithDSL['index-0']
        for (let item in parasSpaceData) {
          if (!(item in parasTreeIndexWithDSL)) {
            parasTreeIndexWithDSL[item] = dslName
          }
        }
        return parasTreeIndexWithDSL
      },
      //  Space for calculating parameter values
      getParasSpaceData: function(AreaData) {
        let sgSpacePadding = 0.5
        let nodeSpacePadding = 2
        let paraAreaData = JSON.parse(JSON.stringify(AreaData))
        let rootObj = paraAreaData['index-0']
        //  Gets an array of the range corresponding to the node
        let occupiedSpaceData = rootObj.others
        let xSpaceData = occupiedSpaceData.X
        let ySpaceData = occupiedSpaceData.Y
        let parameterClassObj = {
          RootLeftPadding: 'padding',
          RootRightPadding: 'padding',
          SubtreeMargin: 'margin',
          RootMargin: 'margin',
          RootAlignment: 'alignment',
          SubtreeAlignment: 'alignment'
        }
        let fullParaObjArray = []
        let areaParameterClass = 'xy'
        //  Adds a node object to the Full Parameter array
        for (let item in paraAreaData) {
          let paraAreaObj = paraAreaData[item]
          if (item === 'index-0') {
            paraAreaObj.elementClass = 'root ' + areaParameterClass
            paraAreaObj.elementName = 'root'
          } else {
            paraAreaObj.elementClass = 'subtree ' + areaParameterClass
            paraAreaObj.elementName = 'subtree'
          }
          // The range of all nodes is indented inward
          paraAreaObj.Rootx = paraAreaObj.Rootx + nodeSpacePadding
          paraAreaObj.Rooty = paraAreaObj.Rooty + nodeSpacePadding
          paraAreaObj.RootWidth = paraAreaObj.RootWidth - nodeSpacePadding * 2
          paraAreaObj.RootHeight = paraAreaObj.RootHeight - nodeSpacePadding * 2  
          paraAreaObj.parameterAxis = areaParameterClass
          fullParaObjArray.push(paraAreaData[item])
        }
        //  Extract the occupied space array, mainly the Subtree group space
        let simpleSubtreeGroupArea = {x: rootObj.SubtreesX - sgSpacePadding, y: rootObj.SubtreesY - sgSpacePadding, 
                      width: rootObj.SubtreesWidth + 2 * sgSpacePadding, 
                      height: rootObj.SubtreesHeight + 2 * sgSpacePadding}
        let parameterAxis = 'xy'
        let subtreeGroupClass = "subtree-group " + parameterAxis
        let subtreeGroupName = "subtree-group"
        let fullSubtreeGroupParaObj = getParameterObjAttr(simpleSubtreeGroupArea, subtreeGroupClass, subtreeGroupName, parameterAxis)
        fullParaObjArray.push(fullSubtreeGroupParaObj)

        //  Extracting an array of parameters
        for (let item in xSpaceData) {
          let parameterAxis = 'x'
          let parameterClass = parameterClassObj[item] + ' ' + parameterAxis
          let parameterName = item
          if (Array.isArray(xSpaceData[item])) { 
            for (let i = 0; i < xSpaceData[item].length; i++) {
              let fullParaObj = getParameterObjAttr(xSpaceData[item][i], parameterClass, parameterName, parameterAxis)
              fullParaObjArray.push(fullParaObj)
            }
          } else {
            let fullParaObj = getParameterObjAttr(xSpaceData[item], parameterClass, parameterName, parameterAxis)
            fullParaObjArray.push(fullParaObj)
          }
        }
        for (let item in ySpaceData) {
          let parameterAxis = 'y'
          let parameterClass = parameterClassObj[item] + ' ' + parameterAxis
          let parameterName = item
          if (Array.isArray(ySpaceData[item])) {
            for (let i = 0; i < ySpaceData[item].length; i++) {
              let fullParaObj = getParameterObjAttr(ySpaceData[item][i], parameterClass, parameterName, parameterAxis)
              fullParaObjArray.push(fullParaObj)
            }
          } else {
            let fullParaObj = getParameterObjAttr(ySpaceData[item], parameterClass, parameterName, parameterAxis)
            fullParaObjArray.push(fullParaObj)
          }
        }
        let fullParaObjCollection = {}
        for (let i = 0; i < fullParaObjArray.length; i++) {
          let elementClass = fullParaObjArray[i].elementClass
          let elementId = fullParaObjArray[i].id
          // Example Set the ID of the parent node
          if (elementId !== 'index-0') {
            fullParaObjArray[i].fatherID = 'index-0'
          }
          if (typeof(fullParaObjArray[i].id) === 'undefined') {
            fullParaObjArray[i].id = 'index-' + i
          }
          fullParaObjCollection['index-' + i] = fullParaObjArray[i]
        }
        return fullParaObjCollection
        // Indent all elements inwards
        // Finally set all fatherID to null
        function getParameterObjAttr(simpleParaObj, parameterClass, parameterName, parameterAxis) {
          let parameterSpacePadding = 1
          if ((parameterName === 'RootAlignment') || (parameterName === 'SubtreeAlignment')) {
            parameterSpacePadding = 2
          } 
          let simpleParaObjWidth = simpleParaObj.width
          let simpleParaObjHeight = simpleParaObj.height
          let simpleParaObjX = simpleParaObj.x
          let simpleParaObjY = simpleParaObj.y
          let fullParaObj = {
            x: simpleParaObjX + parameterSpacePadding,
            y: simpleParaObjY + parameterSpacePadding,
            Width: simpleParaObjWidth - parameterSpacePadding * 2,
            Height: simpleParaObjHeight - parameterSpacePadding * 2,
            Rootx: 0,
            Rooty: 0, 
            RootWidth: simpleParaObjWidth - parameterSpacePadding * 2,
            RootHeight: simpleParaObjHeight - parameterSpacePadding * 2,
            SubtreesX: 0,
            SubtreesY: 0,
            SubtreesWidth: 0,
            SubtreesHeight: 0,
            fatherID: null,
            elementClass: parameterClass,
            elementName: parameterName,
            parameterAxis: parameterAxis
          }
          return fullParaObj
        }
      },
      /**
       * [clear the canvas of the GoTree rendering results]
       * @return {[Null]} [description]
       */
      clearTreeCanvas: function() {
        let self = this
        let currentRootGId = self.treeGId
        d3.select('#' + currentRootGId)
          .selectAll('*')
          .remove()
      },
      removeTreeNodeLabel: function() {
        let currentRootGId = this.treeGId
        d3.select('#' + currentRootGId).selectAll('.node-label').remove()
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
            return d.labelValue
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
            return d.labelValue
          })
          treeNodeLabelElement.exit().remove()
      },
      //  Delete the link between nodes
      removeTreeLink: function() {
        let currentRootGId = this.treeGId
        d3.select('#' + currentRootGId).selectAll('.link').remove()
      },
      appendTreeLink: function(linkDataArray) {
        let self = this
        let currentRootGId = self.treeGId
        //Draw the link
        let linkElements = d3.select(this.$el).select('#' + currentRootGId)
          .selectAll('.link')
          .data(linkDataArray)
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
          .attr('stroke-width', function(d) {
            return d.link_width
          })
          .attr('fill', 'none')
      },

      renderTreeLink: function (linkDataArray) {
        let self = this
        let currentRootGId = self.treeGId
        //Draw the link
        let linkElements = d3.select(this.$el).select('#' + currentRootGId)
          .selectAll('.link')
          .data(linkDataArray)
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
          .attr('stroke-width', function(d) {
            return d.link_width
          })
          .attr('fill', 'none')
        //  The nodes are transitioned by animation transformation
        let fromLinkArray = []
        let toLinkArray = []
        let linkPathArray = []
        //  The lines between nodes are transitioned by animation
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
          //  Other style animation transitions besides path shapes
          d3.select(this)
            // .transition()
            // .duration(self.DURATION)
            .attr('stroke-width', function(d) {
              return d.link_width
            })
            .attr('fill','none')
        })
        linkElements.exit().remove()
        //  The path of the connection between nodes is animated by deformation
        let tweenLinkPathsCallback = function () {
          linkElements.each(function(d, i) {
            d3.select(this)
              .attr('d', d.pathAttr)
          })
          // Once all the changes are done, delete all the LinearNode nodes and redraw, making sure the nodes are at the top
          if (self.linkDisplayTop) { //  when display the tree nodes on the top
            setTimeout(function() {
              d3.select(self.$el).select('#' + currentRootGId).selectAll('.link') .remove()
              // Delete nodes and then add nodes
              self.appendTreeLink(linkDataArray)
            }, 200) 
          } 
        }
        //  Determine whether objects in fromLinkArray and toLinkArray are null
        if ((fromLinkArray.length > 0) && (toLinkArray.length > 0)) {
          if ((fromLinkArray.length === toLinkArray.length) && (fromLinkArray[0] != null) && (toLinkArray[0] != null) && 
              (typeof(fromLinkArray[0]) !== 'undefined') && (typeof(toLinkArray[0]) !== 'undefined')) {
          //  The Transition animation happens only if the objects in fromLinkArray and toLinkArray are not null
          tweenPaths({duration: self.DURATION, complete: tweenLinkPathsCallback, from: fromLinkArray, to: toLinkArray, next: (d, i) => linkPathArray[ i ].setAttribute('d', d)})
          }
        } else {
          tweenLinkPathsCallback()
        }
      },
      removeTreeNode: function() {
        let currentRootGId = this.treeGId
        d3.select('#' + currentRootGId).selectAll('.lineartree-node').remove()
      },
      appendTreeNode: function(areaDataArray) {
        let self = this
        let nodeArray = self.nodeArray
        let currentRootGId = self.treeGId
        let treelayout = this.layouts
        if (!treeNodeValidate(areaDataArray)) {
          d3.select(this.$el)
            .select('#' + currentRootGId)
            .selectAll('.lineartree-node-g')
            .remove()
          let message = "The element of tree node is none. | TreeCanvas.js"
          throwGoTreeError(message)
          return
        }
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
          .attr('fill', function(d) {
            return d.node_color
          })
          .style('stroke-width', function(d) {
            return d.stroke_width
          })
          .style("opacity",1)
        //  The label of a node is added
        treeNodeElementG.each(function(d, i) {
          //  Text will be added to G only if Node-label does not exist in TreeNodeElementG, otherwise duplication will occur
          if ((d3.select(this).select('.unit-node-label').empty()) && (d.fontSize !== 0)) {
            d3.select(this)
              .append("defs")
              .append("path")
              .attr('class', 'unit-label-curve')
              .attr("id", function(d) {
                return "unit-curve-" + d.id
              })
              .attr("d", function(d) {
                return d.labelPath
              });
            d3.select(this)
              .append("text")
              .attr('class','unit-node-label')
              .attr("id", function(d) {
                return "unit-node-label-" + d.id 
              })
              .append("textPath")
              .attr("xlink:href", function(d, i) {
                return "#unit-curve-" + d.id
              })
              .text(function(d, i) {
                return d.labelValue
              })
              .style('text-anchor', function(d) {
                return d.textAnchor
              })
              .attr('transform', function(d) {
                return 'translate(' + 0 + ',' + 0 + ')rotate(' + d.rotation +')' 
              })
              .style('font-size', function(d) {
                return d.fontSize
              })
              .attr('alignment-baseline', 'middle')
              .attr('startOffset', '50%')
          }
        })
      },
      renderTreeNode: function(areaDataArray) {
        let self = this
        let nodeArray = self.nodeArray
        let currentRootGId = self.treeGId
        let treelayout = this.layouts
        if (!treeNodeValidate(areaDataArray)) {
          d3.select(this.$el)
            .select('#' + currentRootGId)
            .selectAll('.lineartree-node-g')
            .remove()
          let message = "The element of tree node is none. | TreeCanvas.js"
          throwGoTreeError(message)
          return
        }
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
          .attr('fill', function(d) {
            return d.node_color
          })
          .style('stroke-width', function(d) {
            return d.stroke_width
          })
          .style("opacity",1)
        //  The label of a node is added
        treeNodeElementG.each(function(d, i) {
          //  Text will be added to G only if Node-label does not exist in TreeNodeElementG, otherwise duplication will occur
          if ((d3.select(this).select('.unit-node-label').empty()) && (d.fontSize !== 0)) {
            d3.select(this)
              .append("defs")
              .append("path")
              .attr('class', 'unit-label-curve')
              .attr("id", function(d) {
                return "unit-curve-" + d.id
              })
              .attr("d", function(d) {
                return d.labelPath
              });
            d3.select(this)
              .append("text")
              .attr('class','unit-node-label')
              .attr("id", function(d) {
                return "unit-node-label-" + d.id 
              })
              .append("textPath")
              .attr("xlink:href", function(d, i) {
                return "#unit-curve-" + d.id
              })
              .text(function(d, i) {
                return d.labelValue
              })
              .style('text-anchor', function(d) {
                return d.textAnchor
              })
              .attr('transform', function(d) {
                return 'translate(' + 0 + ',' + 0 + ')rotate(' + d.rotation +')' 
              })
              .style('font-size', function(d) {
                return d.fontSize
              })
              .attr('alignment-baseline', 'middle')
              .attr('startOffset', '50%')
          }
        })
        //  Update the path in each treeNodeElementG
        let fromArray = []
        let toArray = []
        let pathArray = []
        treeNodeElementG.each(function(d, i) {
            let targetAnimationPath = d.element
            let currentAnimationPath = d3.select(this).select('.lineartree-node').attr("d")
            pathArray.push(d3.select(this).select('.lineartree-node').node())
            fromArray.push(currentAnimationPath)
            toArray.push(targetAnimationPath)
            //  Animation transitions other than path style
            d3.select(this)
              .select('.lineartree-node')
              // .transition()
              // .duration(self.DURATION)
              .attr('fill', function (d) {
                return d.node_color
              })
              .style('stroke-width', function(d) {
                return d.stroke_width
              })
              .style("opacity",1)
            d3.select(this)
              .select('.unit-label-curve')
              // .transition()
              // .duration(self.DURATION)
              .attr("d", function(d) {
                return d.labelPath
              });
            //  Update the label of a node
            d3.select(this)
              .select('.unit-node-label')
              .select('textPath')
              // .transition()
              // .duration(self.DURATION)
              .attr("xlink:href", function(d, i) {
                return "#unit-curve-" + d.id
              })
              .style('text-anchor', function(d) {
                return d.textAnchor
              })
              .style('font-size', function(d) {
                return d.fontSize
              })
              .text(function(d, i) {
                return d.labelValue
              })
              .attr('transform', function(d) {
                return 'translate(' + 0 + ',' + 0 + ')rotate(' + d.rotation +')' 
              })
              .attr('alignment-baseline', 'middle')
              .attr('startOffset', '50%')
        })
        //  Transition after the end of the method
        let tweenPathsCallback = function () {
          treeNodeElementG.each(function(d, i) {
              let targetPath = d.element
              d3.select(this)
                .select('.lineartree-node')
                .attr('d', targetPath)
            })
          // Once all the changes are done, delete all the LinearNode nodes and redraw, making sure the nodes are at the top
          if (!self.linkDisplayTop) { //  when display the tree nodes on the top
            setTimeout(function() {
              d3.select(self.$el).select('#' + currentRootGId).selectAll('.lineartree-node-g') .remove()
              // Delete nodes and then add nodes
              self.appendTreeNode(areaDataArray)
            }, 200) 
          }       
        }
        if ((fromArray.length > 0) && (toArray.length > 0)) {
          if ((fromArray.length === toArray.length) && (fromArray[0] != null) && (toArray[0] != null) && 
                (typeof(fromArray[0]) !== 'undefined') && (typeof(toArray[0]) !== 'undefined')) {
            tweenPaths({duration: self.DURATION, complete: tweenPathsCallback, from: fromArray, to: toArray, next: (d, i) => pathArray[ i ].setAttribute('d', d)})
          }
        } else {
          tweenPathsCallback()
        }
        //  Remove unnecessary visual elements
        treeNodeElementG.exit().remove()
      }
    }
  }
</script>

<style lang="less">
  @treeunit-bg-color: #f9f9f9;
  .link {
    stroke: #606060;
    fill: none;
  }
  .tree-unit-canvas {
    background: @treeunit-bg-color;
    .root {
      fill: #d1d3d4;
      opacity: 0.5;
      &.selected, &:hover {
        opacity: 1;
      }
    }
    .outer-bg {
      fill: @treeunit-bg-color;
    }
    .inner-bg {
      fill: @treeunit-bg-color;
      // stroke: #9e9e9e;
      // stroke-width: 0.05rem;
    }
    .subtree {
      fill: #d1d3d4;
      stroke-width: 1px;
      stroke: #444444;
      opacity: 0.5;
      &.selected, &:hover {
        opacity: 1;
      }
    }
    .subtree-group {
      fill: none;
      stroke-width: 1px;
      stroke: #444444;
      stroke-dasharray: 3px 3px;
      opacity: 0.7;
      &.selected, &:hover {
        opacity: 1;
        stroke-width: 1.5px;
      }
    }
    .margin {
      fill: white;
      // fill: white;
      opacity: 0.4;
      &.x {
        cursor: ew-resize;  
      }
      &.y {
        cursor: ns-resize;
      }
      &.subtreemargin.selected, &.subtreemargin:hover {
        opacity: 0.4;
        stroke: #984ea3;
        fill: #984ea3;
        stroke-width: 1px;
      }
      &.rootmargin.selected, &.rootmargin:hover {
        opacity: 0.4;
        stroke: #ff7f00;
        stroke-width: 1px;
        fill: #ff7f00 ;
      }
    }
    .padding {
      fill: white;
      // fill: white;
      opacity: 0.4;
      &.x {
        cursor: ew-resize;
      }
      &.y {
        cursor: ns-resize;
      }
      &.selected, &:hover {
        opacity: 0.4;
        stroke: #4daf4a;
        stroke-width: 1px;
        fill: #4daf4a;
      }
    }
    .alignment {
      fill: none;
      opacity: 0.5;
      stroke: #ec008c;
      stroke-width: 2px;
      stroke-dasharray: 3px 7px;
      &.selected, &:hover {
        stroke: #ec008c;
        stroke-width: 3.5px;
        fill: #ec008c;
      }
    }
  }
</style>
<style scoped lang="less">
  .treeunit-container {
    position: absolute;
    background-color: #fff;
    position: absolute;
    left: 0%;
    top: 0%;
    width: 100%;
    height: 100%;
    #drop-container {
      width: 100%;
      height: 100%;
      .tree-unit-canvas {
        position: absolute;
        left: 0%;
        top: 0%;
        width: 100%;
        height: 100%;
      }
    }
  }
</style>