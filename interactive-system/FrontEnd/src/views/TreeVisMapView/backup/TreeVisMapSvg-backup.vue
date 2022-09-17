<template>
    <div class="tree-vis-map-svg-container" :ref="treeVisMapContainerId">
        <svg ref="treevismapcanvas" :id="treeVisMapCanvasId">
            <g class="background-container"></g>
            <g class="contour-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
            </g>
            <g class="point-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
            </g>
        </svg>
        <div class="treevis-preview" v-for="singleRepresentativeObj in previewRepresentativeObjList"
            :class="{ selected: singleRepresentativeObj['index'] === selectedDSLIndex }"
            v-show="withinScreenSpace(singleRepresentativeObj)"
            :style="{'left': (singleRepresentativeObj['x'] + treeVisMapCanvasPaddingLeft - treevisPreviewWidth / 2) + 'px',
             'top': (singleRepresentativeObj['y'] + treeVisMapCanvasPaddingTop - treevisPreviewHeight / 2) + 'px', 
             'width': treevisPreviewWidth + 'px', 'height': treevisPreviewHeight + 'px'}"
             :treevisDefaultPreviewContainerKey="treevisDefaultPreviewContainerKey"
             @click="selectTreeVisPreview(singleRepresentativeObj)"
             @mouseover="hoverTreeVisPreview()">
            <TreeCanvas :treeCanvasKey="treeCanvasDefaultPreviewKey" :sendSVGData="false"
                v-if="typeof(singleRepresentativeObj['dsl']) === 'object'"
                :dslObj="singleRepresentativeObj['dsl']"
                :dslIndex="singleRepresentativeObj['index']"
                :initRender="true">
            </TreeCanvas>
        </div>
        <div class="selected-view" v-if="showSelectionView">
            <div class="selected-view-tag">
            </div>
            <div class="bottom-wrapper">
                <div class="selected-view-content">
                    <TreeCanvas :treeCanvasKey="treeCanvasSelectedPreviewKey" :sendSVGData="false"
                        :dslObj="selectedDSLObj"
                        :dslIndex="selectedDSLIndex"
                        :initRender="true">
                    </TreeCanvas>
                </div>
                <div class="selected-view-menu">
                    <i class="icon iconfont close icon-close5" @click="closeSelectionPreviewPanel"></i>
                    <i class="icon iconfont save icon-shoucang" @click="addBookmark"></i>
                    <i class="icon iconfont open icon-dakai" @click="openDetail"></i>
                    <i class="icon iconfont related icon-xiangguan" @click="checkRelated"></i>
                </div>
            </div>
        </div>
        <div class="controller-container">
            <div class="slider-container">
                <el-slider
                  v-model="displayedLevel"
                  :format-tooltip="formatTooltip"
                  @change="updateDisplayedLevel"
                  :min="0"
                  :max="10">
                </el-slider>
            </div>
            <div class="slider-label">granularity</div>
        </div>
        <el-card
            id="tooltip"
            v-if="isShowTooltip"
            :style="{transform: 'translate(' + this.tooltipX + 'px, ' + this.tooltipY + 'px)', 
                     width: tooltipTipWidth + 'px', 
                     height: tooltipTipHeight + 'px'}">
            <TreeCanvas :treeCanvasKey="treeCanvasKey" :sendSVGData="false">
            </TreeCanvas>
        </el-card>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import { getTreeDistanceMatrix } from '@/data-processing/get_tree_distance_matrix.js'
    import { getTSNEProjectionResult } from '@/data-processing/get_tsne_projection_result.js'
    import { getProjectionResults, getProjectionDSLList } from '@/data-processing/get_projection_results.js'
    import { computeTreevisNodePath } from '@/treevis-node-glyph/compute_treevis_node_path.js'
    import TreeCanvas from '@/views/TreeCanvasView/TreeCanvas.vue'
    import d3_save_svg from 'd3-save-svg'
    import createScatterplot from 'regl-scatterplot'
    import { translatePath } from '@/computation/translate_path.js'
    import { getClusterResultByLevel, getGoTreeGrammarObj, getFilterCollection } from '@/communication/sendData.js'

    export default {
        name: 'TreeVisMap',
        components: {
            TreeCanvas
        },
        props: {
        },
        data() {
            return {
                treeVisMapCanvasId: 'tree-vis-map-canvas',
                treeVisMapContainerId: 'tree-vis-map-canvas-container',
                treeVisMapCanvasWidth: 0,
                treeVisMapCanvasHeight: 0,
                treeVisMapCanvasPaddingTop: 0,
                treeVisMapCanvasPaddingBottom: 0,
                treeVisMapCanvasPaddingLeft: 0,
                treeVisMapCanvasPaddingRight: 0,
                treeVisMapCanvasPadding: {'left': 0.02, 'right': 0.02, 'top': 0.02, 'bottom': 0.02},
                isShowTooltip: false,
                circleR: 3,
                highlightedCircleR: 8,
                xScale: null,
                yScale: null,
                wholeProjectionPosItemList: [],
                drawingProjectionPosItemList: [],
                drawingProjectionPosItemIndexSet: null, 
                tooltipX: 0,
                tooltipY: 0,
                tooltipHeader: "",
                tooltipTipWidth: 150,
                tooltipTipHeight: 150, // it is used to set the position of tooltip
                selectedDSLIndex: -1, // index of the highlighted nodes
                selectedDSLObj: null, // the selected dsl object
                treeCanvasKey: 0, // variable to update the tree visualization
                treeCanvasSelectedPreviewKey: 0,
                treeCanvasDefaultPreviewKey: 0,
                treevisDefaultPreviewContainerKey: 0,
                projectionDSLList: [],
                clusterContentList: [],
                clusterRepresentativeList: [],
                previewClusterRepresentativeObjList: [],  // 2d, organize by the cluster
                previewRepresentativeObjList: [], // 1d 
                // clusterColorList: ['#6a3d9a', '#e31a1c', '#b2df8a', '#ff7f00', '#fb9a99', '#1f78b4', '#fdbf6f', '#33a02c', '#cab2d6', '#a6cee3'],
                clusterColorList: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
                showSelectionView: false,
                treevisPreviewWidth: 60,
                treevisPreviewHeight: 60,
                displayedLevel: 0,
                zoomingRatio: 1,
                zoomingRatioChangeThreshold: 0.5,
                zoomingEndTimeThreshold: 1000,
                zoomingEndTimer: null,
                filterDSLCollection: null,
                // filterFormData: null,
                // filterFormData: {'criteria':{'CoordinateSystem': {'Category': 'cartesian'}}}
                // clusterColorList: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']
            }
        },
        watch: {},
        created: function () {},
        beforeMount: function() {},
        mounted: function() {
            let loadProjectionDefer = $.Deferred(), loadClusterDefer = $.Deferred(), loadFilterDefer = $.Deferred()
            let self = this
            self.initViewSize()
            $.when(loadProjectionDefer, loadClusterDefer, loadFilterDefer)
                .done(function() {
                    self.filterProjectionPosResults()
                    self.updateUnderlyingDataset()
                    self.renderWholeProjectionView()
                })
            // loading the projection results from *local* 
            self.loadProjectionResults(loadProjectionDefer)
            self.loadDataCollectionFilter(loadFilterDefer)
            self.loadClusterResults(loadClusterDefer)
        },
        computed: {
            ...mapState([
                'selectedTreeDSLIndex'
            ])
        },
        methods: {
            ...mapMutations([
                'UPDATE_SELECTED_TREE_DSL_INDEX'
            ]),
            point_transform: function (d) {
                return "translate(" + d3.zoomIdentity.apply(d) + ")";
            },
            formatTooltip: function (val) {
                return val
            },
            initViewSize: function() {
                let treeVisMapContainerId = this.treeVisMapContainerId
                let treeVisMapCanvasHeight = this.$refs[treeVisMapContainerId].clientHeight;
                let treeVisMapCanvasWidth = this.$refs[treeVisMapContainerId].clientWidth;
                // record the original height and width of tree vis map canvas
                this.treeVisMapCanvasWholeHeight = treeVisMapCanvasHeight
                this.treeVisMapCanvasWholeWidth = treeVisMapCanvasWidth
                // initialize the paddings (left, right, top, bottom), canvas width, and canvas height
                this.treeVisMapCanvasPaddingTop = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['top']
                this.treeVisMapCanvasPaddingBottom = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['bottom']
                this.treeVisMapCanvasPaddingLeft = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['left']
                this.treeVisMapCanvasPaddingRight = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['right']
                this.treeVisMapCanvasHeight = treeVisMapCanvasHeight - this.treeVisMapCanvasPaddingTop - this.treeVisMapCanvasPaddingBottom
                this.treeVisMapCanvasWidth = treeVisMapCanvasWidth - this.treeVisMapCanvasPaddingLeft - this.treeVisMapCanvasPaddingRight
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
                this.xScale = d3.scaleLinear()
                  .domain(valueExtentX)
                  .range([0, treeVisMapCanvasWidth])
                this.yScale = d3.scaleLinear()
                  .domain(valueExtentY)
                  .range([0, treeVisMapCanvasHeight])
            },
            updateDisplayedLevel: function() {
                let self = this
                let loadClusterDefer = $.Deferred();
                $.when(loadClusterDefer)
                    .done(function() {
                        self.updateUnderlyingDataset()
                        self.renderWholeProjectionView()
                        self.treeCanvasDefaultPreviewKey = (self.treeCanvasDefaultPreviewKey + 1) % 2
                    })
                self.loadClusterResults(loadClusterDefer)
            },
            updateZoomingRatio: function(transform_event) {
                let self = this
                let loadClusterDefer = $.Deferred();
                $.when(loadClusterDefer)
                    .done(function() {
                        self.updateUnderlyingDataset()
                        // self.filterPreviewRepresentativeObjList(transform_event)
                        self.updateWholeProjectionView(transform_event)
                        // self.renderWholeProjectionView()
                        self.treeCanvasDefaultPreviewKey = (self.treeCanvasDefaultPreviewKey + 1) % 2
                        // self.treeCanvasDefaultPreviewKey = (self.treeCanvasDefaultPreviewKey + 1) % 2
                    })
                self.loadClusterResults(loadClusterDefer)
            },
            renderWholeProjectionView: function() {
                // render contour
                this.renderContour()
                // render the projection nodes
                this.renderTreeVisNode()
                // append the zooming background
                this.renderZoomedRect()
            },
            updateProjectionPoints: function (transform_event) {
                let self = this
                // filter the representative item at first, then update the view
                let representativeItemList = self.representativeItemList
                let representativeItemListRemained = []
                let treeVisMapCanvasWholeHeight = self.treeVisMapCanvasWholeHeight
                let treeVisMapCanvasWholeWidth = self.treeVisMapCanvasWholeWidth
                for (let i = 0; i < representativeItemList.length; i++) {
                    let projectionPos = representativeItemList[i]
                    let projectionPosUpdate = transform_event.apply(projectionPos)
                    let projectionPosX = projectionPosUpdate[0]
                    let projectionPosY = projectionPosUpdate[1]
                    if ((projectionPosX >= 0) && (projectionPosX <= treeVisMapCanvasWholeWidth) && (projectionPosY >= 0) && (projectionPosY <= treeVisMapCanvasWholeHeight)) {
                        representativeItemListRemained.push(projectionPos)
                    }
                }
                // update the projection results
                let clusterColorList = self.clusterColorList
                let colorLength = self.clusterColorList.length
                let projectionTreeItems = d3.select('.point-container')
                    .selectAll(".treevis-node")
                    .data(representativeItemListRemained, function(d, i) {
                        return 'node-' + d[2]
                    })
                projectionTreeItems.enter()
                    .append("circle")
                    .attr('class', function(d, i) {
                        let dslIndex = d[2]
                        if (dslIndex == self.selectedDSLIndex) {
                            return 'treevis-node selected'
                        }
                        return 'treevis-node'
                    })
                    .attr('id', function(d, i){
                        return 'treevis-node-' + d[2]
                    })
                    // .attr('fill', function(d, i) {
                 //         let categoryIndex = d[3]
                 //         return clusterColorList[categoryIndex%colorLength]
                 //    })
                    .attr("transform", self.treeVisNodeTransform(transform_event))
                    .on('mouseover', function(d, i) {
                        // setting the position of tooltip
                        // d3.select(this).classed('hovering-node', true)
                        let selectedNodeIndex = d[2]
                        let singleItemAttrs = self.wholeProjectionPosItemList[selectedNodeIndex]
                        let projectionPos = [singleItemAttrs[0], singleItemAttrs[1]]
                        let projectionPosUpdate = transform_event.apply(projectionPos)
                        self.setTooltipPos(projectionPosUpdate)
                        self.showTooltip(selectedNodeIndex)
                    })
                    .on('mouseout', function(d, i) {
                        // d3.select(this).classed('hovering-node', true)
                        self.hideTooltip()
                    })
                    .on('click', function(d, i) {
                        let dslIndex = d[2]
                        if (d3.select(this).classed('selected')) {
                            d3.select('.point-container')
                              .selectAll('.treevis-node')
                              .classed('selected', false)
                            self.selectedDSLIndex = -1
                            self.showSelectionView = false
                        } else {
                            d3.select('.point-container')
                              .selectAll('.treevis-node')
                              .classed('selected', false)
                            self.setSelectedDSLObject(dslIndex)
                            d3.select(this).classed('selected', true)
                        }
                        self.hideTooltip()
                      })
                projectionTreeItems.attr("transform", self.treeVisNodeTransform(transform_event))
                    .on('mouseover', function(d, i) {
                        let selectedNodeIndex = d[2]
                        let singleItemAttrs = self.wholeProjectionPosItemList[selectedNodeIndex]
                        let projectionPos = [singleItemAttrs[0], singleItemAttrs[1]]
                        let projectionPosUpdate = transform_event.apply(projectionPos)
                        self.setTooltipPos(projectionPosUpdate)
                        self.showTooltip(selectedNodeIndex)
                    });
                projectionTreeItems.exit().remove()
            },
            updateProjectionContour: function (transform_event) {
                let self = this
                // filter the remained projection items at first, then update the view
                let clusterContentItemList = self.clusterContentItemList
                let clusterContentItemListRemained = []
                let treeVisMapCanvasWholeHeight = self.treeVisMapCanvasWholeHeight
                let treeVisMapCanvasWholeWidth = self.treeVisMapCanvasWholeWidth
                for (let clusterIndex = 0; clusterIndex < clusterContentItemList.length; clusterIndex++) {
                    let singleClusterContentItemListRemained = []
                    let singleClusterContentItemList = clusterContentItemList[clusterIndex]
                    for (let j = 0; j < singleClusterContentItemList.length; j++) {
                        let projectionPos = singleClusterContentItemList[j]
                        let projectionPosUpdate = transform_event.apply(projectionPos)
                        let projectionPosX = projectionPosUpdate[0]
                        let projectionPosY = projectionPosUpdate[1]
                        // if the node positions exceed the screen space, then remove the nodes
                        if ((projectionPosX >= 0) && (projectionPosX <= treeVisMapCanvasWholeWidth) && (projectionPosY >= 0) && (projectionPosY <= treeVisMapCanvasWholeHeight)) {
                            singleClusterContentItemListRemained.push(projectionPos)
                        }
                    }
                    clusterContentItemListRemained.push(singleClusterContentItemListRemained)
                }
                // update the contour
                self.updateContourComputation(transform_event)
                let colorLength = self.clusterColorList.length
                d3.select(self.$el)
                  .select('.contour-container')
                  .selectAll(".projection-contour")
                  .remove()
                //  let clusterContourContainer = d3.select(self.$el)
                //      .select('.contour-container')
              //            .selectAll(".cluster-contour-container")
              //            .data(clusterContentItemListRemained, function(d, i) {
              //                return 'cluster-contour-container-' + i
              //            })
                //  let clusterContourAddedContainer = clusterContourContainer.enter()
              //            .append('g')
              //            .attr('class', 'cluster-contour-container')
              //            .attr('id', function(d, i) {
              //                return 'cluster-contour-container-' + i
              //            })
              //        // append or update the visual element in the tree vis glyph container
              //        clusterContourAddedContainer.append("path")
                    //     .attr('class', 'projection-contour')
                    //     .attr("d", d3.geoPath())
                    //  .style('stroke', function(d, i) {
                 //             return self.clusterColorList[i%colorLength]
                 //         })
                    // clusterContourContainer.selectAll(".projection-contour")
                 //         .attr("d", d3.geoPath())
                 //    clusterContourContainer.exit().remove()

                for (let clusterIndex = 0; clusterIndex < clusterContentItemListRemained.length; clusterIndex++) {
                    let singleClusterContentItemList = clusterContentItemListRemained[clusterIndex]
                    let projectionContour = d3.select(self.$el)
                        .select('.contour-container')
                        .selectAll(".projection-contour-" + clusterIndex)
                        .data(self.contour(singleClusterContentItemList))
                    projectionContour.enter()
                        .append("path")
                        .attr('class', 'projection-contour projection-contour-' + clusterIndex)
                        .attr("d", d3.geoPath())
                        .style('stroke', function(d, i) {
                            return self.clusterColorList[clusterIndex%colorLength]
                        })
                    projectionContour
                        .attr("d", d3.geoPath())
                    projectionContour.exit().remove()
                }
            },
            updateTreevisPreviewRepresentatives: function (transform_event) {
                let self = this
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let previewRepresentativeObjList = self.previewRepresentativeObjList
                let remainedPreviewRepresentativeObjList = []
                for (let i = 0; i < previewRepresentativeObjList.length; i++) {
                    let previewRepresentativeObj = previewRepresentativeObjList[i]
                    let dslIndex = previewRepresentativeObj['index']
                    let projectionPos = wholeProjectionPosItemList[dslIndex]
                    let projectionPosUpdate = transform_event.apply(projectionPos)
                    let projectionPosX = projectionPosUpdate[0]
                    let projectionPosY = projectionPosUpdate[1]
                    previewRepresentativeObj['x'] = projectionPosX
                    previewRepresentativeObj['y'] = projectionPosY
                    // when update the underlying data is based on the transform event (because we send the parameter transform_event, then filter the preview representative object list
                    // if (self.withinScreenSpace(previewRepresentativeObj)) {
                    //  remainedPreviewRepresentativeObjList.push(previewRepresentativeObj)
                    // }
                }
                // self.previewRepresentativeObjList = remainedPreviewRepresentativeObjList
                self.treevisDefaultPreviewContainerKey = (self.treevisDefaultPreviewContainerKey + 1) % 2
            },
            withinScreenSpace: function(singleRepresentativeObj) {
                let self = this
                let treevisPreviewWidth = self.treevisPreviewWidth
                let treevisPreviewHeight = self.treevisPreviewHeight
                let treeVisMapCanvasWholeWidth = self.treeVisMapCanvasWholeWidth
                let treeVisMapCanvasWholeHeight = self.treeVisMapCanvasWholeHeight
                let treeVisMapCanvasPaddingLeft = self.treeVisMapCanvasPaddingLeft
                let treeVisMapCanvasPaddingTop = self.treeVisMapCanvasPaddingTop
                let previewX = singleRepresentativeObj['x'] + treeVisMapCanvasPaddingLeft - treevisPreviewWidth / 2
                let previewY = singleRepresentativeObj['y'] + treeVisMapCanvasPaddingTop - treevisPreviewHeight / 2
                if ((previewX < 0) || (previewY < 0) || (previewX > treeVisMapCanvasWholeWidth) || (previewY > treeVisMapCanvasWholeHeight)) {
                    return false
                }
                return true
            },
            updateWholeProjectionView: function(transform_event) {
                let self = this
                // update projection contour
                self.updateProjectionContour(transform_event)
                // update projection points
                self.updateProjectionPoints(transform_event)
                // update default tree vis preview figure
                self.updateTreevisPreviewRepresentatives(transform_event)
            },
            updateUnderlyingDataset: function() {
                // compute the items in different clusters
                this.clusterContentItemList = this.separateItemByCluster()
                // extract the representative elements from clusters
                this.representativeItemList = this.selectRepresentative()
                // extract the preview representative elements from clusters
                this.previewRepresentativeObjList = this.arrangePreviewRepresentativeObjList()
                console.log('previewRepresentativeObjList', this.previewRepresentativeObjList)
            },
            selectTreeVisPreview: function(singleRepresentativeObj) {
                let self = this
                let dslIndex = singleRepresentativeObj['index']
                if (dslIndex === this.selectedDSLIndex) {
                    self.selectedDSLIndex = -1
                    self.showSelectionView = false
                } else {
                    self.setSelectedDSLObject(dslIndex)
                }
            },
            hoverTreeVisPreview: function() {
                this.hideTooltip()
            },
            separateItemByCluster: function() {
                let self = this
                let clusterContentList = self.clusterContentList
                let clusterContentItemList = []
                let drawingProjectionPosItemList = self.drawingProjectionPosItemList
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let drawingProjectionPosItemIndexSet = self.drawingProjectionPosItemIndexSet
                for (let clusterIndex = 0; clusterIndex < clusterContentList.length; clusterIndex++) {
                    let contentList = clusterContentList[clusterIndex]
                    let singleClusterItemList = []
                    for (let j = 0; j < contentList.length; j++) {
                        let itemIndex = contentList[j]
                        // TODO change to dict
                        if ((drawingProjectionPosItemIndexSet == null) || (drawingProjectionPosItemIndexSet.has(itemIndex))) {
                            let itemObj = wholeProjectionPosItemList[itemIndex]
                            singleClusterItemList.push(itemObj)
                        }
                    }
                    clusterContentItemList.push(singleClusterItemList)
                }
                console.log('clusterContentItemList', clusterContentItemList)
                return clusterContentItemList
            },
            selectRepresentative: function() {
                let self = this
                let representativeItemList = []
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let clusterRepresentativeList = self.clusterRepresentativeList
                for (let clusterIndex = 0; clusterIndex < clusterRepresentativeList.length; clusterIndex++) {
                    let representativeList = clusterRepresentativeList[clusterIndex]
                    for (let j = 0; j < representativeList.length; j++) {
                        let itemIndex = representativeList[j]
                        let itemObj = wholeProjectionPosItemList[itemIndex]
                        if (typeof(itemObj) !== 'undefined') {
                            // add the cluster index to each record
                            itemObj.push(clusterIndex)
                            representativeItemList.push(itemObj)
                        } 
                    }
                }
                return representativeItemList
            },
            arrangePreviewRepresentativeObjList: function() {
                // arrange the 2d representative object list to 1d representative object list
                let previewClusterRepresentativeObjList = this.previewClusterRepresentativeObjList
                let previewRepresentativeObjList = []
                let wholeProjectionPosItemList = this.wholeProjectionPosItemList
                for (let clusterIndex = 0; clusterIndex < previewClusterRepresentativeObjList.length; clusterIndex++) {
                    let singleClusterRepresentativeObjList = previewClusterRepresentativeObjList[clusterIndex]
                    for (let j = 0; j < singleClusterRepresentativeObjList.length; j++) {
                        let singleRepresentativeObj = singleClusterRepresentativeObjList[j]
                        let dslIndex = singleRepresentativeObj['index']
                        let projectionItemPosAttrs = wholeProjectionPosItemList[dslIndex]
                        if (typeof(projectionItemPosAttrs) !== 'undefined') {
                            singleRepresentativeObj['clusterIndex'] = clusterIndex
                            // initialize the position
                            singleRepresentativeObj['x'] = projectionItemPosAttrs[0]
                            singleRepresentativeObj['y'] = projectionItemPosAttrs[1]
                            previewRepresentativeObjList.push(singleRepresentativeObj)
                        }
                    }
                }
                return previewRepresentativeObjList
            },
            loadProjectionResults: function(deferObj) {
                let self = this
                getProjectionResults().then(function(projectionResults) {
                    let wholeProjectionPosItemList = self.computeProjectionPosResults(projectionResults)
                    self.wholeProjectionPosItemList = wholeProjectionPosItemList
                    deferObj.resolve()
                })
            },
            loadClusterResults: function(deferObj) {
                let self = this
                let displayedLevel = self.displayedLevel
                let zoomingRatio = self.zoomingRatio
                let formData = {'level': displayedLevel, 'zoomRatio': zoomingRatio}
                getClusterResultByLevel(formData, function(clusterResults) {
                    self.clusterContentList = clusterResults['content']
                    self.clusterRepresentativeList = clusterResults['representative']
                    self.previewClusterRepresentativeObjList = clusterResults['preview-representative']
                    console.log('clusterContentList', self.clusterContentList, 'clusterRepresentativeList', self.clusterRepresentativeList, 'previewClusterRepresentativeObjList', self.previewClusterRepresentativeObjList)
                    deferObj.resolve()
                })
            },
            loadDataCollectionFilter: function(deferObj) {
                let self = this
                let formData = self.filterFormData
                // if the filtered formdata is valid
                if ((typeof(formData) !== 'undefined') && (formData != null)) {
                    getFilterCollection(formData, function(filterResults) {
                        self.filterDSLCollection = filterResults['collection']
                        deferObj.resolve()
                    })
                } else {
                    deferObj.resolve()
                }
            },
            // filter the projection results according to the queried filter
            filterProjectionPosResults: function() {
                // TODO
                let self = this
                let filterDSLCollection = self.filterDSLCollection
                if ((typeof(filterDSLCollection) !== 'undefined') && (filterDSLCollection != null)) {
                    let remainedProjectionPosItemList = []
                    let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                    for (let i = 0; i < filterDSLCollection.length; i++) {
                        let filterIndex = filterDSLCollection[i]
                        remainedProjectionPosItemList.push(wholeProjectionPosItemList[filterIndex])
                    }
                    self.drawingProjectionPosItemList = remainedProjectionPosItemList
                    self.drawingProjectionPosItemIndexSet = extractPosItemListIndexSet(remainedProjectionPosItemList)
                }
                // transform position item list to dictionary
                function extractPosItemListIndexSet(projectionPosItemList) {
                    let drawingProjectionPosItemIndexSet = new Set();
                    for (let i = 0; i < projectionPosItemList.length; i++) {
                        let posItemAttrList = projectionPosItemList[i]
                        let posItemIndex = posItemAttrList[2]
                        drawingProjectionPosItemIndexSet.add(posItemIndex)
                    }
                    return drawingProjectionPosItemIndexSet
                }
            },
            updateContourComputation: function(transform_event) {
                let self = this
                let xScale = self.xScale, yScale = self.yScale
                let height = self.treeVisMapCanvasHeight, width = self.treeVisMapCanvasWidth
                self.contour = d3
                    .contourDensity()
                    .size([width, height])
                    // .bandwidth(50)
                    // .thresholds([2, 6, 7, 8, 10])
                    // .thresholds([2, 4, 6, 8, 9, 10])
                    .thresholds(12)
                    .x(function(d, i) {
                        let zoomedPosList = transform_event.apply(d)
                        return zoomedPosList[0]
                    }) //  + this.treeVisMapCanvasPaddingLeft
                    .y(function(d) {
                        let zoomedPosList = transform_event.apply(d)
                        return zoomedPosList[1]
                    }) //  + this.treeVisMapCanvasPaddingTop
                    // .weight(function(d, i) {
                    //  return 1
                    // });
            },
            closeSelectionPreviewPanel: function() {
                this.showSelectionView = false
                d3.select(this.$el)
                    .select('.point-container')
                    .selectAll('.treevis-node')
                    .classed('selected', false)
            },
            addBookmark: function() {
                console.log('addBookmark')
            },
            openDetail: function() {
                console.log('openDetail')
            },
            checkRelated: function() {
                console.log('checkRelated')
            },
            renderContour: function() {
                let self = this
                let clusterContentItemList = self.clusterContentItemList
                console.log('clusterContentItemList', clusterContentItemList)
                let colorLength = self.clusterColorList.length
                self.updateContourComputation(d3.zoomIdentity)
                d3.select(self.$el)
                  .select('.contour-container')
                  .selectAll(".projection-contour")
                  .remove()
                for (let clusterIndex = 0; clusterIndex < clusterContentItemList.length; clusterIndex++) {
                    let singleClusterContentItemList = clusterContentItemList[clusterIndex]
                    let projectionContour = d3.select(self.$el)
                        .select('.contour-container')
                        .selectAll(".projection-contour-" + clusterIndex)
                        .data(self.contour(singleClusterContentItemList))
                    // add new visual element
                    projectionContour.enter()
                        .append("path")
                        .attr('class', 'projection-contour projection-contour-' + clusterIndex)
                        .style('stroke', function(d, i) {
                            return self.clusterColorList[clusterIndex%colorLength]
                        })
                        .attr("d", d3.geoPath())
                        // .on("mouseover", function(d, i) {
                        //  console.log('d', d, 'i', i)
                        // })
                    // update contour visual element
                    projectionContour.style('stroke', function(d, i) {
                            return self.clusterColorList[clusterIndex%colorLength]
                        })
                        .attr("d", d3.geoPath())
                    // remove the extra visual element
                    projectionContour.exit().remove()
                }
            },
            // zooming action end detection, and the corresponding handler
            zoomEndHandler: function (transform_event) {
                let self = this
                let zoomingEndTimeThreshold = self.zoomingEndTimeThreshold;
                if (self.zoomingEndTimer != null) {
                    clearTimeout(self.zoomingEndTimer);
                }
                // update zoom end timer
                self.zoomingEndTimer = setTimeout(function(){ 
                    console.log('finish zooming query data from server')
                    var transform_ratio = transform_event.k
                    self.zoomingRatio = transform_ratio
                    self.updateZoomingRatio(transform_event)
                }, zoomingEndTimeThreshold);
            },
            renderZoomedRect: function() {
                /**
                 * plot the rectangle to support zooming function
                 */
                let self = this
                if (d3.select(self.$el).select('.background-container').select('.zoomable-rectangle').empty()) {
                    d3.select(self.$el)
                    .select('.background-container')
                    .append("rect")
                    .attr('class', 'zoomable-rectangle')
                    .attr("fill", "none")
                    .attr("pointer-events", "all")
                    .call(d3.zoom()
                        .scaleExtent([0.8, 20])
                        .on("zoom", zoom));
                }
                // the handler for the zooming function
                function zoom() {
                    var transform_event = d3.event.transform;
                    var transform_ratio = transform_event.k
                    console.log('zooming ratio', transform_ratio)
                    let zoomingRatioChangeThreshold = self.zoomingRatioChangeThreshold
                    // updateProjectionPoints(projectionPosResultsRemained, transform_event)
                    self.updateWholeProjectionView(transform_event)
                    if (Math.abs(self.zoomingRatio - transform_ratio) > zoomingRatioChangeThreshold) {
                        // the specific handler for the zoomming end enven
                        self.zoomEndHandler(transform_event)        
                    }
                    // console.log('previewRepresentativeObjList', previewRepresentativeObjList)
                    // console.log('treevisDefaultPreviewContainerKey', self.treevisDefaultPreviewContainerKey)
                    // console.log('previewRepresentativeObjListRemained', previewRepresentativeObjListRemained)
                    // self.previewRepresentativeObjListRemained = previewRepresentativeObjListRemained
                    // if ((projectionPosX >= 0) && (projectionPosX <= treeVisMapCanvasWholeWidth) && (projectionPosY >= 0) && (projectionPosY <= treeVisMapCanvasWholeHeight)) {
                        //  previewRepresentativeObjListRemained.push(previewRepresentativeObj)
                        // }
                }
            },
            treeVisNodeTransform: function (t) {
                return function(d) {
                    // console.log('d', d, 't.apply(d)', t.apply(d))
                    return "translate(" + t.apply(d) + ")";
                };
            },
            renderTreeVisNode: function() {
                let self = this
                let representativeItemList = self.representativeItemList
                let clusterColorList = self.clusterColorList
                let colorLength = self.clusterColorList.length
                let representativeItems = d3.select(self.$el)
                  .select('.point-container')
                  .selectAll(".treevis-node")
                  .data(representativeItemList, function(d, i) {
                    return 'node-' + d[2]
                  })
                // append new visual elements
                representativeItems.enter()
                  .append("circle")
                  .attr('class', 'treevis-node')
                  .attr('id', function(d, i){
                        return 'treevis-node-' + d[2]
                   })
                  // .attr('fill', function(d, i) {
                  //    let categoryIndex = d[3]
                  //    return clusterColorList[categoryIndex%colorLength]
                  // })
                  .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity))
                  .on('click', function(d, i) {
                    let dslIndex = d[2]
                    if (d3.select(this).classed('selected')) {
                        d3.select('.point-container')
                          .selectAll('.treevis-node')
                          .classed('selected', false)
                        self.selectedDSLIndex = -1
                        self.showSelectionView = false
                    } else {
                        d3.select('.point-container')
                          .selectAll('.treevis-node')
                          .classed('selected', false)
                        self.setSelectedDSLObject(dslIndex)
                        d3.select(this).classed('selected', true)
                    }
                    self.hideTooltip()
                  })
                  .on('mouseover', function(d, i) {
                    let selectedNodeIndex = d[2]
                    self.showTooltip(selectedNodeIndex)
                    let singleItemAttrs = self.wholeProjectionPosItemList[selectedNodeIndex]
                    let singlePointPos = [singleItemAttrs[0], singleItemAttrs[1]]
                    self.setTooltipPos(singlePointPos)
                  })
                  .on('mouseout', function(d, i) {
                    self.hideTooltip()
                  })
                // update the view
                representativeItems.attr('id', function(d, i){
                        return 'treevis-node-' + d[2]
                   })
                  // .attr('fill', function(d, i) {
                  //    let categoryIndex = d[3]
                  //    return clusterColorList[categoryIndex%colorLength]
                  // })
                  .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity))
                  .on('click', function(d, i) {
                    let dslIndex = d[2]
                    if (d3.select(this).classed('selected')) {
                        d3.select('.point-container')
                          .selectAll('.treevis-node')
                          .classed('selected', false)
                        self.selectedDSLIndex = -1
                        self.showSelectionView = false
                    } else {
                        d3.select('.point-container')
                          .selectAll('.treevis-node')
                          .classed('selected', false)
                        self.setSelectedDSLObject(dslIndex)
                        d3.select(this).classed('selected', true)
                    }
                    self.hideTooltip()
                  })
                  .on('mouseover', function(d, i) {
                    // d3.select(this).classed('hovering-node', true)
                    let selectedNodeIndex = d[2]
                    self.showTooltip(selectedNodeIndex)
                    let singleItemAttrs = self.wholeProjectionPosItemList[selectedNodeIndex]
                    let singlePointPos = [singleItemAttrs[0], singleItemAttrs[1]]
                    self.setTooltipPos(singlePointPos)
                    // console.log('singlePointPos', singlePointPos)
                  })
                  .on('mouseout', function(d, i) {
                    // d3.select(this).classed('hovering-node', true)
                    self.hideTooltip()
                  })
                // remove the extra elements
                representativeItems.exit().remove()
            },
            // renderTreeVisNodeGlyph: function() {
            //  /**
            //   * plot the projection results
            //   */
            //  let self = this
            //  let projectionPosResults = self.projectionPosResults
            //  d3.select('.point-container')
            //       .selectAll(".treevis-node")
            //       .data(projectionPosResults, function(d, i) {
            //          return 'node-' + d[2]
            //       })
            //       .enter()
            //       .append("path")
            //       .attr('class', 'treevis-node')
            //       .attr("d", function (d, i) {
            //          return computeTreevisNodePath(d)
            //       })
            //       .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity));
            // },
            setSelectedDSLObject: function(dslIndex) {
                let self = this
                let formData = {'dslName': dslIndex}
                getGoTreeGrammarObj(formData, function(singleTreeDSLObj) {
                    self.selectedDSLIndex = dslIndex
                    self.selectedDSLObj = singleTreeDSLObj
                    setTimeout(function() {
                        self.treeCanvasSelectedPreviewKey = (self.treeCanvasSelectedPreviewKey + 1) % 2 // update the tree visualization canvas
                        self.showSelectionView = true
                    }, 200)
                })
            },
            computeProjectionPosResults: function (projectionResult) {
                let projectionPosResults = []
                this.updatePosScale(projectionResult)
                for (let i = 0; i < projectionResult.length; i++) {
                    let item = projectionResult[i]
                    let itemPosX = this.xScale(item['x'])
                    let itemPosY = this.yScale(item['y'])
                    projectionPosResults.push([itemPosX, itemPosY, i])
                }
                return projectionPosResults
            },
            addColorAttribute: function(projectionPosResults) {
                let color = '#00ff00'
                for (let i = 0; i < projectionPosResults.length; i++) {
                    let projectionPosItem = projectionPosResults[i]
                    projectionPosItem.push(color)
                }
                return projectionPosResults
            },
            computeHorizontalPos: function(pos) {
                return this.xScale(pos)
            },
            computeVerticalPos: function(pos) {
                return this.yScale(pos)
            },
            updateSelectedTreeDSLContent: function(selectedNodeIndex) {
                let self = this
                selectedNodeIndex = +selectedNodeIndex
                let layoutParas = sysDatasetObj.getLayoutParas()
                let nodeArrayWithValueObj = sysDatasetObj.getNodeArrayWithValueObj()
                let treeIndexWithDSL = sysDatasetObj.computeAllNodeTreeIndexWithDSL(nodeArrayWithValueObj, selectedNodeIndex)
                // set treeIndexWithDSL and treeDSLContentObj within layoutParas, then rendering tree visualization result
                layoutParas.treeIndexWithDSL = treeIndexWithDSL
                sysDatasetObj.loadTreeDSLContentObjFromServer(treeIndexWithDSL, function(treeDSLContentObj) {
                    layoutParas.treeDSLContentObj = treeDSLContentObj
                    self.isShowTooltip = true               
                    setTimeout(function() {
                        self.treeCanvasKey = (self.treeCanvasKey + 1) % 2 // update the tree visualization canvas
                    }, 200)
                })
            },
            showTooltip: function(selectedNodeIndex) {
                this.updateSelectedTreeDSLContent(selectedNodeIndex)
            },
            setTooltipPos: function(singlePointPos) {
                if (singlePointPos[0] > this.treeVisMapCanvasWidth - this.tooltipTipWidth) {
                    this.tooltipX = singlePointPos[0] - this.tooltipTipWidth - this.highlightedCircleR / 2 + this.treeVisMapCanvasPaddingLeft
                } else {
                    this.tooltipX = singlePointPos[0] + this.highlightedCircleR / 2 + this.treeVisMapCanvasPaddingLeft
                }
                if (singlePointPos[1] > this.treeVisMapCanvasHeight - this.tooltipTipWidth) {
                    this.tooltipY = singlePointPos[1]  - this.tooltipTipHeight - this.highlightedCircleR / 2 + this.treeVisMapCanvasPaddingTop
                } else {
                    this.tooltipY = singlePointPos[1] + this.highlightedCircleR / 2 + this.treeVisMapCanvasPaddingTop
                }
            },
            hideTooltip: function() {
                // hide tooltip for each point, which represents one tree visualization
                this.isShowTooltip = false
            }
        }
    }

</script>
<style lang="less">
    @border-style: 0.05rem solid rgba(180, 180, 180, 0.3);
    @menu-height: 2.5rem;
    @selected-view-tag-container-height: 20px;
    @selected-view-tag-item-height: 18px;
    .tree-vis-map-svg-container {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        width: 100%;
        height: 100%;
        background-color: white;
        position: absolute;
        .el-card__body {
            padding: 0px;
            height: 100%;
        }
        .zoomable-rectangle {
            width: 100%;
            height: 100%;
            fill: white;
        }
        #tree-vis-map-canvas {
            width: 100%;
            height: 100%;
            background-color: white;
            .treevis-node {
                opacity: 0.5;
                r: 4px;
                fill: #999999;
                &:hover {
                    r: 8px;
                    fill: red;
                    stroke: black;
                }
                &.selected {
                    r: 8px;
                    fill: red;
                    stroke: black;
                    stroke-width: 1.5px;
                    opacity: 1;
                }
            }
            .projection-contour {
                stroke-opacity: 0.6;
                fill-opacity: 0;
                pointer-events: none;
                stroke-width: 0.25;
            }
        }
        #tooltip {
          position: absolute;
          left: 0;
          top: 0;
          word-wrap: break-word;
          // height: 200px;
          // background: rgba(145, 145, 143, 0.5);
          max-height: 600px;
          overflow-y: auto;
          .title {
            font-size: 14px;
            max-height: 300px;
            overflow-y: auto;
          }
        }
        .selected-view {
          position: absolute;
          top: 10px;
          right: 20px;
          width: 200px;
          height: 180px;
          border-left: #e2e8f0 solid 1px;
          border-right: #e2e8f0 solid 1px;
          border-top: #e2e8f0 solid 1px;
          background-color: white;
          .selected-view-tag {
            position: absolute;
            top: 0%;
            left: 0%;
            height: @selected-view-tag-container-height;
            width: 100%;
          }
          .bottom-wrapper {
            position: absolute;
            width: 100%;
            height: calc(~"100% -" @selected-view-tag-container-height);
            left: 0%;
            top: 20px;
            border-bottom: #e2e8f0 solid 1px;
            .selected-view-content {
                position: absolute;
                left: 0%;
                top: 0%;
                height: 100%;
                right: 20px;
            }
            .selected-view-menu {
                position: absolute;
                top: 0%;
                bottom: 0%;
                right: 0%;
                width: 20px;
                padding-top: 5px;
                display: flex;
                flex-direction: column;
                .iconfont {
                    padding-top: 2px;
                    padding-bottom: 2px;
                    &:hover {
                        font-weight: bold;
                    }
                }
                .close {
                    &:hover {
                        color: red;
                    }
                }
                .save {
                    &:hover {
                        color: steelblue;
                    }
                }
                .open {
                    &:hover {
                        color: steelblue;
                    }
                }
                .related {
                    &:hover {
                        color: steelblue;
                    }
                }
            }
          }
        }
        .treevis-preview {
            position: absolute;
            background-color: rgba(200,200,200,0.6);
            border: gray 0.5px solid;
            &.selected {
                border: #a50026 0.5px solid;
            }
            &:hover {
                border: #a50026 0.5px solid;
            }
        }
        .controller-container {
            position: absolute;
            width: 200px;
            height: 30px;
            right: 10px;
            bottom: 10px;
            @controller-container-height: 30px;
            @slider-container-width: 120px;
            .slider-container {
                position: absolute;
                width: @slider-container-width;
                left: 0%;
                top: 0%;
                height: @controller-container-height;
            }
            .slider-label {
                position: absolute;
                left: @slider-container-width;
                right: 0%;
                top: 0%;
                padding-top: 3px;
                height: @controller-container-height;
                line-height: @controller-container-height;
                vertical-align: middle;
            }
            .el-slider__button {
                width: 12px;
                height: 12px;
                border-color: #999999;
                border-width: 1px;
                background-color: white;
            }
            .el-slider__bar {
                background-color: gray;
            }
            .el-slider__runway {
                background-color: gray;
            }
        }
    }
</style>