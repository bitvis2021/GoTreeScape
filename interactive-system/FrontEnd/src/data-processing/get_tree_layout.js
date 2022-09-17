//	Export the hierarchical data
export function getTreeLayout (treeIndexWithDSL, dslContentObject, treelayout, nodeArray, posLenObj) {

    let nodeIdArray = []
    for (let nodeId in treelayout) {
      nodeIdArray.push(nodeId)
    }
    // nodeIdArray = nodeIdArray.sort()
    nodeIdArray = nodeIdArray.sort(function(a, b) {
      var aNum = a.replace('index-', '')
      var bNum = b.replace('index-', '')
      return aNum - bNum
    })

    let nodeArrayObj = {}
    for (let i = 0;i < nodeArray.length; i++) {
      let nodeIndex = nodeArray[i].data.index
      nodeArrayObj[nodeIndex] = nodeArray[i]
    }
    let currentRootID = nodeIdArray[0]
    //  The corresponding g of the node is obtained according to the ID of the node
    //  let currentRootGId = currentRootID + '-g'
    //  let posLenObj = this.posLenCollectionObj[currentRootGId]
    //	Initialize AreaData
    let AreaData = {}
    let beginID = 1

    let beginRealWidth = posLenObj.width //self.treeWidth
    let beginRealHeight = posLenObj.height  //self.treeHeight 
    let beginX = 0
    let beginY = 0
    let depth = 1
    let paddingLeft = 0, paddingRight = 0, paddingTop = 0, paddingBottom = 0
    // let paddingLeft = 2, paddingRight = 2, paddingTop = 2, paddingBottom = 2
    let marginLeft = 0, marginRight = 0, marginTop = 0, marginBottom = 0
    // let marginLeft = 4, marginRight = 4, marginTop = 4, marginBottom = 4


    // simplify rectArea
    function RectArea(x1, y1, x2, y2) {
      return {
        x: x1,
        y: y1,
        width: x2-x1,
        height: y2-y1
      }
    }

    // alignment line -> rect, width/height
    let alignmentWidth = 8
    let dsl = dslContentObject[treeIndexWithDSL[currentRootID]]
    AreaData[treelayout[currentRootID].id] = {
      'fatherID':null,
      'x': paddingLeft,
      'isLeaf': 1,
      'y': paddingTop,
      'Rootx': 0,
      'Rooty': 0,
      'RootWidth': 0,
      'RootHeight': 0,
      'Width':beginRealWidth,
      'Height':beginRealHeight,
      'depth':0,
      'id':treelayout[currentRootID].id,
      // tianmin 2019/08/27
      // add subtrees
      'SubtreesX': 0,
      'SubtreesY': 0,
      'SubtreesWidth': 0,
      'SubtreesHeight': 0,
      'others': {},
      'value':nodeArrayObj[treelayout[currentRootID].id].value
    }
    complementTooltipAttribute(AreaData[treelayout[currentRootID].id], nodeArrayObj[treelayout[currentRootID].id], dsl)
    //Loop to get the AreaData of all Treeunits
    for (let index = 0; index < nodeIdArray.length; index++) {
      let nodeId = nodeIdArray[index]
      let currentNode = AreaData[treelayout[nodeId].id]
      let widthscale = 0
      if (treelayout[nodeId].width !== 0) {
        widthscale = currentNode.Width/treelayout[nodeId].width
      }
      let heightscale = 0
      if (treelayout[nodeId].height !== 0) {
        heightscale = currentNode.Height/treelayout[nodeId].height
      }
      currentNode.Rootx = treelayout[nodeId].root.x * widthscale + marginLeft
      currentNode.Rooty = treelayout[nodeId].root.y * heightscale + marginTop
      currentNode.RootWidth = treelayout[nodeId].root.width * widthscale - marginLeft - marginRight
      currentNode.RootHeight = treelayout[nodeId].root.height * heightscale - marginTop - marginBottom
      // tianmin 2019/08/27
      // add subtrees
      currentNode.SubtreesX = treelayout[nodeId].subtrees.x * widthscale + marginLeft
      currentNode.SubtreesY = treelayout[nodeId].subtrees.y * heightscale + marginTop
      currentNode.SubtreesWidth = treelayout[nodeId].subtrees.width * widthscale - marginLeft - marginRight
      currentNode.SubtreesHeight = treelayout[nodeId].subtrees.height * heightscale - marginTop - marginBottom
      // others, padding, margin, alignment, etc.
      depth = currentNode.depth
      AreaData[treelayout[nodeId].id] = currentNode
      for (let j = 0; j < treelayout[nodeId].subtreeLayout.length; j++) {
        currentNode.isLeaf = 0
        let SonID = treelayout[nodeId].subtreeLayout[j].id
        AreaData[SonID] = 
          {
           'fatherID': treelayout[nodeId].id,
           'x': currentNode.x + treelayout[nodeId].subtreeLayout[j].x * widthscale + paddingLeft,
           'y': currentNode.y + treelayout[nodeId].subtreeLayout[j].y * heightscale + paddingTop,
           'Rootx': 0,
           'Rooty': 0,
           'RootWidth': 0,
           'RootHeight': 0,
           'isLeaf': 1,
           'Width': treelayout[nodeId].subtreeLayout[j].width * widthscale - paddingLeft - paddingRight,
           'Height':treelayout[nodeId].subtreeLayout[j].height * heightscale - paddingTop - paddingBottom,
           'depth':currentNode.depth + 1,
           'id': SonID,
           // tianmin 2019/08/27
           // add subtrees
           'SubtreesX': 0,
           'SubtreesY': 0,
           'SubtreesWidth': 0,
           'SubtreesHeight': 0,
           'others': {},
           'value': nodeArrayObj[SonID].value
          }
        complementTooltipAttribute(AreaData[SonID], nodeArrayObj[SonID], dslContentObject[treeIndexWithDSL[SonID]])
      }
    }
    // Call adjusttoCenter to calculate the offset of root in each TreeUnit, which is used in RenderTree
    for (let item in AreaData) {
      AreaData[item].translate = 'translate(0 , 0)'
      // self.adjusttoCenter(AreaData[item],dslContentObject,treeIndexWithDSL,AreaData,currentRootID)
    }
    return AreaData
}

// Add the property values required by the tooltip
function complementTooltipAttribute(areaDataObj, nodeObj, dslObj) {
  let tooltip = []
  if ('Tooltip' in dslObj.Element) {
    tooltip = dslObj.Element.Tooltip
  }
  for (let i = 0; i < tooltip.length; i++) {
    areaDataObj[tooltip[i]] = nodeObj.data[tooltip[i]]
  }
}
