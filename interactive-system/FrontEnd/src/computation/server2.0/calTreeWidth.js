export default function calTreeWidth (treeData) {
    let index = treeData.index
    let widths = {}
    let childrenWidth = 0
    treeData.children.forEach((subtree) => {
        let subtreeWidths = calTreeWidth(subtree)
        Object.assign(widths, subtreeWidths)
        let subtreeWidth = subtreeWidths[subtree.index]
        childrenWidth = subtreeWidth + childrenWidth
    })
    let width = childrenWidth === 0 ? 1 : childrenWidth
    widths[index] = width
    return widths
}