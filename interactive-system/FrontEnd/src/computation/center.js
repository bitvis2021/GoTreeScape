        if(dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.Category === 'polar'){
          let currentNodeSystem = dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.Category
            let currentID = firstNodeIndex
            let x
            let y
            let width
            let height
            while(currentNodeSystem === "polar"){
              x = self.areaDataCollection[firstNodeSubtreeGId][currentID].x
              y = self.areaDataCollection[firstNodeSubtreeGId][currentID].y
              width = self.areaDataCollection[firstNodeSubtreeGId][currentID].Width
              height = self.areaDataCollection[firstNodeSubtreeGId][currentID].Height
              currentID = self.areaDataCollection[firstNodeSubtreeGId][currentID].fatherID
              if(currentID === null)
                break
              currentNodeSystem = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem.Category
            }
             let polarCenterAngle = 1
            if(typeof(dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.Theta) !== 'undefined') {
              polarCenterAngle = dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.Theta
            }
              let polarAxis = "y-axis"
              if (typeof(dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.polarAxis) !== 'undefined') {
                polarAxis = dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.polarAxis
              }
              let PolarInnerRadius = 0
              if(typeof(dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.polarInnerRadius) !== 'undefined') {
                PolarInnerRadius = dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.polarInnerRadius
              }
              let direction = "clockwise"
              if(typeof(dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.direction) !== 'undefined'){
                direction = dslContentObject[treeIndexWithDSL[firstNodeIndex]].CoordinateSystem.direction
              }
              let angleScale = direction === "clockwise" ? d3.scaleLinear().range([-Math.PI * polarCenterAngle, Math.PI * polarCenterAngle]):d3.scaleLinear().range([Math.PI * polarCenterAngle, -Math.PI * polarCenterAngle])
              let angle
              let rRange
              let currentr
              if(polarCenterAngle >= 0.75){
                rRange = width > height ? height/2 : width/2
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              else if(polarCenterAngle >= 0.5){
                if(width/(1+Math.sin((polarCenterAngle*2 - 1)*Math.PI)) > height/2){
                  rRange = height/2
                }
                else{
                  rRange = width/(1+Math.sin((polarCenterAngle*2 - 1)*Math.PI))
                }
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              else if(polarCenterAngle >= 0.25){
                if(width > height/(1+Math.sin(polarCenterAngle*2-0.5)*Math.PI)){
                  rRange = height/(1+Math.sin(polarCenterAngle*2-0.5)*Math.PI)
                }
                else{
                  rRange = width
                }
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              else{
                if(width/Math.sin(polarCenterAngle*2*Math.PI) > height){
                  rRange = height
                }
                else{
                  rRange = width/Math.sin(polarCenterAngle*2*Math.PI)
                }
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].y + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].x + self.areaDataCollection[firstNodeSubtreeGId][firstNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
            beginX = firstNodeSubtreeGPosLenObj.x + firstNodeBindData.x + x
            beginY = firstNodeSubtreeGPosLenObj.y + firstNodeBindData.y + y
        }
        if(dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.Category === 'polar'){
          let currentNodeSystem = dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.Category
            let currentID = secondNodeIndex
            let x
            let y
            let width
            let height
            while(currentNodeSystem === "polar"){
              x = self.areaDataCollection[secondNodeSubtreeGId][currentID].x
              y = self.areaDataCollection[secondNodeSubtreeGId][currentID].y
              width = self.areaDataCollection[secondNodeSubtreeGId][currentID].Width
              height = self.areaDataCollection[secondNodeSubtreeGId][currentID].Height
              currentID = self.areaDataCollection[secondNodeSubtreeGId][currentID].fatherID
              if(currentID === null)
                break
              currentNodeSystem = dslContentObject[treeIndexWithDSL[currentID]].CoordinateSystem.Category
            }
             let polarCenterAngle = 1
            if(typeof(dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.Theta) !== 'undefined') {
              polarCenterAngle = dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.Theta
            }
              let polarAxis = "y-axis"
              if (typeof(dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.polarAxis) !== 'undefined') {
                polarAxis = dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.polarAxis
              }
              let PolarInnerRadius = 0
              if(typeof(dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.polarInnerRadius) !== 'undefined') {
                PolarInnerRadius = dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.polarInnerRadius
              }
              let direction = "clockwise"
              if(typeof(dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.direction) !== 'undefined'){
                direction = dslContentObject[treeIndexWithDSL[secondNodeIndex]].CoordinateSystem.direction
              }
              let angleScale = direction === "clockwise" ? d3.scaleLinear().range([Math.PI * polarCenterAngle, -Math.PI * polarCenterAngle]):d3.scaleLinear().range([-Math.PI * polarCenterAngle, Math.PI * polarCenterAngle])
              let angle
              let rRange
              let currentr
              if(polarCenterAngle >= 0.75){
                rRange = width > height ? height/2 : width/2
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              else if(polarCenterAngle >= 0.5){
                if(width/(1+Math.sin((polarCenterAngle*2 - 1)*Math.PI)) > height/2){
                  rRange = height/2
                }
                else{
                  rRange = width/(1+Math.sin((polarCenterAngle*2 - 1)*Math.PI))
                }
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              else if(polarCenterAngle >= 0.25){
                if(width > height/(1+Math.sin(polarCenterAngle*2-0.5)*Math.PI)){
                  rRange = height/(1+Math.sin(polarCenterAngle*2-0.5)*Math.PI)
                }
                else{
                  rRange = width
                }
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              else{
                if(width/Math.sin(polarCenterAngle*2*Math.PI) > height){
                  rRange = height
                }
                else{
                  rRange = width/Math.sin(polarCenterAngle*2*Math.PI)
                }
                if(polarAxis === "y-axis"){
                  angleScale.domain([x, x+width])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([y , y+height])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                }
                else{
                  angleScale.domain([y, y+height])
                  let rScale = d3.scaleLinear().range([rRange * PolarInnerRadius, rRange])
                  rScale.domain([x , x+width])
                  angle = angleScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].y + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rooty)
                  currentr = rScale(self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].x + self.areaDataCollection[secondNodeSubtreeGId][secondNodeIndex].Rootx)
                }
                x = x + width/2 + Math.cos(angle)*currentr
                y = y + height/2 + Math.sin(angle)*currentr
              }
              console.log('rRange',rRange)

            endX = x
            endY = y
        }