<template>
    <div class="search-design-feature">
        <div class="intro">
            Click the design features below to filter the landscape!
        </div>
        <div class="design-feature-container">
            <span v-for="designFeatureObj in designFeatureObjList" 
                class="design-feature"
                :class="{'selected': designFeatureSelected(designFeatureObj)}"
                @click="selectDesignFeature(designFeatureObj)">
                {{designFeatureObj['label']}}
            </span>
        </div>
    </div>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex'

    export default {
        name: 'SearchDesignFeaturelTreeVis',
        components: {
           
        },
        data() {
            return {
                localSelectedDesignFeatureLabelList: [],
                designFeatureObjList: [
                    {'label': '<Coordinate System> polar',     'query': {'CoordinateSystem': {'Category': 'polar'}},     'type': 'design-feature'},
                    {'label': '<Coordinate System> cartesian', 'query': {'CoordinateSystem': {'Category': 'cartesian'}}, 'type': 'design-feature'},
                    {'label': '<Node> circle',                 'query': {'Element': {'Node': 'circle'}},                 'type': 'design-feature'},
                    {'label': '<Node> rect',                   'query': {'Element': {'Node': 'rectangle'}},              'type': 'design-feature'},
                    {'label': '<Node> hidden',                 'query': {'Element': {'Node': 'hidden'}},                 'type': 'design-feature'},
                    {'label': '<Node> ellipse',                'query': {'Element': {'Node': 'ellipse'}},                'type': 'design-feature'},
                    {'label': '<Node> triangle',               'query': {'Element': {'Node': 'triangle'}},               'type': 'design-feature'},
                    {'label': '<Link> straight',               'query': {'Element': {'Link': 'straight'}},               'type': 'design-feature'},
                    {'label': '<Link> curve',                  'query': {'Element': {'Link': 'curve'}},                  'type': 'design-feature'},
                    {'label': '<Link> arccurve',               'query': {'Element': {'Link': 'arccurve'}},               'type': 'design-feature'},
                    {'label': '<Link> curveStepAfter',         'query': {'Element': {'Link': 'curveStepAfter'}},         'type': 'design-feature'},
                    {'label': '<CentralAngle> 90',             'query': {'CoordinateSystem': {'CentralAngle': 0.25}},    'type': 'design-feature'},
                    {'label': '<CentralAngle> 180',            'query': {'CoordinateSystem': {'CentralAngle': 0.5}},     'type': 'design-feature'},
                    {'label': '<CentralAngle> 270',            'query': {'CoordinateSystem': {'CentralAngle': 0.75}},    'type': 'design-feature'},
                    {'label': '<CentralAngle> 360',            'query': {'CoordinateSystem': {'CentralAngle': 1}},       'type': 'design-feature'},
                    {'label': '<CenterType> root',             'query': {'CoordinateSystem': {'PolarCenterType': 'root'}}, 'type': 'design-feature'},
                    {'label': '<CenterType> parent',           'query': {'CoordinateSystem': {'PolarCenterType': 'parent'}}, 'type': 'design-feature'},
                    {'label': '<InnerRadius> 0%',              'query': {'CoordinateSystem': {'InnerRadius': 0}},        'type': 'design-feature'},
                    {'label': '<InnerRadius> 50%',             'query': {'CoordinateSystem': {'InnerRadius': 0.5}},      'type': 'design-feature'},
                ]
            }
        },
        watch: {
            selectedDatasetFilterList: function() {
                this.updateLocalSelectedDataFilterList()
            }
        },
        created: function () {
        },
        beforeMount: function() {
            this.updateLocalSelectedDataFilterList()
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
            updateLocalSelectedDataFilterList: function() {
                let localSelectedDesignFeatureLabelList = []
                for(let i = 0; i < this.selectedDatasetFilterList.length; i++) {
                    let filterObj = this.selectedDatasetFilterList[i]
                    if (filterObj['type'] === 'design-feature') {
                        localSelectedDesignFeatureLabelList.push(filterObj['label'])
                    }
                }
                this.localSelectedDesignFeatureLabelList = localSelectedDesignFeatureLabelList
            },
            designFeatureSelected: function(design_feature_obj) {
                let queryItemStr = design_feature_obj['label']
                if (this.localSelectedDesignFeatureLabelList.indexOf(queryItemStr) === -1) {
                    return false
                } else {
                    return true
                }
            },
            selectDesignFeature: function(designFeatureObj) {
                let queryObj = designFeatureObj['query']
                let queryItemStr = designFeatureObj['label']
                let localSelectedDesignFeatureLabelList = JSON.parse(JSON.stringify(this.localSelectedDesignFeatureLabelList))
                let queryItemStrIndex = localSelectedDesignFeatureLabelList.indexOf(queryItemStr)
                if (queryItemStrIndex === -1) {
                    localSelectedDesignFeatureLabelList.push(queryItemStr)
                } else {
                    localSelectedDesignFeatureLabelList.splice(queryItemStrIndex, 1)
                }
                this.localSelectedDesignFeatureLabelList = localSelectedDesignFeatureLabelList
                this.extractUpdateDesignFeatureObjList()
            },
            extractUpdateDesignFeatureObjList: function () {
                // update the selectedDatasetFilterList
                let localSelectedDesignFeatureObjList = []
                for (let i = 0; i < this.localSelectedDesignFeatureLabelList.length; i++) {
                    let queryItemStr = this.localSelectedDesignFeatureLabelList[i]
                    for (let j = 0; j < this.designFeatureObjList.length; j++) {
                        let designFeatureObj = this.designFeatureObjList[j]
                        if (queryItemStr === designFeatureObj['label']) {
                            localSelectedDesignFeatureObjList.push(designFeatureObj)
                        }
                    }
                }
                this.UPDATE_SELECTED_DATASET_FILTER_LIST(localSelectedDesignFeatureObjList)
            }
        }
    }
</script>
<style scoped lang="less">
    .search-design-feature {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
        width: 100%;
        word-wrap:break-word;
        .design-feature-container {
            margin-top: 10px;
            .design-feature {
                text-decoration: underline;
                text-underline-offset: 2px;
                text-decoration-color: #666666;
                text-decoration-thickness: 2px;
                margin: 5px;
                font-size: 11px;
                cursor: pointer;
                &:hover {
                    text-decoration-color: #1b9e77;//#68c23a; 1b9e77 4daf4a
                    text-decoration-thickness: 3px;
                }
                &.selected {
                    text-decoration-color: #1b9e77;//#68c23a; 1b9e77 4daf4a
                    text-decoration-thickness: 3px;
                }
            }
        }
    }
</style>