//  Export the hierarchical data
export async function getGoTreeGrammarObj(dslIndex) {
    //  The global Graph object
    console.log('getGoTreeGrammarObj')
    let folderName = Math.round(dslIndex / 10000)
    var data = await d3.json('projectionResults/' + folderName + '/' + dslIndex + '.json')
    return data
}