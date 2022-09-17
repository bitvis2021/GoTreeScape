<template>
    <div class="inner-container" :style="{height: containerHeight + 'px'}">
        <div class="treevis-preview" :style="{width: containerHeight + 'px'}">
            <TreeCanvas :treeCanvasKey="treeCanvasDefaultPreviewKey" 
                :sendSVGData="false"
                :dslObj="getTreeVisDSLObj(treevisObj)"
                :dslIndex="treevisObj['index']"
                :initRender="true"
                :nodeArrayWithValueObj="nodeArrayWithValueObjPreview"
                :nodeArrayWithValue="nodeArrayWithValuePreview"
                :hierarchicalData="hierarchicalDataPreview">
            </TreeCanvas>
        </div>
        <div class="treevis-intro">
            <span class="treevis-info-content">
                {{ treevisObj['label'] }}
            </span>
        </div>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import TreeCanvas from '../TreeCanvasView/TreeCanvas.vue'

    export default {
        name: 'TraditionalTreeVis',
        components: {
            TreeCanvas
        },
        props: {
            treevisObj: {
              type: Object
            },
            containerHeight: {
                type: Number
            },
            treeCanvasDefaultPreviewKey: {
                type: Number
            }
        },
        data() {
            return {
                activeName: 'first',
                dslObj: null,
                nodeArrayWithValueObjPreview: null,
                hierarchicalDataPreview: null,
                nodeArrayWithValuePreview: null
            }
        },
        watch: {
        },
        created: function () {

        },
        beforeMount: function() {
            this.initTreeCanvasConfig()
        },
        mounted: function() {
        },
        computed: {
          
        },
        methods: {
            getTreeVisDSLObj: function(treevisObj) {
                let treeVisDslIndex = treevisObj['index']
                return sysDatasetObj['treeVisDSLObjCollection'][treeVisDslIndex]
            },
            initTreeCanvasConfig: function() {
                this.nodeArrayWithValueObjPreview = sysDatasetObj.getNodeArrayWithValueObjPreview()
                this.hierarchicalDataPreview = sysDatasetObj.getTreeDatasetPreview()
                this.nodeArrayWithValuePreview = sysDatasetObj.getNodeArrayWithValuePreview()
            }
        }
    }
</script>
<style lang="less">
    .inner-container {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        width: 100%;
        position: absolute;
        display: flex;
        flex-direction: row;
        .treevis-preview {
            height: 100%;
            display: inline-flex;
            border: 1px solid #dddddd;
        }
        .treevis-intro {
            width: calc(~"100% - 90px");
            padding-left: 10px;
            display: inline-flex;
            align-items: center;
        }
    }
</style>