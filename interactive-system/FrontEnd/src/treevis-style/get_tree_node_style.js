export function getTreeNodeStyle(areaDataArray, dslContentObject, treeIndexWithDSL, treeNodeArray) {
	//  Node color under adaptive
	// let typecolorArray = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
	// let valuecolorArray = ["#08519c","#2171b5", "#4292c6",  "#6baed6", "#9ecae1", "#c6dbef", "#deebf7"]
	let numericalColorRange =  ["#2171b5", "#deebf7"] //['#2c5985', '#bce4d8'] //
	let ordinalColorRange = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
	// Initializes the color of the depth map
	//	Calculate the selected color based on the depth of the tree
	// let depthNum = depthRange[1] - depthRange[0] + 1
	// let colorBias = depthNum / 2, colorMiddel = (valuecolorArray.length - 1) / 2
	// if (colorBias > 3) {
	// 	colorRange[0] = valuecolorArray[colorMiddel - 3]
	// 	colorRange[1] = valuecolorArray[colorMiddel + 3]
	// } else if (colorBias <= 1) {
	// 	colorRange[0] = valuecolorArray[colorMiddel - 1]
	// 	colorRange[1] = valuecolorArray[colorMiddel + 1]
	// } else {
	// 	colorBias = Math.round(colorBias)
	// 	colorRange[0] = valuecolorArray[colorMiddel - colorBias]
	// 	colorRange[1] = valuecolorArray[colorMiddel + colorBias]
	// }
	let numericalColorController = d3.scaleLinear().range(numericalColorRange)
	let categoryColorController = d3.scaleOrdinal().range(ordinalColorRange)
	// let depthColorController = d3.scaleLinear().domain(depthRange).range(numericalColorRange)
	// // Initializes the colors under adaptive mapping
	// let rootNodeObj = treeNodeArray[0]
	// let adaptiveColorController = d3.scaleOrdinal(d3.schemeAccent); //d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, rootNodeObj.children.length + 1))
	// // Initializes the color of the value map
	// let valueRange = d3.extent(treeNodeArray, function(d) { return d.value })
	// let valueColorController = d3.scaleLinear().domain(valueRange).range(numericalColorRange)
	//	GetTreeNodeStyle is used to determine the node's color and size
	for(let i = 0; i < areaDataArray.length; i++) {
		let nodeObj = areaDataArray[i]
      	let nodeId = nodeObj.id
     	let nodeDSLObj = dslContentObject[treeIndexWithDSL[nodeId]]
     	areaDataArray[i].node_color = getTreeNodeColor(nodeObj, nodeDSLObj, treeNodeArray)
     	areaDataArray[i].stroke_width = getTreeNodeStrokeWidth(nodeObj)
	}
	return areaDataArray
	//	Compute the node width of the tree
	function getTreeNodeStrokeWidth(nodeObj) {
		let maxStrokeWidth = 1.5
		let rootWidth = nodeObj.RootWidth
        let rootHeight = nodeObj.RootHeight
        let minLength = rootWidth > rootHeight ? rootHeight : rootWidth
        let nodeStroke = minLength / 80
        nodeStroke = nodeStroke > maxStrokeWidth ? maxStrokeWidth : nodeStroke
        return nodeStroke + 'px'
	}
	// Compute node color
	function getTreeNodeColor (nodeObj, nodeDSLObj, treeNodeArray) {
		let colorEncodeValue = nodeDSLObj.Element.Color
		if (typeof(colorEncodeValue) === 'undefined') {
			colorEncodeValue = 'depth'
		}
		let colorSchema = nodeDSLObj.Element.ColorSchema
		let nodeColorRange = nodeDSLObj.Element.ColorRange
		let nodeStaticColor = nodeDSLObj.Element.StaticColor
		if (typeof(nodeStaticColor) === 'undefined') {
			nodeStaticColor = '#6baed6'
		}
		let nodeCollection = getTreeNodeCollection(treeNodeArray)
		let nodeId = nodeObj.id
		let nodeDataObj = nodeCollection[nodeId].data
		let nodeObjWithValue = treeNodeArray[0].data
		if (colorEncodeValue === 'static') {
			return nodeStaticColor
		} else {
			let valueType = typeof(nodeObjWithValue[colorEncodeValue])
			if (valueType === 'number') {
				let colorNumericalDomain = d3.extent(treeNodeArray, function(d, i){return +d.data[colorEncodeValue]})
				numericalColorController.domain(colorNumericalDomain)
				if (typeof(nodeColorRange) !== 'undefined') {
					numericalColorController.range(nodeColorRange)
				}
				let numericalValue = nodeDataObj[colorEncodeValue]
				return numericalColorController(numericalValue)
			} else if (valueType === 'string') {
				if (colorSchema === 'option 1') {
					// categoryColorController.range(d3.schemeCategory10)
				} else if (colorSchema === 'option 2') {
					categoryColorController.range(d3.schemeSet3)	
				}
				let colorOrdinalDomain = treeNodeArray.map(function(d){return d.data[colorEncodeValue]})
				categoryColorController.domain(colorOrdinalDomain)
				let ordinalValue = nodeDataObj[colorEncodeValue]
				return categoryColorController(ordinalValue)
			}
		}
		// if (typeof(nodeColorType) === 'undefined') {
		// 	nodeColorType = "depth"
		// }
		// let treeNodeCollection = getTreeNodeCollection(treeNodeArray)
		// if (nodeColorType === "depth") { 
		// 	let colorController = d3.scaleLinear()
	 //        	.domain(depthRange)
	 //        	.range(colorRange)
	 //        return depthColorController(nodeObj.depth)
		// } else if (nodeColorType === "adaptive") {
		// 	let treeNodeObj = treeNodeCollection[nodeObj.id]
		// 	// while (treeNodeObj.depth > 1) {
		// 	// 	treeNodeObj = treeNodeObj.parent;
		// 	// }
		// 	return adaptiveColorController(treeNodeObj.data.name)
		// } else if (nodeColorType === "value") {
	 //        return valueColorController(nodeObj.value)
		// }
		function getTreeNodeCollection(treeNodeArray) {
			let treeNodeCollection = {}
			for (let i = 0; i < treeNodeArray.length; i++) {
				let treeNodeObj = treeNodeArray[i]
				let treeNodeObjIndex = treeNodeObj.data.index
				treeNodeCollection[treeNodeObjIndex] = treeNodeObj
			}
			return treeNodeCollection
		}
	}
}