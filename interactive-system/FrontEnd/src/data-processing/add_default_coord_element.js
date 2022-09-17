//  If no node, edge, or frame parameters exist, these parameters are automatically incremented
export function addDefaultCoordElement(dslContentObject) {
  let dslContentObjectWithDefault = JSON.parse(JSON.stringify(dslContentObject))
  for (let item in dslContentObjectWithDefault) {
      if(!('Element' in dslContentObjectWithDefault[item])) {
        dslContentObjectWithDefault[item].Element = {}
      }

      if (!('Node' in dslContentObjectWithDefault[item].Element)) {
        dslContentObjectWithDefault[item].Element.Node = 'rectangle'
      }
      if (!('Link' in dslContentObjectWithDefault[item].Element)) {
        dslContentObjectWithDefault[item].Element.Link = 'hidden'
      }
      if (!('CoordinateSystem' in dslContentObjectWithDefault[item])) {
        dslContentObjectWithDefault[item].CoordinateSystem = {}
        dslContentObjectWithDefault[item].CoordinateSystem.Category = 'cartesian'
      }
  }
  return dslContentObjectWithDefault
}
