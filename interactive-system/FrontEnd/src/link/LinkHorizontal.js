//	Defines the parameters inside the LinkHorizontal
export function LinkHorizontal (beginPos, endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
LinkHorizontal.prototype = {
	init: function() {
		
	},
	updateData: function() {
		
	},
	generatePath: function () {
		let PosData = {source: this.beginPos, target: this.endPos}
        let lineGenerator = d3.linkHorizontal()
        let lineData = lineGenerator(PosData)
        return lineData
	},
	generatePolarPath: function() {
		return this.generatePath()
	}
}
