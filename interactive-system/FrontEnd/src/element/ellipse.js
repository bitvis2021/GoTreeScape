import { throwGoTreeError } from '@/error/GoTreeError.js';

//	Define the parameters inside the circle
export function Ellipse (nodeObj) {
	this.nodeObj = nodeObj
	this.initBoundingBox()
}
//	Defines the prototype of the circle, the method inside the Rect object
Ellipse.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	initBoundingBox: function() {
		let boundingBox = {}
		let nodeObj = this.nodeObj
		boundingBox['top'] = {'x': nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth / 2, 'y': nodeObj.y + nodeObj.Rooty}
		boundingBox['bottom'] = {'x': nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth / 2, 'y': nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight}
		boundingBox['left'] = {'x': nodeObj.x + nodeObj.Rootx, 'y': nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight / 2}
		boundingBox['right'] = {'x': nodeObj.x + nodeObj.Rootx + nodeObj.RootWidth, 'y': nodeObj.y + nodeObj.Rooty + nodeObj.RootHeight / 2}
		this.boundingBox = boundingBox
	},
	generatePath: function (){
		// let cx = this.cx
		// let cy = this.cy
		// let rx = this.radiusX
		// let ry = this.radiusY
		let nodeObj = this.nodeObj
		let boundingBox = this.boundingBox
		let rx = nodeObj.RootWidth / 2, ry = nodeObj.RootHeight / 2
		let ellipseAngle = 0
		let pathStr = 'M ' + boundingBox['top'].x + ' ' + boundingBox['top'].y + ' A ' + rx + ' ' + ry + ' ' + ellipseAngle + ' 1 1 ' + boundingBox['bottom'].x + 
						' ' + boundingBox['bottom'].y + ' A ' + rx + ' ' + ry + ' ' + ellipseAngle + ' 0 1 ' + boundingBox['top'].x + ' ' + boundingBox['top'].y
 		return pathStr
 		// <!-- 50, 200 is the starting point, 250, 200 is the ending point, 100, 50 is RX and RY, 30 is the rotation -->
		// 'M '+ 50 200 A 100 50 30 1 1 250 200 L 250 200 A 100 50 30 0 1 50 200
  		//  return 'M' + (cx - rx)+',' + cy + 'a' + rx+',' + ry+' 0 1,0 '+ 2*rx + ',0a' + rx + ',' + ry + ' 0 1,0 ' + (-2 * rx) + ',0'
	},
	generatePolarPath: function(polarCoordObj, subtreePos) {
		let boundingBox = this.boundingBox
		let boundingBoxTop = boundingBox['top']
		let polarBoundingBoxTop = getPolarCoord(polarCoordObj, subtreePos, boundingBoxTop)
		let boundingBoxBottom = boundingBox['bottom']
		let polarBoundingBoxBottom = getPolarCoord(polarCoordObj, subtreePos, boundingBoxBottom)
		let boundingBoxLeft = boundingBox['left']
		let polarBoundingBoxLeft = getPolarCoord(polarCoordObj, subtreePos, boundingBoxLeft)
		let boundingBoxRight = boundingBox['right']
		let polarBoundingBoxRight = getPolarCoord(polarCoordObj, subtreePos, boundingBoxRight)
		let ellipseHeight = getDistance(polarBoundingBoxTop, polarBoundingBoxBottom)
		let ellipseWidth = getDistance(polarBoundingBoxLeft, polarBoundingBoxRight)
		if ((ellipseHeight == 0) || (ellipseWidth == 0)) {
			let message = "The height of ellipse is zero. | ellipse.js"
			// throwGoTreeError(message)
			ellipseHeight = 1
			ellipseWidth = 1
		}
		if (ellipseWidth == 0) {
			let message = "The width of ellipse is zero. | ellipse.js"
			// throwGoTreeError(message)
			ellipseWidth = 1
		}
		let rx = (ellipseWidth/2==0)?ellipseHeight/2:ellipseWidth/2, 
			ry = (ellipseHeight/2==0)?ellipseWidth/2:ellipseHeight/2
		let ellipseAngle = getAngle (polarBoundingBoxTop, polarBoundingBoxBottom)
		if (isNaN(ellipseAngle)) {
			let myr = 5
			let circlePath = "M" + polarBoundingBoxTop.x + "," + polarBoundingBoxTop.y + " " + "m" + -myr + ", 0 " + "a" + myr + "," + myr + " 0 1,0 " + myr*2  + ",0 " + "a" + myr + "," + myr + " 0 1,0 " + -myr*2 + ",0Z";
			return circlePath
		}
		let pathStr = 'M ' + polarBoundingBoxTop.x + ' ' + polarBoundingBoxTop.y + ' A ' + rx + ' ' + ry + ' ' + ellipseAngle + ' 1 1 ' + polarBoundingBoxBottom.x + 
						' ' + polarBoundingBoxBottom.y + ' A ' + rx + ' ' + ry + ' ' + ellipseAngle + ' 0 1 ' + polarBoundingBoxTop.x + ' ' + polarBoundingBoxTop.y
		return pathStr
		// compute the polar coordinate system
		function getPolarCoord(polarCoordObj, subtreePos, point) {
			let polarPoint = polarCoordObj.calPosition(point)
			polarPoint['x'] = polarPoint['x'] + subtreePos['x']
			polarPoint['y'] = polarPoint['y'] + subtreePos['y']
			return polarPoint
		}
		//	compute distance
		function getDistance(point1, point2) {
			let sum = Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2)
			return Math.sqrt(sum)
		}
		//	compute angle
		function getAngle(point1, point2) {
			let diffx = point1.x - point2.x
			let diffy = point1.y - point2.y
			let _angle = Math.atan(diffy / diffx)
			let angle = _angle / Math.PI * 180 - 90
			return angle
		}
	}
}
