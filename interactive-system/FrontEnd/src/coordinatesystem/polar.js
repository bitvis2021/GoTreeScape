//  Defines a coordinate system for placing visual elements
export function Polar (polarAxis, polarInnerRadius, polarStartAngle, polarCenterAngle, polarCenterPara, polarDirection) {
  this.polarAxis = polarAxis
  //  The radius of the central ring in polar coordinates
  this.polarInnerRadius = polarInnerRadius
  //   The starting Angle of polar coordinates
  this.polarStartAngle = polarStartAngle * 2
  //  The Angle of the center in polar coordinates
  this.polarCenterAngle = polarCenterAngle
  //  The position of the center in polar coordinates
  this.polarCenterPara = polarCenterPara
  //  Specifies the direction of the ring axis of the polar coordinate system
  this.polarDirection = polarDirection
}
//  Defines prototype of Polar coordinate system, which is the method inside the Rect object
Polar.prototype = {
  //  update data
  updateData: function(SubTreeData) {
    //  Update the subtree data
    this.SubTreeData = SubTreeData
    //  Initialize the polar center
    this.initOrigin()
    //  Initialize the scale
    this.initScale()
  },
  //  Update the calculated scale
  initScale: function() {
    let SubTreeData = this.SubTreeData
    //  Because of the repetition after the loop, we need to divide the distance / 2
    let rRange = SubTreeData.TreeWidth > SubTreeData.TreeHeight ? SubTreeData.TreeHeight / 2 : SubTreeData.TreeWidth / 2
    // let rRange = SubTreeData.TreeWidth > SubTreeData.TreeHeight ? SubTreeData.TreeHeight / 2 : SubTreeData.TreeWidth / 2
    let angleScale = this.polarDirection === "clockwise" ? 
      d3.scaleLinear().range([Math.PI * (this.polarCenterAngle + this.polarStartAngle), Math.PI * (-this.polarCenterAngle + this.polarStartAngle)]):
      d3.scaleLinear().range([Math.PI * (-this.polarCenterAngle + this.polarStartAngle), Math.PI * (this.polarCenterAngle + this.polarStartAngle)])
    let rScale = d3.scaleLinear().range([rRange * this.polarInnerRadius, rRange])
    if (this.polarAxis === 'y-axis') {
      //  The polar axis is the vertical axis, so the axis representing the Angle is the horizontal axis, calculated using width
      //  Because Angle is a circle, different angles of the circle have the same status
      angleScale.domain([this.x, this.x + SubTreeData.TreeWidth])
      //  The value range of r is related to the position of the coordinate axis Origin, the 0 position of r maps the position of the central node, and the position of rRange is the farthest position from the central node
      if (this.polarCenterPara === 'top') {
        //  If the center of the current polar coordinate system is above the visual form
        rScale.domain([this.y, Math.abs(this.y + SubTreeData.TreeHeight)])
      } else if (this.polarCenterPara === 'bottom') {
        //  If the center of the polar coordinate system is below the visualization
        rScale.domain([this.y, Math.abs(this.y - SubTreeData.TreeHeight)])
      } 
    } else if (this.polarAxis === 'x-axis') {
      //  The polar axis is the horizontal axis, so the axis representing the Angle is the vertical axis, calculated using height
      angleScale.domain([this.y, this.y + SubTreeData.TreeHeight])
      //  The value range of r is related to the position of the coordinate axis Origin, the 0 position of r maps the position of the central node, and the position of rRange is the farthest position from the central node
      if (this.polarCenterPara === 'left') {
        //  If the center of the polar coordinate system is to the left of the visualization
        rScale.domain([this.x, Math.abs(this.x + SubTreeData.TreeWidth)])
      } else if (this.polarCenterPara === 'right') {
        //  If the center of the polar coordinate system is to the right of the visualization
        rScale.domain([this.x, Math.abs(this.x - SubTreeData.TreeWidth)])
      }
    }
    //  Update the scale of the Angle and diameter
    this.angleScale = angleScale
    this.rScale = rScale
  },
  initOrigin: function() {
    let polarCenter = this._getPolarCenter()
    this.x = polarCenter.x;
    this.y = polarCenter.y;
  },
  //  Set the origin position of the coordinate system
  setOrigin: function (origin) {
    this.x = origin.x
    this.y = origin.y
  },

  generatePath: function (nodePosArray, SubTreeData, direction) {
      let polarPointArray = []
      let angleScale = this.angleScale
      let rScale = this.rScale

      if ((typeof(angleScale) === 'undefined') || (typeof(rScale) === 'undefined')) {
        console.log('scale is undefined')
      }
      //  Calculation of angles according to different polar axes
      if (this.polarAxis === 'y-axis') {
        //  calculate the nodes in polar coordinates
        for (let i = 0; i < nodePosArray.length; i++) {
          let nodeObj = nodePosArray[i]
          let angle = angleScale(nodeObj.x)
          let radius = rScale(nodeObj.y)
          let polarPoint = {angle: angle, radius: radius}
          polarPointArray.push(polarPoint)
        }
      } else if (this.polarAxis === 'x-axis') {
        //  calculate the nodes in polar coordinates
        for (let i = 0; i < nodePosArray.length; i++) {
          let nodeObj = nodePosArray[i]
          let angle = angleScale(nodeObj.y)
          let radius = rScale(nodeObj.x)
          let polarPoint = {angle: angle, radius: radius} 
          polarPointArray.push(polarPoint)
        }
      }
      //  Calculate the range of the radius
      polarPointArray = polarPointArray.sort(function(a, b) {
        return a.radius - b.radius
      })
      let innerRadius = polarPointArray[0].radius
      let outerRadius = polarPointArray[polarPointArray.length - 1].radius
      //  Calculate the range of the angle
      polarPointArray = polarPointArray.sort(function(a, b) {
        return a.angle - b.angle
      })
      let startAngle = polarPointArray[0].angle
      let endAngle = polarPointArray[polarPointArray.length - 1].angle
      //  Create visual elements for Sector
      let rectPathObj = d3.arc()
          .innerRadius(function(d) { return innerRadius; })
          .outerRadius(function(d) { return outerRadius; })
          .startAngle(function(d) { return startAngle; })
          .endAngle(function(d) { return endAngle; })
          .padAngle(0.01)
          .padRadius(0)
      return rectPathObj()
  },
  //  Calculate the position in polar coordinates
  calPolarPosition: function(nodeObj) {
    let angleScale = this.angleScale
    let rScale = this.rScale
    if (this.polarAxis === 'y-axis') {
      //  Compute the nodes in polar coordinates
      let angle = angleScale(nodeObj.x) - Math.PI / 2
      let radius = rScale(nodeObj.y)
      let polarPoint = {angle: angle, radius: radius}
      return polarPoint
    } else if (this.polarAxis === 'x-axis') {
      //  Compute the nodes in polar coordinates
      let angle = angleScale(nodeObj.y) - Math.PI / 2
      let radius = rScale(nodeObj.x)
      let polarPoint = {angle: angle, radius: radius} 
      return polarPoint
    }
  },
  //  Given a position in Cartesian coordinates, compute the position in polar coordinates
  calPosition: function (nodeObj) {
      let angleScale = this.angleScale
      let rScale = this.rScale
      let polarPoint;
      if (this.polarAxis === 'y-axis') {
        //  Compute the nodes in polar coordinates
        let angle = angleScale(nodeObj.x)
        let radius = rScale(nodeObj.y)
        polarPoint = {angle: angle, radius: radius}
      } else if (this.polarAxis === 'x-axis') {
        //  Compute the nodes in polar coordinates
        let angle = angleScale(nodeObj.y)
        let radius = rScale(nodeObj.x)
        polarPoint = {angle: angle, radius: radius} 
      }
      let posAngle = polarPoint.angle - Math.PI / 2
      //  Calculate the position of a point
      let posX = Math.cos(posAngle) * polarPoint.radius
      let posY = Math.sin(posAngle) * polarPoint.radius
      let cartesianPos = {"x": posX, "y": posY}
      return cartesianPos
  },
  /**
   * get the center axis of the polar coord system
   */
  _getPolarCenter: function () {
    let SubTreeData = this.SubTreeData
    let polarCenterPara = this.polarCenterPara
    if (polarCenterPara === 'bottom') {
      return {x: SubTreeData.x + SubTreeData.TreeWidth / 2, y: SubTreeData.y + SubTreeData.TreeHeight}
    } else if (polarCenterPara === 'left') {
      return {x: SubTreeData.x, y: SubTreeData.y + SubTreeData.TreeHeight / 2}
    } else if (polarCenterPara === 'right') {
      return {x: SubTreeData.x + SubTreeData.TreeWidth, y: SubTreeData.y + SubTreeData.TreeHeight / 2}  
    }
    // the default center position is 'top'
    if (polarCenterPara === 'top') {
      return {x: SubTreeData.x + SubTreeData.TreeWidth / 2, y: SubTreeData.y}
    }
  }
}
 