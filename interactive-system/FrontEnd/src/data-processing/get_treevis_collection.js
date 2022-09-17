//  Export the hierarchical data
export async function getTreeVisCollection() {
    //  The global Graph object
    console.log('getTreeVisCollection')
    // var treevisCollection = await d3.text('treevisCollection/dsl_collection_314640.txt')
    var treevisCollection = await d3.text('treevisCollection/dsl_collection_62340.txt')
    return treevisCollection
}