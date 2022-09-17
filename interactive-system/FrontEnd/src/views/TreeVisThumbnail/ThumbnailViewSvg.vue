<template>
    <svg class="thumbnail-view-svg" :ref="thumbnailViewSvgRef">
        <g class="thumbnail-contour-container" 
            :transform="'translate('+thumbnailViewSvgPaddingLeft+','+thumbnailViewSvgPaddingTop+')'">
        </g>
        <g class="scatterplot-container">
        </g>
        <g class="display-range-container">
            <rect class="display-range-rect">
            </rect>
        </g>
    </svg>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'

    export default {
        name: 'thumbnailviewsvg',
        props: {
            displayRangeRatio: {
                type: Object,
                default: { 'x': [0, 1], 'y': [0, 1] }
            },
            projectionResults: {
                type: Array
            },
            treeVisMapCanvasWidth: {
                type: Number
            },
            treeVisMapCanvasHeight: {
                type: Number
            }
        },
        components: {
        },
        data() {
            return {
                thumbnailViewSvgRef: 'thumbnail-view-svg',
                thumbnailViewSvgHeight: 0,
                thumbnailViewSvgWidth: 0,
                thumbnailViewSvgPaddingLeft: 0,
                thumbnailViewSvgPaddingTop: 0,
                clusterContentItemList: [],
                DRAWING_AMOUNT: 1000
            }
        },
        watch: {
            displayRangeRatio: function() {
                this.updateDisplayRangeRect()
            },
            projectionResults: function() {
                this.updatePosScale()
                this.updateProjectionPosResults()
                this.renderContour()
                console.log('===projectionResults===')
                // this.renderScatterplot()
            },
            selectedNodeListInThumbnail: function() {
                this.updateSelectedNode()
            }
        },
        created: function () {
        },
        beforeMount: function() {

        },
        mounted: function() {
           this.initView()
           this.initContourComputation()
           // this.initTransformEvent()
        },
        computed: {
            ...mapState([
                'selectedNodeListInThumbnail'
            ]),
        },
        methods: {
            ...mapMutations([
            ]),
            updateSelectedNode: function () {
                let self = this
                let selectedNodeListInThumbnail = this.selectedNodeListInThumbnail
                console.log('updateSelectedNode', selectedNodeListInThumbnail)
                let thumbnailViewSvgWidth = this.thumbnailViewSvgWidth
                let thumbnailViewSvgHeight = this.thumbnailViewSvgHeight
                let selectedRepresentativeNode = d3.select(self.$el)
                    .select('.scatterplot-container')
                    .selectAll('.selected-representative-node')
                    .data(selectedNodeListInThumbnail, function (d) {
                        return d[2] //the id of selected item
                    })
                selectedRepresentativeNode.enter()
                    .append('circle')
                    .attr('class', 'selected-representative-node')
                    .attr('id', function (d) { return 'selected-representative-node-' + d[2]})
                    .attr('cx', function (d) { return d[0] * thumbnailViewSvgWidth })
                    .attr('cy', function (d) { return d[1] * thumbnailViewSvgHeight})
                selectedRepresentativeNode
                    .attr('cx', function (d) { return d[0] * thumbnailViewSvgWidth})
                    .attr('cy', function (d) { return d[1] * thumbnailViewSvgHeight})
                selectedRepresentativeNode.exit().remove()
            },
            initView: function () {
                let thumbnailViewSvgRef = this.thumbnailViewSvgRef
                let thumbnailViewSvgHeight = this.$refs[thumbnailViewSvgRef].clientHeight;
                let thumbnailViewSvgWidth = this.$refs[thumbnailViewSvgRef].clientWidth;
                // this.thumbnailViewSvgPaddingLeft = thumbnailViewSvgWidth * 0.15
                // this.thumbnailViewSvgPaddingTop = thumbnailViewSvgHeight * 0.4
                this.thumbnailViewSvgPaddingLeft = thumbnailViewSvgWidth * 0
                this.thumbnailViewSvgPaddingTop = thumbnailViewSvgHeight * 0
                this.thumbnailViewSvgHeight = thumbnailViewSvgHeight - this.thumbnailViewSvgPaddingTop * 2
                this.thumbnailViewSvgWidth = thumbnailViewSvgWidth - this.thumbnailViewSvgPaddingLeft * 2
                // this.thumbnailViewSvgHeight = thumbnailViewSvgHeight - this.thumbnailViewSvgPaddingTop * 2
                // this.thumbnailViewSvgWidth = thumbnailViewSvgWidth - this.thumbnailViewSvgPaddingLeft * 2
            },
            initTransformEvent: function() {
                let thumbnailViewSvgWidth = this.thumbnailViewSvgWidth
                let thumbnailViewSvgHeight = this.thumbnailViewSvgHeight
                let treeVisMapCanvasHeight = this.treeVisMapCanvasHeight
                let treeVisMapCanvasWidth = this.treeVisMapCanvasWidth
                let zoomRatio = Math.min(thumbnailViewSvgWidth/treeVisMapCanvasWidth, thumbnailViewSvgHeight/treeVisMapCanvasHeight)
                this.transformEvent = d3.zoomIdentity
                    .translate(thumbnailViewSvgWidth/2, thumbnailViewSvgHeight/2)
                    .scale(0.05)
                    // .translate(-thumbnailViewSvgWidth/2, -thumbnailViewSvgHeight/2);
            },
            updatePosScale: function() {
                let projectionResults = this.projectionResults
                let valueExtentX = d3.extent(projectionResults, function(d, i) { return d['x'] })
                let valueExtentY = d3.extent(projectionResults, function(d, i) { return d['y'] })
                // initialize the scale of vertical position and horizontal position
                let thumbnailViewSvgWidth = this.thumbnailViewSvgWidth
                let thumbnailViewSvgHeight = this.thumbnailViewSvgHeight
                // data -> pox scale
                this.xScale = d3.scaleLinear()
                  .domain(valueExtentX)
                  .range([0, thumbnailViewSvgWidth])
                this.yScale = d3.scaleLinear()
                  .domain(valueExtentY)
                  .range([thumbnailViewSvgHeight, 0])
            },
            updateProjectionPosResults: function () {
                let projectionResults = this.projectionResults
                let selectedProjectionResults = []
                let selectedProjectionPosResults = []
                let drawingProjectionPosItemIndexSet = new Set();
                let DRAWING_AMOUNT = this.DRAWING_AMOUNT
                for (let i = 0; i < DRAWING_AMOUNT; i++) {
                    let selectedIndex = Math.round(Math.random() * projectionResults.length)
                    if (!drawingProjectionPosItemIndexSet.has(selectedIndex)) {
                        selectedProjectionResults.push(projectionResults[selectedIndex])
                    }
                }
                for (let i = 0; i < selectedProjectionResults.length; i++) {
                    let item = selectedProjectionResults[i]
                    let itemPosX = this.xScale(item['x'])
                    let itemPosY = this.yScale(item['y'])
                    selectedProjectionPosResults.push([itemPosX, itemPosY, i])
                }
                this.clusterContentItemList = selectedProjectionPosResults
            },
            initContourComputation: function() {
                let self = this
                let height = self.thumbnailViewSvgHeight
                let width = self.thumbnailViewSvgWidth
                let transformEvent = d3.zoomIdentity
                self.contour = d3.contourDensity()
                    .size([width, height])
                    .thresholds(5)
                    .x(function(d, i) {
                        let zoomedPosList = transformEvent.apply(d)
                        return zoomedPosList[0]
                    })
                    .y(function(d) {
                        let zoomedPosList = transformEvent.apply(d)
                        return zoomedPosList[1]
                    })
            },
            renderContour: function() {
                let self = this
                let clusterContentItemList = self.clusterContentItemList
                let projectionContour = d3.select(self.$el)
                    .select('.thumbnail-contour-container')
                    .selectAll('.projection-contour')
                    .data(self.contour(clusterContentItemList))     
                projectionContour.enter()
                    .append("path")
                    .attr('class', 'projection-contour')
                    .attr("d", d3.geoPath())
                projectionContour.attr("d", d3.geoPath())
                projectionContour.exit().remove()
            },
            renderScatterplot: function() {
                console.log('renderScatterplot')
                let self = this
                let clusterContentItemList = self.clusterContentItemList
                let projectionPoint = d3.select(self.$el)
                    .select('.scatterplot-container')
                    .selectAll('.projection-point')
                    .data(clusterContentItemList)
                projectionPoint.enter()
                    .append('circle')
                    .attr('class', 'projection-point')
                    .attr('cx', function (d) { return d[0] })
                    .attr('cy', function (d) { return d[1] })
                projectionPoint
                    .attr('cx', function (d) { return d[0] })
                    .attr('cy', function (d) { return d[1] })
                projectionPoint.exit().remove()
            },
            updateDisplayRangeRect: function() {
                let self = this
                let displayRangeRatio = self.displayRangeRatio
                let displayRangeXMin = displayRangeRatio['x'][0], displayRangeXMax = displayRangeRatio['x'][1],
                    displayRangeYMin = displayRangeRatio['y'][0], displayRangeYMax = displayRangeRatio['y'][1]
                let thumbnailViewSvgHeight = self.thumbnailViewSvgHeight
                let thumbnailViewSvgWidth = self.thumbnailViewSvgWidth
                d3.select(self.$el)
                  .select('.display-range-container')
                  .select('.display-range-rect')
                  .transition()
                  .duration(1000)
                  .attr('x', displayRangeXMin * thumbnailViewSvgWidth)
                  .attr('y', displayRangeYMin * thumbnailViewSvgHeight)
                  .attr('width', (displayRangeXMax - displayRangeXMin) * thumbnailViewSvgWidth)
                  .attr('height', (displayRangeYMax - displayRangeYMin) * thumbnailViewSvgHeight)
            }
        }
    }
</script>
<style lang="less">
    @stroke-color: #dfc27d;
    @treevis-node-in-gallery-color: orange;
    @treevis-node-in-gallery-stroke-color: black;
    @treevis-node-in-gallery-stroke-width: 1px;
    @treevis-node-in-gallery-opacity: 1;
    @selected-treevis-node-radius: 4px;
    .thumbnail-view-svg {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0%;
        right: 0%;
        .thumbnail-contour-container {
            .projection-contour {
                stroke-opacity: 1;
                fill-opacity: 0.06;
                pointer-events: none;
                stroke-width: 0.35;
                fill: #E3120b;
                stroke: @stroke-color;
                // opacity: 0.05;
            }
        }
        .scatterplot-container {
            .projection-point {
                fill: steelblue;
                r: 2px;
            }
            .selected-representative-node {
                r: @selected-treevis-node-radius;
                fill: @treevis-node-in-gallery-color !important;
                stroke:@treevis-node-in-gallery-stroke-color;
                stroke-width: @treevis-node-in-gallery-stroke-width;
                opacity: @treevis-node-in-gallery-opacity;
            }
        }
        .display-range-container {
            .display-range-rect {
                stroke: red;
                stroke-width: 1px;
                stroke-opacity: 1;
                fill-opacity: 0.06;
            }
        }
    }
</style>