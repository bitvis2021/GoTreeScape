import { translatePath } from '@/computation/translate_path.js'

function computeTreevisNodeCirclePath (radius, start_angle, central_angle) {
    if (typeof(radius) === 'undefined') {
        radius = 3
    }
    if (central_angle < 0.5) {
        radius = radius * 1.5
    }
    let circlePathObj = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(Math.PI * 2 * start_angle)
        .endAngle(Math.PI * 2 * (start_angle + central_angle))
    let circlePath = circlePathObj()
    let pathList = [circlePath]
    return pathList
}

// 
function computeTreevisNodeRectPath (length, x_direction, y_direction) {
    let width = length
    let height = length
    let nodePosArrayX = []
    if (x_direction == 'left') {
        nodePosArrayX = [
            {x: -width, y: -height}, 
            {x: -width, y: height}
        ]
    } else if (x_direction == 'middle') {
        nodePosArrayX = [
            {x: 0, y: -height}, 
            {x: 0, y: height}
        ]
    } else if (x_direction == 'right') {
        nodePosArrayX = [
            {x: width, y: -height}, 
            {x: width, y: height}
        ]
    }
    let nodePosArrayY = []
    if (y_direction == 'top') {
        nodePosArrayY = [
            {x: -width, y: -height}, 
            {x: width, y: -height}
        ]
    } else if (y_direction == 'middle') {
        nodePosArrayY = [
            {x: -width, y: 0}, 
            {x: width, y: 0}
        ]
    } else if (y_direction == 'bottom') {
        nodePosArrayY = [
            {x: -width, y: height}, 
            {x: width, y: height}
        ]
    }
    let nodePathX = generatePath(nodePosArrayX)
    let nodePathY = generatePath(nodePosArrayY)
    return [nodePathX, nodePathY]
}

// 
function generateNodeEllipsePath(nodeObj, boundingBox) {
    let rx = nodeObj.RootWidth / 2, ry = nodeObj.RootHeight / 2
    let ellipseAngle = 0
    let pathStr = 'M ' + boundingBox['top'].x + ' ' + boundingBox['top'].y + ' A ' + rx + ' ' + ry + ' ' + ellipseAngle + ' 1 1 ' + boundingBox['bottom'].x + 
                    ' ' + boundingBox['bottom'].y + ' A ' + rx + ' ' + ry + ' ' + ellipseAngle + ' 0 1 ' + boundingBox['top'].x + ' ' + boundingBox['top'].y
     return pathStr
}

// 
function generateNodeCirclePath(radius) {
    let circlePathObj = d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
          .startAngle(-Math.PI)
          .endAngle(Math.PI)
    return circlePathObj()
}

// 
function generateNodeTrianglePath(nodeList) {
    let triangleNodePath = generatePath(nodeList)
    return triangleNodePath
}

function generateNodeRectanglePath(nodeList) {
    let rectangleNodePath = generatePath(nodeList)
    return rectangleNodePath
}

function computeTreevisNodeElementPath (element_node, glyphSize, dxy) {
    let nodeElementPath = ""
    let height = glyphSize
    let width = glyphSize
    switch(element_node) {
        case 'triangle':
            let triangleTopNode = {x: 0, y: -height/2}
            let triangleBottomLeftNode = {x: -width/2, y: height/2}
            let triangleBottomRightNode = {x: width/2, y: height/2}
            let triangleNodePathNodeList = [triangleTopNode, triangleBottomLeftNode, triangleBottomRightNode, triangleTopNode]
            nodeElementPath = generateNodeTrianglePath(triangleNodePathNodeList)
            break
        case 'rectangle':
            let rectangleTopLeftNode = {x: -width/2, y: -height/2}
            let rectangleBottomLeftNode = {x: -width/2, y: height/2}
            let rectangleBottomRightNode = {x: width/2, y: height/2}
            let rectangleTopRightNode = {x: width/2, y: -height/2}
            let rectangleNodePathNodeList = [rectangleTopLeftNode, rectangleBottomLeftNode, rectangleBottomRightNode, rectangleTopRightNode, rectangleTopLeftNode]
            nodeElementPath = generateNodeRectanglePath(rectangleNodePathNodeList)
            break
        case 'circle':
            let radius = width
            nodeElementPath = generateNodeCirclePath(radius/2)
            break
        case 'ellipse':
            let ellipseNodeObj = {'RootWidth': width/2, 'RootHeight': height/2}
            let ellipseBoundingBox = {'top': {'x': 0, 'y': -height/2}, 'bottom': {'x': 0, 'y': height/2}}
            nodeElementPath = generateNodeEllipsePath(ellipseNodeObj, ellipseBoundingBox)
            break
    }
    return nodeElementPath
}

export function computeTreevisCoordSystemGlyph (treeObj, glyphSize) {
    let treeGlyphAttrList = treeObj[3]
    // create the coordinate system part of the glyph
    let coord_system_type = treeGlyphAttrList[0][0]
    let coord_system_start_angle = treeGlyphAttrList[0][1]
    let coord_system_central_angle = treeGlyphAttrList[0][2]
    let coord_system_glyph_path_list = []
    if (coord_system_type === 'cartesian') {
        let x_direction = treeGlyphAttrList[2][0]
        let y_direction = treeGlyphAttrList[2][1]
        coord_system_glyph_path_list = computeTreevisNodeRectPath(glyphSize, x_direction, y_direction)
    } else if (coord_system_type === 'polar') {
        coord_system_glyph_path_list = computeTreevisNodeCirclePath(glyphSize,  coord_system_start_angle, coord_system_central_angle)
    }
    return coord_system_glyph_path_list
}

// 
function computeElementDxy(treeGlyphAttrList, length) {
    let x_direction = treeGlyphAttrList[2][0]
    let y_direction = treeGlyphAttrList[2][1]
    let width = length
    let height = length
    let dx = 0
    let dy = 0
    if (x_direction == 'left') {
        dx = -width
    }  else if (x_direction == 'right') {
        dx = width
    }
    if (y_direction == 'top') {
        dy = -height
    } else if (y_direction == 'bottom') {
        dy = height
    }
    return [dx, dy]
}

// 
export function computeTreevisNodeElementGlyph (treeObj, glyphSize) {
    let treeGlyphAttrList = treeObj[3]
    // 
    let dxy = computeElementDxy(treeGlyphAttrList, glyphSize)
    // create the element part of the glyph
    let element_node = treeGlyphAttrList[1][0]
    let element_link = treeGlyphAttrList[1][1]
    let treevis_node_element_path = computeTreevisNodeElementPath(element_node, glyphSize, dxy)
    treevis_node_element_path = translatePath(treevis_node_element_path, dxy[0], dxy[1])
    return treevis_node_element_path
}

// generate the path 
function generatePath (nodePosArray) {
    let lineFunction = d3.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
    let rectPathObj = lineFunction(nodePosArray)
    return rectPathObj
}