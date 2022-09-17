import translation from './translation'
import solveMatrix from './solveMatrix'
import resultTransform from './resultTransform'
export default function (treeUnit, layouts, m) {
    let treeData = treeUnit.data
    let treeDsl = treeUnit.dsl

    // console.log('treeData', treeData, 'treeDsl', treeDsl, 'layouts', layouts)
    // translation grammar -> Matrix
    let constraints = translation(treeData, treeDsl, layouts)
    // solve Matrix
    // Constraint.A and Constraint.B are the matrices AX = B, and M is the linear solver
    let result = solveMatrix(constraints.A, constraints.B, m)
    // format
    let layout = resultTransform(result, treeData, constraints.widthWithValue, constraints.heightWithValue, constraints.isCompatible)
    return layout
}