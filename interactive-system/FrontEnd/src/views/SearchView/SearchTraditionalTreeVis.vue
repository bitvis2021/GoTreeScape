<template>
    <div class="search-traditional-tree-vis">
        <div class="traditional-tree-vis-container" ref="traditionalTreeVisContainer">
            <div v-for="treevisObj in itemSubsetOfCurrentPage"
                 class="single-tree-vis-container"
                 :class="{'selected': traditionalTreevisSelected(treevisObj)}"
                 @click="selectTraditionalTreevis(treevisObj)">
                <TraditionalTreeVis :treevisObj="treevisObj" 
                    :containerHeight="singleTraditionalTreeVisHeight-5"
                    :treeCanvasDefaultPreviewKey="treeCanvasDefaultPreviewKey">
                </TraditionalTreeVis>
            </div>
        </div>
        <div class="page-controller-wrapper">
            <el-pagination
                small
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="traditionalTreeVisObjList.length"
                @current-change="changeCurrentPage">
            </el-pagination>
        </div>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import TraditionalTreeVis from './TraditionalTreeVis.vue'
 
    export default {
        name: 'SearchTraditionalTreeVis',
        components: {
           TraditionalTreeVis
        },
        data() {
            return {
                activeName: 'first',
                traditionalTreeVisObjList: [],
                traditionalTreeVisContainerHeight: 250,
                singleTraditionalTreeVisHeight: 80,
                currentPage: 1,
                pageSize: 1,
                itemSubsetOfCurrentPage: [],
                treeCanvasDefaultPreviewKey: 1,
                localSelectedTraditionalTreevisLabelList: []
            }
        },
        watch: {
            selectedDatasetFilterList: function() {
                this.updateLocalSelectedTraditionalTreevis()
            }
        },
        created: function () {

        },
        beforeMount: function() {
            // read traditionalTreeVisObjList from systemData object and initialize the local variable
            this.traditionalTreeVisObjList = sysDatasetObj.traditionalTreeVisObjList
            this.pageSize = Math.round(this.traditionalTreeVisContainerHeight/this.singleTraditionalTreeVisHeight)
            this.updateSubsetOfCurrentPage()
            this.updateLocalSelectedTraditionalTreevis()        
        },
        mounted: function() {
        },
        updated: function() {

        },
        computed: {
            ...mapState([
                'selectedDatasetFilterList'
            ]),
        },
        methods: {
            ...mapMutations([
                'UPDATE_SELECTED_DATASET_FILTER_LIST'
            ]),
            updateLocalSelectedTraditionalTreevis: function() {
                let localSelectedTraditionalTreevisLabelList = []
                for(let i = 0; i < this.selectedDatasetFilterList.length; i++) {
                    let filterObj = this.selectedDatasetFilterList[i]
                    if (filterObj['type'] === 'traditional') {
                        localSelectedTraditionalTreevisLabelList.push(filterObj['label'])
                    }
                }
                this.localSelectedTraditionalTreevisLabelList = localSelectedTraditionalTreevisLabelList
            },
            traditionalTreevisSelected: function (treevisObj) {
                let treevisObjLabel = treevisObj['label']
                let localSelectedTraditionalTreevisLabelList = this.localSelectedTraditionalTreevisLabelList
                if (localSelectedTraditionalTreevisLabelList.indexOf(treevisObjLabel) !== -1) {
                    return true
                } else {
                    return false
                }
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
                while ((index < currentPage*pageSize) && (index < this.traditionalTreeVisObjList.length)) {
                    itemSubset.push(this.traditionalTreeVisObjList[index])
                    index += 1
                }
                this.itemSubsetOfCurrentPage = itemSubset
                console.log('itemSubset', itemSubset)
            },
            selectTraditionalTreevis: function(treevisObj) {
                let localSelectedTraditionalTreevisLabelList = [treevisObj['label']]
                this.localSelectedTraditionalTreevisLabelList = localSelectedTraditionalTreevisLabelList
                let selectedTraditionalTreevisObjList = [treevisObj]
                this.UPDATE_SELECTED_DATASET_FILTER_LIST(selectedTraditionalTreevisObjList)
            }
        }
    }
</script>
<style lang="less">
    .search-traditional-tree-vis {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        position: absolute;
        .traditional-tree-vis-container {
            position: absolute;
            height: calc(~"100% - 30px");
            width: 100%;
            display: flex;
            flex-direction: column;
            .single-tree-vis-container {
                height: 80px;
                margin: 3px 0px;
                cursor: pointer;
                &:hover {
                    background-color: #fdf6ec;
                }
                &.selected {
                    background-color: #fdf6ec;
                }
            }
        }
        .page-controller-wrapper {
            height: 30px;
            bottom: 0px;
            right: 0px;
            position: absolute;
            .el-pagination {
                padding: 0 0 !important;
            }
        }
    }
</style>