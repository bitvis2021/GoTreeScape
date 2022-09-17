//	Export the hierarchical data
export function getTreeUnitLayout (treeIndexWithDSL, dslContentObject, treelayout, nodeArray, posLenObj) {
    //  Iterate over and get an array of all Nodeids
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
    // let currentRootGId = currentRootID + '-g'
    // let posLenObj = this.posLenCollectionObj[currentRootGId]
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
    let minWidth = 4
    function RectArea(x1, y1, x2, y2) {
      let tmp = {
        x: x1,
        y: y1,
        width: x2-x1,
        height: y2-y1
      }
      if (Math.abs(tmp.width) < minWidth) {
        let middleX = (x1 + x2) / 2.0
        tmp.x = middleX - minWidth / 2.0
        tmp.width = minWidth
      }
      if (Math.abs(tmp.height) < minWidth) {
        let middleY = (y1 + y2) / 2.0
        tmp.y = middleY - minWidth / 2.0
        tmp.height = minWidth
      }
      return tmp
    }
    // alignment line -> rect, width/height
    let alignmentWidth = 4

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
      'value':nodeArrayObj[treelayout[currentRootID].id].value,
      'data': nodeArrayObj[treelayout[currentRootID].id].data
    }

    let dsl = dslContentObject[treeIndexWithDSL[currentRootID]]


    // Loop to get the AreaData of all Treeunits
    for (let index = 0; index < nodeIdArray.length; index++) {
      let nodeId = nodeIdArray[index]
      let currentNode = AreaData[treelayout[nodeId].id]
      let widthscale = currentNode.Width/treelayout[nodeId].width
      let heightscale = currentNode.Height/treelayout[nodeId].height
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
      currentNode.others = {
        X: {
          RootLeftPadding: RectArea(currentNode.Rootx, currentNode.y, currentNode.SubtreesX, currentNode.y + currentNode.Height),
          RootRightPadding: RectArea(currentNode.SubtreesX + currentNode.SubtreesWidth, currentNode.y, currentNode.Rootx + currentNode.RootWidth, currentNode.y + currentNode.Height),
          RootMargin: currentNode.Rootx <= currentNode.SubtreesX ? 
            RectArea(currentNode.Rootx + currentNode.RootWidth, currentNode.y, currentNode.SubtreesX, currentNode.y + currentNode.Height) : 
            RectArea(currentNode.SubtreesX + currentNode.SubtreesWidth, currentNode.y, currentNode.Rootx, currentNode.y + currentNode.Height),
          RootAlignment: RectArea(currentNode.Rootx + currentNode.RootWidth / 2 - alignmentWidth / 2, currentNode.y, currentNode.Rootx + 
            currentNode.RootWidth / 2 + alignmentWidth / 2, currentNode.y + currentNode.Height),
          SubtreeMargin: [],
          SubtreeAlignment: RectArea(currentNode.SubtreesX + currentNode.SubtreesWidth / 2 - alignmentWidth / 2, currentNode.y,
            currentNode.SubtreesX + currentNode.SubtreesWidth / 2 + alignmentWidth / 2, currentNode.y + currentNode.Height)
        },
        Y: {
          RootLeftPadding: RectArea(currentNode.x, currentNode.Rooty, currentNode.x + currentNode.Width, currentNode.SubtreesY),
          RootRightPadding: RectArea(currentNode.x, currentNode.SubtreesY + currentNode.SubtreesHeight, currentNode.x + currentNode.Width, currentNode.Rooty + currentNode.RootHeight),
          RootMargin: currentNode.Rooty <= currentNode.SubtreesY ? 
            RectArea(currentNode.x, currentNode.Rooty + currentNode.RootHeight, currentNode.x + currentNode.Width, currentNode.SubtreesY) : 
            RectArea(currentNode.x, currentNode.SubtreesY + currentNode.SubtreesHeight, currentNode.x + currentNode.Width, currentNode.Rooty),
          RootAlignment: RectArea(currentNode.x, currentNode.Rooty + currentNode.RootHeight / 2 - alignmentWidth / 2, 
            currentNode.x + currentNode.Width, currentNode.Rooty + currentNode.RootHeight / 2 + alignmentWidth / 2),
          SubtreeMargin: [],
          SubtreeAlignment: RectArea(currentNode.x, currentNode.SubtreesY + currentNode.SubtreesHeight / 2 - alignmentWidth / 2, 
            currentNode.x + currentNode.Width, currentNode.SubtreesY + currentNode.SubtreesHeight / 2 + alignmentWidth / 2)
        }
      }
      if (dsl.Layout.X.Root.Relation === 'include') {
        delete currentNode.others.X.RootMargin
        delete currentNode.others.X.RootAlignment
      }

      if (dsl.Layout.X.Root.Relation === 'juxtapose') {
        delete currentNode.others.X.RootLeftPadding
        delete currentNode.others.X.RootRightPadding
        delete currentNode.others.X.RootAlignment
      }

      if (dsl.Layout.X.Root.Relation === 'within') {
        delete currentNode.others.X.RootLeftPadding
        delete currentNode.others.X.RootRightPadding
        delete currentNode.others.X.RootMargin
        if ('Alignment' in dsl.Layout.X.Root) {
            if (dsl.Layout.X.Root.Alignment === 'left') {
              currentNode.others.X.RootAlignment = RectArea(currentNode.Rootx, currentNode.y, 
                currentNode.Rootx + alignmentWidth, currentNode.y + currentNode.Height)
            }
            if (dsl.Layout.X.Root.Alignment === 'right') {
              currentNode.others.X.RootAlignment = RectArea(currentNode.Rootx + currentNode.RootWidth - alignmentWidth, currentNode.y, 
                currentNode.Rootx + currentNode.RootWidth, currentNode.y + currentNode.Height)
            }
        }
      }

      if (dsl.Layout.X.Subtree.Relation === 'flatten') {
        delete currentNode.others.X.SubtreeAlignment
      }

      if (dsl.Layout.X.Subtree.Relation === 'align') {
        delete currentNode.others.X.SubtreeMargin
        if ('Alignment' in dsl.Layout.X.Subtree) {
            if (dsl.Layout.X.Subtree.Alignment === 'left') {
              currentNode.others.X.SubtreeAlignment = 
                RectArea(currentNode.SubtreesX, currentNode.y,
                currentNode.SubtreesX + alignmentWidth, currentNode.y + currentNode.Height)
            }
            if (dsl.Layout.X.Subtree.Alignment === 'right') {
              currentNode.others.X.SubtreeAlignment = RectArea(currentNode.SubtreesX + currentNode.SubtreesWidth - alignmentWidth, currentNode.y, 
                currentNode.SubtreesX + currentNode.SubtreesWidth, currentNode.y + currentNode.Height)
            }
          }
      }


      if (dsl.Layout.Y.Root.Relation === 'include') {
        delete currentNode.others.Y.RootMargin
        delete currentNode.others.Y.RootAlignment
      }

      if (dsl.Layout.Y.Root.Relation === 'juxtapose') {
        delete currentNode.others.Y.RootLeftPadding
        delete currentNode.others.Y.RootRightPadding
        delete currentNode.others.Y.RootAlignment
      }

      if (dsl.Layout.Y.Root.Relation === 'within') {
        delete currentNode.others.Y.RootLeftPadding
        delete currentNode.others.Y.RootRightPadding
        delete currentNode.others.Y.RootMargin
        if ('Alignment' in dsl.Layout.Y.Root) {
            if (dsl.Layout.Y.Root.Alignment === 'top') {
              currentNode.others.Y.RootAlignment = RectArea(currentNode.x, currentNode.Rooty, 
                currentNode.x + currentNode.Width, currentNode.Rooty + alignmentWidth)
            }
            if (dsl.Layout.Y.Root.Alignment === 'bottom') {
              currentNode.others.Y.RootAlignment = RectArea(currentNode.x, currentNode.Rooty + currentNode.RootHeight - alignmentWidth, 
                currentNode.x + currentNode.Width, currentNode.Rooty + currentNode.RootHeight)
            }
          }
      }

      if (dsl.Layout.Y.Subtree.Relation === 'flatten') {
        delete currentNode.others.Y.SubtreeAlignment
        
      }

      if (dsl.Layout.Y.Subtree.Relation === 'align') {
        delete currentNode.others.Y.SubtreeMargin
        if ('Alignment' in dsl.Layout.Y.Subtree) {
            if (dsl.Layout.Y.Subtree.Alignment === 'top') {
              currentNode.others.Y.SubtreeAlignment = 
                RectArea(currentNode.x, currentNode.SubtreesY, 
                currentNode.x + currentNode.Width, currentNode.SubtreesY + alignmentWidth)
            }
            if (dsl.Layout.Y.Subtree.Alignment === 'bottom') {
              currentNode.others.Y.SubtreeAlignment = 
                RectArea(currentNode.x, currentNode.SubtreesY + currentNode.SubtreesHeight - alignmentWidth, 
                currentNode.x + currentNode.Width, currentNode.SubtreesY + currentNode.SubtreesHeight)
            }
          }
      }
      let canvasWidth = currentNode.Width
      let canvasHeight = currentNode.Height
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


        // tianmin subtree alignment
        
      }
      for (let j = 0; j < treelayout[nodeId].subtreeLayout.length; j++) {
        currentNode.isLeaf = 0
        let SonID = treelayout[nodeId].subtreeLayout[j].id
        // console.log('tianmin', j, nodeArray[0].children[j].data.order, nodeArray[0].children[j].data.preOrder)
          let sortID = nodeArray[0].children[j].data.order[0]
          if (sortID === 0) {
            if (dsl.Layout.X.Subtree.Relation === 'flatten') {
              currentNode.others.X.SubtreeMargin.push(
                RectArea(currentNode.SubtreesX,
                  currentNode.SubtreesY,
                  AreaData[SonID].x,
                  currentNode.SubtreesY + currentNode.SubtreesHeight)
              )
            }
          }
  
          if (sortID === 2) {
            if (dsl.Layout.X.Subtree.Relation === 'flatten') {
              currentNode.others.X.SubtreeMargin.push(
                RectArea(AreaData[SonID].x + AreaData[SonID].Width,
                  currentNode.SubtreesY,
                  currentNode.SubtreesX + currentNode.SubtreesWidth,
                  currentNode.SubtreesY + currentNode.SubtreesHeight)
              )
            }
          }
  
          if (sortID > 0) {
            if (dsl.Layout.X.Subtree.Relation === 'flatten') {
              let preSonId = 0
              nodeArray[0].children.forEach((node) => {
                if (node.data.order[0] === sortID - 1) {
                  preSonId = node.data.preOrder + 1
                }
              })
              
              currentNode.others.X.SubtreeMargin.push(
                RectArea(AreaData['index-' + preSonId].x + AreaData['index-' + preSonId].Width,
                  currentNode.SubtreesY,
                  AreaData[SonID].x,
                  currentNode.SubtreesY + currentNode.SubtreesHeight)
              )
            }
          }
  
        
          // y
          sortID = nodeArray[0].children[j].data.order[1]
          if (sortID === 0) {
            if (dsl.Layout.Y.Subtree.Relation === 'flatten') {
              currentNode.others.Y.SubtreeMargin.push(
                RectArea(currentNode.SubtreesX,
                  currentNode.SubtreesY,
                  currentNode.SubtreesX + currentNode.SubtreesWidth,
                  AreaData[SonID].y)
              )
            }
          }
  
          if (sortID === 2) {
            if (dsl.Layout.Y.Subtree.Relation === 'flatten') {
              currentNode.others.Y.SubtreeMargin.push(
                RectArea(currentNode.SubtreesX,
                  AreaData[SonID].y + AreaData[SonID].Height,
                  currentNode.SubtreesX + currentNode.SubtreesWidth,
                  currentNode.SubtreesY + currentNode.SubtreesHeight)
              )
            }
          }
  
          if (sortID > 0) {
            if (dsl.Layout.Y.Subtree.Relation === 'flatten') {
              let preSonId = 0
              nodeArray[0].children.forEach((node) => {
                if (node.data.order[1] === sortID - 1) {
                  preSonId = node.data.preOrder + 1
                }
              })
              // console.log('sortID', sortID, 'preSonId', preSonId, 'SonID', SonID, "AreaData['index-' + preSonId]", AreaData['index-' + preSonId])
              currentNode.others.Y.SubtreeMargin.push(
                RectArea(currentNode.SubtreesX,
                  AreaData['index-' + preSonId].y + AreaData['index-' + preSonId].Height,
                  currentNode.SubtreesX + currentNode.SubtreesWidth,
                  AreaData[SonID].y)
              )
            }
          }
      }
    }

    
    // Call adjusttoCenter to calculate the offset of root in each TreeUnit, which is used in RenderTree
    for (let item in AreaData) {
      AreaData[item].translate = 'translate(0 , 0)'
      // self.adjusttoCenter(AreaData[item],dslContentObject,treeIndexWithDSL,AreaData,currentRootID)
    }
    return AreaData
}
