//	Export the hierarchical data
export async function getDSLSchema () {
	//	The global Graph object
	var dslSchema = await d3.json('config/schema_final.json')//.json
	return dslSchema
}
