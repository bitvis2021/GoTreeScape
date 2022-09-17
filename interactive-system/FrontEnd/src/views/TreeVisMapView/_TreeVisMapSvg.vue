<template>
    <div class="tree-vis-map-svg-container" :ref="treeVisMapContainerRef">
        <svg ref="treevismapcanvas" class="tree-vis-map-svg" :id="treeVisMapCanvasId">
            <g class="background-container"></g>
            <g class="contour-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
            </g>
            <g class="point-container" v-show="showLandmarkPoint" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
            </g>
            <g class="traditional-treevis-container" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
            </g>
            <g class="existed-treevis-container" v-show="showExistTreePoint" :transform="'translate('+treeVisMapCanvasPaddingLeft+','+treeVisMapCanvasPaddingTop+')'">
            </g>
        </svg>
        <div class="treevis-preview" v-for="singleRepresentativeObj in previewRepresentativeObjList"
            :key="singleRepresentativeObj['index']"
            :id="'treevis-preview-' + singleRepresentativeObj['index']"
            :class="{ 'selected': singleRepresentativeObj['index'] === selectedDSLIndex, 'existed': singleRepresentativeObj['type'] === 'existed' }"
            v-if="computeDisplayState(singleRepresentativeObj)"
            :style="{'left': (singleRepresentativeObj['x'] + treeVisMapCanvasPaddingLeft - treevisPreviewWidth / 2) + 'px',
             'top': (singleRepresentativeObj['y'] + treeVisMapCanvasPaddingTop - treevisPreviewHeight / 2) + 'px', 
             'width': treevisPreviewWidth + 'px', 'height': treevisPreviewHeight + 'px',
             'visibility': singleRepresentativeObj['hidden']?'hidden':'visible'}"
             :treevisDefaultPreviewContainerKey="treevisDefaultPreviewContainerKey"
             @click="selectTreeVisPreview(singleRepresentativeObj)"
             @mouseover="hoverTreeVisPreview()">
            <TreeCanvas :treeCanvasKey="treeCanvasDefaultPreviewKey" 
                :sendSVGData="false"
                :dslObj="getTreeVisDSLObj(singleRepresentativeObj)"
                :dslIndex="singleRepresentativeObj['index']"
                :initRender="true"
                :nodeArrayWithValueObj="nodeArrayWithValueObjPreview"
                :nodeArrayWithValue="nodeArrayWithValuePreview"
                :hierarchicalData="hierarchicalDataPreview">
            </TreeCanvas>
        </div>
        <!-- <TreeCanvas :treeCanvasKey="treeCanvasDefaultPreviewKey" :sendSVGData="false"
            v-if="typeof(singleRepresentativeObj['dsl']) === 'object'"
            :dslObj="singleRepresentativeObj['dsl']"
            :dslIndex="singleRepresentativeObj['index']"
            :initRender="true">
        </TreeCanvas> -->
        <div class="selected-view" v-if="showSelectionView">
            <div class="selected-view-tag">
                <el-radio v-model="loadRepresentativeItemType" @change="changeLoadRepresentativeItemType('coverage')" label="coverage">landmarks</el-radio>
                <el-radio v-model="loadRepresentativeItemType" @change="changeLoadRepresentativeItemType('neighbor')" label="neighbor">neighbors</el-radio>
            </div>
            <div class="bottom-wrapper">
                <div class="selected-view-content">
                    <TreeCanvas :treeCanvasKey="treeCanvasSelectedPreviewKey" 
                        :sendSVGData="false"
                        :dslObj="selectedDSLObj"
                        :dslIndex="selectedDSLIndex"
                        :initRender="true"
                        :nodeArrayWithValueObj="nodeArrayWithValueObjSelect"
                        :nodeArrayWithValue="nodeArrayWithValueSelect"
                        :hierarchicalData="hierarchicalDataSelect">
                    </TreeCanvas>
                </div>
                <div class="selected-view-menu">
                    <i class="icon iconfont zoom icon-jujiao" @click="zoomIntoSelectedItem('neighbor')"></i>
                    <i class="icon iconfont save" 
                       :class="{'icon-shoucangmiaobian': typeof(galleryDSLObjDict[selectedDSLIndex])==='undefined',
                                'icon-shoucang': typeof(galleryDSLObjDict[selectedDSLIndex])!=='undefined'}" 
                       @click="addBookmark">
                    </i>
                    <i class="icon iconfont open icon-dakai" @click="openInTreeIllustrator"></i>
                    <i class="icon iconfont related icon-xiangguan" @click="checkRelated"></i>
                    <i class="icon iconfont close icon-close5" @click="closeSelectionPreviewPanel"></i>
                </div>
            </div>
        </div>
        <div class="thumbnail-container" :ref="thumbnailContainerRef">
            <ThumbnailViewSvg 
                :projectionResults="projectionResults"
                :displayRangeRatio="displayRangeRatio"
                :treeVisMapCanvasWidth="treeVisMapCanvasWidth"
                :treeVisMapCanvasHeight="treeVisMapCanvasHeight">
            </ThumbnailViewSvg>
        </div>        
        <div class="controller-container">
            <div class="slider-container">
                <el-slider
                  v-model="displayedZoomingRatio"
                  :format-tooltip="formatTooltip"
                  @change="forceUpdateZoomingRatio"
                  :min="minZoomRatio"
                  :max="maxZoomRatio">
                </el-slider>
            </div>
            <div class="slider-label">zooming</div>
        </div>
        <div class="legend-container" :ref="legendContainerRef">
            <svg class="legend-svg">
                <g class="legend-svg-g" :transform="'translate('+legendPaddingLeftRight+','+legendPaddingTopBottom+')'">
                </g>
            </svg>
        </div>
        <el-card
            id="tooltip"
            v-if="isShowTooltip"
            :style="{transform: 'translate(' + this.tooltipX + 'px, ' + this.tooltipY + 'px)', 
                     width: tooltipTipWidth + 'px', 
                     height: tooltipTipHeight + 'px'}">
            <TreeCanvas 
                :treeCanvasKey="treeCanvasHoveringPreviewKey"
                :dslIndex="mouseoverDSLIndex"
                :dslObj="hoveringDSLObj"
                :nodeArrayWithValueObj="nodeArrayWithValueObjPreview"
                :nodeArrayWithValue="nodeArrayWithValuePreview"
                :hierarchicalData="hierarchicalDataPreview"
                :sendSVGData="false"
                :initRender="true">
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
    import ThumbnailViewSvg from '@/views/TreeVisThumbnail/ThumbnailViewSvg.vue'
    import d3_save_svg from 'd3-save-svg'
    import createScatterplot from 'regl-scatterplot'
    import { translatePath } from '@/computation/translate_path.js'
    import { getClusterResultByLevel, getGoTreeGrammarObj, getFilterCollection, getUploadTreeVisProjectionPos } from '@/communication/sendData.js'

    export default {
        name: 'TreeVisMap',
        components: {
            TreeCanvas, ThumbnailViewSvg
        },
        props: {
        },
        data() {
            return {
                treeVisMapCanvasId: 'tree-vis-map-canvas',
                treeVisMapContainerRef: 'tree-vis-map-canvas-container',
                legendContainerRef: 'legend-container',
                thumbnailContainerRef: 'thumbnail-container',
                treeVisMapCanvasWidth: 0,
                treeVisMapCanvasHeight: 0,
                treeVisMapCanvasUpdateYThreshold: 0,
                treeVisMapCanvasUpdateXThreshold: 0,
                treeVisMapCanvasPaddingTop: 0,
                treeVisMapCanvasPaddingBottom: 0,
                treeVisMapCanvasPaddingLeft: 0,
                treeVisMapCanvasPaddingRight: 0,
                legendPaddingLeftRight: 0,
                legendPaddingTopBottom: 0,
                legendCanvasWidth: 0, 
                legendCanvasHeight: 0,
                treeVisMapCanvasPadding: {'left': 0.02, 'right': 0.02, 'top': 0.02, 'bottom': 0.02},
                isShowTooltip: false,
                circleR: 3,
                highlightedCircleR: 8,
                xScale: null,
                yScale: null,
                xScaleRevert: null,
                yScaleRevert: null,
                wholeProjectionPosItemList: [],
                projectionResults: [],
                drawingProjectionPosItemList: [],
                drawingProjectionPosItemIndexSet: null, 
                tooltipX: 0,
                tooltipY: 0,
                tooltipHeader: "",
                tooltipTipWidth: 150,
                tooltipTipHeight: 150, // it is used to set the position of tooltip
                selectedDSLIndex: -1, // index of the highlighted nodes
                mouseoverDSLIndex: -1, // dsl index of the hovering nodes
                selectedDSLObj: null, // the selected dsl object
                hoveringDSLObj: null, // the dsl object when hovering on one node
                treeCanvasKey: 0, // variable to update the tree visualization
                treeCanvasSelectedPreviewKey: 0,
                treeCanvasDefaultPreviewKey: 0,
                treeCanvasHoveringPreviewKey: 0,
                treevisDefaultPreviewContainerKey: 0,
                clusterContentList: [],
                clusterRepresentativeList: [],
                existedTreeVisIndexList: [],
                existedTreeVisItemList: [],
                previewClusterRepresentativeObjList: [],  // 2d, organize by the cluster
                previewRepresentativeObjList: [], // 1d 
                representativeItemList: [],
                representativeItemDict: {},
                // clusterColorList: ['#6a3d9a', '#e31a1c', '#b2df8a', '#ff7f00', '#fb9a99', '#1f78b4', '#fdbf6f', '#33a02c', '#cab2d6', '#a6cee3'],
                clusterColorList: ["#dfc27d", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
                showSelectionView: false,
                treevisPreviewWidth: 60,
                treevisPreviewHeight: 60,
                previewOverlappingThreshold: 50, // indicates the minimum distance between the tree vis previews
                displayedLevel: 0,
                zoomingRatio: 1,
                displayedZoomingRatio: 1,
                zoomingRatioChangeThreshold: 0.2,
                zoomingEndTimeThreshold: 1000,
                zoomingEndTimer: null,
                filterDSLCollection: null,
                minZoomRatio: 0.8,
                defaultZoomRatio: 1,
                maxZoomRatio: 20,
                zoomOperator: null,
                zoomRatioChangeStep: 3, // this variable indicate the changes once clicking the zoom into button 
                selectedTraditionalTreeNodeList: [],
                filterFormData: null,
                transformEvent: null,
                existedNodeSize: 120,
                hideExistedTreevis: false,
                hidePreviewTreeVis: false,
                loadRepresentativeItemType: 'coverage', // 'coverage' or 'neighbor' this variable indicate the operation type of loading representative items
                treevisSearchResult: null,
                displayedDataRange: [],
                displayedRange: [],
                selectedPreviewAmount: 40,
                currentDisplayAndDataRange: null, // record the display and data range at the current state
                updateUnderlyingDataState: false, // record whether current system is in the state of updating underlying dataset
                displayRangeRatio: null,
                /** the required data attributes for rendering tree visualization results
                  * the following data object is used to render the tree visualization results in the tree canvas
                  * since the system contains two previews, one is for the preview hierarchical dataset
                  * and the other is for the selected hierarchical dataset
                **/
                nodeArrayWithValueObjPreview: null,
                nodeArrayWithValueObjSelect: null,
                nodeArrayWithValuePreview: null,
                nodeArrayWithValueSelect: null,
                hierarchicalDataPreview: null,
                hierarchicalDataSelect: null
                // filterFormData: {'criteria': {'1': {'CoordinateSystem': {'Category': 'cartesian'}}}}
                // clusterColorList: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']
            }
        },
        watch: {
            zoomingRatio: function() {
                this.displayedZoomingRatio = +this.zoomingRatio.toFixed(2)
            },
            selectedDataset: function() {
                console.log('this.selectedDataset', this.selectedDataset)
            },
            selectedDatasetFilterList: function() {
                let self = this
                let selectedTraditionalTreeNodeList = []
                let traditionalDatasetFilterObj = null
                let designFeatureDatasetFilterObjList = []
                let uploadingFileDatasetFilterObjList = []
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let zoomEnd = true
                // compute the view center position
                let viewCenterPos = [this.treeVisMapCanvasWidth/2, this.treeVisMapCanvasHeight/2]
                for(let i = 0; i < self.selectedDatasetFilterList.length; i++) {
                    let datasetFilterObj = self.selectedDatasetFilterList[i]
                    if (datasetFilterObj.type === 'traditional') {
                        traditionalDatasetFilterObj = datasetFilterObj
                        break
                    } else if (datasetFilterObj.type === 'design-feature') {
                        designFeatureDatasetFilterObjList.push(datasetFilterObj)
                    } else if (datasetFilterObj.type === 'uploading-file') {
                        uploadingFileDatasetFilterObjList.push(datasetFilterObj)
                    }
                }
                // update the filtering for traditional dataset
                if (traditionalDatasetFilterObj != null) {
                    // zoom into traditional tree
                    self.zoomIntoSelectedTraditionalTree(traditionalDatasetFilterObj)
                    // cancel the filtering for dataset
                } else {
                    self.selectedTraditionalTreeNodeList = []
                    d3.select(self.$el).select('.traditional-treevis-container')
                        .selectAll('.traditional-treevis-node')
                        .remove()
                } 
                // if the filter criteria amount is 0, then just clear the filtering
                if (designFeatureDatasetFilterObjList.length === 0) {
                    self.filterDSLCollection = null
                    self.drawingProjectionPosItemIndexSet = null
                    self.filterProjectionPosResults()
                    self.updateUnderlyingDataset()
                    self.updateWholeProjectionView(self.transformEvent, zoomEnd)
                } else {
                    // update the filtering for the design feature dataset
                    // just filtering for the dataset
                    self.updateFilterFormData(designFeatureDatasetFilterObjList)
                    // filter and update the underlying data, then update the whole projection view
                    let loadFilterDefer = $.Deferred()
                    $.when(loadFilterDefer)
                        .done(function() {
                            self.filterProjectionPosResults()
                            self.updateUnderlyingDataset()
                            self.updateWholeProjectionView(self.transformEvent, zoomEnd)
                            // after filtering the dataset, update all tree visualization previews
                        })
                    self.loadDataCollectionFilter(loadFilterDefer)
                }
                // update the results according to the uploading file object list
                if (uploadingFileDatasetFilterObjList.length === 0) {
                    self.loadRepresentativeItemType = 'coverage'
                } else {
                    let locateUploadingFileDefer = $.Deferred()
                    $.when(locateUploadingFileDefer)
                        .done(function() {
                            self.loadRepresentativeItemType = 'neighbor'
                            self.zoomIntoSearchResults()
                        })
                    let uploadingFileDatasetFilterObj = uploadingFileDatasetFilterObjList[0]
                    self.locateUploadingDslFileDatasetFilter(uploadingFileDatasetFilterObj, locateUploadingFileDefer)
                }
                if ((uploadingFileDatasetFilterObjList.length === 0) && (designFeatureDatasetFilterObjList.length === 0) && (traditionalDatasetFilterObj == null)) {
                    self.zoomOperation(viewCenterPos, self.defaultZoomRatio)
                }
            },
            showDSLInGalery: function() {
                let self = this
                let zoomEnd = true
                self.addRepresentative2Gallery()
                self.updateWholeProjectionView(self.transformEvent, zoomEnd)
            },
            showDSLLinkInGalery: function() {
            },
            showLandmarkPoint: function() {
                let zoomEnd = true
                this.updateWholeProjectionView(this.transformEvent, zoomEnd)
            },
            showLandmarkPreview: function() {
                this.updatePreviewRepresentativeList()
                this.arrangePreviewRepresentativeObjList()
            },
            showExistTreePoint: function() {
                let zoomEnd = true
                this.updateWholeProjectionView(this.transformEvent, zoomEnd)
            },
            showExistTreePreview: function() {
                this.updatePreviewRepresentativeList()
                this.arrangePreviewRepresentativeObjList()
            },
            landmarkPreviewAmount: function() {
                this.updatePreviewRepresentativeList()
                this.arrangePreviewRepresentativeObjList()
            },
            refreshLandmarkPreviewState: function() {
                let randomState = true
                this.updatePreviewRepresentativeList(randomState)
                this.arrangePreviewRepresentativeObjList()
            }
        },
        created: function () {},
        beforeMount: function() {},
        mounted: function() {
            let loadProjectionDefer = $.Deferred(), loadClusterDefer = $.Deferred(), loadFilterDefer = $.Deferred()
            let self = this
            // load the data collection of existed tree visualizations
            self.existedTreeVisIndexList = sysDatasetObj.existedTreeVisCollection
            self.initViewSize()
            $.when(loadClusterDefer)
                .done(function() {
                    self.filterProjectionPosResults()
                    self.updateUnderlyingDataset()
                    self.renderWholeProjectionView()
                    self.updateTreevisPreviewRepresentatives(self.transformEvent, true)
                })
            $.when(loadProjectionDefer, loadFilterDefer)
                .done(function() {
                    self.loadClusterResults(loadClusterDefer)
                })
            // initialize zoom object
            self.initZoomOperator()
            self.initTransformEvent()
            // loading the projection results from *local* 
            self.loadProjectionResults(loadProjectionDefer)
            self.loadDataCollectionFilter(loadFilterDefer)
            // initialize the node array with value object
            self.initNodeArrayWithValueObj()
            // initialize the hierarchical data of preview panel and 
            self.initHierarchicalDataObj()
            // initialize the node array with value list
            self.initNodeArrayWithValue()
        },
        computed: {
            ...mapState([
                'selectedTreeDSLIndex',
                'selectedDatasetFilterList',
                'relatedViewOpen',
                'selectedDataset',
                'galleryOpen',
                'galleryDSLObjDict',
                'showDSLInGalery',
                'showDSLLinkInGalery',
                'showLandmarkPoint',
                'showLandmarkPreview',
                'showExistTreePoint',
                'showExistTreePreview',
                'landmarkPreviewAmount',
                'refreshLandmarkPreviewState',
                'selectedNodeListInThumbnail'
            ])
        },
        methods: {
            ...mapMutations([
                'UPDATE_SELECTED_TREE_DSL_OBJ',
                'UPDATE_RELATED_VIEW_OPEN',
                'UPDATE_GALLERY_OPEN',
                'UPDATE_GALLERY_DSL_OBJ_DICT',
                'UPDATE_DISPLAY_TAP_NAME',
                'UPDATE_CURRENT_TREE_DSL_ARRAY',
                'UPDATE_TREEUNIT_DSL_NAME',
                'UPDATE_TREEUNIT_DSL_ARRAY',
                'UPDATE_TREE_UNIT_LAYOUT_STATE',
                'UPDATE_TREE_CANVAS_LAYOUT_STATE',
                'UPDATE_SELECTED_NODE_LIST_IN_THUMBNAIL'
            ]),
            computeDisplayState: function (singleRepresentativeObj) {
                if (singleRepresentativeObj['hidden']) {
                  return !singleRepresentativeObj['hidden']
                }
                if ((singleRepresentativeObj['type'] === 'existed') && (!this.showExistTreePreview)) {
                    return false
                }
                if ((singleRepresentativeObj['type'] === 'preview') && (!this.showLandmarkPreview)) {
                    return false
                }
                return true
            },
            point_transform: function (d) {
                return "translate(" + d3.zoomIdentity.apply(d) + ")";
            },
            formatTooltip: function (val) {
                return val
            },
            getTreeVisDSLObj: function(singleRepresentativeObj) {
                let treeDslIndex = singleRepresentativeObj['index']
                return sysDatasetObj['treeVisDSLObjCollection'][treeDslIndex]
            },
            changeLoadRepresentativeItemType: function(itemType) {
                let self = this
                let transformEvent = self.transformEvent
                self.updateZoomingRatio(transformEvent)
                // self.zoomIntoSelectedItem(itemType)
            },
            zoomIntoSearchResults: function() {
                let self = this
                let avgItemPos = [0, 0]
                let cluster_inner_neighbor = this.treevisSearchResult['cluster_inner_neighbor']
                for (let i = 0; i < cluster_inner_neighbor.length; i++) {
                    let item_index = cluster_inner_neighbor[i]
                    let item_pos = this.wholeProjectionPosItemList[item_index]
                    avgItemPos[0] = avgItemPos[0] + item_pos[0]
                    avgItemPos[1] = avgItemPos[1] + item_pos[1]
                }
                avgItemPos[0] = avgItemPos[0] / cluster_inner_neighbor.length
                avgItemPos[1] = avgItemPos[1] / cluster_inner_neighbor.length
                this.zoomOperation(avgItemPos, this.maxZoomRatio)
            },
            initViewSize: function() {
                let treeVisMapContainerRef = this.treeVisMapContainerRef
                let legendContainerRef = this.legendContainerRef
                let thumbnailContainerRef = this.thumbnailContainerRef
                let treeVisMapCanvasHeight = this.$refs[treeVisMapContainerRef].clientHeight;
                let treeVisMapCanvasWidth = this.$refs[treeVisMapContainerRef].clientWidth;
                let legendViewWidth  = this.$refs[legendContainerRef].clientWidth;
                let legendViewHeight  = this.$refs[legendContainerRef].clientHeight;
                let thumbnailContainerWidth = this.$refs[thumbnailContainerRef].clientWidth;
                let thumbnailContainerHeight = this.$refs[thumbnailContainerRef].clientHeight;
                // initialize the thumbnail width and height
                this.thumbnailContainerWidth = thumbnailContainerWidth
                this.thumbnailContainerHeight = thumbnailContainerHeight
                // record the original height and width of tree vis map canvas
                this.treeVisMapCanvasWholeHeight = treeVisMapCanvasHeight
                this.treeVisMapCanvasWholeWidth = treeVisMapCanvasWidth
                this.treeVisMapCanvasUpdateYThreshold = treeVisMapCanvasHeight / 120
                this.treeVisMapCanvasUpdateXThreshold = treeVisMapCanvasWidth / 120
                // initialize the paddings (left, right, top, bottom), canvas width, and canvas height
                this.treeVisMapCanvasPaddingTop = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['top']
                this.treeVisMapCanvasPaddingBottom = treeVisMapCanvasHeight * this.treeVisMapCanvasPadding['bottom']
                this.treeVisMapCanvasPaddingLeft = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['left']
                this.treeVisMapCanvasPaddingRight = treeVisMapCanvasWidth * this.treeVisMapCanvasPadding['right']
                this.treeVisMapCanvasHeight = treeVisMapCanvasHeight - this.treeVisMapCanvasPaddingTop - this.treeVisMapCanvasPaddingBottom
                this.treeVisMapCanvasWidth = treeVisMapCanvasWidth - this.treeVisMapCanvasPaddingLeft - this.treeVisMapCanvasPaddingRight
                this.legendPaddingTopBottom = legendViewHeight * 0.04
                this.legendPaddingLeftRight = legendViewWidth * 0.02
                this.legendCanvasWidth = legendViewWidth - this.legendPaddingLeftRight * 2
                this.legendCanvasHeight = legendViewHeight - this.legendPaddingTopBottom * 2
            },
            initTransformEvent: function() {
                this.transformEvent = d3.zoomIdentity
            },
            // initialize the node array object, including both preview and the selected item
            initNodeArrayWithValueObj: function() {
                let self = this
                // let nodeArrayWithValueObj = sysDatasetObj.getPreviewNodeArrayWithValueObj()
                self.nodeArrayWithValueObjPreview = sysDatasetObj.getNodeArrayWithValueObjPreview()
                self.nodeArrayWithValueObjSelect = sysDatasetObj.getNodeArrayWithValueObjSelect()
            },
            initHierarchicalDataObj: function () {
                let self = this
                // let hierarchicalDataObj = sysDatasetObj.getTreeDataset()
                self.hierarchicalDataPreview = sysDatasetObj.getTreeDatasetPreview()
                self.hierarchicalDataSelect = sysDatasetObj.getTreeDatasetSelect()
            },
            initNodeArrayWithValue: function() {
                let self = this
                self.nodeArrayWithValuePreview = sysDatasetObj.getNodeArrayWithValuePreview()
                self.nodeArrayWithValueSelect = sysDatasetObj.getNodeArrayWithValueSelect()
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
                // data -> pox scale
                this.xScale = d3.scaleLinear()
                  .domain(valueExtentX)
                  .range([0, treeVisMapCanvasWidth])
                this.yScale = d3.scaleLinear()
                  .domain(valueExtentY)
                  .range([treeVisMapCanvasHeight, 0])
                // pos -> data revert scale
                this.xScaleRevert = d3.scaleLinear()
                  .domain([0, treeVisMapCanvasWidth])
                  .range(valueExtentX)
                this.yScaleRevert = d3.scaleLinear()
                  .domain([treeVisMapCanvasHeight, 0])
                  .range(valueExtentY)
            },
            updateFilterFormData: function(designFeatureDatasetFilterObjList) {
                let self = this
                let filterFormDataCriteria = {}
                for(let i = 0;i < designFeatureDatasetFilterObjList.length; i++) {
                    let designFeatureDatasetFilterObj = designFeatureDatasetFilterObjList[i]
                    let filterQueryContent = designFeatureDatasetFilterObj['query']
                    filterFormDataCriteria[i] = filterQueryContent
                }
                this.filterFormData = {'criteria': filterFormDataCriteria}
            },
            forceUpdateZoomingRatio: function(zoomingRatio) {
                let self = this
                let treeVisMapCanvasHeight = self.treeVisMapCanvasWholeHeight
                let treeVisMapCanvasWidth = self.treeVisMapCanvasWholeWidth
                let transformEvent = d3.zoomIdentity
                    .translate(treeVisMapCanvasWidth/2, treeVisMapCanvasHeight/2)
                    .scale(zoomingRatio)
                    .translate(-treeVisMapCanvasWidth/2, -treeVisMapCanvasHeight/2);
                self.updateZoomingRatio(transformEvent)
           //   let loadClusterDefer = $.Deferred();
           //   $.when(loadClusterDefer)
                    // .done(function() {
                    //  self.updateUnderlyingDataset()
                    //  self.updateWholeProjectionView()
                    //  self.treeCanvasDefaultPreviewKey = (self.treeCanvasDefaultPreviewKey + 1) % 2
                    // })
     //             self.loadClusterResults(loadClusterDefer)
            },
            addRepresentative2Gallery: function() {
                let self = this
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let selectedDSLIndex = self.selectedDSLIndex
                let representativeItemList = self.representativeItemList
                let representativeItemDict = self.representativeItemDict
                if (self.showDSLInGalery) {
                    for (let dslIndex in self.galleryDSLObjDict) {
                        if (typeof(representativeItemDict[dslIndex]) === 'undefined') {
                            let itemObj = wholeProjectionPosItemList[dslIndex]
                            representativeItemList.push(itemObj)
                        }
                    }
                }
            },
            zoomIntoSelectedTraditionalTree: function(datasetFilterObj) {
                let self = this
                let wholeProjectionPosItemList = this.wholeProjectionPosItemList
                // extract the position of selected dsl
                let selectedTraditionalTreeNodeList = []
                let selectedDSLIndex = datasetFilterObj['index']
                let selectedDSLPos = wholeProjectionPosItemList[selectedDSLIndex]
                // update the selectedTraditionalTreeNodeList 
                let selectedTraditionalTreeNode = [selectedDSLPos[0], selectedDSLPos[1], selectedDSLIndex]
                selectedTraditionalTreeNodeList.push(selectedTraditionalTreeNode)
                this.selectedTraditionalTreeNodeList = selectedTraditionalTreeNodeList
                // zoom into the position of selected dsl
                this.zoomOperation(selectedDSLPos, this.maxZoomRatio, function() {
                    // let selectedDSLPosUpdate = transform_event.apply(selectedDSLPos)
                    // update the position of the traditional tree node
                    // self.updateTraditionalTreeNode(transform_event)
                    self.setSelectedDSLObject(selectedDSLIndex)
                })
            },
            updateTraditionalTreeNode: function(transform_event) {
                let self = this
                let selectedTraditionalTreeNodeList = this.selectedTraditionalTreeNodeList
                if (selectedTraditionalTreeNodeList.length == 0) {
                    return
                }
                let selectedDSLIndex = selectedTraditionalTreeNodeList[0][2]
                let traditionalTreeVisContainer = d3.select(self.$el).select('.traditional-treevis-container')
                // remove all the treevis ndoe at first
                // traditionalTreeVisContainer.selectAll('.traditional-treevis-node').remove()
                let traditionalTreeVisNodes = traditionalTreeVisContainer
                    .selectAll('.traditional-treevis-node')
                    .data(selectedTraditionalTreeNodeList)
                traditionalTreeVisNodes.enter()
                    .append('circle')
                    .attr('class', 'traditional-treevis-node treevis-node')
                    .attr('id', function(d, i) {
                        return 'treevis-node-' + d[2]
                    })
                    .attr("transform", self.treeVisNodeTransform(transform_event))
                    .on('click', function(d, i) {
                        let thisNode = this
                        self.treevisNodeClickHandler(thisNode, d)
                    })
                    .on('mouseover', function(d, i) {
                        self.mouseoverHandler(d, transform_event)
                    })
                    .on('mouseout', function(d, i) {
                        self.hideTooltip()
                    })
                traditionalTreeVisNodes
                    .on('mouseover', function(d, i) {
                        self.mouseoverHandler(d, transform_event)
                    })
                    .attr("transform", self.treeVisNodeTransform(transform_event))
                traditionalTreeVisNodes.exit().remove()
            },
            updateZoomingRatio: function(transform_event) {
                let self = this
                let loadClusterDefer = $.Deferred();
                $.when(loadClusterDefer)
                    .done(function() {
                        let zoom_end = true
                        self.updateUnderlyingDataset()
                        // self.filterPreviewRepresentativeObjList(transform_event)
                        self.updateWholeProjectionView(transform_event, zoom_end)
                        self.updateUnderlyingDataState = false
                        // self.renderWholeProjectionView()
                        // self.treeCanvasDefaultPreviewKey = (self.treeCanvasDefaultPreviewKey + 1) % 2
                        // self.treeCanvasDefaultPreviewKey = (self.treeCanvasDefaultPreviewKey + 1) % 2
                    })
                // whether update the underlying dataset
                let transform_ratio = transform_event.k
                let zoomingRatioChangeThreshold = self.zoomingRatioChangeThreshold
                // the specific handler for the zoomming end enven
                self.zoomingRatio = transform_ratio
                // indicate that the system is in the state of updaing underlying dataset
                self.updateUnderlyingDataState = true
                self.loadClusterResults(loadClusterDefer)
                //      if (Math.abs(self.zoomingRatio - transform_ratio) > zoomingRatioChangeThreshold) {
                //          // the specific handler for the zoomming end enven
                //          self.zoomingRatio = transform_ratio
                //          self.loadClusterResults(loadClusterDefer)
                //      } else {
                //          loadClusterDefer.resolve()
                //      }
            },
            initZoomOperator: function() {
                let self = this
                let minZoomRatio = self.minZoomRatio
                let maxZoomRatio = self.maxZoomRatio
                let zoomOperator = d3.zoom().scaleExtent([minZoomRatio, maxZoomRatio]).on("zoom", self.zoomHandler)
                self.zoomOperator = zoomOperator
            },
            renderWholeProjectionView: function() {
                // render contour
                this.renderContour()
                // render the projection nodes
                this.renderTreeVisNode()
                // render the projection nodes of existed tree visualizations
                this.renderExistedTreeVisNode()
                // append the zooming background
                this.renderZoomedRect()
                // render landscape legend
                this.updateLandscapeLegend()
            },
            updateExistedTreeVisNode: function(transform_event, zoom_end) {
                let self = this
                // filter the existed treevis item at first, then update the view
                let existedTreeVisItemList = self.existedTreeVisItemList
                let existedTreeVisItemListRemained = []
                let treeVisMapCanvasWholeHeight = self.treeVisMapCanvasWholeHeight
                let treeVisMapCanvasWholeWidth = self.treeVisMapCanvasWholeWidth
                let symbolGenerator = d3.symbol().size(self.existedNodeSize).type(d3.symbolStar);
                for (let i = 0; i < existedTreeVisItemList.length; i++) {
                    let projectionPos = existedTreeVisItemList[i]
                    let projectionPosUpdate = transform_event.apply(projectionPos)
                    let projectionPosX = projectionPosUpdate[0]
                    let projectionPosY = projectionPosUpdate[1]
                    if ((projectionPosX >= 0) && (projectionPosX <= treeVisMapCanvasWholeWidth) && (projectionPosY >= 0) && (projectionPosY <= treeVisMapCanvasWholeHeight)) {
                        existedTreeVisItemListRemained.push(projectionPos)
                    }
                }
                // update the projection results
                let existedTreeVisItems = d3.select(self.$el)
                    .select('.existed-treevis-container')
                    .selectAll(".existed-treevis-node-group")
                    .data(existedTreeVisItemListRemained, function(d, i) {
                        return 'node-' + d[2]
                    })
                existedTreeVisItems
                    .attr('class', function(d, i) {
                        let dslIndex = d[2]
                        let nodeClass = 'existed-treevis-node-group'
                        if (dslIndex == self.selectedDSLIndex) {
                            nodeClass += ' selected'
                        }
                        if ((typeof(self.galleryDSLObjDict[dslIndex]) !== 'undefined') && (self.showDSLInGalery)) {
                            nodeClass += ' in-gallery'
                        }
                        return nodeClass
                    })
                    .attr("transform", self.treeVisNodeTransform(transform_event))
                    .on('mouseover', function(d, i) {
                        self.mouseoverHandler(d, transform_event)
                    });
                existedTreeVisItems.exit().remove()
                if (zoom_end) {
                    existedTreeVisItems.enter()
                        .append('g')
                        .attr('class', 'existed-treevis-node-group')
                        .attr("transform", self.treeVisNodeTransform(transform_event))
                        .attr('id', function(d, i) {
                            return 'existed-treevis-node-group-' + d[2]
                        })
                        .append("path")
                        .attr('d', function(d, i) {
                            return symbolGenerator()
                        })
                        .attr('class', function(d, i) {
                            let dslIndex = d[2]
                            let nodeClass = 'existed-treevis-node'
                            if (dslIndex == self.selectedDSLIndex) {
                                nodeClass += ' selected'
                            }
                            if (typeof(self.galleryDSLObjDict[dslIndex]) !== 'undefined') {
                                nodeClass += ' in-gallery'
                            }
                            return nodeClass
                        })
                        .attr('id', function(d, i) {
                            return 'existed-treevis-node-' + d[2]
                        })
                        .on('mouseover', function(d, i) {
                            // setting the position of tooltip
                            // d3.select(this).classed('hovering-node', true)
                            self.mouseoverHandler(d, transform_event)
                        })
                        .on('mouseout', function(d, i) {
                            // d3.select(this).classed('hovering-node', true)
                            self.hideTooltip()
                        })
                        .on('click', function(d, i) {
                            let dslIndex = d[2]
                            let dslObj = d
                            let thisNode = this
                            self.treevisNodeClickHandler(thisNode, dslObj)
                        })
                }
            },
            updateProjectionPoints: function (transform_event, zoom_end) {
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
                projectionTreeItems
                    .attr('class', function(d, i) {
                        let dslIndex = d[2]
                        let nodeClass = 'treevis-node'
                        if (dslIndex == self.selectedDSLIndex) {
                            nodeClass += ' selected'
                        }
                        if ((typeof(self.galleryDSLObjDict[dslIndex]) !== 'undefined') && (self.showDSLInGalery)) {
                            nodeClass += ' in-gallery'
                        }
                        return nodeClass
                    })
                    .attr("transform", self.treeVisNodeTransform(transform_event))
                    .on('mouseover', function(d, i) {
                        self.mouseoverHandler(d, transform_event)
                    });
                projectionTreeItems.exit().remove()
                if (zoom_end) {
                    projectionTreeItems.enter()
                        .append("circle")
                        .attr('class', function(d, i) {
                            let dslIndex = d[2]
                            let nodeClass = 'treevis-node'
                            if (dslIndex == self.selectedDSLIndex) {
                                nodeClass += ' selected'
                            }
                            if (typeof(self.galleryDSLObjDict[dslIndex]) !== 'undefined') {
                                nodeClass += ' in-gallery'
                            }
                            return nodeClass
                        })
                        .attr('id', function(d, i){
                            return 'treevis-node-' + d[2]
                        })
                        .attr("transform", self.treeVisNodeTransform(transform_event))
                        .on('mouseover', function(d, i) {
                            // setting the position of tooltip
                            // d3.select(this).classed('hovering-node', true)
                            self.mouseoverHandler(d, transform_event)
                        })
                        .on('mouseout', function(d, i) {
                            // d3.select(this).classed('hovering-node', true)
                            self.hideTooltip()
                        })
                        .on('click', function(d, i) {
                            let dslIndex = d[2]
                            let dslObj = d
                            let thisNode = this
                            self.treevisNodeClickHandler(thisNode, dslObj)
                          })
                }
            },
            mouseoverHandler: function(d, transform_event=null) {
                let self = this
                let selectedNodeIndex = d[2]
                let singleItemAttrs = self.wholeProjectionPosItemList[selectedNodeIndex]
                let projectionPos = [singleItemAttrs[0], singleItemAttrs[1]]
                let projectionPosUpdate = projectionPos
                if (transform_event != null) {
                    projectionPosUpdate = transform_event.apply(projectionPos)
                }
                self.setTooltipPos(projectionPosUpdate)
                self.showTooltip(selectedNodeIndex)
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
                // update the underlying contour
                let clusterContourContainer = d3.select(self.$el)
                    .select('.contour-container')
                    .selectAll(".cluster-contour-container")
                    .data(clusterContentItemListRemained, function(d, i) {
                        return 'cluster-contour-container-' + i
                    })
                let clusterContourAddedContainer = clusterContourContainer.enter()
                    .append('g')
                    .attr('class', 'cluster-contour-container')
                    .attr('id', function(d, i) {
                        return 'cluster-contour-container-' + i
                    })
                // append or update the visual element in the tree vis glyph container
                clusterContourAddedContainer.selectAll('.projection-contour')
                    .data(d => self.contour(d))
                    .enter()
                    .append("path")
                    .attr('class', 'projection-contour')
                    .attr("d", d3.geoPath())
                    .style('stroke', function(d, i) {
                        let parentGroupElementId = d3.select(this.parentNode).attr('id')
                        let clusterIndex = parentGroupElementId.replace('cluster-contour-container-', '')
                        clusterIndex = parseInt(clusterIndex)
                        return self.clusterColorList[clusterIndex%colorLength]
                    })
                // existed contour group, update the inner content, including enter, update, exit
                let clusterInnerContour = clusterContourContainer.selectAll(".projection-contour")
                    .data(d => self.contour(d))
                clusterInnerContour.enter()
                    .append("path")
                    .attr('class', 'projection-contour')
                    .attr("d", d3.geoPath())
                    .style('stroke', function(d, i) {
                        let parentGroupElementId = d3.select(this.parentNode).attr('id')
                        let clusterIndex = parentGroupElementId.replace('cluster-contour-container-', '')
                        clusterIndex = parseInt(clusterIndex)
                        return self.clusterColorList[clusterIndex%colorLength]
                    })
                clusterInnerContour.attr("d", d3.geoPath())
                clusterInnerContour.exit().remove()
                // remove the redundant contour group
                clusterContourContainer.exit().remove()
            },
            updateTreevisPreviewRepresentatives: function (transform_event, zoom_end) {
                let self = this
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let previewRepresentativeObjList = self.previewRepresentativeObjList
                let remainedPreviewRepresentativeObjList = []
                let previewOverlappingThreshold = self.previewOverlappingThreshold
                for (let i = 0; i < previewRepresentativeObjList.length; i++) {
                    let previewRepresentativeObj = previewRepresentativeObjList[i]
                    // initialize the previewRepresentativeObj as visible at the begining
                    let dslIndex = previewRepresentativeObj['index']
                    let projectionPos = wholeProjectionPosItemList[dslIndex]
                    let projectionPosUpdate = transform_event.apply(projectionPos)
                    let projectionPosX = projectionPosUpdate[0]
                    let projectionPosY = projectionPosUpdate[1]
                    previewRepresentativeObj['x'] = projectionPosX
                    previewRepresentativeObj['y'] = projectionPosY
                    // initialize the hidden attribute as true
                }
                if (zoom_end) {
                    // update the preview representative object only when end zooming
                    for (let i = 0; i < previewRepresentativeObjList.length; i++) {
                        let previewRepresentativeObj = previewRepresentativeObjList[i]
                        // previewRepresentativeObj['hidden'] = false
                        // when update the underlying data is based on the transform event (because we send the parameter transform_event, then filter the preview representative object list
                        if (!self.withinScreenSpace(previewRepresentativeObj)) {
                            previewRepresentativeObj['hidden'] = true
                        } else {
                            remainedPreviewRepresentativeObjList.push(previewRepresentativeObj)
                        }
                    }
                    // compute the overlappings among the preview representatives according to their distance along x and y
                    // for (let i = 0; i < remainedPreviewRepresentativeObjList.length; i++) {
                    //  // this loop is to compute whether the preview representative object indicated by i can be keeped
                    //  let basedPreviewX = remainedPreviewRepresentativeObjList[i]['x']
                    //  let basedPreviewY = remainedPreviewRepresentativeObjList[i]['y']
                    //  for (let j = 0; j < i; j++) {
                    //      if (!remainedPreviewRepresentativeObjList[j]["hidden"]) {
                    //          // the representative object is visible
                    //          let compPreviewX = remainedPreviewRepresentativeObjList[j]['x']
                    //          let compPreviewY = remainedPreviewRepresentativeObjList[j]['y']
                    //          if ((Math.abs(compPreviewX - basedPreviewX) < previewOverlappingThreshold) && (Math.abs(compPreviewY - basedPreviewY) < previewOverlappingThreshold)) {
                    //              remainedPreviewRepresentativeObjList[i]['hidden'] = true
                    //              break
                    //          }
                    //      }
                    //  }
                    // }
                }
                // TODO 
                // remove the severe overlapped selected preview representative tree visualizations
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
            updateWholeProjectionView: function(transform_event, zoom_end=false) {
                let self = this
                // render zoom rectangle
                self.renderZoomedRect()
                // update projection contour
                self.updateProjectionContour(transform_event)
                // update projection points
                self.updateProjectionPoints(transform_event, zoom_end)
                // update the traditional tree vis points
                self.updateTraditionalTreeNode(transform_event)
                // update existed treevis node points
                self.updateExistedTreeVisNode(transform_event, zoom_end)
                // update default tree vis preview figure
                self.updateTreevisPreviewRepresentatives(transform_event, zoom_end)
                // update legend
                self.updateLandscapeLegend()
            },
            updateUnderlyingDataset: function() {
                // compute the items in different clusters
                // this.clusterContentItemList = this.separateItemByCluster()
                this.clusterContentItemList = this.updateClusterContentItemList()
                // extract the representative elements from clusters
                this.representativeItemList = this.selectRepresentative()
                // compute the existed elements
                this.existedTreeVisItemList = this.selectExistedTreeVisItemList()
                // change representativeItemList to representativeItem dict, the key is the dsl index
                this.representativeItemDict = this.transformRepresentativeItemList2Dict()
                // console.log('this.representativeItemDict', this.representativeItemDict)
                // extract the preview representative elements from clusters
                this.arrangePreviewRepresentativeObjList() //this.previewRepresentativeObjList = 
                // add tree visualization in gallery into the representative list
                this.addRepresentative2Gallery()
            },
            transformRepresentativeItemList2Dict: function() {
                let self = this
                let representativeItemList = this.representativeItemList
                let existedTreeVisItemList = this.existedTreeVisItemList
                let representativeItemDict = {}
                for (let i = 0; i < representativeItemList.length; i++) {
                    let dslIndex = representativeItemList[i][2]
                    representativeItemDict[dslIndex] = representativeItemList[i]
                }
                for (let i = 0; i < existedTreeVisItemList.length; i++) {
                    let dslIndex = existedTreeVisItemList[i][2]
                    representativeItemDict[dslIndex] = existedTreeVisItemList[i]
                }
                return representativeItemDict
            },
            selectTreeVisPreview: function(singleRepresentativeObj) {
                let self = this
                let dslIndex = singleRepresentativeObj['index']
                d3.select(self.$el).select('.tree-vis-map-svg')
                  .selectAll('.treevis-node').classed('selected', false)
                if (dslIndex === this.selectedDSLIndex) {
                    self.resetSelectedDSLObject()
                } else {
                    self.setSelectedDSLObject(dslIndex)
                }
            },
            hoverTreeVisPreview: function() {
                this.hideTooltip()
            },
            updateLandscapeLegend: function() {
                let self = this
                let legendCanvasHeight = self.legendCanvasHeight
                let legendCanvasWidth = self.legendCanvasWidth
                let labelLeftPadding = 35
                let circleLeftPadding = 10
                let contourColorCategoryNum = d3.select(self.$el)
                    .select('.tree-vis-map-svg')
                    .select('.contour-container')
                    .selectAll('.projection-contour')
                    .size()
                let singleLegendTypeHeight = legendCanvasHeight / 5
                let contourColorLevelList = []
                let legendGroup = d3.select(self.$el).select('.legend-svg')
                        .select('.legend-svg-g')
                for(let i = 0; i < contourColorCategoryNum; i++) {
                    contourColorLevelList.push(i)
                }
                let contourColorLevelWidth = legendCanvasWidth / contourColorLevelList.length
                let contourColorCategory = legendGroup
                    .selectAll('.legend-contour-level-color')
                    .data(contourColorLevelList)
                contourColorCategory.enter()
                    .append('rect')
                    .attr('class', 'legend-contour-level-color')
                    .attr('width', contourColorLevelWidth)
                    .attr('height', singleLegendTypeHeight)
                    .attr('x', function(d, i) {
                        return contourColorLevelWidth * i
                    })
                    .attr('y', 0)
                    .attr('fill', '#E3120b')
                    .style('fill-opacity', function(d, i) {
                        return 0.06 * (i + 1)
                    })
                contourColorCategory.attr('width', contourColorLevelWidth)
                    .attr('height', singleLegendTypeHeight)
                    .attr('x', function(d, i) {
                        return contourColorLevelWidth * i
                    })
                    .attr('y', 0)
                    .attr('fill', '#E3120b')
                    .style('fill-opacity', function(d, i) {
                        return 0.06 * (i + 1)
                    })
                contourColorCategory.exit().remove()
                // append color legend start label
                if (legendGroup.select('.color-legend-label').empty()) {
                    legendGroup.append('text')
                        .attr('class', 'color-legend-label color-legend-label-start')
                        .attr('x', 0)
                        .attr('y', singleLegendTypeHeight)
                        .attr('text-anchor', 'start')
                        .attr('dominant-baseline', 'hanging')
                        .text('sparse')
                    legendGroup.append('text')
                        .attr('class', 'color-legend-label color-legend-label-end')
                        .attr('x', legendCanvasWidth)
                        .attr('y', singleLegendTypeHeight)
                        .attr('text-anchor', 'end')
                        .attr('dominant-baseline', 'hanging')
                        .text('dense')
                }
                // append landmark circle
                if (legendGroup.select('.landmark').empty()) {
                    legendGroup.append('circle')
                        .attr('class', 'landmark')
                        .attr('cx', circleLeftPadding)
                        .attr('cy', singleLegendTypeHeight * 2.5)
                    legendGroup.append('text')
                        .attr('class', 'landmark-label')
                        .attr('x', labelLeftPadding)
                        .attr('y', singleLegendTypeHeight * 2.5)
                        .text('landmark')
                        .attr('dominant-baseline', 'middle')
                }
                // append selected landmark
                if (legendGroup.select('.selected-landmark').empty()) {
                    legendGroup.append('circle')
                        .attr('class', 'selected-landmark')
                        .attr('cx', circleLeftPadding)
                        .attr('cy', singleLegendTypeHeight * 3.5)
                    legendGroup.append('text')
                        .attr('class', 'selected-landmark-label')
                        .attr('x', labelLeftPadding)
                        .attr('y', singleLegendTypeHeight * 3.5)
                        .text('selected landmark')
                        .attr('dominant-baseline', 'middle')
                }
                // append landmark in gallery
                if (legendGroup.select('.landmark-in-gallery').empty()) {
                    legendGroup.append('circle')
                        .attr('class', 'landmark-in-gallery')
                        .attr('cx', circleLeftPadding)
                        .attr('cy', singleLegendTypeHeight * 4.5)
                    legendGroup.append('text')
                        .attr('class', 'landmark-in-gallery-label')
                        .attr('x', labelLeftPadding)
                        .attr('y', singleLegendTypeHeight * 4.5)
                        .text('treevis in gallery')
                        .attr('dominant-baseline', 'middle')
                }
            },
            updateClusterContentItemList: function() {
                let self = this
                let drawingProjectionPosItemList = self.drawingProjectionPosItemList
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let drawingProjectionPosItemIndexSet = self.drawingProjectionPosItemIndexSet
                if (drawingProjectionPosItemIndexSet == null) {
                    return [wholeProjectionPosItemList]
                } else {
                    let singleClusterItemList = []
                    let drawingProjectionPosItemIndexList = [...drawingProjectionPosItemIndexSet];
                    for(let i = 0; i < drawingProjectionPosItemIndexList.length; i++) {
                        let itemIndex = drawingProjectionPosItemIndexList[i]
                        singleClusterItemList.push(wholeProjectionPosItemList[itemIndex])
                    }
                    return [singleClusterItemList]
                }
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
                return clusterContentItemList
            },
            selectRepresentative: function() {
                let self = this
                let representativeItemList = []
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let clusterRepresentativeList = self.clusterRepresentativeList
                let drawingProjectionPosItemIndexSet = self.drawingProjectionPosItemIndexSet
                for (let i = 0; i < clusterRepresentativeList.length; i++) {
                    let itemIndex = clusterRepresentativeList[i]
                    let itemObj = wholeProjectionPosItemList[itemIndex]
                    if ((drawingProjectionPosItemIndexSet == null) || (drawingProjectionPosItemIndexSet.has(itemIndex))) {
                        if (typeof(itemObj) !== 'undefined') {
                            // add the cluster index to each record
                            representativeItemList.push(itemObj)
                        } 
                    }
                }
                // for (let clusterIndex = 0; clusterIndex < clusterRepresentativeList.length; clusterIndex++) {
                //  let representativeList = clusterRepresentativeList[clusterIndex]
                //  for (let j = 0; j < representativeList.length; j++) {
                //      let itemIndex = representativeList[j]
                //      let itemObj = wholeProjectionPosItemList[itemIndex]
                //      if ((drawingProjectionPosItemIndexSet == null) || (drawingProjectionPosItemIndexSet.has(itemIndex))) {
                //          if (typeof(itemObj) !== 'undefined') {
                //              // add the cluster index to each record
                //              itemObj.push(clusterIndex)
                //              representativeItemList.push(itemObj)
                //          } 
                //      }
                //  }
                // }
                return representativeItemList
            },
            selectExistedTreeVisItemList: function() {
                let self = this
                let existedTreeVisItemList = []
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let existedTreeVisIndexList = self.existedTreeVisIndexList
                let drawingProjectionPosItemIndexSet = self.drawingProjectionPosItemIndexSet
                for (let i = 0; i < existedTreeVisIndexList.length; i++) {
                    let itemIndex = existedTreeVisIndexList[i]
                    let itemObj = wholeProjectionPosItemList[itemIndex]
                    if ((drawingProjectionPosItemIndexSet == null) || (drawingProjectionPosItemIndexSet.has(itemIndex))) {
                        if (typeof(itemObj) !== 'undefined') {
                            // add the cluster index to each record
                            existedTreeVisItemList.push(itemObj)
                        } 
                    }
                }
                return existedTreeVisItemList
            },
            arrangePreviewRepresentativeObjList: function() {
                // arrange the 2d representative object list to 1d representative object list
                let previewRepresentativeObjList = this.previewRepresentativeObjList
                let wholeProjectionPosItemList = this.wholeProjectionPosItemList
                let previewOverlappingThreshold = this.previewOverlappingThreshold
                let drawingProjectionPosItemIndexSet = this.drawingProjectionPosItemIndexSet
                let transformEvent = this.transformEvent
                // for (let clusterIndex = 0; clusterIndex < previewClusterRepresentativeObjList.length; clusterIndex++) {
                //  let singleClusterRepresentativeObjList = previewClusterRepresentativeObjList[clusterIndex]
                for (let j = 0; j < previewRepresentativeObjList.length; j++) {
                    let singleRepresentativeObj = previewRepresentativeObjList[j]
                    let dslIndex = singleRepresentativeObj['index']
                    let projectionItemPosAttrs = wholeProjectionPosItemList[dslIndex]
                    let projectionItemPosAttrsUpdate = JSON.parse(JSON.stringify(projectionItemPosAttrs))
                    if ((typeof(transformEvent) !== 'undefined') && (transformEvent != null)) {
                        projectionItemPosAttrsUpdate = transformEvent.apply(projectionItemPosAttrsUpdate)
                    }
                    if ((drawingProjectionPosItemIndexSet == null) || (drawingProjectionPosItemIndexSet.has(dslIndex))) {
                        if (typeof(projectionItemPosAttrsUpdate) !== 'undefined') {
                            // initialize the position
                            singleRepresentativeObj['x'] = projectionItemPosAttrsUpdate[0]
                            singleRepresentativeObj['y'] = projectionItemPosAttrsUpdate[1]
                        }
                    }
                    if ((drawingProjectionPosItemIndexSet == null) || (drawingProjectionPosItemIndexSet.has(dslIndex))) {
                        singleRepresentativeObj['hidden'] = false
                    } else {
                        singleRepresentativeObj['hidden'] = true
                    }
                }
                // }
                // compute the overlappings among the preview representatives according to their distance along x and y
                // for (let i = 0; i < previewRepresentativeObjList.length; i++) {
                //  // this loop is to compute whether the preview representative object indicated by i can be keeped
                //  let basedPreviewX = previewRepresentativeObjList[i]['x']
                //  let basedPreviewY = previewRepresentativeObjList[i]['y']
                //  for (let j = 0; j < i; j++) {
                //      if (!previewRepresentativeObjList[j]["hidden"]) {
                //          // the representative object is visible
                //          let compPreviewX = previewRepresentativeObjList[j]['x']
                //          let compPreviewY = previewRepresentativeObjList[j]['y']
                //          if ((Math.abs(compPreviewX - basedPreviewX) < previewOverlappingThreshold) && (Math.abs(compPreviewY - basedPreviewY) < previewOverlappingThreshold)) {
                //              previewRepresentativeObjList[i]['hidden'] = true
                //              break
                //          }
                //      }
                //  }
                // }
                // return previewRepresentativeObjList
            },
            loadProjectionResults: function(deferObj) {
                let self = this
                getProjectionResults().then(function(projectionResults) {
                    let wholeProjectionPosItemList = self.computeProjectionPosResults(projectionResults)
                    self.projectionResults = projectionResults
                    self.wholeProjectionPosItemList = wholeProjectionPosItemList
                    deferObj.resolve()
                })
            },
            computeDisplayAndDataRange: function() {
                let self = this
                let displayRange = {'x': [-100000, 100000], 'y': [-100000, 100000]}
                let displayRangeRatio = {'x': [0, 1], 'y': [0, 1]}
                let displayedDataRange = {'x': [-100000, 100000], 'y': [-100000, 100000]}
                if ((self.xScaleRevert != null) && (self.yScaleRevert != null)) {
                    //  revert to compute the range
                    let xRangeMin = 0, xRangeMax = self.treeVisMapCanvasWidth
                    let yRangeMin = 0, yRangeMax = self.treeVisMapCanvasHeight
                    let transformEvent = self.transformEvent
                    let displayedMinX = transformEvent.invertX(xRangeMin), displayedMaxX = transformEvent.invertX(xRangeMax)
                    let displayedMinY = transformEvent.invertY(yRangeMin), displayedMaxY = transformEvent.invertY(yRangeMax)
                    let dataRangeMinX = self.xScaleRevert(displayedMinX), dataRangeMaxX = self.xScaleRevert(displayedMaxX)
                    let dataRangeMaxY = self.yScaleRevert(displayedMinY), dataRangeMinY = self.yScaleRevert(displayedMaxY)
                    displayedDataRange = {'x': [dataRangeMinX, dataRangeMaxX], 'y': [dataRangeMinY, dataRangeMaxY]}
                    displayRange = {'x': [displayedMinX, displayedMaxX], 'y': [displayedMinY, displayedMaxY]}
                    // compute ratio of the display range
                    displayRangeRatio = {'x': [displayedMinX / xRangeMax, displayedMaxX / xRangeMax],  'y': [displayedMinY / yRangeMax, displayedMaxY / yRangeMax]}
                } 
                return {'data': displayedDataRange, 'display':displayRange, 'displayRatio': displayRangeRatio }
            },
            zoomChangeExceedThreshold: function(displayAndDataRangeBeforeUpdate, displayAndDataRange) {
                let self = this
                let dataRangeBeforeUpdate = displayAndDataRangeBeforeUpdate['data']
                let displayedRangeBeforeUpdate = displayAndDataRangeBeforeUpdate['display']
                let dataRange = displayAndDataRange['data']
                let displayRange = displayAndDataRange['display']
                let updateThresholdY = this.treeVisMapCanvasUpdateYThreshold
                let updateThresholdX = this.treeVisMapCanvasUpdateXThreshold
                let displayRangeXDiff0 = Math.abs(displayedRangeBeforeUpdate['x'][0] - displayRange['x'][0])
                let displayRangeXDiff1 = Math.abs(displayedRangeBeforeUpdate['x'][1] - displayRange['x'][1])
                let displayRangeYDiff0 = Math.abs(displayedRangeBeforeUpdate['y'][0] - displayRange['y'][0])
                let displayRangeYDiff1 = Math.abs(displayedRangeBeforeUpdate['y'][1] - displayRange['y'][1])
                let displayRangeXDiff = Math.max(displayRangeXDiff0, displayRangeXDiff1)
                let displayRangeYDiff = Math.max(displayRangeYDiff0, displayRangeYDiff1)
                if ((displayRangeXDiff > updateThresholdX) || (displayRangeYDiff > updateThresholdY)) {
                    return true
                }
                return false
            },
            loadClusterResults: function(deferObj) {
                let self = this
                let displayedLevel = self.displayedLevel
                let zoomingRatio = self.zoomingRatio
                let loadRepresentativeItemType = self.loadRepresentativeItemType
                let displayAndDataRange = self.computeDisplayAndDataRange()
                // update the record of displayAndDaraRange
                self.currentDisplayAndDataRange = displayAndDataRange
                self.displayedDataRange = displayAndDataRange['data']
                self.displayedRange = displayAndDataRange['display']
                self.displayRangeRatio = displayAndDataRange['displayRatio']
                // update the located cluster index, there are two conditions, 
                // 1. coverage -> locateClusterIndex = -1
                // 2. neighbor -> locateClusterIndex = xx
                let locateTreeVisIndex = self.selectedDSLIndex
                let treevisSearchResult = self.treevisSearchResult
                if (treevisSearchResult != null) {
                    locateTreeVisIndex = treevisSearchResult['tree_vis_index']
                }
                // when the selected tree vis index is -1, then the loadRepresentativeItemType is 'coverage'
                if (locateTreeVisIndex === -1) {
                    loadRepresentativeItemType = 'coverage' // coverage
                }
                let formData = {'level': displayedLevel, 'zoomRatio': zoomingRatio, 'treevisIndex': locateTreeVisIndex, 
                                'displayedDataRange': self.displayedDataRange, 'type': loadRepresentativeItemType}
                getClusterResultByLevel(formData, function(clusterResults) {
                    // self.clusterContentList = clusterResults['content']
                    // console.log('clusterContentList', self.clusterContentList)
                    // clusterRepresentativeList indicate the tree visualization dsl list shown through points directly
                    self.clusterRepresentativeList = clusterResults['representative']
                    // add selected item index to representative index list
                    self.addSelectedIndex2RepresentativeList()
                    // add item index in gallery to representative index list
                    self.addIndexInGallery2RepresentativeList()
                    // extract the representative elements from clusters
                    self.representativeItemList = self.selectRepresentative()
                    // change representativeItemList to representativeItem dict, the key is the dsl index
                    self.representativeItemDict = self.transformRepresentativeItemList2Dict()
                    // update the preview tree visualization dsl list according to the cluster representative list
                    self.updatePreviewRepresentativeList()
                    deferObj.resolve()
                })
            },
            // to keep the selected nodes in gallery always exist in the landscape
            addIndexInGallery2RepresentativeList: function() {
                let self = this
                let clusterRepresentativeList = self.clusterRepresentativeList
                let galleryDSLObjDict = self.galleryDSLObjDict
                for (let selectedDSLIndex in galleryDSLObjDict) {
                    if (clusterRepresentativeList.indexOf(selectedDSLIndex) === -1) {
                        clusterRepresentativeList.push(selectedDSLIndex)
                    }
                }
            },
            // to keep the clicked nodes always exist in the landscape
            addSelectedIndex2RepresentativeList: function() {
                let self = this
                let selectedDSLIndex = self.selectedDSLIndex
                let clusterRepresentativeList = self.clusterRepresentativeList
                if (selectedDSLIndex !== -1) {
                    if (clusterRepresentativeList.indexOf(selectedDSLIndex) === -1) {
                        clusterRepresentativeList.push(selectedDSLIndex)
                    }
                }
            },
            updatePreviewRepresentativeList: function(random_state=false) {
                let self = this
                // temporally commented
                // previewRepresentativeObjList
                let remainedPreviewClusterRepresentativeObjList = []
                let previewClusterRepresentativeIndexList = self.randomSelectPreviewRepresentative(random_state)
                // preview representative list contains existed tree visualizations
                let existedTreeVisIndexList = self.existedTreeVisIndexList
                let selectedTreeVisIndexList = []
                let representativeItemDict = self.representativeItemDict
                // check overlappings and add the non-overlappings tree visualizations into the previewIndexList
                if ((self.showExistTreePreview)) {
                    for (let i = 0; i < existedTreeVisIndexList.length; i++) {
                        let treevisIndex = existedTreeVisIndexList[i]
                        if (!self.checkPreviewOverlapping(selectedTreeVisIndexList, treevisIndex)) { // remove overlappings
                            let previewRepresentativeItem = {'type': 'existed', 'index': treevisIndex}
                            remainedPreviewClusterRepresentativeObjList.push(previewRepresentativeItem)
                            selectedTreeVisIndexList.push(treevisIndex)
                        }
                    }
                }
                // check overlappings and add the non-overlappings tree visualizations into the previewIndexList
                if (self.showLandmarkPreview) {
                    for (let i = 0; i < previewClusterRepresentativeIndexList.length; i++) {
                        let treevisIndex = Number(previewClusterRepresentativeIndexList[i])
                        if ((typeof(representativeItemDict[treevisIndex]) !== 'undefined') && (existedTreeVisIndexList.indexOf(treevisIndex) === -1)) {
                            let previewRepresentativeItem = {'type': 'preview', 'index': treevisIndex}
                            remainedPreviewClusterRepresentativeObjList.push(previewRepresentativeItem)
                        }
                    }
                }
                self.previewRepresentativeObjList = remainedPreviewClusterRepresentativeObjList
            },
            checkPreviewOverlapping: function(treevisIndexList, targetTreeVisIndex) {
                let self = this
                let transformEvent = self.transformEvent
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let targetTreeVisPos = wholeProjectionPosItemList[targetTreeVisIndex]
                targetTreeVisPos = transformEvent.apply(targetTreeVisPos)
                let targetTreeVisPosX = targetTreeVisPos[0], targetTreeVisPosY = targetTreeVisPos[1]
                let previewOverlappingThreshold = self.previewOverlappingThreshold
                let overlapping = false
                for (let i = 0; i < treevisIndexList.length; i++) {
                    let treeVisIndex = treevisIndexList[i]
                    let treeVisItemProjPos = wholeProjectionPosItemList[treeVisIndex]
                    treeVisItemProjPos = transformEvent.apply(treeVisItemProjPos)
                    let treeVisItemProjPosX = treeVisItemProjPos[0], treeVisItemProjPosY = treeVisItemProjPos[1]
                    if ((Math.abs(targetTreeVisPosX - treeVisItemProjPosX) < previewOverlappingThreshold) && (Math.abs(targetTreeVisPosY - treeVisItemProjPosY) < previewOverlappingThreshold)) {
                        overlapping = true
                        return overlapping
                    }
                }
                return overlapping
            },
            randomSelectPreviewRepresentative: function(random_state=false) {
                let self = this
                let clusterRepresentativeList = JSON.parse(JSON.stringify(self.clusterRepresentativeList))
                clusterRepresentativeList = clusterRepresentativeList.sort(() => Math.random() - 0.5)
                // previewRepresentativeObjList indicate the list of current preview representatives
                let previewRepresentativeObjList = self.previewRepresentativeObjList
                let wholeProjectionPosItemList = self.wholeProjectionPosItemList
                let updatedPreviewRepresentativeIndexList = []
                let displayedRange = self.displayedRange
                // select prevew representative meet the requirements from the previous preview list
                let selectedAmount = 0
                let selectedPreviewAmount = self.landmarkPreviewAmount
                let index_1 = 0, index_2 = 0
                if (!random_state) {
                    while ((index_1 < previewRepresentativeObjList.length) && (selectedAmount < selectedPreviewAmount)) {
                        let previewItem = previewRepresentativeObjList[index_1]
                        let previewType = previewItem['type']
                        if (previewType === 'existed') {
                            index_1 = index_1 + 1
                            continue
                        }
                        let previewItemIndex = Number(previewItem['index'])
                        let previewItemPos = wholeProjectionPosItemList[previewItemIndex]
                        if ((previewItemPos[0] > displayedRange['x'][0]) && (previewItemPos[0] < displayedRange['x'][1]) 
                                && (previewItemPos[1] > displayedRange['y'][0]) && (previewItemPos[1] < displayedRange['y'][1])) {
                            if (updatedPreviewRepresentativeIndexList.indexOf(previewItemIndex) === -1) { // remove duplicate
                                if (!self.checkPreviewOverlapping(updatedPreviewRepresentativeIndexList, previewItemIndex)) { // remove overlappings
                                    updatedPreviewRepresentativeIndexList.push(previewItemIndex)
                                    selectedAmount = selectedAmount + 1
                                }
                            }                       
                        }
                        index_1 = index_1 + 1
                    }
                }
                let within_range_count = 0, without_duplicate_count = 0, without_overlapping_count = 0
                while ((index_2 < clusterRepresentativeList.length) && (selectedAmount < selectedPreviewAmount)) {
                    let itemIndex = Number(clusterRepresentativeList[index_2])
                    let previewItemPos = wholeProjectionPosItemList[itemIndex]
                    within_range_count = within_range_count + 1
                    if (updatedPreviewRepresentativeIndexList.indexOf(itemIndex) === -1) { // remove duplicate
                        without_duplicate_count = without_duplicate_count + 1
                        if (!self.checkPreviewOverlapping(updatedPreviewRepresentativeIndexList, itemIndex)) { // remove overlappings
                            without_overlapping_count = without_overlapping_count + 1
                            updatedPreviewRepresentativeIndexList.push(itemIndex)
                            selectedAmount = selectedAmount + 1
                        }
                    }
                    index_2 = index_2 + 1
                }
                return updatedPreviewRepresentativeIndexList
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
            locateUploadingDslFileDatasetFilter: function(uploadingFileDatasetFilterObj, deferObj) {
                let self = this
                let treeJsonObj = uploadingFileDatasetFilterObj['content']
                if ((typeof(treeJsonObj) !== 'undefined') && (treeJsonObj != null)) { 
                    let formData = {'target': treeJsonObj}
                    // if the filtered formdata is valid
                    getUploadTreeVisProjectionPos(formData, function(searching_results) {
                        self.treevisSearchResult = searching_results
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
            moveToCenterScale: function (point, zoomingRatio) {
                let self = this
                let treeVisMapCanvasHeight = self.treeVisMapCanvasWholeHeight
                let treeVisMapCanvasWidth = self.treeVisMapCanvasWholeWidth
                return d3.zoomIdentity
                    .translate(treeVisMapCanvasWidth / 2, treeVisMapCanvasHeight / 2)
                    .scale(zoomingRatio)
                    .translate(-point[0], -point[1]);
            },
            zoomIntoSelectedItem: function(itemType) {
                let self = this
                let representativeItemDict = self.representativeItemDict
                let selectedDSLIndex = self.selectedDSLIndex
                if (selectedDSLIndex === -1) {
                    console.log('do not select the target tree visualization')
                    return
                }
                let selectedRepresentativeItem = representativeItemDict[selectedDSLIndex]
                let nodePos = [selectedRepresentativeItem[0], selectedRepresentativeItem[1]]
                // change the searching mode when clicking the zoom in button
                self.loadRepresentativeItemType = itemType 
                this.zoomOperation(nodePos, this.maxZoomRatio)
            },
            zoomOperation: function(nodePos, zoomingRatio, callbackFunc=null) {
                let self = this
                let zoomOperator = self.zoomOperator
                let zoomRatioChangeStep = self.zoomRatioChangeStep
                // we need to force update the underlying data, so we set self.zoomingRatio as 0
                self.zoomingRatio = -1
                // let zoomingRatio = self.maxZoomRatio//Math.round(self.zoomingRatio + zoomRatioChangeStep)
                let transformEvent = self.moveToCenterScale(nodePos, zoomingRatio)
                self.transformEvent = transformEvent
                d3.select(self.$el)
                    .select('.tree-vis-map-svg')
                    .transition()
                    .duration(3000)
                    .call(zoomOperator.transform, transformEvent)
                    .on("end", function() {
                        self.updateZoomingRatio(transformEvent)
                        if (callbackFunc != null) {
                            callbackFunc(transformEvent)
                        }
                    });
            },
            updateContourComputation: function(transform_event) {
                let self = this
                let xScale = self.xScale, yScale = self.yScale
                let height = self.treeVisMapCanvasHeight, width = self.treeVisMapCanvasWidth
                self.contour = d3
                    .contourDensity()
                    .size([width, height])
                    .cellSize(20)
                    // .bandwidth(50)
                    // .thresholds([2, 6, 7, 8, 10])
                    // .thresholds([2, 4, 6, 8, 9, 10])
                    .thresholds(8)
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
                this.resetSelectedDSLObject()
                this.showSelectionView = false
                d3.select(this.$el)
                    .selectAll('.point-container')
                    .selectAll('.treevis-node')
                    .classed('selected', false)
                d3.select(this.$el)
                    .selectAll('.treevis-preview')
                    .selectAll('.treevis-node')
                    .classed('selected', false)
            },
            // save the selected tree visualizations to gallery
            addBookmark: function() {
                if (this.selectedDSLIndex !== -1) {
                    let galleryDSLObjDict = JSON.parse(JSON.stringify(this.galleryDSLObjDict))
                    let selectedDSLObj = JSON.parse(JSON.stringify(this.selectedDSLObj))
                    // add this dsl object to gallery 
                    selectedDSLObj['name'] = this.selectedDSLIndex + '-00'
                    if (typeof(galleryDSLObjDict[this.selectedDSLIndex]) === 'undefined') {
                        galleryDSLObjDict[this.selectedDSLIndex] = [this.selectedDSLObj]
                        this.addSelectedNodeInThumbnail()
                    } else {
                        delete galleryDSLObjDict[this.selectedDSLIndex]
                        this.removeSelectedNodeInThumbnail()
                        // let dslObjList = galleryDSLObjDict[this.selectedDSLIndex]
                        // for (let i = 0; i < dslObjList.length; i++) {
                        //     let dslObj = dslObjList[i]
                        //     if (dslObj.name === selectedDSLObj['name']) {
                        //         dslObjList.splice(i, 1)
                        //     }
                        // }
                    }
                    this.UPDATE_GALLERY_DSL_OBJ_DICT(galleryDSLObjDict)
                    this.addIndexInGallery2RepresentativeList()
                    let zoom_end = false
                    this.updateProjectionPoints(this.transformEvent, zoom_end)
                }
            },
            addSelectedNodeInThumbnail: function() {
                // add the selected item in the thumbnail view
                let self = this
                let representativeItemDict = self.representativeItemDict
                let selectedDSLIndex = self.selectedDSLIndex
                let representativeItem = representativeItemDict[selectedDSLIndex]
                let selectedNodeListInThumbnail = self.selectedNodeListInThumbnail
                let treeVisMapCanvasWidth = self.treeVisMapCanvasWidth
                let treeVisMapCanvasHeight = self.treeVisMapCanvasHeight
                if (typeof(representativeItem) !== 'undefined') {
                    let representativeItemPosX = representativeItem[0]/treeVisMapCanvasWidth
                    let representativeItemPosY = representativeItem[1]/treeVisMapCanvasHeight
                    let representativeItemIndex = representativeItem[2]
                    let representativeItemPos = [representativeItemPosX, representativeItemPosY, representativeItemIndex]
                    selectedNodeListInThumbnail.push(representativeItemPos)
                    self.UPDATE_SELECTED_NODE_LIST_IN_THUMBNAIL(selectedNodeListInThumbnail)
                }
            },
            removeSelectedNodeInThumbnail: function() {
                // remove the selected node from thumbnail view
                let self = this
                let selectedDSLIndex = self.selectedDSLIndex
                let selectedNodeListInThumbnail = self.selectedNodeListInThumbnail
                for (let i = 0; i< selectedNodeListInThumbnail.length; i++) {
                    let selectedNodeItem = selectedNodeListInThumbnail[i]
                    let selectedNodeItemIndex = selectedNodeItem[2]
                    if (selectedNodeItemIndex == selectedDSLIndex) {
                        selectedNodeListInThumbnail.splice(i, 1)
                    }
                }
                self.UPDATE_SELECTED_NODE_LIST_IN_THUMBNAIL(selectedNodeListInThumbnail)
            },
            openInTreeIllustrator: function() {
                let self = this
                // edit this tree visualization in the tree illustrator panel
                // switch the gotreescape panel to treeillustrator panel
                let treeillustratorTapLanel = 'treeillustrator'
                self.UPDATE_DISPLAY_TAP_NAME(treeillustratorTapLanel)
                let selectedDSLIndex = self.selectedDSLIndex.toString()
                let currentTreeDSLArray = [ selectedDSLIndex ]
                self.UPDATE_CURRENT_TREE_DSL_ARRAY(currentTreeDSLArray)
                // update the treeunit view and tree canvas view
                let selectedDSLObj = self.selectedDSLObj
                self.UPDATE_SELECTED_TREE_DSL_OBJ({'index': selectedDSLIndex, 'dsl': selectedDSLObj})
                self.UPDATE_TREEUNIT_DSL_ARRAY([{ "name": selectedDSLIndex, "dslObj": selectedDSLObj, "visible": true }])
                //  update the tree unit view
                setTimeout(function() {
                    self.UPDATE_TREEUNIT_DSL_NAME(selectedDSLIndex)
                }, 200)
                // update the layout of tree unit view
                setTimeout(function() {
                    self.UPDATE_TREE_UNIT_LAYOUT_STATE()
                }, 500)
                //  update the tree canvas view
                setTimeout(function() {
                    self.UPDATE_TREE_CANVAS_LAYOUT_STATE()
                }, 900)
            },
            checkRelated: function() {
                let relatedViewOpen = true
                this.UPDATE_RELATED_VIEW_OPEN(relatedViewOpen)
            },
            renderContour: function() {
                let self = this
                let colorLength = self.clusterColorList.length
                self.updateContourComputation(d3.zoomIdentity)
                let clusterContentItemList = self.clusterContentItemList
                let clusterContourContainer = d3.select(self.$el)
                    .select('.contour-container')
                    .selectAll(".cluster-contour-container")
                    .data(clusterContentItemList, function(d, i) {
                        return 'cluster-contour-container-' + i
                    })
                let clusterContourAddedContainer = clusterContourContainer.enter()
                    .append('g')
                    .attr('class', 'cluster-contour-container')
                    .attr('id', function(d, i) {
                        return 'cluster-contour-container-' + i
                    })
                // append or update the visual element in the tree vis glyph container
                clusterContourAddedContainer.selectAll('.projection-contour')
                    .data(d => self.contour(d))
                    .enter()
                    .append("path")
                    .attr('class', 'projection-contour')
                    .attr("d", d3.geoPath())
                    .style('stroke', function(d, i) {
                        let parentGroupElementId = d3.select(this.parentNode).attr('id')
                        let clusterIndex = parentGroupElementId.replace('cluster-contour-container-', '')
                        clusterIndex = parseInt(clusterIndex)
                        return self.clusterColorList[clusterIndex%colorLength]
                    })
                // update the inner contour of the contour group
                let clusterInnerContour = clusterContourContainer.selectAll(".projection-contour")
                    .data(d => self.contour(d))
                clusterInnerContour.enter()
                    .append("path")
                    .attr('class', 'projection-contour')
                    .attr("d", d3.geoPath())
                    .style('stroke', function(d, i) {
                        let parentGroupElementId = d3.select(this.parentNode).attr('id')
                        let clusterIndex = parentGroupElementId.replace('cluster-contour-container-', '')
                        clusterIndex = parseInt(clusterIndex)
                        return self.clusterColorList[clusterIndex%colorLength]
                    })
                clusterInnerContour.attr("d", d3.geoPath())
                clusterInnerContour.exit().remove()
                // remove the redundant contour group
                clusterContourContainer.exit().remove()
            },
            // zooming action end detection, and the corresponding handler
            zoomEndHandler: function (transform_event) {
                let self = this
                let zoomingEndTimeThreshold = self.zoomingEndTimeThreshold;
                if (self.zoomingEndTimer != null) {
                    clearTimeout(self.zoomingEndTimer);
                }
                console.log('========call zoom end handler========')
                // update zoom end timer
                self.zoomingEndTimer = setTimeout(function() { 
                    var transform_ratio = transform_event.k
                    console.log('transform_ratio', transform_ratio)
                    self.updateZoomingRatio(transform_event)
                }, zoomingEndTimeThreshold);
            },      
            zoomHandler: function () {
                let self = this
                console.log('========call zoom========')
                // the variable to indicate the state of system
                let updateUnderlyingDataState = self.updateUnderlyingDataState
                // the handler for the zooming function
                let transformEvent = d3.event.transform;
                let transformRatio = transformEvent.k
                // update transformEvent
                self.transformEvent = transformEvent
                // console.log('zoom ratio', transform_ratio)
                // updateProjectionPoints(projectionPosResultsRemained, transform_event)
                let displayAndDataRangeBeforeUpdate = self.currentDisplayAndDataRange
                let displayAndDataRange = self.computeDisplayAndDataRange()
                console.log('displayAndDataRangeBeforeUpdate', displayAndDataRangeBeforeUpdate==null)
                console.log('zoomChangeExceedThreshold', self.zoomChangeExceedThreshold(displayAndDataRangeBeforeUpdate, displayAndDataRange))
                console.log('!updateUnderlyingDataState', updateUnderlyingDataState)
                if (((displayAndDataRangeBeforeUpdate == null) || (self.zoomChangeExceedThreshold(displayAndDataRangeBeforeUpdate, displayAndDataRange))) && !updateUnderlyingDataState) { 
                    // only the system is not in the state of updating underlying dataset
                    self.currentDisplayAndDataRange = displayAndDataRange
                    self.updateWholeProjectionView(transformEvent)
                    self.zoomEndHandler(transformEvent)     
                }
                // console.log('previewRepresentativeObjList', previewRepresentativeObjList)
                // console.log('treevisDefaultPreviewContainerKey', self.treevisDefaultPreviewContainerKey)
                // console.log('previewRepresentativeObjListRemained', previewRepresentativeObjListRemained)
                // self.previewRepresentativeObjListRemained = previewRepresentativeObjListRemained
                // if ((projectionPosX >= 0) && (projectionPosX <= treeVisMapCanvasWholeWidth) && (projectionPosY >= 0) && (projectionPosY <= treeVisMapCanvasWholeHeight)) {
                //  previewRepresentativeObjListRemained.push(previewRepresentativeObj)
                // }
            },
            renderZoomedRect: function() {
                /**
                 * plot the rectangle to support zooming function
                 */
                let self = this
                let zoomOperator = self.zoomOperator
                d3.select(self.$el)
                .select('.tree-vis-map-svg')
                .call(zoomOperator)
                // let self = this
                // let zoomOperator = self.zoomOperator
                // if (d3.select(self.$el).select('.background-container').select('.zoomable-rectangle').empty()) {
                //  d3.select(self.$el)
                //  .select('.background-container')
                //  .append("rect")
                //  .attr('class', 'zoomable-rectangle')
                   //  .attr("fill", "none")
                   //  .attr("pointer-events", "all")
                   //  .call(zoomOperator);
                // } else {
                //  d3.select(self.$el)
                //  .select('.background-container')
                //  .select('.zoomable-rectangle')
                   //  .attr("fill", "none")
                   //  .attr("pointer-events", "all")
                   //  .call(zoomOperator);
                // }
            },
            treeVisNodeTransform: function (t) {
                return function(d) {
                    // console.log('d', d, 't.apply(d)', t.apply(d))
                    return "translate(" + t.apply(d) + ")";
                };
            },
            treevisNodeClickHandler: function (thisNode, dslObj) {
                let self = this
                let dslIndex = dslObj[2]
                let nodePos = [dslObj[0], dslObj[1]]
                d3.select(self.$el).select('.tree-vis-map-svg')
                  .selectAll('.treevis-node').classed('selected', false)
                d3.select(self.$el).select('.tree-vis-map-svg')
                  .selectAll('.existed-treevis-node').classed('selected', false)
                self.setSelectedDSLObject(dslIndex)
                // if (dslIndex === this.selectedDSLIndex) {
                //     self.resetSelectedDSLObject()
                // } else {
                // }
                // TODO
                self.renderZoomedRect()
                self.hideTooltip()
            },
            renderTreeVisNode: function() {
                let self = this
                let representativeItemList = self.representativeItemList
                let clusterColorList = self.clusterColorList
                let colorLength = self.clusterColorList.length
                // console.log('representativeItemDict', self.representativeItemDict)
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
                    let dslObj = d
                    let thisNode = this
                    self.treevisNodeClickHandler(thisNode, dslObj)
                  })
                  .on('mouseover', function(d, i) {
                    self.mouseoverHandler(d)
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
                    let dslObj = d
                    let thisNode = this
                    self.treevisNodeClickHandler(thisNode, dslObj)
                  })
                  .on('mouseover', function(d, i) {
                    self.mouseoverHandler(d)
                  })
                  .on('mouseout', function(d, i) {
                    self.hideTooltip()
                  })
                // remove the extra elements
                representativeItems.exit().remove()
            },
            renderExistedTreeVisNode: function() {
                let self = this
                let symbolGenerator = d3.symbol().size(self.existedNodeSize).type(d3.symbolStar);
                let existedTreeVisItemList = self.existedTreeVisItemList
                let existedTreeVisItems = d3.select(self.$el)
                  .select('.existed-treevis-container')
                  .selectAll(".existed-treevis-node-group")
                  .data(existedTreeVisItemList, function(d, i) {
                    return 'node-' + d[2]
                  })
                // append new visual elements
                let addExistedTreeVisItemGroup = existedTreeVisItems.enter()
                  .append("g")
                  .attr("class", "existed-treevis-node-group")
                  .attr('id', function(d, i) {
                        return 'existed-treevis-node-group-' + d[2]
                   })
                  .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity))
                addExistedTreeVisItemGroup
                  .append('path')
                  .attr('class', 'existed-treevis-node')
                  .attr('id', function(d, i) {
                        return 'existed-treevis-node-' + d[2]
                  })
                  .attr('d', function(d) {
                    return symbolGenerator();
                  })
                  .on('click', function(d, i) {
                    let dslObj = d
                    let thisNode = this
                    self.treevisNodeClickHandler(thisNode, dslObj)
                  })
                  .on('mouseover', function(d, i) {
                    self.mouseoverHandler(d)
                  })
                  .on('mouseout', function(d, i) {
                    self.hideTooltip()
                  })
                // update the view
                let updateExistedTreeVisItemGroup = existedTreeVisItems.attr('id', function(d, i) {
                        return 'existed-treevis-node-group-' + d[2]
                   })
                  .attr("transform", self.treeVisNodeTransform(d3.zoomIdentity))
                updateExistedTreeVisItemGroup.select('.existed-treevis-node')
                  .on('click', function(d, i) {
                    let dslIndex = d[2]
                    let dslObj = d
                    let thisNode = this
                    self.treevisNodeClickHandler(thisNode, dslObj)
                  })
                  .on('mouseover', function(d, i) {
                    self.mouseoverHandler(d)
                  })
                  .on('mouseout', function(d, i) {
                    self.hideTooltip()
                  })
                // remove the extra elements
                existedTreeVisItems.exit().remove()
            },
            setSelectedDSLObject: function(dslIndex) {
                let self = this
                self.selectedDSLIndex = dslIndex
                let formData = {'dslName': dslIndex}
                getGoTreeGrammarObj(formData, function(singleTreeDSLObj) {
                    self.selectedDSLObj = singleTreeDSLObj
                    self.UPDATE_SELECTED_TREE_DSL_OBJ({'index': dslIndex, 'dsl': singleTreeDSLObj})
                    // keep the selected treevis node always exist in the tree visualization landscape
                    if (self.existedTreeVisIndexList.indexOf(dslIndex) === -1) {
                        self.existedTreeVisIndexList.push(dslIndex)
                    }
                    setTimeout(function() {
                        self.treeCanvasSelectedPreviewKey = (self.treeCanvasSelectedPreviewKey + 1) % 2 // update the tree visualization canvas
                        self.showSelectionView = true
                        // highlight the selected dsl
                        d3.select(self.$el)
                          .select('.tree-vis-map-svg')
                          .select('#treevis-node-' + dslIndex).classed('selected', true)
                        d3.select(self.$el)
                          .select('.tree-vis-map-svg')
                          .select('#existed-treevis-node-' + dslIndex).classed('selected', true)
                    }, 200)
                })
            },
            resetSelectedDSLObject: function() {
                let self = this
                let unSelectedDSLIndex = -1
                self.selectedDSLIndex = unSelectedDSLIndex
                self.UPDATE_SELECTED_TREE_DSL_OBJ(null)
                self.showSelectionView = false
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
                let nodeArrayWithValueObj = sysDatasetObj.getNodeArrayWithValueObjSelect()
                let treeIndexWithDSL = sysDatasetObj.computeAllNodeTreeIndexWithDSL(nodeArrayWithValueObj, selectedNodeIndex)
                // set treeIndexWithDSL and treeDSLContentObj within layoutParas, then rendering tree visualization result
                layoutParas.treeIndexWithDSL = treeIndexWithDSL
                let treeDSLContentObj = {}
                treeDSLContentObj[selectedNodeIndex] = sysDatasetObj['treeVisDSLObjCollection'][selectedNodeIndex]
                layoutParas.treeDSLContentObj = treeDSLContentObj
                self.isShowTooltip = true
                setTimeout(function() {
                    self.treeCanvasKey = (self.treeCanvasKey + 1) % 2 // update the tree visualization canvas
                }, 200)
                // sysDatasetObj.loadTreeDSLContentObjFromServer(treeIndexWithDSL, function(treeDSLContentObj) {
                //  layoutParas.treeDSLContentObj = treeDSLContentObj
                //  console.log('treeDSLContentObj', treeDSLContentObj)
          //        self.isShowTooltip = true               
          //        setTimeout(function() {
                //      self.treeCanvasKey = (self.treeCanvasKey + 1) % 2 // update the tree visualization canvas
                //  }, 200)
                // })
            },
            showTooltip: function(selectedNodeIndex) {
                let self = this
                // set the mouseover dsl index when users hovering on the nodes
                self.mouseoverDSLIndex = selectedNodeIndex
                let formData = {'dslName': selectedNodeIndex}
                getGoTreeGrammarObj(formData, function(singleTreeDSLObj) {
                    self.hoveringDSLObj = singleTreeDSLObj
                    setTimeout(function() {
                        // update the tree visualization canvas
                        self.treeCanvasHoveringPreviewKey = (self.treeCanvasHoveringPreviewKey + 1) % 2
                        self.isShowTooltip = true
                    }, 200)
                })
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
    @existed-node-color: #a6761d;
    @treevis-node-radius: 3px;
    @treevis-node-opacity: 0.7;
    @treevis-node-color: #666666;
    @hovering-treevis-node-color: red;
    @hovering-treevis-node-stroke-color: black;
    @selected-treevis-node-radius: 8px;
    @legend-selected-treevis-node-radius: 5px;
    @selected-treevis-node-color: red;
    @selected-treevis-node-stroke-color: black;
    @selected-treevis-node-stroke-width: 1.5px;
    @selected-treevis-node-opacity: 1;
    @treevis-node-in-gallery-color: orange;
    .tree-vis-map-svg-container {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        width: 100%;
        height: 100%;
        background-color: white;
        position: absolute;
        cursor: pointer !important;
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
                opacity: @treevis-node-opacity;
                r: @treevis-node-radius;
                fill: @treevis-node-color;
                &:hover {
                    r: @selected-treevis-node-radius;
                    fill: @hovering-treevis-node-color !important;
                    stroke: @hovering-treevis-node-stroke-color;
                }
                &.selected {
                    r: @selected-treevis-node-radius;
                    fill: @selected-treevis-node-color !important;
                    stroke: @selected-treevis-node-stroke-color;
                    stroke-width: @selected-treevis-node-stroke-width;
                    opacity: @selected-treevis-node-opacity;
                }
                &.in-gallery {
                    r: @selected-treevis-node-radius;
                    fill: @treevis-node-in-gallery-color;
                    stroke: @selected-treevis-node-stroke-color;
                    stroke-width: @selected-treevis-node-stroke-width;
                    opacity: @selected-treevis-node-opacity;
                }
            }
            .existed-treevis-node {
                opacity: @treevis-node-opacity;
                r: @treevis-node-radius;
                fill: @existed-node-color;
                &:hover {
                    fill: red !important;
                    stroke: black;
                }
                &.selected {
                    fill: red !important;
                    stroke: black;
                    stroke-width: 1.5px;
                    opacity: 1;
                }
            }
            .traditional-treevis-node {
                opacity: @treevis-node-opacity;
                r: @treevis-node-radius;
                fill: @treevis-node-color;
                &.selected {
                    r: 6px;
                    fill: #ff7f00;
                    stroke: black;
                    stroke-width: 1.5px;
                    opacity: 1;
                }
            }
            .projection-contour {
                stroke-opacity: 1; //0.6
                fill-opacity: 0.06;
                pointer-events: none;
                stroke-width: 0.35;
                fill: #E3120b;
                // opacity: 0.05;
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
          border-left: #dddddd solid 1px;
          border-right: #dddddd solid 1px;
          border-top: #dddddd solid 1px;
          background-color: white;
          .selected-view-tag {
            position: absolute;
            top: 0%;
            left: 5%;
            height: @selected-view-tag-container-height;
            width: 100%;
            .el-radio {
                margin-right: 10px !important;
            }
            .el-radio__label {
                padding-left: 5px !important;
            }
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
                    // &.icon-close5 {
                    //     fill: red;
                    // }
                }
                .zoom {
                    font-size: 18px;
                    &:hover {
                        color: steelblue;
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
                border: #a50026 2px solid !important;
            }
            &:hover {
                border: #a50026 2px solid !important;
            }
            &.existed {
                border: @existed-node-color 2px solid;
            }
        }
        .legend-container {
            position: absolute;
            width: 180px;
            height: 90px;
            left: 0px;
            bottom: 0px;
            background-color: white;
            .legend-svg {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0%;
                top: 0%;
                .landmark {
                    opacity: @treevis-node-opacity;
                    r: @treevis-node-radius;
                    fill: @treevis-node-color;
                }
                .selected-landmark {
                    r: @legend-selected-treevis-node-radius;
                    fill: @selected-treevis-node-color !important;
                    stroke: @selected-treevis-node-stroke-color;
                    stroke-width: @selected-treevis-node-stroke-width;
                    opacity: @selected-treevis-node-opacity;
                }
                .landmark-in-gallery {
                    r: @legend-selected-treevis-node-radius;
                    fill: @treevis-node-in-gallery-color;
                    stroke: @selected-treevis-node-stroke-color;
                    stroke-width: @selected-treevis-node-stroke-width;
                    opacity: @selected-treevis-node-opacity;
                }
            }
        }
        .thumbnail-container {
            position: absolute;
            width: 200px;
            height: 100px;
            right: 5px;
            bottom: 5px;
            background-color: white;
            border: solid #bbbbbb 1px;
        }
        .controller-container {
            position: absolute;
            width: 180px;
            height: 20px;
            left: 8px;
            bottom: 90px;
            @controller-container-height: 20px;
            @slider-container-width: 100px;
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
                // padding-top: 3px;
                // height: @controller-container-height;
                // line-height: @controller-container-height;
                // vertical-align: middle;
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