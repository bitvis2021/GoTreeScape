//	Defines the parameters inside the Straight
export function Straight (beginPos, endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
Straight.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	generatePath: function () {
		let PosData = []
        PosData.push(this.beginPos)
        PosData.push(this.endPos)
        let lineGenerator = d3.line()
        let lineData = lineGenerator(PosData)
        return lineData
	},
	generatePolarPath: function() {
		return this.generatePath()
	}
}
