//	Define the parameters inside RECT
export function Rect (x, y, width, height, id, path) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.id = id;
	//	Initializes the path of the RECT object
	this.path = path;
}
//	Defines the prototype for Rect, the methods inside the RecT object
Rect.prototype = {
	init: function() {

	},
	updateData: function() {

	}
}
