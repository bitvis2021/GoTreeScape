//	Export the hierarchical data
export async function getTreeTemplate (fileName) {
	//	The global Graph object
	var treeTemplateObj = await d3.json('template/' + fileName)
	return treeTemplateObj
}