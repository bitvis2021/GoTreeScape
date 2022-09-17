import leafLayout from './leafLayout'
import treeUnitLayout from './treeUnitLayout'
export default function dispatchTreeUnit (index, treeUnits, layouts, m) {
    let treeUnit = treeUnits[index]
    if (treeUnit.data.children.length === 0) {
        layouts[index] = leafLayout(treeUnit.data, treeUnit.dsl)
    } else {
        if (treeUnit.dsl.Layout.Mode === 'bottom-up') {
            treeUnit.data.children.forEach((subtree) => {
                dispatchTreeUnit(subtree.index, treeUnits, layouts, m)
            })
            layouts[index] = treeUnitLayout(treeUnit, layouts, m)
        } else {
            layouts[index] = treeUnitLayout(treeUnit, layouts, m)
            treeUnit.data.children.forEach((subtree) => {
                dispatchTreeUnit(subtree.index, treeUnits, layouts, m)
            })
        }
    }
}