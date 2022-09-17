//	The width of the path may map hierarchies, and the width of the path needs to be related to the size of the canvas being drawn
export function getLinkStrokeWidth (beginNodeObj, endNodeObj, beginNodeDSLObj, endNodeDSLObj, 
		treeViewWidth, treeViewHeight, treeNodeArray) {
	//	If there is a link in both the parent node and the child node, then the link's style follows the parent node,
	//	Otherwise the link's style follows the child node
	//	The width of a link is also related to the number of nodes
	let beginLinkType = beginNodeDSLObj.Element.Link
	let endLinkType = endNodeDSLObj.Element.Link
	let linkDSLObj = beginNodeDSLObj
	if ((beginLinkType === 'hidden') && (endLinkType !== 'hidden')) {
		linkDSLObj = endNodeDSLObj
	}
	let linkWidthType = linkDSLObj.Element.LinkWidth
	//	TODO
	let ratio = linkDSLObj.Element.LinkWidthRatio
	if (typeof(ratio) === 'undefined') {
		ratio = 1
	}
	if (linkWidthType === 'depth') {
		let maximumLinkWidth = treeViewWidth / 40
		maximumLinkWidth = maximumLinkWidth * ratio
		let depth = endNodeObj.depth
		return maximumLinkWidth / depth
	} else if (linkWidthType === 'adaptive') {
			//	The width of the constant link
		let adaptiveLinkWidth = treeViewWidth/200<2?2:treeViewWidth/200
		adaptiveLinkWidth = adaptiveLinkWidth * ratio
		return adaptiveLinkWidth
	} else if (linkWidthType === 'value') {
		let maximumLinkWidth = treeViewWidth / 20
		let minimumLinkWidth = treeViewWidth / 100
		let maxvalue = treeNodeArray[0].data.value
	  	let minvalue = maxvalue	
	  	for (let i=0;i<treeNodeArray.length;i++) {
		   	if (minvalue > treeNodeArray[i].data.value) {
		     	minvalue = treeNodeArray[i].data.value
		   	}
		}
		let widthLinearScale = d3.scaleLinear()
			.domain([minvalue, maxvalue])
			.range([minimumLinkWidth, maximumLinkWidth])
		return widthLinearScale(endNodeObj.value)
	}
}