//	Define the parameters inside curve
export function Curve (beginPos, endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
Curve.prototype = {
	init: function() {
		
	},
	updateData: function() {
		
	},
	generatePath: function () {
		let PosData = {source: this.beginPos, target: this.endPos}
        let lineGenerator = d3.linkVertical()
        let lineData = lineGenerator(PosData)
        return lineData
	},
	generatePolarPath: function() {
		let PosData = {source: this.beginPos, target: this.endPos}
        let lineGenerator = d3.linkVertical()
        let lineData = lineGenerator(PosData)
        return lineData
	}
}
