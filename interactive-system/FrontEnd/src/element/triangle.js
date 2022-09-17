//  Define the parameters inside the circle

export function Triangle (tx, ty, tw, th, direction) {
  this.tx = tx
  this.ty = ty
  this.tw = tw
  this.th = th
  this.direction = direction
  if (typeof(this.direction) === 'undefined') {
    this.direction = 'top'
  }
}
//  Defines the prototype of the circle, the method inside the Rect object
Triangle.prototype = {
  getNodePosArray: function () {
    let tx = this.tx, ty = this.ty, tw = this.tw, th = this.th, direction = this.direction
    let triangleNodePosArray = [
        {x: tx + tw / 2,  y: ty}, 
        {x: tx,           y: ty + th}, 
        {x: tx + tw,      y: ty + th}, 
      ]
    if (direction === 'bottom') {
          triangleNodePosArray = [
            {x: tx,           y: ty}, 
            {x: tx + tw / 2,  y: ty + th}, 
            {x: tx + tw,      y: ty}, 
          ] 
        } else if (direction === 'left') {
          triangleNodePosArray = [
            {x: tx + tw,      y: ty}, 
            {x: tx,           y: ty + th / 2}, 
            {x: tx + tw,      y: ty + th}, 
          ]
        } else  if (direction === 'right') {
          triangleNodePosArray = [
            {x: tx,           y: ty}, 
            {x: tx + tw,      y: ty + th / 2}, 
            {x: tx,           y: ty + th}, 
          ]
        }
        return triangleNodePosArray
  },
  getPolarNodePosArray: function(polarCoordObj, subtreePos) {
    let triangleNodePosArray = this.getNodePosArray()
    let polarTriangleNodePosArray = []
    for (let i = 0;i < triangleNodePosArray.length; i++) {
      let polarTriangleNodePos = polarCoordObj.calPosition(triangleNodePosArray[i])
      polarTriangleNodePos.x = polarTriangleNodePos.x + subtreePos.x
      polarTriangleNodePos.y = polarTriangleNodePos.y + subtreePos.y
      polarTriangleNodePosArray.push(polarTriangleNodePos)
    }
    return polarTriangleNodePosArray
  },
  constructPath: function(nodePosArray) {
    //  create the path
    let trianglePath = d3.path()
    trianglePath.moveTo(nodePosArray[0].x, nodePosArray[0].y)
    for (let i = 1;i < nodePosArray.length; i++) {
      trianglePath.lineTo(nodePosArray[i].x, nodePosArray[i].y)
    }
    trianglePath.closePath()
    return trianglePath.toString()
  },
  generatePath: function() {
    let triangleNodePosArray = this.getNodePosArray()
    return this.constructPath(triangleNodePosArray)
  },
  generatePolarPath: function(polarCoordObj, subtreePos) {
    let polarTriangleNodePosArray = this.getPolarNodePosArray(polarCoordObj, subtreePos)
    return this.constructPath(polarTriangleNodePosArray)
  }
}
