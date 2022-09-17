<template>
    <div class="search-view-wrapper">
        <transition name="expand" mode="out-in">
            <div class="search-view" :class="{ bigger: showButton }"  @click="searchTreeVis">
                <i class="icon iconfont search bigger icon-search"  key="small"></i>
                <!-- <el-tag v-for="filterContent in selectedDatasetFilterList"
                        :type="computeFilterType(filterContent)"
                        size="mini">
                    {{processFilterContent(filterContent)}}
                </el-tag> -->
            </div>
        </transition>
    </div>
    
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'

    export default {
        name: 'SearchView',
        components: {
           
        },
        data() {
            return {
                showButton: false
            }
        },
        watch: {
            selectedDatasetFilterList: function() {
                console.log('update')
            }
        },
        created: function () {

        },
        beforeMount: function() {

        },
        mounted: function() {
           
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
            searchTreeVis: function() {
                this.showButton = !this.showButton;
                console.log('showButton', this.showButton)
            },
            computeFilterType: function(filterContent) {
                let tagType = ''
                if (filterContent.indexOf('<') === -1) {
                    tagType = '' // traditiona tree visualizations
                } else {
                    tagType = 'danger' // design features
                }
            },
            processFilterContent: function(filterContent) {
                // extract the specific content of the filter
                let filterContentList = filterContent.split('> ')
                if (filterContentList.length > 1) {
                    return filterContentList[1]
                } else {
                    return filterContent
                }
            }
        }
    }
</script>
<style lang="less">
    .search-view-wrapper {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        // background-color: #e2e8f0;
        overflow-y: auto;
        display: flex;
        align-items: center;
        .search-view {
            width: 200px;
            border: #666666 solid 1px;
            text-align: left;
            padding: 3px;
            cursor: pointer;
            .icon-search {
                font-size: 1.5rem;
                margin-right: 0.5rem;
                // display: table;
                // margin: 0 auto;
            }
            &:hover {
                background-color: #eeeeee;
            }
        }
        .bigger {
          transition: max-height 0.25s ease-out;
          width: 200px;
          transition-duration: 0.2s;
          transition-property: width;
        }
    }
</style>