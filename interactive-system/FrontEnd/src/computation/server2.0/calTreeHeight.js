export default function calTreeHeight (treeData) {
    let index = treeData.index
    let heights = {}
    let childrenHeight = 0
    treeData.children.forEach((subtree) => {
        let subtreeHeights = calTreeHeight(subtree)
        Object.assign(heights, subtreeHeights)
        let subtreeHeight = subtreeHeights[subtree.index]
        childrenHeight = childrenHeight < subtreeHeight ? subtreeHeight : childrenHeight
    })
    let height = childrenHeight + 1
    heights[index] = height
    return heights
}