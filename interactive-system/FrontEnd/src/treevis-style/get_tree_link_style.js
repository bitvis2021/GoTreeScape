export function getTreeLinkStyle(linkDataArray, AreaData, dslContentObject, 
		treeIndexWithDSL, treeNodeArray, treeViewWidth, treeViewHeight) {
	let maximumValueLinkWidth = treeViewWidth / 20
	let minimumValueLinkWidth = treeViewWidth / 100
	let [minvalue, maxvalue] = d3.extent(treeNodeArray, function (d) {return d.data.value})
	let widthLinearScaleController = d3.scaleLinear()
		// .domain([minvalue, maxvalue])
		// .range([minimumValueLinkWidth, maximumValueLinkWidth])
	//  Calculate the width value of each connected edge
	for(let i = 0; i < linkDataArray.length; i++) {
		let linkObj = linkDataArray[i]
		let beginNodeId = linkObj.beginid
		let endNodeId = linkObj.endid
		let beginNodeObj = AreaData[beginNodeId]
		let endNodeObj = AreaData[endNodeId]
      	let beginNodeDSLObj = dslContentObject[treeIndexWithDSL[beginNodeId]]
      	let endNodeDSLObj = dslContentObject[treeIndexWithDSL[endNodeId]]
      	linkObj.link_width = getLinkStrokeWidth(beginNodeObj, endNodeObj, beginNodeDSLObj, 
      			endNodeDSLObj, treeViewWidth, treeViewHeight, treeNodeArray)
	}
	return linkDataArray
	// Compute the width of the connecting edges between nodes
	function getLinkStrokeWidth (beginNodeObj, endNodeObj, beginNodeDSLObj, endNodeDSLObj, 
		treeViewWidth, treeViewHeight, treeNodeArray) {
		//	If there is a link in both the parent node and the child node, then the link's style follows the parent node,
		//	Otherwise the link's style follows the child node
		//	The width of a link is also related to the number of nodes
		let beginLinkType = beginNodeDSLObj.Element.Link
		let endLinkType = endNodeDSLObj.Element.Link
		let linkDSLObj = beginNodeDSLObj
		let linkNodeObj = beginNodeObj
		if ((beginLinkType === 'hidden') && (endLinkType !== 'hidden')) {
			linkDSLObj = endNodeDSLObj
			linkNodeObj = endNodeObj
		}
		let Thickness = linkDSLObj.Element.Thickness
		let nodeCollection = getTreeNodeCollection(treeNodeArray)
		let linkNodeId = linkNodeObj.id
		let linkNodeDataObj = nodeCollection[linkNodeId].data
		if (Thickness === 'static') {
			//	There's only one number
			//	When thickness of node links specified in Grammar is undefined, the default value is returned
			if (typeof(linkDSLObj.Element.StaticThickness) === 'undefined') {
				let defaultThickness = 1
				return defaultThickness / 2
			}
			return (linkDSLObj.Element.StaticThickness / 2)
		} else {
			let maxWidth = linkDSLObj.Element.MaxThickness
			let minWidth = linkDSLObj.Element.MinThickness
			if (typeof(maxWidth) === 'undefined') {
				// TODO
				maxWidth = 2
				
			}
			if (typeof(minWidth) === 'undefined') {
				minWidth = 1
			}
			let linkWidthRange = [maxWidth, minWidth]
			let widthNumericalDomain = d3.extent(treeNodeArray, function(d, i){return +d.data[Thickness]})
			widthLinearScaleController.domain(widthNumericalDomain).range(linkWidthRange)
			let numericalValue = linkNodeDataObj[Thickness]
			return (widthLinearScaleController(numericalValue) / 2)
		}
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
}

