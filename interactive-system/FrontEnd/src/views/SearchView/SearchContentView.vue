<template>
    <div class="search-content-view-wrapper">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="Traditional" name="first">
                <div class="block">
                    <SearchTraditionalTreeVis></SearchTraditionalTreeVis>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Design features" name="second">
                <div class="block">
                    <SearchDesignFeature></SearchDesignFeature>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Upload" name="third">
                <div class="block">
                    <SearchUploadingFile></SearchUploadingFile>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'
    import SearchTraditionalTreeVis from './SearchTraditionalTreeVis.vue'
    import SearchDesignFeature from './SearchDesignFeature.vue'
    import SearchUploadingFile from './SearchUploadingFile.vue'

    export default {
        name: 'SearchContentView',
        components: {
            SearchTraditionalTreeVis, SearchDesignFeature, SearchUploadingFile
        },
        data() {
            return {
                activeName: 'first'
            }
        },
        watch: {

        },
        created: function () {

        },
        beforeMount: function() {

        },
        mounted: function() {
           
        },
        computed: {
          
        },
        methods: {
            handleClick(tab, event) {
            }
        }
    }
</script>
<style lang="less">
    .search-content-view-wrapper {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        .block {
            // container-height: 320px;
            // title-height: 40px;
            padding-top: 10px;
            height: 270px;
            width: 90%;
            left: 5%;
            position: relative;
        }
        .el-tabs__header {
            margin: 0 0 !important;
        }
        .el-tabs__item {
            padding: 0 15px !important;
        }
    }
</style>