export default function calTreeDepth (depth, treeData) {
    let depths = {}
    depths[treeData.index] = depth
    treeData.children.forEach((subtree) => {
        let subtreeDepths = calTreeDepth(depth + 1, subtree)
        Object.assign(depths, subtreeDepths)
    })
    return depths
}