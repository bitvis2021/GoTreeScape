import { Polar } from '@/coordinatesystem/polar.js';
import { getIsRootCentricAttribute } from '@/data-processing/get_root_centric_attribute.js'

//	Define the parameters inside curveStepAfter
export function CurveStepBefore (beginPos, endPos, _beginPos, _endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
	this._beginPos = _beginPos
	this._endPos = _endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
CurveStepBefore.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	generatePath: function () {
		let PosData = []
        PosData.push(this.beginPos)
        PosData.push(this.endPos)
        let lineGenerator = d3.line().curve(d3.curveStepBefore)
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
		// let middlePos = {'x': _beginx, 'y': _endy}
		// let endPos = {'x': _endx, 'y': _endy}
        let middlePos = {'x': _beginx, 'y': _endy}
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
		//	the path is vertical line first and then horizontal line
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
    	//	the line start from [beginx, beginy] 
    	let curveStepBeforePath = d3.path()
		curveStepBeforePath.moveTo(beginx, beginy);
		if (polarAxis == 'y-axis') {
			//	line to middlePoint [middlePoint.x, middlePoint.y], 
    		//	then arc to endPoint [endPos.x, endPos.y]
			curveStepBeforePath.lineTo(middlePoint.x, middlePoint.y)
			//	generate the arc path according to the direction
			if ((polarMiddlePoint.angle - polarEndPoint.angle > 0.001) && (polarMiddlePoint.radius > 0.001)) {
				let pathDirection = true
				curveStepBeforePath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint.radius, polarMiddlePoint.angle, polarEndPoint.angle, pathDirection)
			} else if ((polarMiddlePoint.angle - polarEndPoint.angle < -0.001) && (polarMiddlePoint.radius > 0.001)) {
		    	let pathDirection = false
				curveStepBeforePath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint.radius, polarMiddlePoint.angle, polarEndPoint.angle, pathDirection)
			}
		} else if (polarAxis == 'x-axis') {
			//	arc to middlePoint [middlePoint.x, middlePoint.y], 
    		//	then line to endPoint [endPos.x, endPos.y]
    		if ((polarBeginPoint.angle - polarMiddlePoint.angle > 0.001) && (polarMiddlePoint.radius > 0.001)) {
				let pathDirection = true
				curveStepBeforePath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint.radius, polarBeginPoint.angle, polarMiddlePoint.angle, pathDirection)
			} else if ((polarBeginPoint.angle - polarMiddlePoint.angle < -0.001) && (polarMiddlePoint.radius > 0.001)) {
		    	let pathDirection = false
				curveStepBeforePath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint.radius, polarBeginPoint.angle, polarMiddlePoint.angle, pathDirection)
			}
			curveStepBeforePath.lineTo(endPoint.x, endPoint.y)
		}
		return curveStepBeforePath.toString()
	}
}
