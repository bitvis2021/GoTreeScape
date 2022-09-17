//	Export the hierarchical data
export async function getHierarchicalDSL (fileNameArray, filePath) {
	console.log('fileNameArray', fileNameArray, 'filePath', filePath)
	if (typeof(filePath) === 'undefined') {
		filePath = ""
	}
	//	The global Graph object
	let treeDSLDataCollection = {}
	for (let i = 0; i < fileNameArray.length; i++) {
		let fileName = fileNameArray[i]
		let fileNameFull = fileName + '.json'
		var treeDSLData = await d3.json('treeDSL/' + filePath + fileNameFull)
		treeDSLDataCollection[fileName] = treeDSLData
	}
	console.log('treeDSLDataCollection', treeDSLDataCollection)
	return treeDSLDataCollection
}
