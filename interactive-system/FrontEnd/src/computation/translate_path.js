/**
 * Converts a move to path from the Translate property to the path concrete d
 */
let parseSVG = require('svg-path-parser');
export function translatePath (pathD, ox, oy) {
  if (pathD.indexOf('NaN') !== -1) {
    console.log('error! The path has errors in translatePath function.')
  }
  let pArray = parseSVG(pathD)
  let newPath = ''
  for (let i = 0; i < pArray.length; i++) {
    newPath += pArray[i].code
    if (pArray[i].code == 'M') {
      newPath += (pArray[i].x + ox) + ',' + (pArray[i].y + oy)
    } else if (pArray[i].code == 'L') {
      newPath += (pArray[i].x + ox) + ',' + (pArray[i].y + oy)
    } else if (pArray[i].code == 'A') {
      let laflag = (pArray[i].largeArc) ? 1 : 0
      let sweepflag = (pArray[i].sweep) ? 1 : 0
      newPath += (pArray[i].rx) + ',' + (pArray[i].ry) + ',' + (pArray[i].xAxisRotation) + ',' + laflag + ',' + sweepflag + ',' + (pArray[i].x + ox) + ',' + (pArray[i].y + oy)
    }
  }
  return newPath
}