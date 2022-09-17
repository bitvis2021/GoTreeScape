//	Define parameters inside the Arc Curve
export function ArcCurve (beginPos, endPos, arcDirection) {
	this.beginPos = beginPos
	this.endPos = endPos
	this.arcDirection = arcDirection
}
//	Defines the prototype of the circle, the method inside the Rect object
ArcCurve.prototype = {
	init: function() {
	},
	updateData: function() {
	},
	generatePath: function () {
		let beginx = this.beginPos[0], beginy = this.beginPos[1],
			endx = this.endPos[0], endy = this.endPos[1]
        let beginEndLength = Math.pow((Math.pow((beginx-endx), 2) + Math.pow((beginy-endy), 2)), 1/2)
        let radius = beginEndLength / 2
        let positionX = (beginx + endx) / 2
        let positionY = (beginy + endy) / 2
        let arcGenerator = d3.arc()
          .innerRadius(radius)
          .outerRadius(radius)
        let initAngleSin = Math.round(positionY - beginy) / radius
        initAngleSin = initAngleSin > 1?1:initAngleSin
        initAngleSin = initAngleSin < -1?-1:initAngleSin
        let initAngle = Math.asin(initAngleSin)
        if (beginx <= positionX) {
          // let startAngle = -Math.PI / 2 - initAngle, endAngle = Math.PI / 2 - initAngle  
        } else {
          initAngle = Math.PI - initAngle
        }
        if (radius > 0.001) {
            let startAngle = 0 + initAngle, endAngle = Math.PI + initAngle
            //	direction of the arc are true by default
            let anticlockwise = true
            if (this.arcDirection === 'bottom') {
                anticlockwise = false
            }
            var path = d3.path();
            path.arc(positionX, positionY, radius, startAngle, endAngle, anticlockwise)
            let lineData = path.toString()
            return lineData
        }
	},
	generatePolarPath: function() {
		return this.generatePath()
	}
}
