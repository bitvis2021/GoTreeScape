export default function (bias, treeData, axisDsl, constraints, rootValue, axisName) {
    let constraint = []
    let n = treeData.children.length
    // subtree
    if (axisDsl.Root.Relation === 'include') {
        // root.width = width
        // What if padding is negative?
		constraint = Array(4 * n + 16).fill(0)
		constraint[2 + 2 + bias] = 1
		constraint[0 + bias] = -1
		constraints.A.push(constraint)
        constraints.B.push(0)
        
        /*
        // tree_padding = width * axisDsl.Root.Padding
        // todo
        // Different units
        constraint = Array(4 * n + 16).fill(0)
        constraint[4 * n + 10 + bias] = 1
        if (!('Padding' in axisDsl.Root)) {
            constraint[0 + bias] = 0 
        } else {
            let tmp = 0
            if (isNaN(axisDsl.Root.Padding)) {
                tmp = +axisDsl.Root.Padding.slice(0, -1)
                if (axisDsl.Root.Padding.slice(-1) === 'h') {
                    constraint[2 + 2 + 1] = -tmp
                } else {
                    constraint[2 + 2 + 0] = -tmp
                }
            } else {
                tmp = +axisDsl.Root.Padding
                constraint[0 + bias] = -tmp
            }
        }
        constraints.A.push(constraint)
        constraints.B.push(0)
        */

        // tree_padding_left = width * axisDsl.Root.Padding[0]
        constraint = Array(4 * n + 16).fill(0)
        constraint[4 * n + 10 + bias] = 1
        if (!('Padding' in axisDsl.Root)) {
            constraint[0 + bias] = 0 
        } else {
            let tmp = 0
            if (isNaN(axisDsl.Root.Padding[0])) {
                tmp = +axisDsl.Root.Padding[0].slice(0, -1)
                if (axisDsl.Root.Padding[0].slice(-1) === 'h') {
                    constraint[2 + 2 + 1] = -tmp
                } else {
                    constraint[2 + 2 + 0] = -tmp
                }
            } else {
                tmp = +axisDsl.Root.Padding[0]
                constraint[0 + bias] = -tmp
            }
        }
        constraints.A.push(constraint)
        constraints.B.push(0)

        // tree_padding_right = width * axisDsl.Root.Padding[1]
        constraint = Array(4 * n + 16).fill(0)
        constraint[4 * n + 14 + bias] = 1
        if (!('Padding' in axisDsl.Root)) {
            constraint[0 + bias] = 0 
        } else {
            let tmp = 0
            if (isNaN(axisDsl.Root.Padding[1])) {
                tmp = +axisDsl.Root.Padding[1].slice(0, -1)
                if (axisDsl.Root.Padding[1].slice(-1) === 'h') {
                    constraint[2 + 2 + 1] = -tmp
                } else {
                    constraint[2 + 2 + 0] = -tmp
                }
            } else {
                tmp = +axisDsl.Root.Padding[1]
                constraint[0 + bias] = -tmp
            }
        }
        constraints.A.push(constraint)
        constraints.B.push(0)


        /*
		// width = subtrees.width + 2 * tree_padding
		constraint = Array(4 * n + 16).fill(0)
		constraint[0 + bias] = 1
		constraint[6 + 2 + bias] = -1
		constraint[4 * n + 10 + bias] = -2
		constraints.A.push(constraint)
        constraints.B.push(0)
        */
        // width = subtrees.width + tree_padding_left + tree_padding_right
		constraint = Array(4 * n + 16).fill(0)
		constraint[0 + bias] = 1
		constraint[6 + 2 + bias] = -1
        constraint[4 * n + 10 + bias] = -1
        constraint[4 * n + 14 + bias] = -1
		constraints.A.push(constraint)
        constraints.B.push(0)

		// root.x = 0
		constraint = Array(4 * n + 16).fill(0)
		constraint[2 + 0 + bias] = 1
		constraints.A.push(constraint)
		constraints.B.push(0)

		// root.x + tree_padding_left = subtrees.x
		constraint = Array(4 * n + 16).fill(0)
		constraint[2 + 0 + bias] = 1
		constraint[4 * n + 10 + bias] = 1
		constraint[6 + 0 + bias] = -1
		constraints.A.push(constraint)
		constraints.B.push(0)
    } else {
        // root.width mapping, when inclusion, ignored.
        let tmp = rootValue === 'adaptive' ? 1 : treeData[rootValue]
		constraint = Array(4 * n + 16).fill(0)
        constraint[2 + 2 + bias] = 1
        constraints.A.push(constraint)
        constraints.B.push(tmp)
    }

    if (axisDsl.Root.Relation === 'within') {
        // let alignment = 'Alignment' in axisDsl.Root ? axisDsl.Root.Alignment : 0.5
        // translate top/left/right/bottom to number
        let alignment = 0.5
        if ('Alignment' in axisDsl.Root) {
            if (axisDsl.Root.Alignment === 'left' || axisDsl.Root.Alignment === 'top') {
                alignment = 0
            }
            if (axisDsl.Root.Alignment === 'right' || axisDsl.Root.Alignment === 'bottom') {
                alignment = 1
            }
        }
        
        // root.x + 0.5 * root.width = 0.5 * width
        constraint = Array(4 * n + 16).fill(0)
		constraint[2 + 0 + bias] = 1
		constraint[2 + 2 + bias] = alignment
		constraint[0 + 0 + bias] = -alignment
		constraints.A.push(constraint)
		constraints.B.push(0)

        // subtrees.x + 0.5 * subtrees.width = 0.5 * width
        constraint = Array(4 * n + 16).fill(0)
		constraint[6 + 0 + bias] = 1
		constraint[6 + 2 + bias] = alignment
		constraint[0 + 0 + bias] = -alignment
		constraints.A.push(constraint)
		constraints.B.push(0)

        if (axisDsl.Subtree.Relation === 'flatten') {
            // subtrees.width = width
            constraint = Array(4 * n + 16).fill(0)
            constraint[6 + 2 + bias] = 1
            constraint[0 + bias] = -1
            constraints.A.push(constraint)
            constraints.B.push(0)

            // subtrees.x = 0
            constraint = Array(4 * n + 16).fill(0)
            constraint[6 + 0 + bias] = 1
            constraints.A.push(constraint)
            constraints.B.push(0)
        }
    }

    if (axisDsl.Root.Relation === 'juxtapose') {
        // tree_margin = (treeUnit/root) width * axisDsl.Subtrees.Margin
        constraint = Array(4 * n + 16).fill(0)
        constraint[4 * n + 10 + bias] = 1
        if (!('Margin' in axisDsl.Root)) {
            constraint[0 + bias] = 0
        } else {
            // constraint[0 + bias] = -axisDsl.Root.Margin
            let tmp = 0
            if (isNaN(axisDsl.Root.Margin)) {
                tmp = +axisDsl.Root.Margin.slice(0, -1)
                // if (axisDsl.Root.Margin.slice(-1) === 'r') {
                //     if (isNaN(tmp)) {
                //         console.log('Wrong! axisDsl.Root.Margin', axisDsl.Root.Margin)
                //     }
                //     constraint[2 + 2 + bias] = -tmp
                // } else {
                //     if (isNaN(tmp)) {
                //         console.log('Wrong! axisDsl.Root.Margin', axisDsl.Root.Margin)
                //     }
                //     constraint[0 + bias] = -tmp
                // }
                if (axisDsl.Root.Margin.slice(-1) === 'h') {
                    constraint[2 + 2 + 1] = -tmp
                } else {
                    constraint[2 + 2 + 0] = -tmp
                }
            } else {
                tmp = +axisDsl.Root.Margin
                constraint[0 + bias] = -tmp
            }
        }
        constraints.A.push(constraint)
        constraints.B.push(0)

        // root.width + tree_margin + subtrees.width = width
        constraint = Array(4 * n + 16).fill(0)
		constraint[2 + 2 + bias] = 1
		constraint[4 * n + 10 + bias] = 1
		constraint[6 + 2 + bias] = 1
		constraint[0 + bias] = -1
		constraints.A.push(constraint)
        constraints.B.push(0)
        
        if ('Position' in axisDsl.Root) {
            if (axisDsl.Root.Position === 'left' || axisDsl.Root.Position === 'top') {
                // root.x = 0
                constraint = Array(4 * n + 16).fill(0)
                constraint[2 + 0 + bias] = 1
                constraints.A.push(constraint)
                constraints.B.push(0)
        
                // subtrees.x + subtrees.width = width
                constraint = Array(4 * n + 16).fill(0)
                constraint[6 + 0 + bias] = 1
                constraint[6 + 2 + bias] = 1
                constraint[0 + bias] = -1
                constraints.A.push(constraint)
                constraints.B.push(0)
            } else {
                // subtrees.x = 0
                constraint = Array(4 * n + 16).fill(0)
                constraint[6 + 0 + bias] = 1
                constraints.A.push(constraint)
                constraints.B.push(0)
        
                // root.x + root.width = width
                constraint = Array(4 * n + 16).fill(0)
                constraint[2 + 0 + bias] = 1
                constraint[2 + 2 + bias] = 1
                constraint[0 + bias] = -1
                constraints.A.push(constraint)
                constraints.B.push(0)
            }
        } else {
            // root.x = 0
            constraint = Array(4 * n + 16).fill(0)
            constraint[2 + 0 + bias] = 1
            constraints.A.push(constraint)
            constraints.B.push(0)
    
            // subtrees.x + subtrees.width = width
            constraint = Array(4 * n + 16).fill(0)
            constraint[6 + 0 + bias] = 1
            constraint[6 + 2 + bias] = 1
            constraint[0 + bias] = -1
            constraints.A.push(constraint)
            constraints.B.push(0)
        }
        
    }
    // Subtree
    if (axisDsl.Subtree.Relation === 'align') {
        /* something wrong
        // subtrees.width = max(subtree[i].height)
        constraint = Array(4 * n + 16).fill(0)
        constraint[6 + 2 + bias] = 1
        constraints.A.push(constraint)
        constraints.B.push(maxSubtreeSpace)
        */

        // let alignment = 'Alignment' in axisDsl.Subtree ? axisDsl.Subtree.Alignment : 0.5
        let alignment = 0.5
        if ('Alignment' in axisDsl.Subtree) {
            if (axisDsl.Subtree.Alignment === 'left' || axisDsl.Subtree.Alignment === 'top') {
                alignment = 0
            }
            if (axisDsl.Subtree.Alignment === 'right' || axisDsl.Subtree.Alignment === 'bottom') {
                alignment = 1
            }
        }
        treeData.children.forEach((subtree, i) => {
            // subtree[i].x + alignment * subtree[i].width = subtrees.x + alignment * subtrees.width
			constraint = Array(4 * n + 16).fill(0)
			constraint[10 + 4 * i + 0 + bias] = 1
			constraint[10 + 4 * i + 2 + bias] = alignment
			constraint[6 + 0 + bias] = -1
			constraint[6 + 2 + bias] = -alignment
			constraints.A.push(constraint)
			constraints.B.push(0)
		})
    } else {
        // flatten 
        // Sort
        let flag = true
        let treeDataSort = [...treeData.children]
        if ('SortingOrder' in axisDsl.Subtree) {
            flag = axisDsl.Subtree.SortingOrder === 'desc' ? false : true
        }
        if ('SortingCriteria' in axisDsl.Subtree ) {
            if (axisDsl.Subtree.SortingCriteria !== 'null') {
                treeDataSort.sort((a, b) => {
                    return ((a[axisDsl.Subtree.SortingCriteria] < b[axisDsl.Subtree.SortingCriteria]) ^ flag) - 0.5
                })
            }
        } 
        // else {
        //     treeDataSort.sort((a, b) => {
        //         return ((a.index < b.index) ^ flag) - 0.5
        //     })
        // }

        // Calculate the sequence number before and after the sort
        treeData.children.forEach((subtree, index) => {
            subtree.preOrder = index
        })
        treeDataSort.forEach((subtree, index) => {
            if ('order' in subtree) {
                subtree.order[bias] = index
            } else {
                subtree.order = bias === 0 ? [index, 0] : [0, index]
            }
            
        })
        
        // ToDo Margin Dependent objects
        let flagMargin = 0 // flagMargin === 0 means splitting equally
        let margin = 0

        if ('Margin' in axisDsl.Subtree) {
            if (isNaN(axisDsl.Subtree.Margin)) {
                margin = axisDsl.Subtree.Margin.slice(0, -1)
                if (axisDsl.Subtree.Margin.slice(-1) === 'w') {
                    // Subtree.margin = root.width * 'margin'
                    constraint = Array(4 * n + 16).fill(0)
                    constraint[4 * n + 12 + bias] = 1
                    constraint[2 + 2 + 0] = -margin
                    constraints.A.push(constraint)
                    constraints.B.push(0)
                    flagMargin = 1
                }
                if (axisDsl.Subtree.Margin.slice(-1) === 'h') {
                    // Subtree.margin = root.height * 'margin'
                    constraint = Array(4 * n + 16).fill(0)
                    constraint[4 * n + 12 + bias] = 1
                    constraint[2 + 2 + 1] = -margin
                    constraints.A.push(constraint)
                    constraints.B.push(0)
                    flagMargin = 1
                }
            } else {
                // Subtree.margin = treeUnit.width * 'margin'
                margin = +axisDsl.Subtree.Margin
            }
        }

        if (flagMargin === 0) {
            // sum(subtree[i].width) = subtrees.width * (1 - axisDsl.Subtree.Margin)
            if (n > 1) {
                constraint = Array(4 * n + 16).fill(0)
                for (let i = 0; i < n; i++) {
                    constraint[10 + 4 * i + 2 + bias] = 1
                }
                constraint[6 + 2 + bias] = -1 + margin
                constraints.A.push(constraint)
                constraints.B.push(0)
            }
            
            // ToDo Margin Dependent objects
            // subtree_margin = subtrees.width * axisDsl.Subtree.Margin
            constraint = Array(4 * n + 16).fill(0)
            constraint[4 * n + 12 + bias] = 1
            if (axisDsl.Subtree.MarginType === 'space-around') {
                constraint[6 + 2 + bias] = -margin / n
            } else {
                constraint[6 + 2 + bias] = n === 1 ? 0 : -margin / (n - 1)
            }
            
            constraints.A.push(constraint)
            constraints.B.push(0)
        }
        

        treeData.children.forEach((subtree, i) => {
            if (subtree.order[bias] === 0) {
                if (axisDsl.Subtree.MarginType === 'space-around') {
                    // The initial value subtree[0].x = subtrees.x + 1/2 * subtree_margin
                    constraint = Array(4 * n + 16).fill(0)
                    // constraint[10 + 0 + bias] = 1
                    constraint[10 + 4 * i + bias] = 1
                    constraint[6 + 0 + bias] = -1
                    constraint[4 * n + 12 + bias] = -1/2.0
                    constraints.A.push(constraint)
                    constraints.B.push(0)
                } else {
                    // The initial value subtree[0].x = subtrees.x
                    constraint = Array(4 * n + 16).fill(0)
                    // constraint[10 + 0 + bias] = 1
                    constraint[10 + 4 * i + bias] = 1
                    constraint[6 + 0 + bias] = -1
                    constraints.A.push(constraint)
                    constraints.B.push(0)
                }  
			} else {
				// subtree[i].x = subtree[i-1].x + subtree[i-1].width + subtree_margin
				constraint = Array(4 * n + 16).fill(0)
				constraint[10 + 4 * i + 0 + bias] = 1
				// constraint[10 + 4 * (i - 1) + 0 + bias] = -1
                // constraint[10 + 4 * (i - 1) + 2 + bias] = -1
                // subtree[i].x = subtree[treeDataSort[subtree.order - 1].preOrder].x + subtree[i-1].width + subtree_margin
                // console.log('tianmin preSubtreeId', subtree.order, subtree.order - 1, treeDataSort[subtree.order - 1])
                let preSubtreeId = treeDataSort[subtree.order[bias] - 1].preOrder
                constraint[10 + 4 * preSubtreeId + 0 + bias] = -1
                constraint[10 + 4 * preSubtreeId + 2 + bias] = -1
				constraint[4 * n + 12 + bias] = -1
				constraints.A.push(constraint)
				constraints.B.push(0)
			}
        })
        
        if (axisDsl.Subtree.MarginType === 'space-around') {
            // subtree[-1].x + subtree[-1].width + 1/2 * subtree_margin = subtrees.x + subtrees.width
            let lastId = treeDataSort[n-1].preOrder
            constraint = Array(4 * n + 16).fill(0)
            // constraint[10 + 4 * (n - 1) + 0 + bias] = 1
            // constraint[10 + 4 * (n - 1) + 2 + bias] = 1
            constraint[10 + 4 * lastId + 0 + bias] = 1
            constraint[10 + 4 * lastId + 2 + bias] = 1
            constraint[4 * n + 12 + bias] = 1/2.0
            constraint[6 + 0 + bias] = -1
            constraint[6 + 2 + bias] = -1
            constraints.A.push(constraint)
            constraints.B.push(0)
        } else {
            // subtree[-1].x + subtree[-1].width = subtrees.x + subtrees.width
            let lastId = treeDataSort[n-1].preOrder
            constraint = Array(4 * n + 16).fill(0)
            // constraint[10 + 4 * (n - 1) + 0 + bias] = 1
            // constraint[10 + 4 * (n - 1) + 2 + bias] = 1
            constraint[10 + 4 * lastId + 0 + bias] = 1
            constraint[10 + 4 * lastId + 2 + bias] = 1
            constraint[6 + 0 + bias] = -1
            constraint[6 + 2 + bias] = -1
            constraints.A.push(constraint)
            constraints.B.push(0)
        }   
    }
}