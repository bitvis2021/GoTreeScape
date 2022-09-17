//	Define the parameters inside the circle
export function Circle (pos, radius) {
	this.x = pos.x;
	this.y = pos.y;
	this.radius = radius;
}
//	Defines the prototype of the circle, the method inside the Rect object
Circle.prototype = {
	init: function() {
		
	},
	updateData: function() {
		
	},
	generatePath: function (){
		let rectPathObj = d3.arc()
          .innerRadius(0)
          .outerRadius(this.radius)
          .startAngle(-Math.PI)
          .endAngle(Math.PI)
        return rectPathObj()
	}
}
