//	Define the parameters inside curveStepX
export function CurveStepX (beginPos, endPos, _beginPos, _endPos) {
	this.beginPos = beginPos
	this.endPos = endPos
	this._beginPos = _beginPos
	this._endPos = _endPos
}
//	Defines the prototype of the circle, the method inside the Rect object
CurveStepX.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	generatePath: function () {
		let PosData = []
        PosData.push(this.beginPos)
        PosData.push(this.endPos)
        let lineGenerator = d3.line().curve(d3.curveStep)
        let lineData = lineGenerator(PosData)
        return lineData
	},
	generatePolarPath: function() {
		return this.generatePath()
	}
}
