import { createVisualElement, computeVisualElementPos, computeAreaLabelPath} from '@/computation/visual_element_attr.js'
import { getIsRootCentricAttribute } from '@/data-processing/get_root_centric_attribute.js'
import { translatePath } from '@/computation/translate_path.js'
//  import different link object
import { ArcCurve } from '@/link/ArcCurve.js';
import { Curve } from '@/link/Curve.js';
import { CurveStepAfter } from '@/link/CurveStepAfter.js';
import { CurveStepBefore } from '@/link/CurveStepBefore.js';
import { CurveStepX } from '@/link/CurveStepX.js';
import { LinkHorizontal } from '@/link/LinkHorizontal.js';
import { Orthogonal } from '@/link/Orthogonal.js';
import { Straight } from '@/link/Straight.js';

export function getNodeLinkAttr (areaData, dslContentObject, treeIndexWithDSL, treeViewPosLenObj, nodeArray) {
    /**
     * compute the visual elements, nodes and links 
     */
    // areaData is a object to save all the attributes, 
    // the key of this object is the incident id, for example, 'index-0', 'index-1', ..., 'index-26', ...
    // nodeIdArray is ['index-1', 'index-2', ..., 'index-10', ...]
    let nodeIdArray = []
    for (let nodeId in areaData) {
      nodeIdArray.push(nodeId)
    }
    // sort nodeIdArray according to the node id
    nodeIdArray = nodeIdArray.sort(function(a, b) {
      var aNum = a.replace('index-', '')
      var bNum = b.replace('index-', '')
      return aNum - bNum
    })
    // setting the root node id of the whole tree
    let currentRootID = nodeIdArray[0]
    // transform the areaDataObject into array, [{}, {}, {}, ..., {}]
    // construct the linkDataArray, [{beginid: 'index-1', endid: 'index-2'}, {beginid: '', endid: ''}, ......]
    // and used as the links between the nodes
     let areaDataArray = []
    let linkDataArray = []
    for (let item in areaData) {
      areaDataArray.push(areaData[item])
      if (areaData[item].fatherID != null) {
        let linkdata = {'beginid': areaData[item].fatherID, 'endid': areaData[item].id}
        linkDataArray.push(linkdata)
      }
    }
    //  nodeArrayObj is the original data, this data object saves the raw data, mainly record  
    //  the parent-child relationships among different nodes
    //  [{
    //    children: [],
    //    data: {
    //      index: 'index-0'
    //    }, // mainly the attribute values
    //    depth: 0,
    //    height: 2
    //  }, {}, {}]
    let nodeArrayObj = {}
    if (typeof(nodeArray) !== 'undefined') {
      for (let i = 0; i < nodeArray.length; i++) {
         let nodeObj = nodeArray[i]
         let nodeIndex = nodeObj.data.index
         nodeArrayObj[nodeIndex] = nodeObj.data
      }
    }
    //  extract the node position of nodes in tree visualizations, 
    //  mainly used the attributes, x, y, Rootx, Rooty, RootWidth, RootHeight
    let areaDataNodePosArray = computeAreaDataNodePosArray(areaDataArray)
    //  extract the position of the whole subtree in tree visualizations
    //  mainly used the attributes: x, y, TreeWidth, TreeHeight
    let areaDataTreePosArray = computeAreaDataTreePosArray(areaDataArray)
    //  compute the path of label in tree visualization nodes
    let areaLabelPathArray = computeAreaLabelPathArray(areaDataArray)
    //  compute the range of all nodes in the whole tree visualization
    let wholetreeDataRange = computeWholeTreeDataRange(areaDataNodePosArray)
    // compute the maximum static size of the visual element
    let maxElementStaticSize = computeMaxElementStaticSize(areaDataArray, treeViewPosLenObj)
    //  compute the object array about different attributes, 
    //  including the node position, tree position, label path, etc. 
    for (let i = 0; i < areaDataArray.length; i++) {
      let areaDataObj = areaDataArray[i]
      let areaDataNodePosObj = areaDataNodePosArray[i]
      let areaDataTreePosObj = areaDataTreePosArray[i]
      let areaLabelPathObj = areaLabelPathArray[i]
      computeNodeDataAttr(areaDataObj, areaDataNodePosObj, areaDataTreePosObj, wholetreeDataRange, areaLabelPathObj, areaDataArray, treeViewPosLenObj, maxElementStaticSize)
    }
    // let minViewLength = treeViewPosLenObj['height']>treeViewPosLenObj['width']?treeViewPosLenObj['width']:treeViewPosLenObj['height']
    // let maxStaticCircleSize = 
    // compute the direct lines between the nodes in tree visualization 
    for (let i = 0; i < linkDataArray.length; i++) {
      let linkdata = linkDataArray[i]
      linkdata.pathAttr = directLineData(linkdata, wholetreeDataRange)
    }
    computeNodeLabelDataAttr(areaDataArray)
    return [areaDataArray, linkDataArray]
    // compute the maximum element static size
    function computeMaxElementStaticSize(areaDataArray, treeViewPosLenObj) {
      let depthCountObj = {}
      let sizeRatio = 1.2
      // set minimum static size of the visual element
      let minElementStaticSize = 2
      for (let i = 0; i < areaDataArray.length; i++) {
        let areaDataObj = areaDataArray[i]
        let nodeDepth = areaDataObj['depth']
        if (typeof(depthCountObj[nodeDepth]) === 'undefined') {
          depthCountObj[nodeDepth] = 0
        }
        depthCountObj[nodeDepth] += 1
      }
      let treeWidth = 0
      for (let depth in depthCountObj) {
        let levelWidth = depthCountObj[depth]
        treeWidth = treeWidth>levelWidth?treeWidth:levelWidth
      }
      let viewWidth = treeViewPosLenObj['width']
      let viewHeight = treeViewPosLenObj['height']
      let minViewLength = viewWidth>viewHeight?viewHeight:viewWidth
      let maxElementStaticSize = Math.floor(minViewLength / (treeWidth * sizeRatio))
      maxElementStaticSize = maxElementStaticSize<minElementStaticSize?minElementStaticSize:maxElementStaticSize
      return maxElementStaticSize
    }
    //  Compute an array of node positions in areaDataArray
    function computeAreaDataNodePosArray(areaDataArray) {
      let areaDataNodePosArray = []
      for(let i = 0; i < areaDataArray.length; i++) {
        let nodeObj = areaDataArray[i]
        let nodeObjX = nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth / 2
        let nodeObjY = nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight / 2
        areaDataNodePosArray.push({x: nodeObjX, y: nodeObjY})
      }
      return areaDataNodePosArray
    }

    function computeAreaDataTreePosArray(areaDataArray) {
      let areaDataTreePosArray = []
      for(let i = 0; i < areaDataArray.length; i++) {
        let nodeObj = areaDataArray[i]
        let treeObjX = nodeObj.x + nodeObj.Width / 2
        let treeObjY = nodeObj.y + nodeObj.Height / 2
        areaDataTreePosArray.push({x: treeObjX, y: treeObjY})
      }
      return areaDataTreePosArray
    }
    //  Calculate the path corresponding to the node label in areaDataArray
    function computeAreaLabelPathArray(areaDataArray) {
      let areaLabelPathArray = []
      for(let i = 0; i < areaDataArray.length; i++) {
        let nodeObj = areaDataArray[i]
        let nodeObjId = nodeObj.id
        let areaDataObjDSL = dslContentObject[treeIndexWithDSL[nodeObjId]]
        let textDx = 0, textDy = 0
        if ('TextDx' in areaDataObjDSL.Element) {
          textDx = areaDataObjDSL.Element.TextDx
        }
        if ('TextDy' in areaDataObjDSL.Element) {
          textDy = areaDataObjDSL.Element.TextDy
        }
        let areaLabelPathStartPosX = 0, areaLabelPathStartPosY = 0,
          areaLabelPathEndPosX = 0, areaLabelPathEndPosY = 0
        let areaLabelPathObj = {}
        if (areaDataObjDSL.CoordinateSystem.Category === 'cartesian') {
          if (nodeObj.RootWidth >= nodeObj.RootHeight) {

            areaLabelPathObj = computeHorizontalLabelPath(nodeObj, textDy)
          } else {

            areaLabelPathObj = computeVerticalLabelPath(nodeObj, textDx)
          }
        } else if (areaDataObjDSL.CoordinateSystem.Category === 'polar') {
          if (areaDataObjDSL.CoordinateSystem.PolarAxis === 'x-axis') {

            if (nodeObj.RootWidth >= (nodeObj.RootHeight * 1.5)) {

              areaLabelPathObj = computeHorizontalLabelPath(nodeObj, textDy)
            } else {

              areaLabelPathObj = computeVerticalLabelPath(nodeObj, textDx)
            }
          } else if (areaDataObjDSL.CoordinateSystem.PolarAxis === 'y-axis') {

            if (nodeObj.RootHeight >= (nodeObj.RootWidth * 1.5)) {

              areaLabelPathObj = computeVerticalLabelPath(nodeObj, textDx)
            } else {

              areaLabelPathObj = computeHorizontalLabelPath(nodeObj, textDy)
            }
          }
        } 
        let areaLabelPathStartPos = {x: areaLabelPathObj.areaLabelPathStartPosX, y: areaLabelPathObj.areaLabelPathStartPosY}
        let areaLabelPathEndPos = {x: areaLabelPathObj.areaLabelPathEndPosX, y: areaLabelPathObj.areaLabelPathEndPosY}
        areaLabelPathArray.push({start: areaLabelPathStartPos, end: areaLabelPathEndPos})
      }
      return areaLabelPathArray
      //  Calculate the vertical label path
      function computeVerticalLabelPath(nodeObj, textDx) {
        let areaLabelPathObj = {}
        areaLabelPathObj.areaLabelPathStartPosX = nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth / 2 + textDx * nodeObj.RootWidth
        areaLabelPathObj.areaLabelPathEndPosX = nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth / 2 + textDx * nodeObj.RootWidth
        areaLabelPathObj.areaLabelPathStartPosY = nodeObj.y + nodeObj.Rooty
        areaLabelPathObj.areaLabelPathEndPosY = nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight
        return areaLabelPathObj
      }
      //  Calculate the horizontal  label path
      function computeHorizontalLabelPath(nodeObj, textDy) {
        let areaLabelPathObj = {}
        areaLabelPathObj.areaLabelPathStartPosX = nodeObj.x + nodeObj.Rootx
        areaLabelPathObj.areaLabelPathEndPosX = nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth
        areaLabelPathObj.areaLabelPathStartPosY = nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight / 2 + textDy * nodeObj.RootHeight
        areaLabelPathObj.areaLabelPathEndPosY = nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight / 2 + textDy * nodeObj.RootHeight
        return areaLabelPathObj
      }
    }
    //  Compute node label position array
    function computeNodeLabelDataAttr (areaDataArray) {
       let initMaxTextSize = 100, maxTextSize = 100, minTextSize = 2, hiddenFontSize = 0
       let totalR = treeViewPosLenObj.width>treeViewPosLenObj.height?treeViewPosLenObj.height/2:treeViewPosLenObj.width/2
       for (let i = 0;i < areaDataArray.length;i++) {
         let areaDataObj = areaDataArray[i]
         let rootHeight = areaDataObj.RootHeight
         let rootWidth = areaDataObj.RootWidth

         let areaDataObjId = areaDataObj.id
         let areaDataObjDSL = dslContentObject[treeIndexWithDSL[areaDataObjId]]
         let elementLabelAttr = areaDataObjDSL.Element.Label
         let elementLabelDx = 0
         if ('TextDx' in areaDataObjDSL.Element) {
           elementLabelDx = areaDataObjDSL.Element.TextDx
         }
         let elementLabelDy = 0
         if ('TextDy' in areaDataObjDSL.Element) {
           elementLabelDy = areaDataObjDSL.Element.TextDy
         } 
         if (areaDataObjDSL.CoordinateSystem.Category === 'polar') {
           if ('pos' in areaDataObj) {
              let labelR = areaDataObj.pos.r
              let labelRatio = labelR / totalR
              if (areaDataObjDSL.CoordinateSystem.PolarAxis === 'x-axis') {
                //  If the polar axis is the X-axis, the transverse length decreases by half
                rootWidth = rootWidth / 2

                let lengthRatio = 2 * Math.PI * labelR / treeViewPosLenObj.height
                rootHeight = rootHeight * lengthRatio
              } else if (areaDataObjDSL.CoordinateSystem.PolarAxis === 'y-axis') {
                //  The polar axis is the Y-axis, and the longitudinal length decreases generally
                rootHeight = rootHeight / 2
                //  The transverse length times a certain ratio
                let lengthRatio = 2 * Math.PI * labelR / treeViewPosLenObj.width
                rootWidth = rootWidth * lengthRatio
              }
           }
         }
         let maxLength = rootHeight<rootWidth?rootWidth:rootHeight
         let minLength = rootHeight>rootWidth?rootWidth:rootHeight
         //  Determine the relative size of the width and length of the root node
         if (areaDataObj.RootWidth >= areaDataObj.RootHeight) {
           //  Dx will affect the specific proportion on the path
           areaDataObj.labelPathPos = 50 + elementLabelDx * 50
         } else {
           //  Dy will affect the specific proportion on the path
           areaDataObj.labelPathPos = 50 + elementLabelDy * 50
         }
         let elementLabelValue = ""
         if ((typeof(elementLabelAttr) !== 'undefined') && (elementLabelAttr !== "hidden") 
               && (elementLabelAttr != null) && (elementLabelAttr !== 'null')
               && typeof(nodeArrayObj[areaDataObjId]) !== 'undefined') {
           if (elementLabelAttr in nodeArrayObj[areaDataObjId]) {
             elementLabelValue = nodeArrayObj[areaDataObjId][elementLabelAttr]
           }
         }
         areaDataObj.labelValue = elementLabelValue
         //  Calculate the font size of the label
         let fontSize = (minLength / 2) > maxTextSize ? maxTextSize : (minLength / 2)
         fontSize = fontSize > minTextSize ? fontSize : hiddenFontSize
         fontSize = fontSize > minTextSize ? fontSize : hiddenFontSize
         // Determine whether it is in the middle part of the polar coordinate system. If it is in the middle part, the label on the node is not displayed
         let maxLengthSideFontSize = Math.floor(maxLength / areaDataObj.labelValue.length)
         let minLengthSideFontSize = Math.floor(minLength / 2)
         let finalFontSize = maxLengthSideFontSize>minLengthSideFontSize?minLengthSideFontSize:maxLengthSideFontSize
         finalFontSize = finalFontSize>hiddenFontSize?finalFontSize:hiddenFontSize
         finalFontSize = finalFontSize>initMaxTextSize?initMaxTextSize:finalFontSize
         areaDataObj.fontSize = finalFontSize + 'px'
         //  Calculate rotation Angle
         areaDataObj.rotation = 0
         if ('TextRotation' in areaDataObjDSL.Element) {
           areaDataObj.rotation = areaDataObjDSL.Element.TextRotation * 180
         }
         // Calculate the alignment position
         areaDataObj.textAnchor = 'middle'
         if ('TextAnchor' in areaDataObjDSL.Element) {
           areaDataObj.textAnchor = areaDataObjDSL.Element.TextAnchor
         }
         areaDataObj.tooltip = []
         if ('Tooltip' in areaDataObjDSL.Element) {
           areaDataObj.tooltip = areaDataObjDSL.Element.Tooltip
         }
         if (!('rotation' in areaDataObj)) {
           areaDataObj.rotation = 0
         }
       }
    }
    //  compute the range of subtree node positions
    //  it is used to place nodes in the polar coordinate system
    function computeWholeTreeDataRange(areaDataNodePosArray) {
      let _wholeTreeDataRange = { xmin: Infinity, ymin: Infinity, xmax: 0, ymax: 0 }
      for(let i = 0; i < areaDataNodePosArray.length; i++) {
        let nodePosObj = areaDataNodePosArray[i]
        let nodeObjX = nodePosObj.x
        let nodeObjY = nodePosObj.y
        if (_wholeTreeDataRange.xmin > nodeObjX) {
          _wholeTreeDataRange.xmin = nodeObjX
        }
        if (_wholeTreeDataRange.xmax < nodeObjX) {
          _wholeTreeDataRange.xmax = nodeObjX
        }
        if (_wholeTreeDataRange.ymin > nodeObjY) {
          _wholeTreeDataRange.ymin = nodeObjY
        }
        if (_wholeTreeDataRange.ymax < nodeObjY) {
          _wholeTreeDataRange.ymax = nodeObjY
        }
      }
      let wholetreeDataRange = {
        "x": _wholeTreeDataRange.xmin,
        "y": _wholeTreeDataRange.ymin,
        "TreeWidth": _wholeTreeDataRange.xmax - _wholeTreeDataRange.xmin,
        "TreeHeight": _wholeTreeDataRange.ymax - _wholeTreeDataRange.ymin
      }
      return wholetreeDataRange
    }
    /**
     * compute the detailed information of visual elements in tree visualization
     * @param  {[type]} areaDataObj        [the detailed information of each node]
     * @param  {[type]} areaDataNodePosObj [the specific node position of each node]
     * @param  {[type]} areaDataTreePosObj [the speccificn position of corresponding subtree for different nodes]
     * @param  {[type]} wholetreeDataRange [the range of whole tree visualization, including x, y, width, and height]
     * @param  {[type]} areaLabelPathObj   [the path of area label for the nodes in tree visualizations]
     * @param  {[type]} areaDataArray      [the whole nodes array, contains the detail information of all nodes in tree visualizations ]
     * @return {[type]}                    [description]
     */
    function computeNodeDataAttr(areaDataObj, areaDataNodePosObj, areaDataTreePosObj, wholetreeDataRange, areaLabelPathObj, areaDataArray, treeViewPosLenObj, maxElementStaticSize) {
      let coordinateSystem = dslContentObject[treeIndexWithDSL[areaDataObj.id]].CoordinateSystem.Category
      let WidthScale = treeViewPosLenObj.width/areaData[currentRootID].Width
      let HeightScale = treeViewPosLenObj.height/areaData[currentRootID].Height
      // positions of root node
      let movex = 0, movey = 0
      if (areaDataObj.fatherID != null) {
        movex = areaData[currentRootID].x //- areaData[areaDataObj.fatherID].SubtreesX 
        movey = areaData[currentRootID].y //- areaData[areaDataObj.fatherID].SubtreesY//
      }
      // set the raw data (attribute values of data object) with the areaDataObj
      if (typeof(nodeArrayObj[areaDataObj.id]) !== 'undefined') {
        areaDataObj.data = nodeArrayObj[areaDataObj.id]
      }
      // set the name attribute from inner data attribute with the node object
      let nodeObjName = ''
      if (typeof(nodeArrayObj[areaDataObj.id]) !== 'undefined') {
        nodeObjName = nodeArrayObj[areaDataObj.id].name
      }
      areaDataObj.name = nodeObjName
      // set the value attribute from inner data attribute with the node object
      let nodeObjValue = 0
      if (typeof(nodeArrayObj[areaDataObj.id]) !== 'undefined') {
        nodeObjValue = nodeArrayObj[areaDataObj.id].value
      }
      areaDataObj.value = nodeObjValue
      // get the dsl about the visual element
      let elementObj = dslContentObject[treeIndexWithDSL[areaDataObj.id]].Element
      let nodeObj = {
                     'id': areaDataObj.id,
                     'x': (areaData[areaDataObj.id].x + movex) * WidthScale,
                     'y': (areaData[areaDataObj.id].y + movey) * HeightScale,
                     'Rootx': areaData[areaDataObj.id].Rootx * WidthScale,
                     'Rooty': areaData[areaDataObj.id].Rooty * HeightScale,
                     'RootWidth': areaData[areaDataObj.id].RootWidth * WidthScale,
                     'RootHeight': areaData[areaDataObj.id].RootHeight * HeightScale,
                     'isLeaf': areaData[areaDataObj.id].isLeaf,
                     'Width': areaData[areaDataObj.id].Width * WidthScale,
                     'Height': areaData[areaDataObj.id].Height * HeightScale,
                     'depth': areaData[areaDataObj.id].depth
                    }
      // TODO to improve the efficiency, remove this part
      // if (isNaN(nodeObj.x) || isNaN(nodeObj.RootWidth)) {
      //   console.log('areaData[areaDataObj.id].Rootx', areaData[areaDataObj.id].Rootx)
      // }
      // compute the detailed information of two coordinate systems, including:
      //    - subtreeData, and
      //    - coordinate system
      // the first coordinate system is to compute the visual element,
      // the second coordinate system is to compute the node layout
      // for root-centric polar coordinate system, the subtreeData is the subtree data at the top level, 
      //   these two coordinate system should be same
      // for parent-centric polar coordinate system, 
      //    - the subtree data to compute visual element is the current subtreeData
      //    - the coordinate system to compute node layout is subtreeData in the upper level
      // the coordinate system is either polar coordinate system or cartesian coordinate system
      let minTraversalNum_visualelement = 0
      let subTreeData_coordinateSystem_visualelement = computeShallowest(coordinateSystem, areaDataObj, minTraversalNum_visualelement)
      let subTreeData_visualelement = subTreeData_coordinateSystem_visualelement['SubTreeData']
      let currentNodeCoordinateSystemObj_visualelement = subTreeData_coordinateSystem_visualelement['CoordinateSystem']
      //  the coordinate system is to compute the layout of visual element
      let minTraversalNum_layout = 1
      let subTreeData_coordinateSystem_layout = computeShallowest(coordinateSystem, areaDataObj, minTraversalNum_layout)
      let subTreeData_layout = subTreeData_coordinateSystem_layout['SubTreeData']
      let currentNodeCoordinateSystemObj_layout = subTreeData_coordinateSystem_layout['CoordinateSystem']
      //  update the wholetreeDataRange object according to the axis of polar coordinate system
      if (subTreeData_coordinateSystem_layout.Category === 'polar') {
        if (subTreeData_coordinateSystem_layout.PolarAxis === 'y-axis') {
          wholetreeDataRange['x'] = subTreeData['x']
          wholetreeDataRange['TreeWidth'] = subTreeData['TreeWidth']
        } else if (subTreeData_coordinateSystem_layout.PolarAxis === 'x-axis') {
          wholetreeDataRange['y'] = subTreeData['y']
          wholetreeDataRange['TreeHeight'] = subTreeData['TreeHeight']
        }
      }
      // compute the node object in the upper level
      let fatherAreaDataObj = getFatherAreaDataObj (areaDataObj, areaDataArray)
      // compute the position of area data object
      let areaDataObjPos = computeVisualElementPos (currentNodeCoordinateSystemObj_layout, elementObj, nodeObj, subTreeData_layout, wholetreeDataRange, areaDataNodePosObj, areaDataTreePosObj, fatherAreaDataObj)
      if (typeof(areaDataObjPos) !== 'undefined') {
        areaDataObj.pos = areaDataObjPos
        // CHANGE
        let rootCentric = getIsRootCentricAttribute(currentNodeCoordinateSystemObj_layout)
        if (rootCentric) {
          areaDataObj._pos = areaDataNodePosObj
        } else {
          areaDataObj._pos = areaDataTreePosObj
        }
      }
      //  compute the visual element of the area data object to create the elements
      let areaDataObjElement = createVisualElement (currentNodeCoordinateSystemObj_visualelement, elementObj, nodeObj, subTreeData_visualelement, wholetreeDataRange, areaDataObj, maxElementStaticSize) //fatherAreaDataObj, areaDataObj
      if (typeof(areaDataObjElement) !== 'undefined') {
        areaDataObj.element = areaDataObjElement
      }
      // compute the path of the labels
      let areaLabelPath = computeAreaLabelPath (currentNodeCoordinateSystemObj_layout, subTreeData_layout, areaLabelPathObj)
      if ((typeof(areaLabelPath) !== 'undefined') && (areaLabelPath != null)) {
        areaDataObj.labelPath = areaLabelPath
      }
    }
    // compute the areaDataArray in the upper level
    function getFatherAreaDataObj(areaDataObj, areaDataArray) {
      let fatherNodeId = areaDataObj['fatherID']
      if (fatherNodeId == null) {
        return null
      } 
      let fatherAreaObjIndex = +fatherNodeId.replace('index-', '')
      return areaDataArray[fatherAreaObjIndex]
    }
    //  compute the root node at the top level
    function computeShallowest(coordinateSystem, areaDataObj, minTraversalNum) {
      let subTreeData = {}
      subTreeData['TreeWidth'] = treeViewPosLenObj.width
      subTreeData['TreeHeight'] = treeViewPosLenObj.height
      let currentNodeSystem = coordinateSystem
      let currentID = areaDataObj.id
      let currentNodeCoordinateSystemObj = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem
      let backTraversal = 0
      // indicate whether the start node is parent-centric
      let startNodeIsParentCentric = !getIsRootCentricAttribute(currentNodeCoordinateSystemObj)
      while (true) {
        let currentNodeIsParentCentric = !getIsRootCentricAttribute(currentNodeCoordinateSystemObj)
        let updateSubtreeData = false
        if (currentNodeSystem === 'polar') {
          updateSubtreeData = true
        } else {
          if (startNodeIsParentCentric) {
            updateSubtreeData = true
            startNodeIsParentCentric = false
          }
        }
        if (updateSubtreeData) {
          subTreeData['TreeWidth'] = areaData[currentID].Width
          subTreeData['TreeHeight'] = areaData[currentID].Height
          subTreeData['x'] = areaData[currentID].x
          subTreeData['y'] = areaData[currentID].y
          currentNodeCoordinateSystemObj = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem
        }
        currentID = areaData[currentID].fatherID
        if (currentID === null) {
          break
        }


        if ((currentNodeSystem === 'polar') && (currentNodeIsParentCentric) && (backTraversal >= minTraversalNum)) {
          break
        }
        currentNodeSystem = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem.Category
        backTraversal = backTraversal + 1
      }
      // let CoordinateSystem = dslContentObject[treeIndexWithDSL[areaDataObj.id]].CoordinateSystem
      //  Change the horizontal x and TreeWidth parameters of the wholetreeDataRange to the entire canvas length
      return {
        'SubTreeData': subTreeData,
        'CoordinateSystem': currentNodeCoordinateSystemObj
      }
    }
    //  Compute the topmost root node
    // function computeShallowest(coordinateSystem, areaDataObj) {
    //   let subTreeData = {}
    //   subTreeData['TreeWidth'] = treeViewPosLenObj.width
    //   subTreeData['TreeHeight'] = treeViewPosLenObj.height
    //   let currentNodeSystem = coordinateSystem
    //   let currentID = areaDataObj.id
    //   let currentNodeCoordinateSystemObj = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem
    //   let backTraversal = 0
    //   console.log('areaData', areaData)
    //   while (true) {
    //     if (currentNodeSystem === 'polar') {
    //       subTreeData['TreeWidth'] = areaData[currentID].Width
    //       subTreeData['TreeHeight'] = areaData[currentID].Height
    //       subTreeData['x'] = areaData[currentID].x
    //       subTreeData['y'] = areaData[currentID].y
    //       currentNodeCoordinateSystemObj = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem
    //     }
    //     currentID = areaData[currentID].fatherID
    //     console.log('currentID', currentID)
    //     if (currentID === null) {
    //       break
    //     }
    //     if ((currentNodeSystem === 'polar') && (backTraversal >= 1)) {
    //       break
    //     } 
    //     currentNodeSystem = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem.Category
    //     backTraversal = backTraversal + 1
    //   }
    //   //  Change the horizontal x and TreeWidth parameters of the wholetreeDataRange to the entire canvas length
    //   return {
    //     'SubTreeData': subTreeData,
    //     'CoordinateSystem': currentNodeCoordinateSystemObj
    //   }
    // }
    //  generate the original data of links between different nodes
    function directLineData(d, wholetreeDataRange) {
        let beginID = d.beginid
        let endID = d.endid
        let linkTypeDSL = treeIndexWithDSL[beginID]
        let elementObj = dslContentObject[linkTypeDSL].Element
        let linkType = elementObj.Link
        let nodeType = elementObj.Node
        if ((linkType === 'hidden') || (typeof(linkType) === 'undefined')) {
          let endLinkTypeDSL = treeIndexWithDSL[endID]
          let endElementObj = dslContentObject[endLinkTypeDSL].Element
          linkType = endElementObj.Link
          nodeType = elementObj.Node
        }
        //  if the visibility of link is hidden, then do not render the links between nodes
        if (linkType === 'hidden') {
          return
        }
        // TODO
        let beginx = areaData[beginID].pos.x, beginy = areaData[beginID].pos.y, 
            endx = areaData[endID].pos.x, endy = areaData[endID].pos.y
        // prefix _ indicate the position under cartesian coordinate system
        let _beginx = areaData[beginID]._pos.x, _beginy = areaData[beginID]._pos.y, 
            _endx = areaData[endID]._pos.x, _endy = areaData[endID]._pos.y
        let beginPos = [beginx, beginy], endPos = [endx, endy],
            _beginPos = [_beginx, _beginy], _endPos = [_endx, _endy]
        let beginAreaDataObj = areaData[beginID]
        let endAreaDataObj = areaData[endID]
        let coordinateSystem = dslContentObject[treeIndexWithDSL[beginID]].CoordinateSystem.Category
        //  compute the shallowest node start from the parent node
        let minTraversalNum_layout = 1
        let subTreeData_coordinateSystem_layout = computeShallowest(coordinateSystem, endAreaDataObj, minTraversalNum_layout)
        let subTreeData_layout = subTreeData_coordinateSystem_layout['SubTreeData']
        let currentNodeCoordinateSystemObj_layout = subTreeData_coordinateSystem_layout['CoordinateSystem']
        // the coordinate system is to compute the shape of visual element
        let minTraversalNum_visualelement = 0
        let subTreeData_coordinateSystem_visualelement = computeShallowest(coordinateSystem, endAreaDataObj, minTraversalNum_visualelement)
        let subTreeData_visualelement = subTreeData_coordinateSystem_visualelement['SubTreeData']
        let currentNodeCoordinateSystemObj_visualelement = subTreeData_coordinateSystem_visualelement['CoordinateSystem']
        // //  the coordinate system is to compute the layout of visual element
        // let subTreeData_coordinateSystem = computeShallowest(coordinateSystem, areaDataObj, minTraversalNum_layout)
        // let subTreeData = subTreeData_coordinateSystem['SubTreeData']
        // let currentNodeCoordinateSystemObj = subTreeData_coordinateSystem['CoordinateSystem']
        // TODO
        wholetreeDataRange['x'] = subTreeData_layout['x']
        wholetreeDataRange['TreeWidth'] = subTreeData_layout['TreeWidth']
        
        //Generate the trace of link
        let lineObject = null
        let lineGenerator = null
        switch (linkType) {
          // line connection
          case 'straight': {
            lineObject = new Straight(beginPos, endPos)
            break
          }

          case 'curveStepX': {
            lineObject = new CurveStepX(beginPos, endPos, _beginPos, _endPos)
            break
          }

          case 'orthogonal': {
            lineObject = new Orthogonal(beginPos, endPos, _beginPos, _endPos)
            break
          }

          case 'curveStepAfter': {
            lineObject = new CurveStepAfter(beginPos, endPos, _beginPos, _endPos)
            break
          }

          case 'curveStepBefore': {
            lineObject = new CurveStepBefore(beginPos, endPos, _beginPos, _endPos)
            break
          }

          case 'curve': {
            lineObject = new Curve(beginPos, endPos)
            break
          }

          case 'linkHorizontal': {
            lineObject = new LinkHorizontal(beginPos, endPos)
            break
          }

          case 'arccurve': {
            let arcDirection = elementObj.ArcDirection
            lineObject = new ArcCurve(beginPos, endPos, arcDirection)
            break
          }
        }
        if (currentNodeCoordinateSystemObj_layout.Category === 'polar') {
          if (((nodeType === "circle") || (nodeType === "triangle") 
              || (nodeType === 'ellipse') || (nodeType === "hidden")) && (linkType === 'curveStepAfter')) {

            if (beginID === 'index-0') {
              // TODO fix the bug of of CurveStepAfter path
              return lineObject.generatePolarPath(currentNodeCoordinateSystemObj_layout, subTreeData_layout)
            } 
          }
          return lineObject.generatePolarPath(currentNodeCoordinateSystemObj_layout, subTreeData_layout)
        } else if (currentNodeCoordinateSystemObj_layout.Category === 'cartesian') {
          let lineData = lineObject.generatePath()
          return lineData
        }
    }       
}