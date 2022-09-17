import { Circle } from '@/element/circle.js';
import { Ellipse } from '@/element/ellipse.js';
import { Rect } from '@/element/rect.js';
import { Triangle } from '@/element/triangle.js';
import { Polar } from '@/coordinatesystem/polar.js';
import { Cartesian } from '@/coordinatesystem/cartesian.js';
import DSLDefinitionObj from '@/dsl/definition.js'; 
import { getIsRootCentricAttribute } from '@/data-processing/get_root_centric_attribute.js'

/**
 * The computeAttr method supports the height and width attribute values of compute nodes
 * Compared with computeHeight and computeWidth, computeAttr does not distinguish between width and height
 */
/**
 * create the visual elements of tree. The elements are constructred through the path
 * PolarAxis is the polarAxis of the polar coordinate system, that is, the axis representing the sector width
 */
import { translatePath } from '@/computation/translate_path.js'

export function createVisualElement (coordinateSystem, elementObj, nodeObj, subTreeData, subTreeDataPos, currentAreaDataObj, maxElementStaticSize) {
    // get the parameters of domain specific language about visual element
    let nodeType = elementObj.Node
    let sizeOption = elementObj.SizeOption
    let rootCentric = getIsRootCentricAttribute(coordinateSystem)
    // the position of root node
    let rootNodePos = {x: nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth/2, y: nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight/2}
    // the position of whole subtree (center)
    let rootSubtreePos = {x: subTreeData.x + subTreeData.TreeWidth / 2, y: subTreeData.y + subTreeData.TreeHeight / 2}
    let subtreePos = rootSubtreePos
    // let subtreePos = {x: subTreeData.x + subTreeData.TreeWidth / 2, y: subTreeData.y + subTreeData.TreeHeight / 2}
    // CHANGE
    if (!rootCentric) {
      if ((currentAreaDataObj != null) && (typeof(currentAreaDataObj) !== 'undefined')) {
        subtreePos = currentAreaDataObj.pos
      }
    }
    //  when the visibility of node is hidden, set the size of nodes as 0
    let hiddenRadius = 0
    //  set the size of radius, which indicate the size of nodes
    let radius = nodeObj.RootWidth>nodeObj.RootHeight?nodeObj.RootHeight/2:nodeObj.RootWidth/2
    if (sizeOption === 'static') {
      radius = elementObj.StaticSize
      radius = radius>maxElementStaticSize?maxElementStaticSize:radius
    }
    if (coordinateSystem.Category === "cartesian") {
      //  Calculate the path based on the node type
      if (nodeType === "rectangle") {
        let rectNodePosArray = [
          {x: nodeObj.x + nodeObj.Rootx,                          y: nodeObj.y + nodeObj.Rooty}, 
          {x: nodeObj.x + nodeObj.Rootx,                          y: nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight}, 
          {x: nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth,      y: nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight}, 
          {x: nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth,      y: nodeObj.y + nodeObj.Rooty}, 
          {x: nodeObj.x + nodeObj.Rootx,                          y: nodeObj.y + nodeObj.Rooty}
        ]
        //  Initialize the Cartesian Coordinate System by setting parameters
        let cartesianCoordObj = new Cartesian()
        let elementPath = cartesianCoordObj.generatePath(rectNodePosArray)
        if (elementPath.indexOf('NaN') !== -1) {
          console.log('element path error')
          console.log('path error')
        }
        return elementPath
      } else if (nodeType === "triangle") {
        let tx = nodeObj.x + nodeObj.Rootx, 
            ty = nodeObj.y + nodeObj.Rooty, 
            tw = nodeObj.RootWidth,
            th = nodeObj.RootHeight,
            direction = elementObj.Direction
        let triangleNode = new Triangle(tx, ty, tw, th, direction)
        let elementPath = triangleNode.generatePath()
        return elementPath
      } else if (nodeType === "circle") {
        let CircleNode = new Circle(rootNodePos, radius)
        return translatePath(CircleNode.generatePath(), rootNodePos["x"], rootNodePos["y"])
      } else if (nodeType === "ellipse") {
        let ellipseNode = new Ellipse(nodeObj) 
        let elementPath = ellipseNode.generatePath()
        return elementPath
      } else if (nodeType === "hidden") {
        let CircleNode = new Circle(rootNodePos, hiddenRadius)
        let elementPath = translatePath(CircleNode.generatePath(), rootNodePos["x"], rootNodePos["y"])
        return elementPath
      }
    } else if (coordinateSystem.Category === "polar") {
      //  initialize the parameters of polar coordinate system
      let polarAxis = coordinateSystem.PolarAxis
      let polarCenterPos = coordinateSystem.PolarCenterPos
      let polarInnerRadius = coordinateSystem.InnerRadius
      let polarStartAngle = coordinateSystem.StartAngle
      let polarCenterAngle = coordinateSystem.CentralAngle
      let polarDirection = coordinateSystem.Direction
      let polarCoordObj = new Polar(polarAxis, polarInnerRadius, polarStartAngle, polarCenterAngle, polarCenterPos, polarDirection)
      //  set the data as subTreeData by default
      polarCoordObj.updateData(subTreeData)
      if (((nodeType === 'circle') || (nodeType === "triangle") 
         || (nodeType === 'ellipse') || (nodeType === "hidden")) 
            && (nodeObj.id === 'index-0')) {
        //  The polar coordinate axis is established in the part with only the center of the node, and only the central node is placed in the center, and the rest is calculated according to the previous method
        polarCoordObj.updateData(subTreeDataPos)
      }
      if (nodeType === "rectangle") {
        // for rectangle, this method computes the four positions and then generate the sector in polar coordinate system directly,
        // the computation approach of rectangle is different with the computation approach of circle
        let rectNodePosArray = [
          {x: nodeObj.x + nodeObj.Rootx,                          y: nodeObj.y + nodeObj.Rooty}, 
          {x: nodeObj.x + nodeObj.Rootx,                          y: nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight}, 
          {x: nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth,      y: nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight}, 
          {x: nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth,      y: nodeObj.y + nodeObj.Rooty}, 
          {x: nodeObj.x + nodeObj.Rootx,                          y: nodeObj.y + nodeObj.Rooty}
        ]
        let elementPath = translatePath(polarCoordObj.generatePath(rectNodePosArray, subTreeData), subtreePos["x"], subtreePos["y"])
        return elementPath
      } else if (nodeType === "circle") {
        // calculate the position under the polar coordinate system
        let cartesianPos = polarCoordObj.calPosition(rootNodePos)
        //  calculate positions of the root nodes
        //  cartesianPos is the position in the polar coordinate system
        //  Note that for root-centric layout => subtreePos is the position of the whole tree visualization
        //            for parent-centric layout => subtreePos is the node of the position calculated position of this node
        cartesianPos["x"] = cartesianPos["x"] + subtreePos["x"]
        cartesianPos["y"] = cartesianPos["y"] + subtreePos["y"]
        //  The node that initializes the circle
        let CircleNode = new Circle(rootNodePos, radius)
        // root-centric => put visual elements at the center of correspnonding node
        let elementPath = translatePath(CircleNode.generatePath(), cartesianPos["x"], cartesianPos["y"])
        // CHANGE
        if (!rootCentric) {
          //  parent-centric => put visual elements at the subtree position, 
          //  subtree position is the center of the corresponding subtree of this node
          elementPath = translatePath(CircleNode.generatePath(), subtreePos["x"], subtreePos["y"])
        }
        return elementPath
      } else if (nodeType === "triangle") {
        let tx = nodeObj.x + nodeObj.Rootx, 
            ty = nodeObj.y + nodeObj.Rooty, 
            tw = nodeObj.RootWidth,
            th = nodeObj.RootHeight,
            direction = elementObj.Direction
        let triangleNode = new Triangle(tx, ty, tw, th, direction)
        let elementPath = triangleNode.generatePolarPath(polarCoordObj, subtreePos)
        return elementPath
      } else if (nodeType === 'ellipse') {
        //  The coordinates of the node in polar coordinate system are calculated according to the current coordinates of the node
        let ellipseNode = new Ellipse(nodeObj)
        let elementPath = ellipseNode.generatePolarPath(polarCoordObj, subtreePos)
        // let elementPath = ellipseNode.generatePath()
        return elementPath
        // return translatePath(EllipseNode.generatePath(), cartesianPos["x"], cartesianPos["y"])
      } else if (nodeType === "hidden") {
        let cartesianPos = polarCoordObj.calPosition(rootNodePos)
        //  Initializes the nodes of the hidden circle
        let CircleNode = new Circle(rootNodePos, hiddenRadius)

        cartesianPos["x"] = cartesianPos["x"] + subtreePos["x"]
        cartesianPos["y"] = cartesianPos["y"] + subtreePos["y"]
        //  Move the nodes to the corresponding position
        let elementPath = translatePath(CircleNode.generatePath(), cartesianPos["x"], cartesianPos["y"])
        return elementPath
      }
    } 
}
/**
 * Computes the locations of nodes in the areaData array
 */
export function computeVisualElementPos(coordinateSystem, elementObj, nodeObj, subTreeData, subTreeDataPos, areaDataNodePosObj, areaDataTreePosObj, parentAreaDataObj) {
  let nodeType = elementObj.Node
  let rootCentric = getIsRootCentricAttribute(coordinateSystem)
  // the position of the whole subtree
  let rootSubtreePos = {x: subTreeData.x + subTreeData.TreeWidth / 2, y: subTreeData.y + subTreeData.TreeHeight / 2}
  // CHANGE
  let subtreePos = rootSubtreePos
  // polar coordinate system is root-centric => subtree position is the root position, 
  // parent-centric subtree position => subtree position the positon of parent node
  if (!rootCentric) { // if it is parent-centric, then set the position as the center of this parentAreaObject
    if ((parentAreaDataObj != null) && (typeof(parentAreaDataObj) !== 'undefined')) {
      subtreePos = parentAreaDataObj.pos
    }
  }
  // cartesian coordinate system => return the original position object
  if (coordinateSystem.Category === "cartesian") {
    return areaDataNodePosObj
  } else if(coordinateSystem.Category === "polar") {
    //  set the parameters of the polar coordinate system to initialize the system
    let polarAxis = coordinateSystem.PolarAxis
    let polarCenterPos = coordinateSystem.PolarCenterPos     
    let polarInnerRadius = coordinateSystem.InnerRadius
    let polarStartAngle = coordinateSystem.StartAngle
    let polarCenterAngle = coordinateSystem.CentralAngle
    let polarDirection = coordinateSystem.Direction
    let polarCoordObj = new Polar(polarAxis, polarInnerRadius, polarStartAngle, polarCenterAngle, polarCenterPos, polarDirection)
    // set underlying data based on the polar coordinate system
    polarCoordObj.updateData(subTreeData)
    // calculate the coordinate in the corresponding polar system
    let cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
    // compute the position of the node and subtree data, this layout can be regarded as the relative position to the root node
    if (nodeObj.id === 'index-0') {
      // put the *root node* (index-0) at center, the underlying data of polar coordinate system is subTreeDataPos
      polarCoordObj.updateData(subTreeDataPos)
      cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
    } else {
      // root-centric and parent-centric are different
      if (rootCentric) {
        // root-centric => compute the position based on the root node
        cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      } else {
        // parent-centric => compute the position based on the center of the whole tree
        cartesianPos = polarCoordObj.calPosition(areaDataTreePosObj)
      }
    }  
    if (nodeType === "rectangle") {
      // CHANGE
      // // compute the position of the node and subtree data, 
      // if (nodeObj.id === 'index-0') {
      //   // put the *root node* (index-0) at center, the underlying data of polar coordinate system is subTreeDataPos
      //   polarCoordObj.updateData(subTreeDataPos)
      //   cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      // } else {
      //   // root-centric and parent-centric are different
      //   if (rootCentric) {
      //     // root-centric => compute the position based on the root node
      //     cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      //   } else {
      //     // parent-centric => compute the position based on the center of the whole tree
      //     cartesianPos = polarCoordObj.calPosition(areaDataTreePosObj)
      //   }
      // }  
      // if (nodeObj.id === 'index-0') {
      //   polarCoordObj.updateData(subTreeDataPos)
      //   cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      // } else {
      //
      //   polarCoordObj.updateData(SubTreeData)
      //   cartesianPos = polarCoordObj.calPosition(areaDataTreePosObj)
      // }   
      //
      // let cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      cartesianPos["x"] = cartesianPos["x"] + subtreePos["x"]
      cartesianPos["y"] = cartesianPos["y"] + subtreePos["y"]
      return cartesianPos
    } else if ((nodeType === "circle") || (nodeType === "triangle") || (nodeType === 'ellipse') || (nodeType === "hidden")) {
      //  Set the polar axis at the part where only the node is centered
      //  CHANGE
      // if (nodeObj.id === 'index-0') {
      //   polarCoordObj.updateData(subTreeDataPos)
      //   cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      // } else {
      //   // root-centric and parent-centric are different
      //   if (rootCentric) {
      //     // root-centric => compute the position based on the root node
      //     cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      //   } else {
      //     // parent-centric => compute the position based on the center of the whole tree
      //     cartesianPos = polarCoordObj.calPosition(areaDataTreePosObj)
      //   }
      // }
      // if (nodeObj.id === 'index-0') {
      //   polarCoordObj.updateData(subTreeDataPos)
      //   cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      // } else {
      //   polarCoordObj.updateData(SubTreeData)
      //   cartesianPos = polarCoordObj.calPosition(areaDataTreePosObj)
      // }
      // let cartesianPos = polarCoordObj.calPosition(areaDataNodePosObj)
      cartesianPos["x"] = cartesianPos["x"] + subtreePos["x"]
      cartesianPos["y"] = cartesianPos["y"] + subtreePos["y"]
      // cartesianPos["r"] = radius
      return cartesianPos
    }
  }
}
/**
 * Computes the path to the label in areaData
 */
export function computeAreaLabelPath(coordinateSystem, subTreeData, areaLabelPathObj) {
  let LineData = null
  let lineGenerator = d3.line()
  let subtreePos = {x: subTreeData.x + subTreeData.TreeWidth / 2, y: subTreeData.y + subTreeData.TreeHeight / 2}
  if (coordinateSystem.Category === "cartesian") {
    let areaLabelPathStartPos = areaLabelPathObj.start
    let areaLabelPathEndPos = areaLabelPathObj.end
    let PosData = []
    PosData.push([areaLabelPathStartPos.x, areaLabelPathStartPos.y])
    PosData.push([areaLabelPathEndPos.x, areaLabelPathEndPos.y])
    LineData = lineGenerator(PosData)
    return LineData
  } else if(coordinateSystem.Category === "polar") {
    //  Initialize the Polar Coordinate System by setting parameters
    //  Specifies the polar axis of the polar coordinate system
    let polarAxis = coordinateSystem.PolarAxis
    let polarCenterPos = coordinateSystem.PolarCenterPos
    let polarInnerRadius = coordinateSystem.InnerRadius
    let polarStartAngle = coordinateSystem.StartAngle
    let polarCenterAngle = coordinateSystem.CentralAngle
    let polarDirection = coordinateSystem.Direction
    //  Calculate the length of the ring at the center of the polar coordinate system
    let polarCoordObj = new Polar(polarAxis, polarInnerRadius, polarStartAngle, polarCenterAngle, polarCenterPos, polarDirection)
    polarCoordObj.updateData(subTreeData)
    let originX = polarCoordObj.x, originY = polarCoordObj.y
    //  Computes the path to the label in the tree visualization
    let areaLabelPathStartPos = areaLabelPathObj.start
    let areaLabelPathEndPos = areaLabelPathObj.end
    let carBeginx = areaLabelPathStartPos.x, carBeginy = areaLabelPathStartPos.y,
      carEndx = areaLabelPathEndPos.x, carEndy = areaLabelPathEndPos.y
    areaLabelPathStartPos = polarCoordObj.calPosition(areaLabelPathStartPos)
    let beginx = areaLabelPathStartPos.x, beginy = areaLabelPathStartPos.y
    areaLabelPathEndPos = polarCoordObj.calPosition(areaLabelPathEndPos)
    let endx = areaLabelPathEndPos.x, endy = areaLabelPathEndPos.y
    if (polarAxis === "y-axis") {
      if (carBeginx === carEndx) {
        let PosData = []
        if (beginx > endx) {
          PosData.push([endx, endy])
          PosData.push([beginx, beginy])
        } else {
          PosData.push([beginx, beginy])
          PosData.push([endx, endy])
        }
        LineData = translatePath(lineGenerator(PosData), subtreePos["x"], subtreePos["y"])
        return LineData
      }
    } else if (polarAxis === "x-axis") {
      if (carBeginy === carEndy) {
        let PosData = []
        if (beginx > endx) {
          PosData.push([endx, endy])
          PosData.push([beginx, beginy])
        } else {
          PosData.push([beginx, beginy])
          PosData.push([endx, endy])
        }
        LineData = translatePath(lineGenerator(PosData), subtreePos["x"], subtreePos["y"])
        return LineData
      }
    }
    let polarOriginX = 0, polarOriginY = 0
    let radius = Math.pow((Math.pow((beginx - polarOriginX), 2)+Math.pow((beginy - polarOriginY), 2)), 1/2)
    let radius2 = Math.pow((Math.pow((endx - polarOriginX), 2)+Math.pow((endy - polarOriginY), 2)), 1/2)
    //  Calculate the ARC Path path
    let arcGenerator = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius);
    //  Calculate the starting Angle
    let initAngleSin = Math.round(polarOriginY - beginy) / radius
    initAngleSin = initAngleSin>1?1:initAngleSin
    initAngleSin = initAngleSin<-1?-1:initAngleSin
    let initAngle = Math.asin(initAngleSin)
    if (beginx <= polarOriginX) {
      // let startAngle = -Math.PI / 2 - initAngle, endAngle = Math.PI / 2 - initAngle  
    } else {
      initAngle = Math.PI - initAngle
    }
    if (isNaN(initAngle)) {
      console.log('initAngleSin', initAngleSin)
    }
    //  Calculate the Angle of termination
    let endAngleSin = Math.round(polarOriginY - endy) / radius
    endAngleSin = endAngleSin>1?1:endAngleSin
    endAngleSin = endAngleSin<-1?-1:endAngleSin
    let endAngle = Math.asin(endAngleSin)
    if (endx <= polarOriginX) {
      // let startAngle = -Math.PI / 2 - initAngle, endAngle = Math.PI / 2 - initAngle  
    } else {
      endAngle = Math.PI - endAngle
    }
    //  compute links between  nodes
    if (radius > 0.001) {
        let anticlockwise = true
        if (coordinateSystem.Direction === 'clockwise') {
          anticlockwise = false
        }
        var path = d3.path();
        path.arc(polarOriginX, polarOriginY, radius, initAngle, endAngle, anticlockwise)
        if (path.toString().indexOf('NaN') !== -1) {
          console.log('polarOriginX', polarOriginX, 'polarOriginY', polarOriginY, 'radius', radius, 'initAngle', initAngle, 'endAngle', endAngle)
        }
        LineData = translatePath(path.toString(), subtreePos["x"], subtreePos["y"])
        return LineData
    }
  }
}
/**
 * get the center axis of the polar coord system
 */
function _getPolarCenter(polarCenterPos, subTreeData) {
  if (polarCenterPos === 'top') {
    return {x: subTreeData.x + subTreeData.TreeWidth / 2, y: subTreeData.y}
  } else if (polarCenterPos === 'bottom') {
    return {x: subTreeData.x + subTreeData.TreeWidth / 2, y: subTreeData.y + subTreeData.TreeHeight}
  } else if (polarCenterPos === 'left') {
    return {x: subTreeData.x, y: subTreeData.y + subTreeData.TreeHeight / 2}
  } else if (polarCenterPos === 'right') {
    return {x: subTreeData.x + subTreeData.TreeWidth, y: subTreeData.y + subTreeData.TreeHeight / 2}  
  }
}
/**
 * reorder all the nodes in the node array according to dfs
 */
export function reorderNodeArray (nodeArray) {
  let originalNodeArray = nodeArray.sort(function(a, b) {
    return a.data.originalNodeIndex - b.data.originalNodeIndex
  })
  return originalNodeArray
}
/**
 * initialize the links between the nodes
 */
export function initializeLinks (type) {
}
/**
 * compute the absolute position of the nodes
 */
export function computeAbsoluteNodePosition(posAttrName, nodeArray, DSLObj) {
  if (typeof(DSLObj) !== 'undefined') {
    for (let i = 0; i < nodeArray.length; i++) {
      let nodeObj = nodeArray[i]
      let parentNodeObj = nodeObj.parent
      if (parentNodeObj != null) {
        nodeObj.visualAttr[posAttrName] = parentNodeObj.visualAttr[posAttrName] + nodeObj.visualAttr[posAttrName]
      }
    }
  }
  return nodeArray
}
/**
 * create coordinate system
 */
function _createCoordinateSystem (type, polarCenter, polarAxis) {
  if (type === 'polar') {
    return new Polar(polarCenter, polarAxis)
  } else if (type === 'cartesian') {
    return new Cartesian()
  }
}
