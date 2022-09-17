import { Polar } from '@/coordinatesystem/polar.js';
import { getIsRootCentricAttribute } from '@/data-processing/get_root_centric_attribute.js'

//	Defines the parameters inside the Orthogonal
export function Orthogonal (beginPos, endPos, _beginPos, _endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
	this._beginPos = _beginPos
	this._endPos = _endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
Orthogonal.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	generatePath: function () {
		let PosData = []
		let beginX = this.beginPos[0], beginY = this.beginPos[1],
			endX = this.endPos[0], endY = this.endPos[1]
        PosData.push([beginX,beginY])
        PosData.push([beginX,(beginY+endY)/2])
        PosData.push([endX,(beginY+endY)/2])
        PosData.push([endX,endY])
        let lineGenerator = d3.line()
        let lineData = lineGenerator(PosData)
        return lineData
	},
	generatePolarPath: function(polarCoordinateSystem, subTreeData) {
		let beginx = this.beginPos[0], beginy = this.beginPos[1],
			endx = this.endPos[0], endy = this.endPos[1]
		let _beginx = this._beginPos[0], _beginy = this._beginPos[1],
			_endx = this._endPos[0], _endy = this._endPos[1]
		//	the position of middle point and end point along CurveStepBefore path
		//	because we need to compute their positions in polar coordinate system
		let beginPos = {'x': _beginx, 'y': _beginy}
        // TODO
		let middlePos1 = {'x': _beginx, 'y': (_beginy+_endy) / 2}
		let middlePos2 = {'x': _endx, 'y': (_beginy+_endy) / 2}
		let endPos = {'x': _endx, 'y': _endy}
		// the position of the subtree
        // TODO
        let rootCentric = getIsRootCentricAttribute(polarCoordinateSystem)
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
    	// compute the begin point
    	let polarBeginPoint = polarCoordObj.calPolarPosition(beginPos)
    	let beginPoint = polarCoordObj.calPosition(beginPos)
    	beginPoint.x = beginPoint.x + subtreePos.x
    	beginPoint.y = beginPoint.y + subtreePos.y
    	//	the path is horizontal line first and then vertical line
    	//	compute the middle point 1
    	let polarMiddlePoint1 = polarCoordObj.calPolarPosition(middlePos1)
    	let middlePoint1 = polarCoordObj.calPosition(middlePos1)
    	middlePoint1.x = middlePoint1.x + subtreePos.x
    	middlePoint1.y = middlePoint1.y + subtreePos.y
    	//	compute the middle point 2
    	let polarMiddlePoint2 = polarCoordObj.calPolarPosition(middlePos2)
    	let middlePoint2 = polarCoordObj.calPosition(middlePos2)
    	middlePoint2.x = middlePoint2.x + subtreePos.x
    	middlePoint2.y = middlePoint2.y + subtreePos.y
    	// 	compute the end point
    	let polarEndPoint = polarCoordObj.calPolarPosition(endPos)
    	let endPoint = polarCoordObj.calPosition(endPos)
    	endPoint.x = endPoint.x + subtreePos.x
    	endPoint.y = endPoint.y + subtreePos.y
    	//	vertical line first, then horizontal line, then vertical line
    	let orthogonalPath = d3.path()
    	//	the line start from [beginx, beginy] 
		orthogonalPath.moveTo(beginx, beginy);
		if (polarAxis == 'y-axis') {
			//	then line to middlePoint1 [middlePoint1.x, middlePoint1.y], 
			orthogonalPath.lineTo(middlePoint1.x, middlePoint1.y)
    		//	then arc to middlePoint2 [middlePoint2.x, middlePoint2.y],
			if ((polarMiddlePoint1.angle - polarMiddlePoint2.angle > 0.001) && (polarMiddlePoint1.radius > 0.001)) {
				let pathDirection = true
				orthogonalPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint1.radius, polarMiddlePoint1.angle, polarMiddlePoint2.angle, pathDirection)
			} else if ((polarMiddlePoint1.angle - polarMiddlePoint2.angle < -0.001) && (polarMiddlePoint1.radius > 0.001)) {
		    	let pathDirection = false
				orthogonalPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint1.radius, polarMiddlePoint1.angle, polarMiddlePoint2.angle, pathDirection)
			}
	    	//	last line to endPoint [endPos.x, endPos.y]
			orthogonalPath.lineTo(endx, endy)
		} else if (polarAxis == 'x-axis') {
			//	then arc to middlePoint1 [middlePoint1.x, middlePoint1.y], 
			if ((polarBeginPoint.angle - polarMiddlePoint1.angle > 0.001) && (polarMiddlePoint1.radius > 0.001)) {
				let pathDirection = true
				orthogonalPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint1.radius, polarBeginPoint.angle, polarMiddlePoint1.angle, pathDirection)
			} else if ((polarBeginPoint.angle - polarMiddlePoint1.angle < -0.001) && (polarMiddlePoint1.radius > 0.001)) {
		    	let pathDirection = false
				orthogonalPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint1.radius, polarBeginPoint.angle, polarMiddlePoint1.angle, pathDirection)
			}
			//	then line to middlePoint2 [middlePoint2.x, middlePoint2.y],
			orthogonalPath.lineTo(middlePoint2.x, middlePoint2.y)
			//	then arc to endPoint [endPoint.x, endPoint.y], 
			if ((polarMiddlePoint2.angle - polarEndPoint.angle > 0.001) && (polarMiddlePoint2.radius > 0.001)) {
				let pathDirection = true
				orthogonalPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint2.radius, polarMiddlePoint2.angle, polarEndPoint.angle, pathDirection)
			} else if ((polarBeginPoint.angle - polarMiddlePoint1.angle < -0.001) && (polarMiddlePoint1.radius > 0.001)) {
		    	let pathDirection = false
				orthogonalPath.arc(subtreePos.x, subtreePos.y, polarMiddlePoint2.radius, polarMiddlePoint2.angle, polarEndPoint.angle, pathDirection)
			}
		}
		return orthogonalPath.toString()
	}
}
