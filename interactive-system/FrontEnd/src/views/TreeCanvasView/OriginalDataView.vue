<template>
  <div class='data-view-container'>
      <div id="original-data-view-title">
        <span class="value">{{selectedDataset}}</span>
      </div>
      <div id="original-data-view-content">
        <div id="inner-data-view-content">
          <vue-json-pretty 
            selectableType="single"
            :data="originalTreeData"
            :deep="treeDepth"
            :showDoubleQuotes="false"
            :highlightMouseoverNode="true"
            :highlightSelectedNode="true"
            :selectOnClickNode="true"
            v-model="selectedArray">
          </vue-json-pretty>
        </div>
      </div>
      <div id="data-view-toggle">
        <el-tooltip class='labelIcon' :content="selectedDataset" effect="light"> 
          <el-button plain @click="toggleDataView">
            <i class="icon iconfont" :class="previewPanelOpen?'icon-zuo':'icon-data'"></i>
          </el-button>
        </el-tooltip>
      </div>
  </div>
</template>

<script> 
  import { mapState, mapActions } from 'vuex';
  import VueJsonPretty from 'vue-json-pretty'

  export default {
    name: 'OriginalDataView',
    components: {
      VueJsonPretty
    },
    props: {
    },
    data() {
      return {
        previewPanelOpen: false,
        originalTreeData: {},
        treeDepth: 3,
        selectedArray: [],
        OPEN_PREVIEW_PANEL_DURATION: 1000
      }
    },
    created: function() {},
    mounted: function() {
      this.initTreeData()
      this.initToggleButtonPos()
    },
    updated: function() {
    },
    watch: {
      selectedDataset: function() {
        this.originalTreeData = sysDatasetObj.getTreeDatasetSelect()
      }
    },
    computed: {
      ...mapState([
        'selectedDataset'
      ])
    },
    methods: {
      ...mapActions([
      ]),
      initTreeData: function() {
        this.originalTreeData = sysDatasetObj.getTreeDatasetSelect()
      },
      initToggleButtonPos: function() {
        let toggleButtonWidth = $('#data-view-toggle').width()
        let toggleButtonHeight = $('#data-view-toggle').height()
        $('#data-view-toggle').css({right: (-toggleButtonWidth) + 'px'})
      },
      //  Operating dataview
      toggleDataView: function() {
        if (!this.previewPanelOpen) {
          this.openDataPanel()
          this.$emit('openDataView')
        } else {
          this.closeDataPanel()
          this.$emit('closeDataView')
        }
      },
      //  Open the Preview view
      openDataPanel: function() {
        if (!this.previewPanelOpen) { 
          // The current previewPanel is closed
          let duration = this.OPEN_PREVIEW_PANEL_DURATION
          let subtreePreviewPanelWidth = $('#original-data-view').width() 
          $('#original-data-view').animate({
              left: '+=' + subtreePreviewPanelWidth,
          }, duration, function () {
          })
          this.previewPanelOpen = true
        }
      },
      //  Turning off the Preview view
      closeDataPanel: function() {
        if (this.previewPanelOpen) {
          //  The current previewPanel is open
          let duration = this.OPEN_PREVIEW_PANEL_DURATION
          let subtreePreviewPanelWidth = $('#original-data-view').width()
          $('#original-data-view').animate({
              left: '-=' + subtreePreviewPanelWidth,
          }, duration, function () {
          })
          this.previewPanelOpen = false
        }
      },
    }
  }
</script>
<style lang="less">
  .data-view-container{
    .el-divider--vertical {
      margin: 0 3px !important;
    }
    .vjs-tree {
      font-size: 8px;
    }
    .vjs-value__number, .vjs-value__string {
      color: #4575b4;
    }
  }
</style>
<style scoped lang="less">
  .data-view-container {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    width: 100%;
    height: 100%;
    #data-view-toggle {
      position: absolute;
      top: 0%;
      z-index: 3;
      .iconfont {
        font-size: 1rem;
      }
    }
    .el-button {
      padding: 6px 3px;
      border-radius: 0 4px 4px 0;
    }
    #original-data-view-title {
      position: absolute;
      height: 1.5rem;
      width: 100%;
      top: 0%;
      left: 0%;
      font-size: 0.8rem;
      text-align: left;
      border-bottom: 1px solid #E4E7ED;
      display: table;
      padding-left: 0.5rem;
      .text {
        vertical-align: middle;
        display: table-cell;
        font-weight: bold;
      }
      .value {
        vertical-align: middle;
        display: table-cell;
      }
    } 
    #original-data-view-content {
      position: absolute;
      top: 1.5rem;
      bottom: 0%;
      left: 0%;
      width: 100%;
      overflow-x: auto;
      overflow-y: auto;
      #inner-data-view-content {
        text-align: left;
        padding: 5px;
        width: 100%;
      }
    }
  }
</style>