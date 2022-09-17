import treeLayout from '@/computation/server2.0/treeLayout'
export async function getLayoutValue(payload) {
  let t0 = new Date().getTime()
  let treeData = payload.hierarchicalData
  let treeDSLs = payload.treeDSLContentObj
  let treeDic = payload.treeIndexWithDSL
  if ((typeof(treeData) !== 'undefined') && (typeof(treeDSLs) !== 'undefined') && (typeof(treeDic) !== 'undefined')) {
    let treeLayouts = treeLayout(treeData, treeDSLs, treeDic, lscgSolver)
    return treeLayouts
  }
}
