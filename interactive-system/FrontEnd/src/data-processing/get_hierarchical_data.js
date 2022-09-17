//	Export the hierarchical data
export async function getHierarchicalData (fileName) {
	//	The global Graph object
	var data = await d3.json('hierarchicalData/' + fileName)
	return data
}