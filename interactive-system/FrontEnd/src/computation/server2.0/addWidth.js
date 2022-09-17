export default function addWidth (treeData, widths) {
    treeData.width = widths[treeData.index]
    treeData.children.forEach((subtree) => {
        addWidth(subtree, widths)
    })
}