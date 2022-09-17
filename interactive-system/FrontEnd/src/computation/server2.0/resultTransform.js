export default function (result, treeData, widthWithValue, heightWithValue, CompatibleList) {
	let l = result.length
	let n = (l - 16) / 4
	let subtreeLayout = []
	for (let i = 0; i < n; i++) {
		let index = treeData.children[i].index
		subtreeLayout.push({
			x: result[10 + 4 * i + 0],
			y: result[10 + 4 * i + 1],
			width: result[10 + 4 * i + 2],
			height: result[10 + 4 * i + 3],
			id: index,
			isCompatible: index in CompatibleList ? true : false
		})
	}
	let index = treeData.index
	let layout = {
		width: result[0],
		height: result[1],
		widthWithValue: widthWithValue,
		heightWithValue: heightWithValue,
		root: {
			x: result[2],
			y: result[3],
			width: result[4],
			height: result[5]
		},
		id: index,
		subtreeLayout: subtreeLayout,
		subtrees: {
			x: result[6],
			y: result[7],
			width: result[8],
			height: result[9]
		}
	}
	return layout
}