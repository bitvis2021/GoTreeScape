export function getConfig () {
	//	All configuration files
	let config = {
		treeDataArray: [{
		  fileName: 'flare.json',
		  nodeNum: 100,
		  depth: 5
		}, {
		  fileName: 'flare-vis.json',
		  nodeNum: 100,
		  depth: 5
		}, {
		  fileName: 'tmp50.json',
		  nodeNum: 120,
		  depth: 3
		}, {
		  fileName: 'binaryTree.json',
		  nodeNum: 120,
		  depth: 3
		}],
		initTreeDataName: 'flare-vis.json',
		defaultLinkWidth: 5, // Default width of the joined edges
		defaultMaxLinkWidth: 30, //	The width of the largest joint edge
		//	Array of DSLS in different coordinate systems
		cartesianDSLArray: ['ArcTree', 'BCTh', 'BCTw', 'BeamTree', 'BeamTreeV', 
			'CurveTree', 'GoTree1', 'GoTree3', 'IciclePlot', 'IPTP', 
			'NodeLink', 'NodeLink1', 'PedVis', 'Dendrogram', 'TreemapSlice', 
			'TreemapSliceDice'],
		polarDSLArray: ['GoTree2', 'Sunburst1', 'Sunburst'],
		//	Select the DSL array to the DSL List view
		selectedDSLArray: ['ArcTree', 'CurveTree', 'NodeLink', 'Sunburst'],
	}
	return config
}
