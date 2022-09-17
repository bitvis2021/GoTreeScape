//	Defines a coordinate system for placing visual elements
export function Cartesian (origin = {x: 0, y: 0}) {
	this.x = origin.x;
	this.y = origin.y;
}
//	Defines prototype of rect, which is the method inside the Rect object
Cartesian.prototype = {
	init: function() {

	},
	updateData: function() {

	},
	//  Calculate the path of icicle plot
  	generatePath: function (nodePosArray) {
    	let lineFunction = d3.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
    	let rectPathObj = lineFunction(nodePosArray)
    	return rectPathObj
 	}
}
