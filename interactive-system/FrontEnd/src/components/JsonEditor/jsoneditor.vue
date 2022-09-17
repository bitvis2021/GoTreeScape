<template>
  <div class="jsoneditor" :id="editorId">
  </div>  
</template>

<script>
  import Vue from 'vue';
  // Modify the treemode.js, Node.js, and i18n in Src when implement the selection fuction in jsoneditor.
  import JSONEditor from 'jsoneditor';
  import 'jsoneditor/dist/jsoneditor.css';

  export default {
    name: 'HelloWorld',
    props: {
      editorId:{
        type: String
      },
      editorBg:{
        type: String
      },
      editorSetting: {
        type: Boolean
      },
      editorMode: {
        type: String
      },
      content: {
        type: Object
      },
      editorExpand: {
        default: true,
        type: Boolean
      },
      jsonEditorHeight:{
        type: Number
      },
      treeDSLSchema: {},
      autoCompleteOption: {
        type: Array
      }
    }, 
    data() {
      return {
      }
    },
    components: {},
    created: function() {},
    mounted: function() {
      var self = this
      console.log('self.treeDSLSchema', self.treeDSLSchema)
      var container = document.getElementById(this.editorId);  
      var options = {
        modes: ['text', 'code', 'tree', 'form', 'view'],
        mode: self.editorMode,
        search: false,
        schema: self.treeDSLSchema,
        mainMenuBar: self.editorSetting,
        autocomplete: {
          getOptions: function () {
            return self.autoCompleteOption;
          }
        },
        onModeChange: function(newMode, oldMode) {
          self.updateMode(newMode)
          self.updateEditorWidth()
          self.updateEditorColor()
          self.updateEditorBorder()
          self.updateEditorText()
          if (((newMode === 'tree') || (newMode === 'form') || (newMode === 'view')) && (this.editorExpand)) {
            self.editor.expandAll()
          }
        },
        onTextSelectionChange: function(start, end, text) {
        },
        onSelectionChange: function(start, end) {
          if (typeof(start) !== 'undefined') {
            console.log('start', start)
            let selectedItem = start.value
            self.updateSelectedItem(selectedItem)
          } else {
            self.updateSelectedItem(null)
          }
        },
        onChange: function() {
          console.log('onchange', onchange)
          let json = self.editor.get()
          self.updateHierarchicalData(json)
        },
        onEvent: function(node, event) {
          if (event.type === 'mouseover') {
            var message = 'mouseover on <' + node.field +
              '> under path <' + node.path + 
              '> with pretty path: <' + prettyPrintPath(node.path) + '>';
            if (node.value) message += ' with value <' + node.value + '>';
            // self.updateHoveringItem(message)
            self.updateHoveringItem(node)
          }
          if (event.type === 'mouseout') {
            var message = null
            self.updateHoveringItem(message)
          }
          function prettyPrintPath(path) {
            var str = '';
            for (var i=0; i<path.length; i++) {
              var element = path[i];
              if (typeof element === 'number') {
                str += '[' + element + ']'
              } else {
                if (str.length > 0) str += ',';
                str += element; 
              }
            }
            return str;
          }
        }
      };

      // let editor = new JSONEditor(container, options, json);
      let editor = new JSONEditor(container, options, this.content);
      self.editor = editor
      // get json
      var json = editor.get();
      self.editor = editor
      self.options = options
      self.data = json
      //  Initializes the view's own EditorMode
      self.localEditorMode = this.editorMode
      if (((self.editorMode === 'tree') || (self.editorMode === 'form') || (self.editorMode === 'view')) && (self.editorExpand)) {
        self.editor.expandAll()
      }
      self.updateEditorWidth()
      self.updateEditorColor()
      self.updateEditorText()
      self.updateEditorBorder()
    },
    watch: {
      editorSetting: function() {
        console.log('change editorSetting', this.editorSetting)
        // this.options.mainMenuBar = this.editorSetting
        console.log('this.options', this.options)
        this.editor.setSchema(this.options)
        // this.editor.options.mainMenuBar = this.editorSetting
        // this.editor.options.mode = "code"
        console.log('options', this.editor.options)
        this.editor.refresh()
      }
    },
    computed: {},  
    methods: {
      updateEditorWidth: function() {
        let jsonEditorWidth = $('.jsoneditor').width()
        let inputWidth = jsonEditorWidth - 270
        $('#' + this.editorId + ' table.jsoneditor-search input').width(inputWidth)
      },
      updateEditorColor: function() {
        $('#' + this.editorId + ' .jsoneditor-menu').css("background-color", this.editorBg)
      },
      updateEditorBorder: function() {
        $('div.jsoneditor').css('border', 0)
      },
      updateEditorText: function() {
        $('div.jsoneditor-value.jsoneditor-string').css('white-space', 'nowrap')
        $('.ace_variable').css('white-space', 'nowrap')
        $('.jsoneditor-tree').css('white-space', 'nowrap')
        $('textarea.jsoneditor-text, .ace-jsoneditor').css('min-height', this.jsonEditorHeight + 'px')
      },
      //  Update the mode option of the parent component
      updateMode: function (newMode) {
        let newModeObj = {
          mode: newMode,
          editorId: this.editorId
        }
        this.$emit('updateMode', newModeObj)
      },
      //  Pass the selected item
      updateSelectedItem: function (selectedItem) {
        this.$emit('updateSelectedItem', selectedItem)
      },
      //  Update the hierarchical data structure passed in the Editor
      updateHierarchicalData: function(treeData) {
        this.$emit('updateHierarchicalData', treeData, this.editorId)
      },
      // Update parameters for the current hover of the mouse
      updateHoveringItem: function(item) {
        this.$emit('updateHoveringItem', item)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  div.jsoneditor-field, 
  div.jsoneditor-value, 
  div.jsoneditor td, 
  div.jsoneditor th, 
  div.jsoneditor textarea, 
  .jsoneditor-schema-error {
    font-size: 0.8rem;
  }
</style>

<style lang="less" rel="stylesheet/less" scoped>
  #jsoneditor {
    width: 100%;
    left: 0%;
    top: 0%;
    height: 100%;
  }
  .icon {
    &:hover {
      cursor: pointer;
    }
  }
  div.jsoneditor-tree div.jsoneditor-tree-inner {
    padding-bottom: 50px;
  }
  div.jsoneditor-outer.has-nav-bar.has-main-menu-bar {
    padding-right: 5px;
  }
  // .jsoneditor-tree {
  //   .jsoneditor-value {
  //     white-space: nowrap;
  //   }
  // }
</style>