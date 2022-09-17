import addLeafChildren from './addLeafChildren'
import setDefaultAttributes from './setDefaultAttributes'
import calTreeheight from './calTreeHeight'
import addHeight from './addHeight'
import calTreeWidth from './calTreeWidth'
import addWidth from './addWidth'
import calTreeDepth from './calTreeDepth'
import addDepth from './addDepth'
import makeTreeUnits from './makeTreeUnits'
import dispatchTreeUnit from './dispatchTreeUnit'

export default function (treeData, treeDsls, treeDic, m) {
    // add attributes: leaf-children, height, width, depth, rdepth
    addLeafChildren(treeData)

    setDefaultAttributes(treeDsls)

    addHeight(treeData, calTreeheight(treeData))

    addWidth(treeData, calTreeWidth(treeData))
  
    addDepth(treeData, calTreeDepth(1, treeData), treeData.height) 
    
    // make treeUnits set
    let treeUnits = makeTreeUnits(treeData, treeDsls, treeDic)

    // dispatch
    let layouts = {}
    if (treeUnits.length !== 0) {
        dispatchTreeUnit(treeData.index, treeUnits, layouts, m)
    }
    return layouts
}