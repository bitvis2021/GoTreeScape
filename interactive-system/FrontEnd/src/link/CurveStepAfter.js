import { Polar } from '@/coordinatesystem/polar.js';
import { getIsRootCentricAttribute } from '@/data-processing/get_root_centric_attribute.js'

//	Define the parameters inside curveStepAfter
export function CurveStepAfter (beginPos, endPos, _beginPos, _endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
	this._beginPos = _beginPos
	this._endPos = _endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
CurveStepAfter.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	generatePath: function () {
		let PosData = []
        PosData.push(this.beginPos)
        PosData.push(this.endPos)
        let lineGenerator = d3.line().curve(d3.curveStepAfter)
        let lineData = lineGenerator(PosData)
        return lineData
	},
	generatePolarPath: function(polarCoordinateSystem, subTreeData) {
		//	node positions under polar coordinate system 
		let beginx = this.beginPos[0], beginy = this.beginPos[1],
			endx = this.endPos[0], endy = this.endPos[1]
		//	node positions under cartesian coordinate system
		let _beginx = this._beginPos[0], _beginy = this._beginPos[1],
			_endx = this._endPos[0], _endy = this._endPos[1]
		//	the position of middle point and end point along CurveStepBefore path
		//	because we need to compute their positions in polar coordinate system
		let beginPos = {'x': _beginx, 'y': _beginy}
		let middlePos = {'x': _endx, 'y': _beginy}
		let endPos = {'x': _endx, 'y': _endy}
        let rootCentric = getIsRootCentricAttribute(polarCoordinateSystem)
		//	the position of the subtree
		let subtreePos = {'x': subTreeData.x + subTreeData.TreeWidth / 2, 'y': subTreeData.y + subTreeData.TreeHeight / 2}
        if (!rootCentric) {
           subtreePos = {'x': beginx, 'y': beginy}
        }
		//	initialize the polar coordinate system
		let polarAxis = polarCoordinateSystem.PolarAxis
    	let polarCenterPos = polarCoordinateSystem.PolarCenterPos
    	let polarInnerRadius = polarCoordinateSystem.InnerRadius
    	let polarStartAngle = polarCoordinateSystem.StartAngle
    	let polarCenterAngle = polarCoordinateSystem.CentralAngle
    	let polarDirection = polarCoordinateSystem.Direction
    	let polarCoordObj = new Polar(polarAxis, polarInnerRadius, polarStartAngle, polarCenterAngle, polarCenterPos, polarDirection)
    	polarCoordObj.updateData(subTreeData)
    	//	the path is horizontal line first and then vertical line
    	//	compute the begin point
    	let polarBeginPoint = polarCoordObj.calPolarPosition(beginPos)
    	let beginPoint = polarCoordObj.calPosition(beginPos)
    	beginPoint.x = beginPoint.x + subtreePos.x
    	beginPoint.y = beginPoint.y + subtreePos.y
		//	compute the middle point
		let polarMiddlePoint = polarCoordObj.calPolarPosition(middlePos)
    	let middlePoint = polarCoordObj.calPosition(middlePos)
    	middlePoint.x = middlePoint.x + subtreePos.x
    	middlePoint.y = middlePoint.y + subtreePos.y
    	//	compute the end point
    	let polarEndPoint = polarCoordObj.calPolarPosition(endPos)
    	let endPoint = polarCoordObj.calPosition(endPos)
    	endPoint.x = endPoint.x + subtreePos.x
    	endPoint.y = endPoint.y + subtreePos.y
    	//	create the path
    	let curveStepAfterPath = d3.path()
      	//	the line start from [beginx, beginy]
    	curveStepAfterPath.moveTo(beginx, beginy)
    	if (polarAxis == 'y-axis') {
    		//	arc to middlePoint [middlePoint.x, middlePoint.y], 
    		//	last line to endPoint [endPos.x, endPos.y]
			if ((polarBeginPoint.angle - polarMiddlePoint.angle > 0.001) && (polarMiddlePoint.radius > 0.001)) {
				let pathDirection = true
				curveStepAfterPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint.radius, polarBeginPoint.angle, polarMiddlePoint.angle, pathDirection)
			} else if ((polarBeginPoint.angle - polarMiddlePoint.angle < -0.001) && (polarMiddlePoint.radius > 0.001)) {
		    	let pathDirection = false
				curveStepAfterPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint.radius, polarBeginPoint.angle, polarMiddlePoint.angle, pathDirection)
			}
			curveStepAfterPath.lineTo(endx, endy)
    	} else if (polarAxis == 'x-axis') {
    		// line to middlePoint [middlePoint.x, middlePoint.y]
    		// last arc to endPoint [endPos.x, endPos.y]
    		curveStepAfterPath.lineTo(middlePoint.x, middlePoint.y)
    		if ((polarMiddlePoint.angle - polarEndPoint.angle > 0.001) && (polarEndPoint.radius > 0.001)) {
				let pathDirection = true
				curveStepAfterPath.arc(subtreePos.x, subtreePos.y, polarEndPoint.radius, polarMiddlePoint.angle, polarEndPoint.angle, pathDirection)
			} else if ((polarMiddlePoint.angle - polarEndPoint.angle < -0.001) && (polarEndPoint.radius > 0.001)) {
		    	let pathDirection = false
				curveStepAfterPath.arc(subtreePos.x, subtreePos.y, polarEndPoint.radius, polarMiddlePoint.angle, polarEndPoint.angle, pathDirection)
			}
    	}
		//	horizontal line first and next vertical line
		return curveStepAfterPath.toString()
			
	}
}
