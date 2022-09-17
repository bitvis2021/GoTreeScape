<template>
    <div class="treevis-gallery-view-wrapper">
        <div class="gallery-view-title">
            <span class = "text"> {{ title }} </span>
            <span class = "operation">
              <el-tooltip class='labelIcon' content="show eploration history" effect="light"> 
                <span class = "operation-icon" @click.stop.prevent="showPointInLandscape">
                  <span class="icon iconfont icon-icon_locationsvg" :class="{'active': showDSLInGalery}"></span>
                </span>
              </el-tooltip>      
                <el-divider direction="vertical"></el-divider>
                <el-tooltip class='labelIcon' content="show eploration path" effect="light"> 
                    <span class = "operation-icon" @click.stop.prevent="showLinkInLandscape">
                        <span class="icon iconfont icon-xiansuo" :class="{'active': showDSLLinkInGalery}"></span>
                    </span>
                </el-tooltip>
            </span>
        </div>
        <div class="gallery-view-content" ref="galleryViewContent">
            <div class="single-treevis-related-view"
                :style="{'width': singleTreeVisRelatedViewWidth + 'px', height: singleTreeVisRelatedViewWidth +'px'}"
                v-for="(treeDSLObj, index) in itemSubsetOfCurrentPage">
                <TreeCanvas :treeCanvasKey="treeCanvasDefaultPreviewKey" 
                    :sendSVGData="false"
                    :dslObj="treeDSLObj"
                    :dslIndex="index"
                    :initRender="true"
                    :nodeArrayWithValueObj="nodeArrayWithValueObjSelect"
                    :nodeArrayWithValue="nodeArrayWithValueSelect"
                    :hierarchicalData="hierarchicalDataSelect">
                </TreeCanvas>
            </div>
        </div>
        <div class="treevis-related-view-page">
            <el-pagination
                small
                v-show="galleryDSLAmount>0 && pageSize>0"
                layout="prev, pager, next"
                :page-size="pageSize"
                :current-page="currentPage"
                :total="galleryDSLAmount"
                @current-change="changeCurrentPage">
            </el-pagination>
        </div>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import TreeCanvas from '../TreeCanvasView/TreeCanvas.vue'

    export default {
        name: 'TreeGalleryView',
        components: {
          TreeCanvas
        },
        data() {
            return {
                title: 'Gallery',
                galleryTreeDSLObjList: [],
                itemSubsetOfCurrentPage: [],
                treeCanvasDefaultPreviewKey: 1,
                treevisRelatedViewHeight: 0,
                treevisRelatedViewWidth: 0,
                singleTreeVisRelatedViewWidth: 0,
                padding: 15,
                pageSize: 0,
                currentPage: 1,
                nodeArrayWithValueObjSelect: null,
                nodeArrayWithValueSelect: null,
                hierarchicalDataSelect: null
            }
        },
        props: {
        },
        watch: {
          galleryDSLObjDict: function() {
            this.updateGalleryTreeDSLObjList()
            this.currentPage = 1
            this.updateSubsetOfCurrentPage()
            this.treeCanvasDefaultPreviewKey = (this.treeCanvasDefaultPreviewKey+1)%2
          },
          galleryOpen: function() {
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
          this.updateGalleryTreeDSLObjList()
          this.updateSubsetOfCurrentPage()
        },
        computed: {
          ...mapState([
              'selectedTreeDSLObj',
              'galleryOpen',
              'galleryDSLObjDict',
              'showDSLInGalery',
              'showDSLLinkInGalery'
          ]),
          galleryDSLAmount: function() {
            let dslAmount = 0
            for (let dsl in this.galleryDSLObjDict) {
              dslAmount += 1
            }
            return dslAmount
          }
        },
        methods: {
            ...mapMutations([
              'UPDATE_RELATED_VIEW_OPEN',
              'UPDATE_SHOW_DSL_IN_GALLERY',
              'UPDATE_SHOW_DSL_LINK_IN_GALLERY'
            ]),
            initTreeCanvasParas: function() {
              // initialize the parameters of the tree canvas components
              let self = this
              self.nodeArrayWithValueObjSelect = sysDatasetObj.getNodeArrayWithValueObjSelect()
              self.hierarchicalDataSelect = sysDatasetObj.getTreeDatasetSelect()
              self.nodeArrayWithValueSelect = sysDatasetObj.getNodeArrayWithValueSelect()
            },
            updateGalleryTreeDSLObjList: function() {
              let galleryDSLObjDict = this.galleryDSLObjDict
              let galleryTreeDSLObjList = []
              for (let dslIndex in galleryDSLObjDict) {
                let dslObjList = galleryDSLObjDict[dslIndex]
                for(let i = 0; i < dslObjList.length; i++) {
                  galleryTreeDSLObjList.push(dslObjList[i])
                }
              }
              this.galleryTreeDSLObjList = galleryTreeDSLObjList
            },
            updatePageSize: function() {
              let galleryViewContentHeight = this.$refs.galleryViewContent.clientHeight;
              let galleryViewContentWidth = this.$refs.galleryViewContent.clientWidth;
              let singleTreeVisRelatedViewWidth = galleryViewContentWidth - this.padding * 2
              this.singleTreeVisRelatedViewWidth = singleTreeVisRelatedViewWidth
              this.pageSize = Math.ceil(galleryViewContentHeight / singleTreeVisRelatedViewWidth)
              this.singleTreeVisRelatedViewWidth = Math.floor(galleryViewContentHeight / this.pageSize) - 8
            },
            changeCurrentPage: function(currentPage) {
              this.currentPage = currentPage
              this.updateSubsetOfCurrentPage()
              this.treeCanvasDefaultPreviewKey = (this.treeCanvasDefaultPreviewKey+1)%2
            },
            updateSubsetOfCurrentPage: function() {
              let itemSubset = []
              let currentPage = this.currentPage
              let pageSize = this.pageSize
              let index = (currentPage - 1) * pageSize
              while ((index < currentPage*pageSize) && (index < this.galleryTreeDSLObjList.length)) {
                console.log('this.galleryTreeDSLObjList[index]', this.galleryTreeDSLObjList[index])
                  itemSubset.push(this.galleryTreeDSLObjList[index])
                  index += 1
              }
              this.itemSubsetOfCurrentPage = itemSubset
            },
            closeRelatedView: function() {
              let relatedViewOpenState = false
              this.UPDATE_RELATED_VIEW_OPEN(relatedViewOpenState)
            },
            showPointInLandscape: function() {
              this.UPDATE_SHOW_DSL_IN_GALLERY(!this.showDSLInGalery)
              console.log('showDSLInGalery', this.showDSLInGalery)
            },
            showLinkInLandscape: function() {
              this.UPDATE_SHOW_DSL_LINK_IN_GALLERY(!this.showDSLLinkInGalery)
              console.log('showDSLLinkInGalery', this.showDSLLinkInGalery)
            }
        }
    }
</script>
<style scoped lang="less">
    .treevis-gallery-view-wrapper {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        position: absolute;
        .gallery-view-title {
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
               font-size: 14px;
               .operation-icon {
                  padding: 0.2rem;
                  .iconfont {
                    color: #dddddd;
                    &.active {
                      color: #000000;
                    }
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
        .gallery-view-content {
            width: 100%;
            top: 30px;
            height: calc(~'100% - 60px');
            left: 0%;
            font-family: 'Avenir', Helvetica, Arial, sans-serif;
            border-bottom: 1px solid #E4E7ED;
            display: flex;
            flex-direction: column;
            align-items: center;
            .single-treevis-related-view {
              border: 1px solid #E4E7ED;
              margin-top: 5px;
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