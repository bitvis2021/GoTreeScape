//	Compute the number of nodes and depth information for the hierarchical data
export function getTreeDataInfo (tree_json, username, filename) {
	var treeObj = d3.hierarchy(tree_json)
	var nodesArray = []
	appendNodeObj(treeObj, nodesArray)
	let nodeNum = nodesArray.length
	let treeDepth = 0
	for (let i = 0;i < nodesArray.length; i++) {
		let nodeDepth = nodesArray[i].depth
		if(nodeDepth > treeDepth) {
			treeDepth = nodeDepth
		}
	}
	let treeInfo = { 
		nodenum: nodeNum, 
		depth: (treeDepth + 1),
		treedata: tree_json,
		date: new Date().toISOString().split('T')[0],
		username: username,
		filename: filename
	}
	return treeInfo
}
//	Pass in hierarchical data to compute the attribute values of nodes in the hierarchical data
function appendNodeObj (nodes, nodesArray) {
	let children = nodes.children
	nodesArray.push(nodes)
	if (typeof(children) !== 'undefined') {
		for (let i = 0; i < children.length; i++) {
			appendNodeObj(children[i], nodesArray)
		}
	}
}
