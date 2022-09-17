//	The color of a node can be fixed, mapping numeric attributes, or mapping category attributes
export function getTreeNodeColor (nodeObj, nodeDSLObj, treeNodeArray) {
	let nodeColorType = nodeDSLObj.Element.Color
	let treeNodeCollection = getTreeNodeCollection(treeNodeArray)
	//  Node color under adaptive
    let typecolorArray = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
    let valuecolorArray = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6", "#2171b5"]
    let colorRange =  ['#2c5985', '#bce4d8'] //["#2171b5", "#f7fbff"]
	if (nodeColorType === "depth") { 
		let depthRange = d3.extent(treeNodeArray, function(d) {
			return d.depth
		})
		let colorController = d3.scaleLinear()
        	.domain(depthRange)
        	.range(colorRange)
        return colorController(nodeObj.depth)
	} else if (nodeColorType === "adaptive") {
		// let rootNodeObj = treeNodeArray[0]
		// console.log('rootNodeObj.children.length', rootNodeObj.children.length)
		// let ordinalColor = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 9))
		// let treeNodeObj = treeNodeCollection[nodeObj.id]
		// console.log('treeNodeObj', treeNodeObj.depth, 'rootNodeObj', rootNodeObj, 'treeNodeCollection', treeNodeCollection)
		// while (treeNodeObj.depth > 2) {
		// 	console.log('-----depth-----', treeNodeObj.depth)
		// 	treeNodeObj = treeNodeObj.parent;
		// }
		// console.log('name', treeNodeObj.data.name, 'color', ordinalColor(treeNodeObj.data.name))
		// return ordinalColor(treeNodeObj.data.index)
	} else if (nodeColorType === "value") {
		let valueRange = d3.extent(treeNodeArray, function(d) {
			return d.value
		})
		let colorController = d3.scaleLinear()
        	.domain(valueRange)
        	.range(colorRange)
        return colorController(nodeObj.value)
	}
	function getTreeNodeCollection(treeNodeArray) {
		let treeNodeCollection = {}
		for (let i = 0; i < treeNodeArray.length; i++) {
			let treeNodeObj = treeNodeArray[i]
			let treeNodeObjIndex = treeNodeObj.data.index
			treeNodeCollection[treeNodeObjIndex] = treeNodeObj
		}
		return treeNodeCollection
	}
	// let colorAttr = this.colorAttr
	// let colorController = this.colorController
}

// let colorAttr = this.colorAttr
//       let colorRange = this.colorRange
//       let treeNodeArray = this.nodeArray
//       let valueRange = d3.extent(treeNodeArray, function(d, i) { return d[colorAttr] })
//       let colorController = d3.scaleLinear()
//         .domain(valueRange)
//         .range(colorRange)
//       this.colorController = colorController

// 		let colorAttr = this.colorAttr
//       let colorController = this.colorController
//       return colorController(d[colorAttr])
//
//       let dataType = dslContentObject[treeIndexWithDSL[d.id]].Element.Color
//       if(dataType === "depth"){
//         let colorNum = valuecolorArray.length - 1
//         let color = (colorNum + 1)/maxdepth * (AreaData[d.id].depth - 1)
//         color = parseInt(color)
//         return valuecolorArray[colorNum-color]
//       }
//       else if(dataType === "adaptive"){
//         if (AreaData[d.id].isLeaf === 1) {
//           let ID = AreaData[d.id].fatherID
//           return ordinalColor(ID)
//         }
//         else{
//           let ID = d.id
//           return ordinalColor(ID)
//         }
//       }
//       else if(dataType === "value"){
//         let currentvalue
//         for(let i=0;i<nodeArray.length;i++){
//           if(d.id === nodeArray[i].data.index)
//             currentvalue = nodeArray[i].data.value
//         }
//         let color = 8*(currentvalue - minvalue)/(maxvalue - minvalue)
//         color = parseInt(color)
//         return valuecolorArray[color]
//       }
//       return '#c6dbef'