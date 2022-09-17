<template>
    <div class="treevis-related-view-wrapper" ref="treevisRelatedView">
        <div class="treevis-related-view-title">
            <span class = "text"> {{ title }} </span>
            <span class = "operation">
                <!-- <el-tooltip class='labelIcon' content="new" effect="light"> 
                  <span class = "operation-icon" @click.stop.prevent="showPoints">
                    <span class="icon iconfont icon-export"></span>
                  </span>
                </el-tooltip>      
                <el-divider direction="vertical"></el-divider> -->
                <el-tooltip class='labelIcon' content="save as" effect="light"> 
                    <span class = "operation-icon" @click.stop.prevent="closeRelatedView">
                        <span class="icon iconfont icon-close5"></span>
                    </span>
                </el-tooltip>
            </span>
        </div>
        <div class="treevis-related-view-content" ref="treevisRelatedViewContent">
            <div class="single-treevis-related-view"
                :style="{'width': singleTreeVisRelatedViewWidth + 'px', height: singleTreeVisRelatedViewWidth +'px'}"
                v-for="(treeDSLObj, index) in itemSubsetOfCurrentPage"
                @mouseover="mouseoverSingleTreeVis(index)"
                @mouseout="mouseoutSingleTreeVis">
                <TreeCanvas :treeCanvasKey="treeCanvasDefaultPreviewKey" 
                    :sendSVGData="false"
                    :dslObj="treeDSLObj"
                    :dslIndex="index"
                    :initRender="true"
                    :nodeArrayWithValueObj="nodeArrayWithValueObjSelect"
                    :nodeArrayWithValue="nodeArrayWithValueSelect"
                    :hierarchicalData="hierarchicalDataSelect">
                </TreeCanvas>
                <span class="setting-container" v-show="(hoveringTreeDSLIndex===index || getDslObjIndexInGallery(treeDSLObj) !== -1)">
                  <i class="icon iconfont save icon-shoucang"
                    :class="{'icon-shoucang': getDslObjIndexInGallery(treeDSLObj) === -1,
                             'icon-shoucangshixin': getDslObjIndexInGallery(treeDSLObj) !== -1}" 
                    @click="addBookmark(treeDSLObj)"></i>
                  <br />
                  <i class="icon iconfont open icon-dakai" @click="openDetail"></i>
                </span>
            </div>
        </div>
        <div class="treevis-related-view-page">
            <el-pagination
                small
                v-show="relatedTreeDSLObjList.length>0 && pageSize>0"
                layout="prev, pager, next"
                :page-size="pageSize"
                :current-page="currentPage"
                :total="relatedTreeDSLObjList.length"
                @current-change="changeCurrentPage">
            </el-pagination>
        </div>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import TreeCanvas from '../TreeCanvasView/TreeCanvas.vue'

    // :class="{'icon-shoucang': typeof(galleryDSLObjDict[selectedDSLIndex])==='undefined',
    //                 'icon-shoucangshixin': typeof(galleryDSLObjDict[selectedDSLIndex])!=='undefined'}" 

    export default {
        name: 'TreeVisRelatedView',
        components: {
          TreeCanvas
        },
        data() {
            return {
                title: 'Related Tree Vis',
                relatedTreeDSLObjList: [],
                itemSubsetOfCurrentPage: [],
                treeCanvasDefaultPreviewKey: 1,
                treevisRelatedViewHeight: 0,
                treevisRelatedViewWidth: 0,
                singleTreeVisRelatedViewWidth: 0,
                padding: 15,
                pageSize: 0,
                currentPage: 1,
                hoveringTreeDSLIndex: -1,
                nodeArrayWithValueObjSelect: null,
                nodeArrayWithValueSelect: null,
                hierarchicalDataSelect: null
            }
        },
        watch: {
          selectedTreeDSLObj: function() {
            this.updateRelatedTreeDSLObjList()
            this.currentPage = 1
            this.updateSubsetOfCurrentPage()
            this.treeCanvasDefaultPreviewKey = (this.treeCanvasDefaultPreviewKey+1)%2
          },
          relatedViewOpen: function() {
            this.updatePageSize()
            this.updateSubsetOfCurrentPage()
            this.treeCanvasDefaultPreviewKey = (this.treeCanvasDefaultPreviewKey+1)%2
          }
        },
        created: function () {

        },
        beforeMount: function() {
          this.initTreeCanvasParas()
        },
        mounted: function() {
          this.updatePageSize()
          this.updateRelatedTreeDSLObjList()
        },
        computed: {
          ...mapState([
              'selectedTreeDSLObj',
              'relatedViewOpen',
              'galleryDSLObjDict'
          ])
        },
        methods: {
            ...mapMutations([
              'UPDATE_RELATED_VIEW_OPEN',
              'UPDATE_GALLERY_DSL_OBJ_DICT'
            ]),
            initTreeCanvasParas: function() {
              // initialize the parameters of the tree canvas components
              let self = this
              self.nodeArrayWithValueObjSelect = sysDatasetObj.getNodeArrayWithValueObjSelect()
              self.hierarchicalDataSelect = sysDatasetObj.getTreeDatasetSelect()
              self.nodeArrayWithValueSelect = sysDatasetObj.getNodeArrayWithValueSelect()
            },
            getDslObjIndexInGallery: function(treeDSLObj) {
              let self = this
              let galleryDSLObjDict = self.galleryDSLObjDict
              let treeDSLObjName = treeDSLObj['name']
              let treeDSLObjNameAttrList = treeDSLObjName.split('-')
              let treeDSLObjIndex = treeDSLObjNameAttrList[0]
              let treeDSLObjRelatedIndex = treeDSLObjNameAttrList[1]
              if (typeof(galleryDSLObjDict[treeDSLObjIndex]) === 'undefined') {
                console.log('not found -1')
                return -1
              }
              let dslObjList = galleryDSLObjDict[treeDSLObjIndex]
              for (let i = 0; i < dslObjList.length; i++) {
                let dslObj = dslObjList[i]
                if (dslObj.name === treeDSLObjName) {
                  console.log('found i')
                  return i
                }
              }
              console.log('not found -1')
              return -1
            },
            updatePageSize: function() {
              let treevisRelatedViewContentHeight = this.$refs.treevisRelatedViewContent.clientHeight;
              let treevisRelatedViewContentWidth = this.$refs.treevisRelatedViewContent.clientWidth;
              let singleTreeVisRelatedViewWidth = treevisRelatedViewContentWidth - this.padding * 2
              this.singleTreeVisRelatedViewWidth = singleTreeVisRelatedViewWidth
              this.pageSize = Math.ceil(treevisRelatedViewContentHeight / singleTreeVisRelatedViewWidth)
              this.singleTreeVisRelatedViewWidth = Math.floor(treevisRelatedViewContentHeight / this.pageSize) - 8
            },
            changeCurrentPage: function(currentPage) {
              this.currentPage = currentPage
              this.updateSubsetOfCurrentPage()
              this.treeCanvasDefaultPreviewKey = (this.treeCanvasDefaultPreviewKey+1)%2
            },
            addBookmark: function(treeDSLObj) {
              let self = this
              let galleryDSLObjDict = JSON.parse(JSON.stringify(this.galleryDSLObjDict))
              let treeDSLObjName = treeDSLObj['name']
              let treeDSLObjNameAttrList = treeDSLObjName.split('-')
              let treeDSLObjIndex = treeDSLObjNameAttrList[0]
              let treeDSLObjRelatedIndex = treeDSLObjNameAttrList[1]
              let treeDSLObjIndexInGallery = this.getDslObjIndexInGallery(treeDSLObj)
              if (treeDSLObjIndexInGallery === -1) {
                if (typeof(galleryDSLObjDict[treeDSLObjIndex]) === 'undefined') {
                  galleryDSLObjDict[treeDSLObjIndex] = [treeDSLObj]
                } else {
                  galleryDSLObjDict[treeDSLObjIndex].push(treeDSLObj)
                }
              } else {
                let dslObjList = galleryDSLObjDict[treeDSLObjIndex]
                dslObjList.split(treeDSLObjIndexInGallery, 1)
              }
              self.UPDATE_GALLERY_DSL_OBJ_DICT(galleryDSLObjDict)
            },
            openDetail: function() {
              console.log('open detail')
            },
            mouseoverSingleTreeVis: function(treeDSLIndex) {
              this.hoveringTreeDSLIndex = treeDSLIndex
            },
            mouseoutSingleTreeVis: function() {
              this.hoveringTreeDSLIndex = -1
            },
            updateRelatedTreeDSLObjList: function() {
              if (this.selectedTreeDSLObj == null) {
                return
              }
              let selectedTreeDSLContent = this.selectedTreeDSLObj['dsl']
              let layoutObj = selectedTreeDSLContent['Layout']
              let elementObj = selectedTreeDSLContent['Element']
              let coordinateSystemObj = selectedTreeDSLContent['CoordinateSystem']
              let relatedTreeDSLObjList = []
              let paddingXOptions = [-1, -0.5, 0, 0.5, 1]
              let paddingYOptions = [-1, -0.5, 0, 0.5, 1]
              // initialize the padding options
              let paddingOptions = []
              for (let i = 0; i < paddingXOptions.length; i++) {
                for (let j = 0; j < paddingYOptions.length; j++) {
                  paddingOptions.push([paddingXOptions[i], paddingYOptions[j]])
                }
              }
              let marginOptions = [-1, -0.5, 0.5, 1]
              let startAngleOptions = [0.25, 0.5, 0,75]
              // node with/height settings
              let nodeWidthHeightOptions = ['depth', 'rdepth']
              // update visual element
              if (elementObj['Node'] !== 'hidden') {
                if (elementObj['Link'] !== 'hidden') {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Element']['Link'] = "hidden"
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
                if (elementObj['Link'] === 'hidden') {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Element']['Link'] = "straight"
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              // adjust Layout
              if (layoutObj['X']['Root']['Relation'] === 'within') {
                let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                selectedTreeDSLContentCopy['Layout']['X']['Root']['Relation'] = 'right'
                relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
              }
              if (layoutObj['X']['Root']['Relation'] === 'include') {
                for (let i = 0; i < paddingOptions.length; i++) {
                  let paddingObj = paddingOptions[i]
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Layout']['X']['Root']['Padding'] = paddingObj
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              if (layoutObj['X']['Root']['Relation'] === 'juxtapose') {
                for (let i = 0; i < marginOptions.length; i++) {
                  let marginVal = marginOptions[i]
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Layout']['X']['Root']['Margin'] = marginVal
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              if (layoutObj['Y']['Root']['Relation'] === 'within') {
                let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                selectedTreeDSLContentCopy['Layout']['Y']['Root']['Relation'] = 'bottom'
                relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
              }
              if (layoutObj['Y']['Root']['Relation'] === 'include') {
                for (let i = 0; i < paddingOptions.length; i++) {
                  let paddingObj = paddingOptions[i]
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Layout']['Y']['Root']['Padding'] = paddingObj
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              if (layoutObj['Y']['Root']['Relation'] === 'juxtapose') {
                for (let i = 0; i < marginOptions.length; i++) {
                  let marginVal = marginOptions[i]
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Layout']['Y']['Root']['Margin'] = marginVal
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              if (layoutObj['Y']['Root']['Relation'] === 'juxtapose') {
                for (let i = 0; i < marginOptions.length; i++) {
                  let marginVal = marginOptions[i]
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Layout']['Y']['Root']['Margin'] = marginVal
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              // update coordinate system parameters
              if (coordinateSystemObj['Category'] === 'polar') {
                for (let i = 0; i < startAngleOptions.length; i++) {
                  let startAngleVal = startAngleOptions[i]
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['CoordinateSystem']['StartAngle'] = startAngleVal
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              if (coordinateSystemObj['Category'] === 'polar') {
                if (coordinateSystemObj['PolarCenterPos'] === 'left') {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['CoordinateSystem']['PolarCenterPos'] = 'right'
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
                if (coordinateSystemObj['PolarCenterPos'] === 'right') {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['CoordinateSystem']['PolarCenterPos'] = 'left'
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
                if (coordinateSystemObj['PolarCenterPos'] === 'top') {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['CoordinateSystem']['PolarCenterPos'] = 'bottom'
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
                if (coordinateSystemObj['PolarCenterPos'] === 'bottom') {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['CoordinateSystem']['PolarCenterPos'] = 'top'
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              // make the node width/height adaptive to the node attributes
              if (layoutObj['Mode'] === 'bottom-up') {
                // do not need to specify the subtree width and height
                for (let i = 0; i < nodeWidthHeightOptions.length; i++) {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Element']['RootWidth'] = nodeWidthHeightOptions[i]
                  selectedTreeDSLContentCopy['Element']['RootHeight'] = nodeWidthHeightOptions[i]
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              } else if (layoutObj['Mode'] === 'top-down') {
                // need to specify the subtree width and height, RootWidth and RootHeight
                for (let i = 0; i < nodeWidthHeightOptions.length; i++) {
                  let selectedTreeDSLContentCopy = JSON.parse(JSON.stringify(selectedTreeDSLContent))
                  selectedTreeDSLContentCopy['Element']['RootWidth'] = nodeWidthHeightOptions[i]
                  selectedTreeDSLContentCopy['Element']['RootHeight'] = nodeWidthHeightOptions[i]
                  selectedTreeDSLContentCopy['Layout']['SubtreeWidth'] = nodeWidthHeightOptions[i]
                  selectedTreeDSLContentCopy['Layout']['SubtreeHeight'] = nodeWidthHeightOptions[i]
                  relatedTreeDSLObjList.push(selectedTreeDSLContentCopy)
                }
              }
              this.relatedTreeDSLObjList = relatedTreeDSLObjList
              this.addIndex2RelatedTreeDSLObj()
            },
            addIndex2RelatedTreeDSLObj: function() {
              let self = this
              let relatedTreeDSLObjList = this.relatedTreeDSLObjList
              let selectedTreeDSLObj = this.selectedTreeDSLObj
              let selectedTreeDSLIndex = selectedTreeDSLObj['index']
              for (let i = 0; i < relatedTreeDSLObjList.length; i++) {
                relatedTreeDSLObjList[i]['name'] = selectedTreeDSLIndex + '-' + i
              }
            },
            updateSubsetOfCurrentPage: function() {
              let itemSubset = []
              let currentPage = this.currentPage
              let pageSize = this.pageSize
              let index = (currentPage - 1) * pageSize
              while ((index < currentPage*pageSize) && (index < this.relatedTreeDSLObjList.length)) {
                  itemSubset.push(this.relatedTreeDSLObjList[index])
                  index += 1
              }
              this.itemSubsetOfCurrentPage = itemSubset
            },
            closeRelatedView: function() {
              let relatedViewOpenState = false
              this.UPDATE_RELATED_VIEW_OPEN(relatedViewOpenState)
            }
        }
    }
</script>
<style scoped lang="less">
    .treevis-related-view-wrapper {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        position: absolute;
        .treevis-related-view-title {
            width: 100%;
            top: 0px;
            height: 30px;
            left: 0%;
            font-family: 'Avenir', Helvetica, Arial, sans-serif;
            border-bottom: 1px solid #E4E7ED;
            display: flex; 
            .text {
               padding-left: 0.5rem;
               margin-left: 0; /* Important */ 
               margin-right: 0; /* Important */ 
               margin-top: auto; /* Important */ 
               margin-bottom: auto; /* Important */ 
               text-align: left;
               font-weight: bold;
            }
            .operation {
               display: flex; 
               flex-direction: row;
               align-items: baseline;
               margin-top: auto; /* Important */ 
               margin-bottom: auto; /* Important */ 
               margin-right: 0.5rem;
               margin-left: auto;
               .operation-icon {
                  padding: 0.2rem;
                  .iconfont {
                    font-size: 12px !important;
                  }
               }
               .operation-icon:hover {
                  background: #ccc !important;
               }
               .mode-selection {
                  margin-left: 0.8rem;
               }
            }
        }
        .treevis-related-view-content {
            width: 100%;
            top: 30px;
            height: calc(~'100% - 60px');
            left: 0%;
            font-family: 'Avenir', Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            .single-treevis-related-view {
              position: relative;
              border: 1px solid #E4E7ED;
              margin-top: 5px;
              .setting-container {
                position: absolute;
                top: 4px;
                right: 0px;
                .iconfont {
                  padding-top: 2px;
                  padding-bottom: 2px;
                  cursor: pointer;
                  &:hover {
                    font-weight: bold;
                  }
                }
              }
              &:hover {
                border: 1px solid gray;
              }
            }
        }
        .treevis-related-view-page {
            position: absolute;
            width: 100%;
            height: 30px;
            bottom: 0px;
            left: 0%;
        }
    }
</style>