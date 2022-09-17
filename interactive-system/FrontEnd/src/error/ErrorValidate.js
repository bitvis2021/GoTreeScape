/**
 * [judge whether the areaDataArray is valid]
 * @param  {[Array]} areaDataArray [description]
 * @return {[Boolean]}             
 */
export function treeNodeValidate (areaDataArray) {
  let valid = true
  for (let i = 0;i < areaDataArray.length;i++) {
    if (typeof(areaDataArray[i].element) === 'undefined') {
      valid = false
      return valid
    }
    if (areaDataArray[i].element.indexOf('NaN') !== -1) {
      console.log('NaN', areaDataArray[i])
      valid = false
      return valid
    }
  }
  return valid
}
/**
 * check the validability of tree layout
 * @param  {[Object]} treeLayout [description]
 * @return {[Boolean]}            [description]
 */
export function treeLayoutValidate (treeLayout) {
  let validity = true
  if ((treeLayout == null) || (typeof(treeLayout) === 'undefined')) {
    validity = false
    return validity
  }
  for (let item in treeLayout) {
    let treeNode = treeLayout[item]
    if ((treeNode.height < 0) || (treeNode.width < 0)) {
      validity = false
      return validity
    }
  }
  return validity
}
/**
 * check the validability of the areaData
 * @param  {[type]} areaData [description]
 * @return {[Boolean]}          [description]
 */
export function areaDataValidate (areaData) {
  let validity = true
  for (let i = 0;i < areaData.length;i++) {
    let area = areaData[i]
    if ((area.Height < 0) || (area.Width < 0) || (areaData.RootHeight < 0) || (areaData.RoowWidth < 0) 
        || (area.SubtreesX < 0) || (area.SubtreesY < 0) || (area.SubtreesWidth < 0)  || (area.SubtreesHeight < 0) 
        || (area.x < 0) || (area.y < 0)) {
      validity = false
      return validity
    }
  }
  return validity
}