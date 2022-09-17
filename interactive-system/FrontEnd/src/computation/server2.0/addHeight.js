export default function addHeight (treeData, heights) {
    treeData.height = heights[treeData.index]
    treeData.children.forEach((subtree) => {
        addHeight(subtree, heights)
    })
}