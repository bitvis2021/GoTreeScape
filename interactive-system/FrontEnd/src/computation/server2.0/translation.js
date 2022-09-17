import translateAxis from './translationAxis'
export default function (treeData, treeDsl, layouts) {
    let adaptiveAttr = ['adaptive', 'height', 'width', 'depth', 'rdepth']
    let flag_ = true
    let constraints = {
        A: [],
        B: []
    }
    let n = treeData.children.length

    // constraint (important)
    // 0, 1 width, height
    // 2 - 5 treeUnit
    // 6 - 9 subtrees
    // (10 + 4*k) - (13 + 4*k) subtree
    // (10 + 4*n) - (11 + 4*n) root padding/margin - left/top
    // (12 + 4*n) - (13 + 4*n) subtrees margin
    // (14 + 4*n) - (15 + 4*n) root padding/margin - right/bottom

    // axis 1
    let bias = 0
    let axisDsl = treeDsl.Layout.X
    translateAxis(bias, treeData, axisDsl, constraints, treeDsl.Element.RootWidth, 'x') 

    // axis 2
    bias = 1
    axisDsl = treeDsl.Layout.Y
    translateAxis(bias, treeData, axisDsl, constraints, treeDsl.Element.RootHeight, 'y')

    // Compute maxSubtreeWidth and maxSubtreeHeight, for Subtree is 'align', make constraint for 'subtrees.width/height'
    let maxSubtreeWidth = 1    
    let maxSubtreeHeight = 1


    // Mode part
    let constraint = []
    constraints.isCompatible = {}
    constraints.widthWithValue = false
    constraints.heightWithValue = false
    if (treeDsl.Layout.Mode === 'top-down') {
        let tmp = 1
        treeData.children.forEach((subtree, i) => {
            // subtree[i].width = map_value
            constraint = Array(4 * n + 16).fill(0)
            constraint[10 + 4 * i + 2] = 1
            constraints.A.push(constraint)
            flag_ = adaptiveAttr.indexOf(treeDsl.Layout.SubtreeWidth)
            if (flag_ < 0) {
                constraints.widthWithValue = true
            }
            tmp = treeDsl.Layout.SubtreeWidth === 'adaptive' ? 1 : subtree[treeDsl.Layout.SubtreeWidth]
            maxSubtreeWidth = maxSubtreeWidth > tmp ? maxSubtreeWidth : tmp
            constraints.B.push(tmp)

            // subtree[i].height = map_value
            constraint = Array(4 * n + 16).fill(0)
            constraint[10 + 4 * i + 3] = 1
            constraints.A.push(constraint)
            tmp = 1
            flag_ = adaptiveAttr.indexOf(treeDsl.Layout.SubtreeHeight)
            if (flag_ < 0) {
                constraints.heightWithValue = true
            }
            tmp = treeDsl.Layout.SubtreeHeight === 'adaptive' ? 1 : subtree[treeDsl.Layout.SubtreeHeight]
            maxSubtreeHeight = maxSubtreeHeight > tmp ? maxSubtreeHeight : tmp
            constraints.B.push(tmp)
        })
    } else {
        let widthIsAnyValue = false
        let heightIsAnyValue = false
        let widthIsAnyAdaptive = false
        let heightIsAnyAdaptive = false
        let widthMapValue = {}
        let heightMapValue = {}
        treeData.children.forEach((subtree, i) => {
            if (subtree.index in layouts) {
                if (layouts[subtree.index].widthWithValue) {

                    widthIsAnyValue = true
                    widthMapValue[i] = true
                } else {

                    widthIsAnyAdaptive = true
                    widthMapValue[i] = false
                }
            
                if (layouts[subtree.index].heightWithValue) {

                    heightIsAnyValue = true
                    heightMapValue[i] = true
                } else {

                    heightIsAnyAdaptive = true
                    heightMapValue[i] = false
                }
            } else {

                widthIsAnyAdaptive = true
                heightIsAnyAdaptive = true
                widthMapValue[i] = false
                heightMapValue[i] = false
            }
        })
        
        if (widthIsAnyValue) {

            if (widthIsAnyAdaptive) {

                let allAdaptive = 0
                let nAdaptive = 0
                treeData.children.forEach((subtree, i) => {
                    if (!widthMapValue[i]) {
                        constraint = Array(4 * n + 16).fill(0)
                        constraint[10 + 4 * i + 2] = 1
                        constraints.A.push(constraint)
                        let tmp = subtree.index in layouts ? layouts[subtree.index].width : 1
                        allAdaptive += tmp
                        nAdaptive += 1
                        maxSubtreeWidth = maxSubtreeWidth > tmp ? maxSubtreeWidth : tmp
                        constraints.B.push(tmp)
                    }
                })
                let ave = allAdaptive / nAdaptive
                maxSubtreeWidth = maxSubtreeWidth > ave ? maxSubtreeWidth : ave
                treeData.children.forEach((subtree, i) => {
                    if (widthMapValue[i]) {
                        constraints.isCompatible[subtree.index] = true
                        constraint = Array(4 * n + 16).fill(0)
                        constraint[10 + 4 * i + 2] = 1
                        constraints.A.push(constraint)
                        constraints.B.push(ave)
                    }
                })
            } else {

                constraints.widthWithValue = true
                treeData.children.forEach((subtree, i) => {
                    constraint = Array(4 * n + 16).fill(0)
                    constraint[10 + 4 * i + 2] = 1
                    constraints.A.push(constraint)
                    let tmp = subtree.index in layouts ? layouts[subtree.index].width : 1
                    maxSubtreeWidth = maxSubtreeWidth > tmp ? maxSubtreeWidth : tmp
                    constraints.B.push(tmp)
                })
            }
        } else {
            // No value mapping
            treeData.children.forEach((subtree, i) => {
                constraint = Array(4 * n + 16).fill(0)
                constraint[10 + 4 * i + 2] = 1
                constraints.A.push(constraint)
                let tmp = subtree.index in layouts ? layouts[subtree.index].width : 1
                maxSubtreeWidth = maxSubtreeWidth > tmp ? maxSubtreeWidth : tmp
                constraints.B.push(tmp)
            })
        }
        if (heightIsAnyValue) {
            // Value mapping
            if (heightIsAnyAdaptive) {

                let allAdaptive = 0
                let nAdaptive = 0
                treeData.children.forEach((subtree, i) => {
                    if (!heightMapValue[i]) {
                        constraint = Array(4 * n + 16).fill(0)
                        constraint[10 + 4 * i + 3] = 1
                        constraints.A.push(constraint)
                        let tmp = subtree.index in layouts ? layouts[subtree.index].height : 1
                        allAdaptive += tmp
                        nAdaptive += 1
                        maxSubtreeHeight = maxSubtreeHeight > tmp ? maxSubtreeHeight : tmp
                        constraints.B.push(tmp)
                    }
                })
                let tmp = allAdaptive / nAdaptive
                maxSubtreeHeight = maxSubtreeHeight > tmp ? maxSubtreeHeight : tmp
                treeData.children.forEach((subtree, i) => {
                    if (heightMapValue[i]) {
                        constraints.isCompatible[subtree.index] = true
                        constraint = Array(4 * n + 16).fill(0)
                        constraint[10 + 4 * i + 3] = 1
                        constraints.A.push(constraint)
                        constraints.B.push(tmp)
                    }
                })
            } else {

                constraints.heightWithValue = true
                treeData.children.forEach((subtree, i) => {
                    constraint = Array(4 * n + 16).fill(0)
                    constraint[10 + 4 * i + 3] = 1
                    constraints.A.push(constraint)
                    let tmp = subtree.index in layouts ? layouts[subtree.index].height : 1
                    maxSubtreeHeight = maxSubtreeHeight > tmp ? maxSubtreeHeight : tmp
                    constraints.B.push(tmp)
                })
            }
        } else {
            // No value mapping
            treeData.children.forEach((subtree, i) => {
                constraint = Array(4 * n + 16).fill(0)
                constraint[10 + 4 * i + 3] = 1
                constraints.A.push(constraint)
                let tmp = subtree.index in layouts ? layouts[subtree.index].height : 1
                maxSubtreeHeight = maxSubtreeHeight > tmp ? maxSubtreeHeight : tmp
                constraints.B.push(tmp)
            })
        }
    }

    // when within: width = max(root.width, maxSubtreeWidth)
    if (treeDsl.Layout.X.Root.Relation === 'within') {
        if (treeDsl.Layout.X.Subtree.Relation === 'align') {
            let tmp = treeDsl.Element.RootWidth === 'adaptive' ? 1 : treeData[treeDsl.Element.RootWidth]
            tmp = tmp > maxSubtreeWidth ? tmp : maxSubtreeWidth
            constraint = Array(4 * n + 16).fill(0)
            constraint[0] = 1
            constraints.A.push(constraint)
            constraints.B.push(tmp)
        }       
    }

    // when within: height = max(root.height, maxSubtreeHeight)
    if (treeDsl.Layout.Y.Root.Relation === 'within') {
        if (treeDsl.Layout.Y.Subtree.Relation === 'align') {
            let tmp = treeDsl.Element.RootHeight === 'adaptive' ? 1 : treeData[treeDsl.Element.RootHeight]
            tmp = tmp > maxSubtreeHeight ? tmp : maxSubtreeHeight
            constraint = Array(4 * n + 16).fill(0)
            constraint[1] = 1
            constraints.A.push(constraint)
            constraints.B.push(tmp)
        }
    }

    // when Subtree align: subtrees.width = max(subtree[i].width)
    if (treeDsl.Layout.X.Subtree.Relation === 'align') {
        constraint = Array(4 * n + 16).fill(0)
        constraint[6 + 2 + 0] = 1
        constraints.A.push(constraint)
        constraints.B.push(maxSubtreeWidth)
    }

    // when Subtree align: subtrees.height = max(subtree[i].height)
    if (treeDsl.Layout.Y.Subtree.Relation === 'align') {
        constraint = Array(4 * n + 16).fill(0)
        constraint[6 + 2 + 1] = 1
        constraints.A.push(constraint)
        constraints.B.push(maxSubtreeHeight)
    }
    return constraints
}