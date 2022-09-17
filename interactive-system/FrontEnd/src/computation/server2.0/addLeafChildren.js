export default function addLeafChildren (treeData) {
    if ('children' in treeData) {
        treeData.children.forEach((subtree) => {
            addLeafChildren(subtree)
        })
    } else {
        treeData.children = []
    }
}