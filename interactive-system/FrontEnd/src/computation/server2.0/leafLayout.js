export default function leafLayout (treeData, treeDsl) {
    let adaptiveAttr = ['adaptive', 'height', 'width', 'depth', 'rdepth']
    let flag = 0

    flag = adaptiveAttr.indexOf(treeDsl.Element.RootWidth)
    let width = flag === 0 ? 1 : treeData[treeDsl.Element.RootWidth]
    let widthWithValue = flag === -1 ? true : false

    flag = adaptiveAttr.indexOf(treeDsl.Element.RootHeight)
    let height = flag === 0 ? 1 : treeData[treeDsl.Element.RootHeight]
    let heightWithValue = flag === -1 ? true : false

    return {
        width: width,
        height: height,
        widthWithValue: widthWithValue,
        heightWithValue: heightWithValue,
        id: treeData.index,
        root: {
            x: 0,
            y: 0,
            width: width,
            height: height
        },
        subtreeLayout: [],
        subtrees: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		}
    }
}