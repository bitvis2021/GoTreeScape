<template>
    <div class="tree-vis-map" :ref="treeVisMapContainerId" :id="treeVisMapContainerId">
        <svg xmlns="http://www.w3.org/2000/svg" ref="treevismapsvg" :id="treeVisMapSvgId">
            <!-- <g class="canvas-overlay">
                <circle class="highlight" :cx="uniformMappingResultX" :cy="uniformMappingResultY" :r="highlightRadius">
                </circle>
            </g> -->
            <g class="canvas-outer-container">
                <foreignObject class="canvas-container">
                    <canvas ref="treevismapcanvas" :id="treeVisMapCanvasId">
                    </canvas>
                </foreignObject>
            </g>
            <!-- <g>
                <foreignObject class="test-container">
                    <div class = "test" v-if="showTestDiv">
                    </div>
                </foreignObject>
            </g> -->
            <!-- <g class="land-mark-outer-container" v-if="showLandMark">
                <foreignObject class="land-mark-container" :updateKey="landMarkUpdate" v-for="selectedLandMarkObj in selectedLandMarkObjList" 
                    :style="{x: landMarkPosX(selectedLandMarkObj.posAttrs[0], selectedLandMarkObj.index), 
                             y: landMarkPosY(selectedLandMarkObj.posAttrs[1], selectedLandMarkObj.index), 
                             width: landMarkLength(selectedLandMarkObj.index), 
                             height: landMarkLength(selectedLandMarkObj.index)}">
                    <span class="icon iconfont icon-icon_locationsvg" 
                        :style="{fontSize: landMarkLength(selectedLandMarkObj.index) + 'px',
                                color: landMarkColor(selectedLandMarkObj.index)}"></span>
                </foreignObject>
            </g> -->
            <!-- <g class="treevis-preview-outer-container" v-if="showTreeVisPreview && finishCanvasRendering">
                <foreignObject class="treevis-preview-container" 
                    v-for="selectedLandMarkObj in selectedLandMarkObjList"
                    :style="{x: previewPosX(selectedLandMarkObj.posAttrs[0], selectedLandMarkObj.index), 
                             y: previewPosY(selectedLandMarkObj.posAttrs[1], selectedLandMarkObj.index), 
                             width: previewLength(selectedLandMarkObj.index), 
                             height: previewLength(selectedLandMarkObj.index)}">
                    <div class="treevis-canvas">
                        <TreeCanvas :treeCanvasKey="treeCanvasPreviewKey" :sendSVGData="false"
                            :dslObj="selectedLandMarkObj['dslObj']"
                            :dslIndex="selectedLandMarkObj['index']"
                            :initRender="true">
                        </TreeCanvas>
                    </div>
                </foreignObject>
            </g> -->
            <g class="tooltip-outer-container" v-if="isShowTooltip && finishCanvasRendering"
                :style="'transform: translate(' + this.tooltipX + 'px,' + this.tooltipY + 'px);'">
                <foreignObject class="tooltip-container" :style="{width: tooltipWidth + 'px', height: tooltipHeight + 'px'}">
                    <el-card id="tooltip" :style="{width: tooltipWidth + 'px', height: tooltipHeight + 'px'}">
                        <TreeCanvas :treeCanvasKey="treeCanvasKey" :sendSVGData="false">
                        </TreeCanvas>
                    </el-card>
                </foreignObject>
            </g>
        </svg>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import { getTreeDistanceMatrix } from '@/data-processing/get_tree_distance_matrix.js'
    import { getTSNEProjectionResult } from '@/data-processing/get_tsne_projection_result.js'
    import { getProjectionResults, getProjectionDSLList } from '@/data-processing/get_projection_results.js'
    import TreeCanvas from '@/views/TreeCanvasView/TreeCanvas.vue'
    import { getGoTreeGrammarObj, getFilterCollection } from '@/communication/sendData.js'
    import d3_save_svg from 'd3-save-svg'
    import createScatterplot from 'regl-scatterplot'

    export default {
        name: 'TreeVisMap',
        components: {
            TreeCanvas
        },
        props: {
            maxDslAmountIndex: {
                type: Number
            }
        },
        data() {
            return {
                treeVisMapCanvasId: 'tree-vis-map-canvas',
                treeVisMapSvgId: 'tree-vis-map-svg',
                treeVisMapContainerId: 'tree-vis-map-canvas-container',
                treeVisMapCanvasWidth: 0,
                treeVisMapCanvasHeight: 0,
                treeVisMapCanvasPaddingTop: 0,
                treeVisMapCanvasPaddingBottom: 0,
                treeVisMapCanvasPaddingLeft: 0,
                treeVisMapCanvasPaddingRight: 0,
                treeVisMapCanvasPadding: {'left': 0, 'right': 0, 'top': 0, 'bottom': 0},
                finishComputeProjectionResult: false,
                isShowTooltip: false,
                circleR: 2,
                highlightedCircleR: 8,
                xScale: null,
                yScale: null,
                projectionPosResults: [],
                projectionResults: [],
                filterDSLCollection: [],
                filterDSLCollectionSet: null,
                tooltipX: 0,
                tooltipY: 0,
                tooltipHeader: "",
                tooltipTipWidth: 300,
                tooltipTipHeight: 300, // it is used to set the position of tooltip
                highlightNodeIndex: -1, // index of the highlighted nodes
                treeCanvasKey: 0, // variable to update the tree visualization
                treeCanvasPreviewKey: 0,
                projectionDSLList: [],
                projectionViewChanged: false,
                zoomRatio: 1,
                baseTooltipLength: 80, // the basic tooltip width
                maxTooltipLength: 300,
                tooltipWidth: 150,  // the practical tooltip width
                tooltipHeight: 150, // the practical tooltip height
                uniformMappingResultX: 0, // the position of the hovering point
                uniformMappingResultY: 0, // the position of the hovering point
                baseHighlightRadius: 8,
                highlightRadius: 0,
                landMarkNum: 15,
                selectedLandMarkObjList: [],
                showLandMark: false,
                showTreeVisPreview: false,
                finishCanvasRendering: false,
                landMarkUpdate: 0,
                baseLandMarkLength: 20,
                highlightLandMarkLength: 30,
                landMarkPadding: 4,
                basePreviewLength: 80,
                maxPreviewLength: 300,
                showTestDiv: true,
                finishViewChangeTimer: null,
                colorsCat: ['#3a78aa', '#aa3a99', '#33a02c', '#6a3d9a', '#cab2d6', '#b15928', '#fb9a99', '#ff7f00', '#b2df8a', '#fdbf6f', '#8dd3c7', '#fdb462', '#fccde5', '#d9d9d9', '#ccebc5', '#543005', '#dfc27d', '#35978f', '#40004b', '#1b7837', '#b2182b', '#2166ac', '#4d4d4d', '#b2182b']
            }
        },
        watch: {},
        created: function () {},
        beforeMount: function() {},
        mounted: function() {
            let self = this
            let treeVisMapContainerId = this.treeVisMapContainerId
            let treeVisMapCanvasHeight = this.$refs[treeVisMapContainerId].clientHeight;
            let treeVisMapCanvasWidth = this.$refs[treeVisMapContainerId].clientWidth;
            // initialize the paddings (left, right, top, bottom), canvas width, and canvas height
            this.treeVisMapCanvasPaddingTop = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['top']
            this.treeVisMapCanvasPaddingBottom = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['bottom']
            this.treeVisMapCanvasPaddingLeft = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['left']
            this.treeVisMapCanvasPaddingRight = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['right']
            this.treeVisMapCanvasHeight = treeVisMapCanvasHeight - this.treeVisMapCanvasPaddingTop - this.treeVisMapCanvasPaddingBottom
            this.treeVisMapCanvasWidth = treeVisMapCanvasWidth - this.treeVisMapCanvasPaddingLeft - this.treeVisMapCanvasPaddingRight
            // TODO
            let loadProjectionDefer = $.Deferred(), loadFilterDefer = $.Deferred() 
            // this.preprocess()
            $.when(loadProjectionDefer, loadFilterDefer)
                .done(function() {
                    self.preprocess()
                })
            this.loadProjectionResults(loadProjectionDefer)
            this.loadDataCollectionFilter(loadFilterDefer)
            // this.renderScatterplot()
        },
        computed: {
            ...mapState([
                'selectedTreeDSLIndex'
            ]),
        },
        methods: {
            ...mapMutations([
                'UPDATE_SELECTED_TREE_DSL_INDEX'
            ]),
            landMarkPosX: function(xRelativePos, selectedIndex) {
                let self = this
                if (!self.projectionViewChanged) {
                    let originalRange = this.xScale.range()
                    let refinedScale =  d3.scaleLinear().domain([-1, 1]).range(originalRange)
                    return refinedScale(xRelativePos) - this.landMarkLength(selectedIndex) / 2
                }
                return this.xScale(xRelativePos) - this.landMarkLength(selectedIndex) / 2
            },
            landMarkPosY: function(yRelativePos, selectedIndex) {
                let self = this
                if (!self.projectionViewChanged) {
                    let originalRange = this.yScale.range()
                    let refinedScale =  d3.scaleLinear().domain([-1, 1]).range(originalRange)
                    return refinedScale(yRelativePos) - this.landMarkLength(selectedIndex) - this.landMarkPadding * this.zoomRatio
                }
                return this.yScale(yRelativePos) - this.landMarkLength(selectedIndex) - this.landMarkPadding * this.zoomRatio
            },
            landMarkLength: function (selectedIndex) {
                let landMarkLength = this.baseLandMarkLength
                if (selectedIndex === this.highlightNodeIndex) {
                    landMarkLength = this.highlightLandMarkLength
                }
                if (this.zoomRatio > 1) {
                    // return this.baseLandMarkLength * this.zoomRatio
                    return landMarkLength * this.zoomRatio
                }
                // return this.baseLandMarkLength]
                return landMarkLength
            },
            landMarkColor: function(selectedIndex) {
                if (selectedIndex === this.highlightNodeIndex) {
                    return "#b2182b" 
                }
                return "#f46d43"
            },
            preprocess: function() {
                let self = this
                let projectionResults = self.projectionResults
                // console.log('projectionPosResults', self.projectionPosResults)
                let filterDSLCollectionSet = self.filterDSLCollectionSet
                self.projectionPosResults = self.computeProjectionPosResults(projectionResults, filterDSLCollectionSet)
                // let projectionPosColorItemList = self.addColorAttribute(projectionPosItemList)
                // console.log('projectionPosResults', self.projectionPosResults)
                self.selectLandMarkList()
                self.showLandMark = true
                self.treeCanvasPreviewKey = (self.treeCanvasPreviewKey + 1) % 2
                // console.log('projectionPosColorItemList', self.projectionPosResults)
                self.renderScatterplot()
            },
            previewPosX: function(xRelativePos, selectedIndex) {
                let self = this
                if (!self.projectionViewChanged) {
                    let originalRange = this.xScale.range()
                    let refinedScale =  d3.scaleLinear().domain([-1, 1]).range(originalRange)
                    return refinedScale(xRelativePos) - this.previewLength(selectedIndex) / 2
                }
                return this.xScale(xRelativePos) - this.previewLength(selectedIndex) / 2
            },
            previewPosY: function(yRelativePos, selectedIndex) {
                let self = this
                if (!self.projectionViewChanged) {
                    let originalRange = this.yScale.range()
                    let refinedScale =  d3.scaleLinear().domain([-1, 1]).range(originalRange)
                    return refinedScale(yRelativePos)
                }
                return this.yScale(yRelativePos) 
            },
            previewLength: function() {
                let previewLength = this.basePreviewLength
                if (this.zoomRatio > 1) {
                    // return this.baseLandMarkLength * this.zoomRatio
                    previewLength = previewLength * this.zoomRatio
                }
                previewLength = previewLength>this.maxPreviewLength?this.maxPreviewLength:previewLength
                // return this.baseLandMarkLength]
                return previewLength
            },
            updateLandMarkView: function () {
                this.landMarkUpdate = (this.landMarkUpdate + 1) % 2
            },
            updateTreeVisPreview: function() {
                this.treeCanvasPreviewKey = (this.treeCanvasPreviewKey + 1) % 2
            },
            updatePosScale: function(projectionResult) {
                let valueExtentX = d3.extent(projectionResult, function(d, i) {
                    return d['x']
                })
                let valueExtentY = d3.extent(projectionResult, function(d, i) {
                    return d['y']
                })
                // initialize the scale of vertical position and horizontal position
                let treeVisMapCanvasWidth = this.treeVisMapCanvasWidth
                let treeVisMapCanvasHeight = this.treeVisMapCanvasHeight
                this.uniformXScale = d3.scaleLinear()
                  .domain(valueExtentX)
                  .range([-1, 1])
                this.uniformYScale = d3.scaleLinear()
                  .domain(valueExtentY)
                  .range([-1, 1])
                this.xScale = d3.scaleLinear()
                  .domain([-1, 1])
                this.yScale = d3.scaleLinear()
                  .domain([-1, 1])
            },
            selectLandMarkList: function() {
                let self = this
                let projectionPosResults = this.projectionPosResults
                let selectedLandMarkIndexList = []
                let selectedLandMarkObjList = []
                while (true) {
                    let selectedIndex = Math.floor(Math.random() * projectionPosResults.length);
                    if(selectedLandMarkIndexList.indexOf(selectedIndex) === -1) {
                        selectedLandMarkIndexList.push(selectedIndex)
                    }
                    if (selectedLandMarkIndexList.length == self.landMarkNum) {
                        break
                    }
                }
                let deferObjDic = {}
                let deferObjArray = []
                for (let i = 0; i < selectedLandMarkIndexList.length; i++) {
                    let selectedIndex = selectedLandMarkIndexList[i]
                    let deferObj = $.Deferred()
                    deferObjDic[selectedIndex] = deferObj
                    deferObjArray.push(deferObj)
                }
                $.when(...deferObjArray).then(function() {
                    self.selectedLandMarkObjList = selectedLandMarkObjList
                    // when finish loading the data, set the show TreeVis Preview as True
                    self.showTreeVisPreview = true
                })
                for (let i = 0; i < selectedLandMarkIndexList.length; i++) {
                    let selectedIndex = selectedLandMarkIndexList[i]
                    let formData = {'dslName': selectedIndex}
                    getGoTreeGrammarObj(formData, function(singleTreeDSLObj, selectedIndex) {
                        let selectedLandMarkObj = {
                            index: selectedIndex,
                            posAttrs: projectionPosResults[selectedIndex],
                            dslObj: singleTreeDSLObj
                        }
                        selectedLandMarkObjList.push(selectedLandMarkObj)
                        deferObjDic[selectedIndex].resolve()
                    })
                    // let selectedLandMarkObj = {
                    //  index: selectedIndex,
                    //  posAttrs: projectionPosResults[selectedIndex]
                    // }
                    // selectedLandMarkObjList.push(selectedLandMarkObj)
                }
                
            },
            loadProjectionResults: function(deferObj) {
                let self = this
                getProjectionResults().then(function(projectionResults) {
                    self.updatePosScale(projectionResults)
                    self.projectionResults = projectionResults
                    deferObj.resolve()
                    // self.renderContour(projectionResults)
                    // self.finishComputeProjectionResult = true
                })
                // getProjectionDSLList().then(function(projectionDSLList) {
                //  self.projectionDSLList = projectionDSLList
                // })
            },
            loadDataCollectionFilter: function(deferObj) {
                let self = this
                // let formData = {'criteria':{'1':{'CoordinateSystem': {'Category': 'cartesian'}}}}
                let formData = {'criteria':{'1':{'Element': {'Node': 'rectangle'}}}}
                // let formData = {'criteria':{'1':{'Element': {'Node': 'triangle'}}}}
                // let formData = {'criteria':{'1':{'Layout': {'X': {'Root': {'Relation': 'include'}, 'Subtree': {'Relation': 'flatten'}}, 'Y': {'Root': {'Relation': 'include'}, 'Subtree': {'Relation': 'flatten'}}}}}}
                // let formData = {'criteria':{'1':{'Layout': {'X': {'Root': {'Relation': 'include'}, 'Subtree': {'Relation': 'flatten'}}, 'Y': {'Root': {'Relation': 'include'}, 'Subtree': {'Relation': 'flatten'}}}}}}
                // let formData = {'criteria': {'1': {'Layout': {'X': {'Root': {'Relation': 'include'}}}}}}
                // let formData = {'criteria': {'Layout': {'X': {'Root': {'Relation': 'include'}, 'Subtree': {'Relation': 'align'}}, 'Y': {'Root': {'Relation': 'include'}, 'Subtree': {'Relation': 'flatten'}}}}}
                getFilterCollection(formData, function(filterResults) {
                    // console.log('filterResults[collection]', filterResults['collection'])
                    self.filterDSLCollection = filterResults['collection']
                    self.filterDSLCollectionSet = new Set(self.filterDSLCollection)
                    deferObj.resolve()
                })
            },
            renderContour: function(projectionResult) {
                let height = this.treeVisMapCanvasHeight, width = this.treeVisMapCanvasWidth
                let xScale = this.xScale, yScale = this.yScale
                let self = this
                d3.select('.contour-container')
                  .selectAll("path")
                  .remove()
                let contour = d3
                   .contourDensity()
                   .x((d) => xScale(d.x)) //  + this.treeVisMapCanvasPaddingLeft
                   .y((d) => yScale(d.y)) //  + this.treeVisMapCanvasPaddingTop
                   .size([width, height])
                   .bandwidth(12)
                   .weight(1);
                d3.select('.contour-container')
                  .selectAll(".contour")
                  .data(contour(projectionResult))
                  .enter()
                  .append("path")
                  .attr('class', 'contour')
                  .attr("d", d3.geoPath())
                  .attr("stroke-width", 1)
                  .attr("stroke-opacity", 0.5)
                  .attr("fill-opacity", 0);
            },
            renderScatterplot: function() {
                let self = this
                let points = this.projectionPosResults
                let canvas = this.$refs.treevismapcanvas
                let treeVisMapCanvasHeight = this.treeVisMapCanvasHeight
                let treeVisMapCanvasWidth = this.treeVisMapCanvasWidth
                let color = '#00ff00'
                let xScale = this.xScale
                let yScale = this.yScale
                let circleR = this.circleR
                const showRecticle = true;
                const recticleColor = [1, 1, 0.878431373, 0.33];
                // console.log('points', points)
                // blue - 165598
                // red - ae1e32 a50026
                // show cartesian coordinate system
                // let colorsCat = ['#636363', '#a50026'];
                // let circleRList = [10, 15]
                // show circle visual elements
                let colorsCat = ['#636363', '#FFA500']
                let circleRList = [10, 15]
                // the default color setting for all items
                // let colorsCat = ['#636363', '#636363'];
                // let circleRList = [10, 10]
                // show all items equally
                // first - set the color category
                // let colorsCat = this.colorsCat
                // TODO
                // let colorsCat = ['#636363', '#313695'];
// \               let colorsCat = ['#636363', '#b2182b'];
                // let colorsCat = ['#3a78aa', '#aa3a99', '#33a02c', '#6a3d9a', '#cab2d6', '#b15928', '#fb9a99', '#ff7f00', '#b2df8a', '#fdbf6f', '#8dd3c7', '#fdb462', '#fccde5', '#d9d9d9', '#ccebc5'];
                // self.colorsCatLength = colorsCat.length
                //   const colorsScale = [
                //   '#002072', // dark blue
                //   '#162b79',
                //   '#233680',
                //   '#2e4186',
                //   '#394d8d',
                //   '#425894',
                //   '#4b649a',
                //   '#5570a1',
                //   '#5e7ca7',
                //   '#6789ae',
                //   '#7195b4',
                //   '#7ba2ba',
                //   '#85aec0',
                //   '#90bbc6',
                //   '#9cc7cc',
                //   '#a9d4d2',
                //   '#b8e0d7',
                //   '#c8ecdc',
                //   '#ddf7df',
                //   '#ffffe0', // bright yellow
                // ];
                 // '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99'
                const scatterplot = createScatterplot({
                  canvas,
                  width: treeVisMapCanvasWidth,
                  height: treeVisMapCanvasHeight,
                  xScale: xScale,
                  yScale: yScale
                });
                // TODO
                // the highlight color setting for all items
                // let circleRList = [10, 15]
                // the default color setting for all items
                // let circleRList = [12, 12]
                scatterplot.set({ sizeBy: 'category', pointSize: circleRList }); // rgb array
                
                // scatterplot.set({ xScale: xScale }); // rgb array
                // scatterplot.set({ yScale: yScale }); // rgb array
                scatterplot.set({ backgroundColor: [161, 0, 33] }); // rgb array
                scatterplot.set({ aspectRatio: treeVisMapCanvasWidth / treeVisMapCanvasHeight });
                // scatterplot.set({ width: treeVisMapCanvasWidth, height: treeVisMapCanvasHeight });
                scatterplot.set({
                  pointColor: [0.6, 0.6, 0.6, 0.3],
                  pointColorActive: [0, 0, 0, 1], // optional
                  pointColorHover: [0, 0, 0, 1], // optional
                });
                // scatterplot.set({ pointColorActive: [1, 0, 0, 1] });
                // scatterplot.set({ cameraDistance: 0.005 });
                // scatterplot.set({ opacity: 1 });
                scatterplot.set({ pointOutlineWidth: 0 });
                // scatterplot.set({ pointSize: 8 });
                // Set the additional point size of selected points
                scatterplot.set({ pointSizeSelected: 0 });
                // scatterplot.set({ lassoInitiator: true });
                // scatterplot.set({ lassoInitiator: true });
                // scatterplot.set({ lassoInitiatorElement: true });
                
                // scatterplot.set({
                //   lassoColor: [1, 1, 1, 1],
                //   lassoMinDelay: 0,
                //   lassoMinDist: 1,
                //   // This will keep the drawn lasso until the selected points are deselected
                //   lassoClearEvent: 'deselect',
                // });
                // scatterplot.set({ showRecticle: true, recticleColor: [0.8, 0.8, 0.8, 0.66] });
                scatterplot.set({ colorBy: 'category', pointColor: colorsCat });
                scatterplot.get('lassoInitiatorElement').style.background = 'steelblue'
                scatterplot.get('lassoInitiatorElement').style.width = '2rem'
                scatterplot.get('lassoInitiatorElement').style.height = '2rem'
                scatterplot.subscribe(
                  'view',
                  (payload) => {
                    self.viewChanged(payload)
                  });
                scatterplot.subscribe(
                  'pointOver',
                  (pointIndex) => {
                    self.hoverSelectedPoint(pointIndex)
                  });
                scatterplot.subscribe(
                  'pointOut',
                  (pointIndex) => {
                    self.unhoverSelectPoint(pointIndex)
                  });
                scatterplot.subscribe(
                  'select',
                  (point) => {
                    // scatterplot.set({ cameraTarget: [0.5, 0.5] });
                    // scatterplot.set({ cameraDistance: 0.5 });
                  });
                scatterplot.subscribe(
                  'deselect',
                  (point) => {
                    self.deselectPoints()
                  });
                scatterplot.subscribe(
                  'draw',
                  (point) => {
                    self.drawEnd()
                  });
                // const points = new Array(2000)
                //   .fill()
                //   .map(() => [-1 + Math.random() * 2, -1 + Math.random() * 2, color]);
                scatterplot.draw(points);
            },  
            drawEnd: function() {
                let self = this
                this.finishViewChangeTimer = setTimeout(function() {
                    // only after the scatter plot finished the rendering, render the other parts
                    self.finishCanvasRendering = true
                }, 1000)
            },
            deselectPoints: function () {
                let self = this
                self.unhoverSelectPoint()
            },
            viewChanged: function (payload) {
                let self = this
                self.zoomRatio = 1 / payload.camera.distance
                self.tooltipWidth = self.baseTooltipLength * self.zoomRatio
                self.tooltipWidth = self.tooltipWidth>self.maxTooltipLength?self.maxTooltipLength:self.tooltipWidth
                self.tooltipHeight = self.baseTooltipLength * self.zoomRatio
                self.tooltipHeight = self.tooltipHeight>self.maxTooltipLength?self.maxTooltipLength:self.tooltipHeight
                self.tooltipX = self.uniformMappingResultX - self.tooltipWidth - self.circleR * self.zoomRatio
                self.tooltipY = self.uniformMappingResultY - self.tooltipHeight / 2
                self.unhoverSelectPoint()
                self.updateLandMarkView()
                clearTimeout(this.finishViewChangeTimer);
                self.projectionViewChanged = true
                self.finishCanvasRendering = false
                // console.log(payload)
                // self.updateTreeVisPreview()
            },
            hoverSelectedPoint: function(pointIndex) {
                let self = this
                let projectionPosResults = self.projectionPosResults
                let selectedPoint = projectionPosResults[pointIndex]
                if (!self.projectionViewChanged) {
                    this.xScale.domain([-1, 1])
                    this.yScale.domain([-1, 1])
                }
                let uniformMappingResultX = this.xScale(selectedPoint[0])
                let uniformMappingResultY = this.yScale(selectedPoint[1])
                // set the uniforMapping results
                this.uniformMappingResultX = uniformMappingResultX
                this.uniformMappingResultY = uniformMappingResultY
                this.highlightRadius = this.baseHighlightRadius * this.zoomRatio
                this.tooltipX = uniformMappingResultX - self.tooltipWidth - self.circleR * self.zoomRatio
                this.tooltipY = uniformMappingResultY - self.tooltipHeight / 2
                // 1. show the tooltip with tree visualization results
                // 2. set the highlighted node
                this.highlightNodeIndex = pointIndex
                this.isShowTooltip = true
                this.updateSelectedTreeDSLContent(pointIndex)
                this.updateLandMarkView()
                // console.log('projectionPosResults[pointIndex]', projectionPosResults[pointIndex])
            },
            unhoverSelectPoint: function() {
                this.uniformMappingResultX = 0
                this.uniformMappingResultY = 0
                this.highlightRadius = 0
                this.highlightNodeIndex = -1
                this.isShowTooltip = false
            },
            computeProjectionPosResults: function (projectionResult, filterDSLCollectionSet) {
                let projectionPosResults = []
                let colorsCat = this.colorsCat
                let colorsCatLength = colorsCat.length
                // this.updatePosScale(projectionResult)
                let cartesian_count = 0
                // console.log('projectionResult', projectionResult)
                for (let i = 0; i < projectionResult.length; i++) {
                    let item = projectionResult[i]
                    let itemPosX = this.uniformXScale(item['x'])
                    let itemPosY = this.uniformYScale(item['y'])
                    let itemIndex = +item['index']
                    // add color according to the filtering results
                    // first - set the category according to the filtering results
                    let category = 0
                    if (filterDSLCollectionSet.has(i)) {
                        category = 1
                        cartesian_count += 1
                    }
                    // second - set the category according to one specific index
                    // let category = 0
                    // if (itemIndex === 80) {
                    //     category = 1
                    // }
                    // third - set the category according to the itemIndex
                    // let category = itemIndex % colorsCatLength
                    projectionPosResults.push([itemPosX, itemPosY, category])
                }
                return projectionPosResults
            },
            addColorAttribute: function(projectionPosResults) {
                let color = '#00ff00'
                for (let i = 0; i < projectionPosResults.length; i++) {
                    let projectionPosItem = projectionPosResults[i]
                    // projectionPosItem.push(color)
                }
                return projectionPosResults
            },
            computeHorizontalPos: function(pos) {
                return this.xScale(pos)
            },
            computeVerticalPos: function(pos) {
                return this.yScale(pos)
            },
            updateTooltipContent: function(selectedTreeDSLIndex) {
                this.treeCanvasKey = (this.treeCanvasKey + 1) % 2 // update the tree visualization canvas
                // let selectedNodeIndex = this.projectionDSLList.indexOf(dslNameIndex)
                // setting the position of tooltip
                let singlePointPos = this.projectionPosResults[selectedTreeDSLIndex]
                // this.tooltipHeader = 'tree visualization ' + dslNameIndex
            },
            updateSelectedTreeDSLContent: function(selectedTreeDSLIndex) {
                // console.log('projectionDSLList', this.projectionDSLList[selectedTreeDSLIndex])
                let self = this
                // let selectedTreeDSLIndex = this.projectionDSLList[selectedNodeIndex]
                selectedTreeDSLIndex = +selectedTreeDSLIndex
                let layoutParas = sysDatasetObj.getLayoutParas()
                let nodeArrayWithValueObj = sysDatasetObj.getNodeArrayWithValueObjPreview()
                let treeIndexWithDSL = sysDatasetObj.computeAllNodeTreeIndexWithDSL(nodeArrayWithValueObj, selectedTreeDSLIndex)
                // set treeIndexWithDSL and treeDSLContentObj within layoutParas, then rendering tree visualization result
                layoutParas.treeIndexWithDSL = treeIndexWithDSL
                sysDatasetObj.loadTreeDSLContentObjFromServer(treeIndexWithDSL, function(treeDSLContentObj, treeIndexWithDSL) {
                    layoutParas.treeDSLContentObj = treeDSLContentObj
                    layoutParas.treeIndexWithDSL = treeIndexWithDSL
                    self.updateTooltipContent(selectedTreeDSLIndex)
                    setTimeout(function() {
                        // self.UPDATE_SELECTED_TREE_DSL_INDEX(selectedTreeDSLIndex)
                    }, 300)
                })
            },
            setTooltipPos: function(singlePointPos) {
                if (singlePointPos[0] > this.treeVisMapCanvasWidth - this.tooltipTipWidth) {
                    this.tooltipX = singlePointPos[0] - this.tooltipTipWidth - this.highlightedCircleR / 2
                } else {
                    this.tooltipX = singlePointPos[0] + this.highlightedCircleR / 2
                }
                if (singlePointPos[1] > this.treeVisMapCanvasHeight - this.tooltipTipWidth) {
                    this.tooltipY = singlePointPos[1]  - this.tooltipTipHeight - this.highlightedCircleR / 2
                } else {
                    this.tooltipY = singlePointPos[1] + this.highlightedCircleR / 2
                }
            },
            hideTooltip: function() {
                // hide tooltip for each point, which represents one tree visualization
                // this.isShowTooltip = false
            }
        }
    }

</script>
<style lang="less">
    @border-style: 0.05rem solid rgba(180, 180, 180, 0.3);
    .tree-vis-map {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        width: 100%;
        height: 100%;
        background-color: white;
        .el-card__body {
            padding: 0px;
            height: 100%;
        }
        .is-always-shadow {
            box-shadow: none !important;
        }
        .el-card {
            border: none !important;
        }
        #tree-vis-map-canvas {
            position: absolute;
            left: 0%;
            top: 0%;
            width: 100%;
            height: 100%;
            // background-color: white;
            .treevis-node {
                fill: steelblue;
                &:hover {
                    fill: #8b0000;
                }
                &.selected {
                    fill: #8b0000;
                }
            }
            .contour {
                stroke: gray;
            }
        }
        .highlight {
            fill: #b2182b;
        }
        #tree-vis-map-svg {
            position: absolute;
            left: 0%;
            top: 0%;
            width: 100%;
            height: 100%;
            background-color: white;
            .canvas-container {
                position: absolute;
                left: 0%;
                top: 0%;
                width: 100%;
                height: 100%;
                .test {
                    height: 100%;
                    width: 100%;
                    background-color: gray;
                }
            }
            .land-mark-container {
                width: 30px;
                height: 30px;
                .iconfont {
                    position: relative;
                    color: #f46d43;
                    font-weight: 700;
                    fill: white;
                }
            }
            .tooltip-container {
                position: relative;
                border: 1px solid #b2182b;
                // border: 1px solid steelblue;
            }
            .treevis-preview-container {
                width: 100px;
                height: 100px;
                background-color: white;
                border: 1.5px solid #636363;
                .treevis-canvas {
                    position: relative;
                    left: 0%;
                    top: 0%;
                    width: 100%;
                    height: 100%;
                }
            }
            .test-container {
                width: 500px;
                height: 500px;
                .test{
                    position: relative;
                    width: 500px;
                    height: 500px;
                    background-color: red;
                }
            }
        }
        #tooltip {
          position: absolute;
          left: 0;
          top: 0;
          // width: 150px;
          // height: 150px;
          word-wrap: break-word;
          // height: 200px;
          background: rgba(255, 255, 255, 1);
          overflow-y: auto;
          .title {
            font-size: 14px;
            max-height: 300px;
            overflow-y: auto;
          }
        }
    }
</style>