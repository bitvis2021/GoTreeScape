export default function addDepth (treeData, depths, maxHeight) {
    treeData.depth = depths[treeData.index]
    treeData.rdepth = maxHeight + 1 - depths[treeData.index]
    treeData.children.forEach((subtree) => {
        addDepth(subtree, depths, maxHeight)
    })
}