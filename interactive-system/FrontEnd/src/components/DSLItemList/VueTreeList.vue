<template>
  <div id='node-list' class='vtl' :style="{minWidth: minWidth + 'px'}" :class="{'add-border': model.name !== 'root'}">
    <div v-if="model.name !== 'root'">
      <div :class="treeNodeClass"
        :draggable="!model.dragDisabled"
        @dragstart='dragStart'
        @dragover='dragOver'
        @dragenter='dragEnter'
        @dragleave='dragLeave'
        @drop='drop'
        @dragend='dragEnd'
        @mouseover='mouseOver'
        @mouseout='mouseOut'
        @click.stop='click'>
        <span v-if="model.isLeaf">
          <slot name="leafNodeIcon">
          </slot>
        </span>
        <span v-else>
          <slot name="treeNodeIcon">
          </slot>
        </span>
        <div class="vtl-node-content" id="vtl-name">
           {{model.name}}
        </div> 
        <div class="vtl-node-content" v-if="hasValue(model)" id="vtl-colon">:</div>       
        <div class="vtl-node-content" id="vtl-value" v-if="!editable && hasValue(model)" @dblclick="setEditable">
            {{model.value}}
        </div>
        <input v-if="hasValue(model) && editable" class="vtl-input" type="text" ref="nodeInput" :value="model.value" @input="updateName" @blur="setUnEditable">
        <div class="vtl-operation" v-if="hasChildren(model)">
          <span title="open" @click.stop.prevent="toggle" v-if="!expanded">
            <slot name="openTreeNode">
              <i class="fa" aria-hidden="true"></i>
            </slot>
          </span>
          <span title="close" @click.stop.prevent="toggle" v-if="expanded">
            <slot name="closeTreeNode">
              <i class="fa " aria-hidden="true"></i>
            </slot>
          </span>
          <span title="edit" @click.stop.prevent="setEditable" v-if="!model.editNodeDisabled">
            <slot name="editNode">
              <i class="vtl-icon vtl-icon-edit"></i>
            </slot>
          </span>
        </div>
      </div>
    </div>
    
    <div :class="{'vtl-tree-margin': model.name !== 'root'}" v-show="model.name === 'root' || expanded" 
          v-if="format === 'block'">
      <div v-for="model in model.children">
        <item :default-tree-node-name="defaultTreeNodeName"
          :default-leaf-node-name="defaultLeafNodeName"
          v-bind:default-expanded="defaultExpanded"
          :model="model"
          :format="format"
          :key='model.name'>
            <slot name="openTreeNode" slot="openTreeNode" />
            <slot name="closeTreeNode" slot="closeTreeNode" />
            <slot name="editNode" slot="editNode" />
        </item>
        <div class="vtl-border vtl-bottom"
          :class="{'vtl-active': isDragEnterBottom}"
          @drop="dropBottom"
          @dragenter="dragEnterBottom"
          @dragover='dragOverBottom'
          @dragleave="dragLeaveBottom"></div>
      </div>
    </div>
    <div class="json-block" v-else>
      
    </div>
  </div>
</template>

<script>
  import { Tree, TreeNode } from './Tree.js'
  import { addHandler, removeHandler } from './tools.js'
  import VueTreeList from './VueTreeList.vue' 

  let fromComp = null

  export default {
    data: function () {
      return {
        isHover: false,
        editable: false,
        isDragEnterUp: false,
        isDragEnterBottom: false,
        isDragEnterNode: false,
        expanded: true // Change the default display tree mode to an expanded display style
      }
    },
    props: {
      model: {
        type: Object
      },
      defaultLeafNodeName: {
        type: String,
        default: 'New leaf node'
      },
      defaultTreeNodeName: {
        type: String,
        default: 'New tree node'
      },
      defaultExpanded: {
        type: Boolean,
        default: true
      },
      minWidth: {
        type: Number
      },
      format: {
        type: String
      }
    },
    watch: {
      format: function() {
        console.log('format update', this.format)
      }
    },
    computed: {
      itemIconClass () {
        return this.model.isLeaf ? 'vtl-icon-file' : 'vtl-icon-folder'
      },
      caretClass () {
        return this.expanded ? 'vtl-icon-caret-down' : 'vtl-icon-caret-right'
      },
      isFolder () {
        return this.model.children &&
          this.model.children.length
      },
      treeNodeClass () {
        const {
          model: {
            dragDisabled,
            disabled
          },
          isDragEnterNode
        } = this
        return {
          'vtl-tree-node': true,
          'vtl-active': isDragEnterNode,
          'vtl-drag-disabled': dragDisabled,
          'vtl-disabled': disabled
        }
      }
    },
    beforeMount() {
      console.log('beforeMount format', this.format)
    },
    mounted () {
      const vm = this
      addHandler(window, 'keyup', function (e) {
        // click enter
        if (e.keyCode === 13 && vm.editable) {
          vm.editable = false
        }
      })
    },
    beforeDestroy () {
      removeHandler(window, 'keyup')
    },
    methods: {
      updateName (e) {
        var oldName = this.model.value;
        console.log('e.target.value', e.target.value)
        this.model.changeValue(e.target.value)
        var node = this.getRootNode();
        node.$emit('change-name', {'id': this.model.id, 'oldValue': oldName, 'newValue': e.target.value})
      },

      delNode () {
        var node = this.getRootNode()
        node.$emit('delete-node', this.model)
      },

      setEditable () {
        this.editable = true
        this.$nextTick(() => {
          this.$refs.nodeInput.focus()
//          fireFocusEvent(this.$refs.nodeInput)
        })
      },

      setUnEditable () {
        this.editable = false
      },

      toggle() {
        if (this.isFolder) {
          this.expanded = !this.expanded
          console.log('expanded', this.expanded)
        }
      },

      mouseOver(e) {
        if (this.model.disabled) return
        this.isHover = true
      },

      mouseOut(e) {
        // TODO 
        this.isHover = false
      },

      click() {
        var node = this.getRootNode()
        node.$emit('click', this.model);
      },

      addChild(isLeaf) {
        const name = isLeaf ? this.defaultLeafNodeName : this.defaultTreeNodeName
        this.expanded = true
        var node = new TreeNode({ name, isLeaf })
        this.model.addChildren(node, true)
        var root = this.getRootNode();
        root.$emit('add-node', node)
      },

      dragStart(e) {
        if (!(this.model.dragDisabled || this.model.disabled)) {
          fromComp = this
          // for firefox
          e.dataTransfer.setData("data","data");
          e.dataTransfer.effectAllowed = 'move'
          return true
        }
        return false
      },

      dragEnd(e) {
        fromComp = null
      },

      dragOver(e) {
        e.preventDefault()
        return true
      },

      dragEnter(e) {
        // if (!fromComp) return
        // if (this.model.isLeaf) return
        // this.isDragEnterNode = true
      },
      dragLeave(e) {
        this.isDragEnterNode = false
      },
      drop(e) {
        // if (!fromComp) return
        // fromComp.model.moveInto(this.model)
        // this.isDragEnterNode = false
      },

      dragEnterUp () {
        if (!fromComp) return
        this.isDragEnterUp = true
      },
      dragOverUp (e) {
        e.preventDefault()
        return true
      },
      dragLeaveUp () {
        // if (!fromComp) return
        // this.isDragEnterUp = false
      },
      dropUp () {
        // if (!fromComp) return
        // fromComp.model.insertBefore(this.model)
        // this.isDragEnterUp = false
      },
      dragEnterBottom () {
        if (!fromComp) return
        this.isDragEnterBottom = true
      },
      dragOverBottom (e) {
        e.preventDefault()
        return true
      },
      dragLeaveBottom () {
        // if (!fromComp) return
        // this.isDragEnterBottom = false
      },
      dropBottom () {
        // if (!fromComp) return
        // fromComp.model.insertAfter(this.model)
        // this.isDragEnterBottom = false
      },
      getRootNode() {
        var node = this.$parent
        while (node._props.model.name !== 'root') {
          node = node.$parent
        }
        return node;
      },
      isObject(model) {
        let modelType = typeof model
      },
      //  To determine whether an object has a child node, the child node attribute name is children
      hasChildren(model) {
        if ((typeof(model.children) === 'undefined') || (model.children == null)) {
          return false
        } else {
          return true
        }
      },
      //  To determine whether an object has a child node, the child node attribute name is value
      hasValue(model) {
        if ((typeof(model.value) === 'undefined') || (model.value == null)) {
          return false
        } else {
          return true
        }
      }
    },
    beforeCreate () {
      this.$options.components.item = VueTreeList
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @font-face {
    font-family: 'icomoon';
    src:  url('fonts/icomoon.eot?ui1hbx');
    src:  url('fonts/icomoon.eot?ui1hbx#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?ui1hbx') format('truetype'),
    url('fonts/icomoon.woff?ui1hbx') format('woff'),
    url('fonts/icomoon.svg?ui1hbx#icomoon') format('svg');
    font-weight: normal;
    font-style: normal;
  }

  .vtl-icon {
    /* use !important to prevent issues with browser extensions that change fonts */
    font-family: 'icomoon' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;

    /* Better Font Rendering =========== */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    &.vtl-menu-icon {
      margin-right: 4px;
      &:hover {
        color: inherit;
      }
    }
    &:hover {
      color: blue;
    }
  }
  #node-list {
    // width: 100%;
    padding-right: 4%;
    border-radius: 0.3rem;
    display: block;
    width: auto;
    // flex-direction: column;
    // width: 100%;
    // background: rgba(238, 238, 238, 0.2)   
  }

  .add-border {
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .vtl-icon-file:before {
    content: "\e906";
  }
  .vtl-icon-folder:before {
    content: "\e907";
  }
  .vtl-icon-caret-down:before {
    content: "\e901";
  }
  .vtl-icon-caret-right:before {
    content: "\e900";
  }
  .vtl-icon-edit:before {
    content: "\e902";
  }
  .vtl-icon-folder-plus-e:before {
    content: "\e903";
  }
  .vtl-icon-plus:before {
    content: "\e904";
  }
  .vtl-icon-trash:before {
    content: "\e905";
  }


  .vtl-border {
    height: 0.5rem;
    &.vtl-up {
      margin-top: -5px;
      background-color: transparent;
    }
    &.vtl-bottom {
      background-color: transparent;
    }
    &.vtl-active {
      // border-bottom: 3px dashed blue;
      /*background-color: blue;*/
    }
  }

  .vtl-tree-node {
    display: flex;
    align-items: center;
    padding: 2px 0 2px 0.5rem;
    width: 100%;
    .vtl-input {
      border: none;
      width: 6.5rem;
      border-bottom: 1px solid blue;
      margin-left: 0.5rem;
    }
    &:hover {
      background-color: #f0f0f0;
    }
    &.vtl-active {
      outline: 2px dashed pink;
    }
    .vtl-caret {
      margin-left: -1rem;
    }
    .vtl-icon {
      margin-left: 2rem;
      letter-spacing: 1px;
    }
    .vtl-operation {
      margin-left: 0.5rem;
      letter-spacing: 1px;
      .icon {
        font-size: 0.8rem;
        -webkit-text-fill-color: #ccc;
        &:hover {
          -webkit-text-fill-color: steelblue !important;
        }
      }
      .icon.icon-expand {
        -webkit-text-fill-color: #006400;
      }
    }
    .vtl-node-content {
      white-space: nowrap;
      font-family: Monospace;
      &#vtl-name {
        color: rgb(70, 130, 180, 0.6);
      }
      &#vtl-colon {
        color: #999;
      }
      &#vtl-value {
        margin-left: 0.5rem;
        width: 6.5rem;
        text-align: left;
      }
    }
  }


  .vtl-item {
    cursor: pointer;
  }
  .vtl-tree-margin {
    margin-left: 0.4em;
  }
</style>
