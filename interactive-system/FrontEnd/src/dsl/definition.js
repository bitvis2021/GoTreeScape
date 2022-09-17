/**
 * Defines a coordinate system for placing visual elements
 */
var DSLDefinitionObj = {
	relationEncoding: {
		separation: "separation",
		adjacency: "adjacency",
		overlapping: "overlapping",
		inclusion: "inclusion"
	},
	layoutMode: {
		topDown: "top-down",
		bottomUp: "bottom-up"
	},
	sortingMode: {
		horizontal: "horizontal",
		vertical: "vertical"
	},
	attributeEncodeMode: {
		value: "value",
		depth: "depth",
		constant: "CONSTANT"
	},
	sortingScope: {
		level: "level",
		global: "global"
	}
};

export default DSLDefinitionObj; 
