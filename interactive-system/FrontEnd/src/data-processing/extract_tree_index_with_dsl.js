//  Extract the file corresponding to the passed treeNodeIndex and DSL
export function extractTreeIndexWithDSL (treeIndexWithDefaultDSL, nodeArray) {
  let treeIndexWithDSL = {}
  for (let nI = 0; nI < nodeArray.length; nI++) {
    let treeData = nodeArray[nI].data
    let index = treeData.index
    //  Not all nodes have DSL objects. Need to determine whether the nodes have DSL objects
    if (typeof(treeIndexWithDefaultDSL[index]) !== 'undefined') {      
      treeIndexWithDSL[index] = treeIndexWithDefaultDSL[index]
    } else {

      treeIndexWithDSL[index] = treeIndexWithDefaultDSL.default
    }        
  }
  return treeIndexWithDSL
}