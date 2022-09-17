/* eslint-disable no-console */
/* jshint esversion: 8 */
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as m from 'lscg-solver'
import { mergeDeep } from '@/computation/deep_merge.js'
import { addDslDefaultSetting } from '@/dsl-processing/add_dsl_default_setting.js' 
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    attrObjArray: [],
    previewTreeObj: null, // the selected hierarchical object
    selectedPreviewNodeId: null,
    viewSelectionMode: 'Sibling', // 'SingleNode', "Sibling", "SameDepth"
    viewSelectionMode2: 'Subtree', //  'SingleNode', 'Subtree'
    focusedTreeObjArray: [],
    selectedDataset: null, // the selected hierarchical dataset. 
    treeUnitDSLArray: [], // the selected dsl list shown in the TreeUnit view
    treeUnitDSLName: null, // the shown dsl name shown in the TreeUnit view
    selectedDSLArray: [], //  the selected dsl list shown in the DSLList view
    changedDSLNameState: 0, 
    treeCanvasLayoutState: 0,
    treeUnitLayoutState: 0,
    treePreviewLayoutState: 0,
    selectParaName: null,
    dslListSelectedDSLName: null, // the selected dsl name in the DSLlist
    dslListSelectedDSLState: 0,
    manipulateParaValue: null,
    manipulateValue: 0,
    manipulatePara: '',
    assignNodeQuery: 'index',
    assignRecursiveMode: 'true',
    assignDSLName: '',
    assembleMode: 'bottom-up',
    assembleSubtreeWidth: 'adaptive',
    assembleSubtreeHeight: 'adaptive',
    currentTreeDSLArray: [],
    userInfoName: 'Login',
    userInfoObj: null,
    currentDragComponent: null,
    hierarchicalData: null,
    originalHierarchicalDataObj: null,
    nodeArray: [],
    originalNodeArray: [],
    hierarchicalDSL: {},
    focusedDSLObj: {},
    treeDSLArray: [],
    treeDSLArrayKey: 0,
    hoveringDSLItem: null, //  the hovering dsl object
    treeViewUpdate: 0,
    currentTree: "test",
    treeDSLViewFormat: "block",
    treeDataViewFormat: "tree",
    treeDataViewSetting: false,
    dataDisplayMode: "tree", // "tree", "level"
    selectionMode: "Subtree", //  "SingleNode", "Subtree"
    layouts: [],  
    layoutParas: {}, // the layout parameters
    treeUnitLayout: [],
    partitionValue: 0, 
    partitionDataObjDic: {},
    drawerViewSelectionState: 'template', // the selected state in the drawer view
    focusedDSLObjIndex: 0,
    // dragComponentState could be 'DRAG-START', 'DRAG-OVER', 'DRAG-END'
    dragComponentState: 'DRAG-END',
    // the different component in the tree visualization grammamr
    rootLayoutComponent: null,
    subtreeLayoutComponent: null,
    nodeComponent: null,
    linkComponent: null,
    coordComponent: null,
    hoverParam: '',
    hoverParamAxis: '',
    displayTapName: 'gotreescape', // the attribute of displayTapName is either "gotreescape" or "treeillustrator"
    positionArray: [], // node position in a tree list to compute the distance
    displayedPanel: 'map', // this state controls the displayed view, either vanvas or map
    selectedTreeDSLObj: null,
    selectedDatasetFilterList: [], // the default dataset filter
    galleryDSLObjDict: {},
    relatedViewOpen: false,
    galleryOpen: false,
    showDSLInGalery: true,
    showDSLLinkInGalery: false,
    treevisSearchResult: [],
    showLandmarkPoint: true,
    showLandmarkPreview: true,
    showExistTreePoint: false,
    showExistTreePreview: false,
    landmarkPreviewAmount: 25,
    refreshLandmarkPreviewState: 0,
    selectedNodeListInThumbnail: []
  },
  mutations: {
    ['UPDATE_CURRENT_DARG_COMPONENT'] (state, currentDragComponent) {
      state.currentDragComponent = currentDragComponent
    },
    ['UPDATE_USER_INFO_OBJ'] (state, userInfoObj) {
      state.userInfoObj = userInfoObj
    },
    ['UPDATE_USER_INFO_NAME'] (state, userInfoName) {
      state.userInfoName = userInfoName
    },
    ['UPDATE_CURRENT_TREE_DSL_ARRAY'] (state, currentTreeDSLArray) {
      state.currentTreeDSLArray = currentTreeDSLArray
    },
    ['UPDATE_ASSEMBLE_SUBTREE_HEIGHT'] (state, assembleSubtreeHeight) {
      state.assembleSubtreeHeight = assembleSubtreeHeight
    },
    ['UPDATE_ASSEMBLE_SUBTREE_WIDTH'] (state, assembleSubtreeWidth) {
      state.assembleSubtreeWidth = assembleSubtreeWidth
    },
    ['UPDATE_ASSEMBLE_MODE'] (state, assembleMode) {
      state.assembleMode = assembleMode
    },
    ['UPDATE_ASSIGN_DSL_NAME'] (state, assignDSLName) {
      state.assignDSLName = assignDSLName
    },
    ['UPDATE_ASSIGN_NODE_QUERY'] (state, assignNodeQuery) {
      state.assignNodeQuery = assignNodeQuery
    },
    ['UPDATE_ASSIGN_RECURSIVE_MODE'] (state, assignRecursiveMode) {
      state.assignRecursiveMode = assignRecursiveMode
    },
    ['UPDATE_ATTR_OBJ_ARRAY'] (state, attrObjArray) {
      state.attrObjArray = attrObjArray
    },
    ['UPDATE_VIEW_SELECTION_MODE'] (state, viewSelectionMode) {
      state.viewSelectionMode = viewSelectionMode
    },
    ['UPDATE_VIEW_SELECTION_MODE2'] (state, viewSelectionMode2) {
      state.viewSelectionMode2 = viewSelectionMode2
    },
    ['UPDATE_PREVIEW_TREE_OBJ'] (state, previewTreeObj) {
      state.previewTreeObj = previewTreeObj
    },
    ['UPDATE_FOCUS_TREE_OBJ_ARRAY'] (state, focusedTreeObjArray) {
      state.focusedTreeObjArray = focusedTreeObjArray
    },
    ['UPDATE_SELECTED_PREVIEW_NODE_ID'] (state, selectedPreviewNodeId) {
      state.selectedPreviewNodeId = selectedPreviewNodeId
    },
    //  update the selected dataset
    ['UPDATE_SELECTED_DATASET'] (state, selectedDataset) {
      state.selectedDataset = selectedDataset;
    },
    ['UPDATE_TREEUNIT_DSL_ARRAY'] (state, treeUnitDSLArray) {
      state.treeUnitDSLArray = treeUnitDSLArray;
    },
    ['UPDATE_TREEUNIT_DSL_NAME'] (state, treeUnitDSLName) {
      state.treeUnitDSLName = treeUnitDSLName;
    },
    ['UPDATE_CHANGED_DSL_NAME_STATE'] (state, changedDSLNameState) {
      state.changedDSLNameState = (state.changedDSLNameState + 1) % 2
    },
    ['UPDATE_TREE_CANVAS_LAYOUT_STATE'] (state, treeCanvasLayoutState) {
      state.treeCanvasLayoutState = (state.treeCanvasLayoutState + 1) % 2
    },
    ['UPDATE_TREE_UNIT_LAYOUT_STATE'] (state, treeUnitLayoutState) {
      state.treeUnitLayoutState = (state.treeUnitLayoutState + 1) % 2
    },
    ['UPDATE_TREE_PREVIEW_LAYOUT_STATE'] (state, treePreviewLayoutState) {
      state.treePreviewLayoutState = (state.treePreviewLayoutState + 1) % 2
    },
    //  update the tree layout
    ['UPDATE_LAYOUTS'] (state, layouts) {
      state.layouts = layouts
    },  
    ['UPDATE_TREE_UNIT_LAYOUTS'] (state, treeUnitLayout) {
      state.treeUnitLayout = treeUnitLayout
    },
    ['UPDATE_SELECT_PARA_NAME'] (state, selectParaName) {
      state.selectParaName = selectParaName
    },
    ['UPDATE_HOVER_PARAM'] (state, payload) {
      state.hoverParam = payload.param
      state.hoverParamAxis = payload.axis
    },
    ['UPDATE_DSLLIST_SELECTED_DSL_NAME'] (state, dslListSelectedDSLName) {
      state.dslListSelectedDSLName = dslListSelectedDSLName
    },
    ['UPDATE_DSLLIST_SELECTED_DSL_STATE'] (state) {
      state.dslListSelectedDSLState = (state.dslListSelectedDSLState + 1) % 2
    },
    ['MANIPULATE_PARA'] (state, payload) {
      state.manipulatePara = payload
    },
    ['MANIPULATE_VALUE'] (state, payload) {
      state.manipulateValue = payload
    },
    //	update the hierarchical data
    ['UPDATE_HIERARCHICAL_DATA'] (state, hierarchicalData) {
      state.hierarchicalData = hierarchicalData;
    },
    //  update the selected dsl array
    ['UPDATE_SELECTED_DSL_ARRAY'] (state, selectedDSLArray) {
      state.selectedDSLArray = selectedDSLArray;
    },
    //  update the hierarchical data
    ['UPDATE_ORIGINAL_HIERARCHICAL_DATA'] (state, originalHierarchicalDataObj) {
      state.originalHierarchicalDataObj = originalHierarchicalDataObj;
    },
    //	update the node list after linearizing the hierarchical data
    ['UPDATE_NODE_ARRAY'] (state, nodeArray) {
      state.nodeArray = nodeArray;
    },
    //  update the node list after    
    ['UPDATE_ORIGINAL_NODE_ARRAY'] (state, originalNodeArray) {
      state.originalNodeArray = originalNodeArray;
    },
    //  update the domain specific language of the hierarchical data
    ['UPDATE_HIERARCHICAL_DSL'] (state, hierarchicalDSL) {
      state.hierarchicalDSL = hierarchicalDSL;
    },
    //  Update current tree visualization
    ['UPDATE_CURRENT_TREE'] (state, currentTree) {
      state.currentTree = currentTree;
    },
    //  update the view format of the dsl
    ['UPDATE_DSL_VIEW_FORMAT'] (state, currentDSLFormat) {
      state.treeDSLViewFormat = currentDSLFormat
    },
    //  update the view format of data
    ['UPDATE_DATA_VIEW_FORMAT'] (state, currentDataFormat) {
      state.treeDataViewFormat = currentDataFormat
    },
    //  update the data view setting 
    ['UPDATE_DATA_VIEW_SETTING'] (state, treeDataViewSetting) {
      state.treeDataViewSetting = treeDataViewSetting
    },
    // update the dataset with tree visualization dsl 
    ['UPDATE_TREE_DSL_ARRAY'] (state, treeDSLArray) {
      state.treeDSLArray = treeDSLArray
    },
    //  update the key for saving the tree dsl list
    ['UPDATE_TREE_DSL_ARRAY_KEY'] (state, treeDSLArrayKey) {
      state.treeDSLArrayKey = treeDSLArrayKey
    },
    //  update the display mode of dataset
    ['UPDATE_DATA_DISPLAY_MODE'] (state, dataDisplayMode) {
      state.dataDisplayMode = dataDisplayMode
    },
    //  update the selected mode 
    ['UPDATE_SELECTION_MODE'] (state, selectionMode) {
      state.selectionMode = selectionMode
    },
    ['UPDATE_HOVERING_DSL_ITEM'] (state, hoveringDSLItem) {
      state.hoveringDSLItem = hoveringDSLItem
    },
    ['UPDATE_FOCUSED_DSL_OBJ'] (state, focusedDSLObj) {
      state.focusedDSLObj = focusedDSLObj
    },
    ['UPDATE_LAYOUT_PARAS'] (state, layoutParas) {
      state.layoutParas = layoutParas
    },
    ['UPDATE_PARTITION_VALUE'] (state, partitionValue) {
      state.partitionValue = partitionValue
    },
    ['UPDATE_PARTITION_DATA_OBJ_DIC'] (state, partitionDataObjDic) {
      state.partitionDataObjDic = partitionDataObjDic
    },
    ['UPDATA_DRAWER_VIEW_SELECTION_STATE'] (state, drawerViewSelectionState) {
      state.drawerViewSelectionState = drawerViewSelectionState
    },
    ['UPDATE_FOCUSED_DSL_OBJ_INDEX'] (state, focusedDSLObjIndex) {
      state.focusedDSLObjIndex = focusedDSLObjIndex
    },
    //  update the state of the drag component
    ['UPDATE_DRAG_COMPONENT_STATE'] (state, dragComponentState) {
      state.dragComponentState = dragComponentState
    },
    //  update different component
    ['UPDATE_ROOT_LAYOUT'] (state, rootLayoutComponent) {
      state.rootLayoutComponent = rootLayoutComponent
    },
    ['UPDATE_SUBTREE_LAYOUT'] (state, subtreeLayoutComponent) {
      state.subtreeLayoutComponent = subtreeLayoutComponent
    },
    ['UPDATE_NODE'] (state, nodeComponent) {
      state.nodeComponent = nodeComponent
    },
    ['UPDATE_LINK'] (state, linkComponent) {
      state.linkComponent = linkComponent
    },
    ['UPDATE_COORD'] (state, coordComponent) {
      state.coordComponent = coordComponent
    },
    ['UPDATE_DISPLAYED_PANEL'] (state) {
      if (state.displayedPanel === 'map') {
        state.displayedPanel = 'canvas'
      } else {
        state.displayedPanel = 'map'
      }
    },
    ['UPDATE_SELECTED_TREE_DSL_OBJ'] (state, selectedTreeDSLObj) {
      state.selectedTreeDSLObj = selectedTreeDSLObj
    },
    ['UPDATE_SELECTED_DATASET_FILTER_LIST'] (state, selectedDatasetFilterList) {
      state.selectedDatasetFilterList = selectedDatasetFilterList
    },
    ['UPDATE_GALLERY_DSL_OBJ_DICT'] (state, galleryDSLObjDict) {
      state.galleryDSLObjDict = galleryDSLObjDict
    },
    ['UPDATE_RELATED_VIEW_OPEN'] (state, relatedViewOpen) {
      state.relatedViewOpen = relatedViewOpen
    },
    ['UPDATE_GALLERY_OPEN'] (state, galleryOpen) {
      state.galleryOpen = galleryOpen
    },
    ['UPDATE_SHOW_DSL_IN_GALLERY'] (state, showDSLInGalery) {
      state.showDSLInGalery = showDSLInGalery
    },
    ['UPDATE_SHOW_DSL_LINK_IN_GALLERY'] (state, showDSLLinkInGalery) {
      state.showDSLLinkInGalery = showDSLLinkInGalery
    },
    ['UPDATE_TREEVIS_SEARCH_RESULT'] (state, treevisSearchResult) {
      state.treevisSearchResult = treevisSearchResult
    },
    ['UPDATE_SHOW_LAND_MARK_POINT_STATE'] (state, showLandmarkPoint) {
      state.showLandmarkPoint = showLandmarkPoint
    },
    ['UPDATE_SHOW_LAND_MARK_PREVIEW_STATE'] (state, showLandmarkPreview) {
      state.showLandmarkPreview = showLandmarkPreview
    },
    ['UPDATE_SHOW_EXISTED_TREE_POINT_STATE'] (state, showExistTreePoint) {
      state.showExistTreePoint = showExistTreePoint
    },
    ['UPDATE_SHOW_EXISTED_TREE_PREVIEW_STATE'] (state, showExistTreePreview) {
      state.showExistTreePreview = showExistTreePreview
    },
    ['UPDATE_LAND_PREVIEW_AMOUNT'] (state, landmarkPreviewAmount) {
      state.landmarkPreviewAmount = landmarkPreviewAmount
    },
    ['REFRESH_LANDMARK_PREVIEW'] (state) {
      state.refreshLandmarkPreviewState = (state.refreshLandmarkPreviewState + 1) % 2
    },
    ['UPDATE_DISPLAY_TAP_NAME'] (state, displayTapName) {
      state.displayTapName = displayTapName
    },
    ['UPDATE_SELECTED_NODE_LIST_IN_THUMBNAIL'] (state, selectedNodeListInThumbnail) {
      state.selectedNodeListInThumbnail = selectedNodeListInThumbnail
    },
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    updateTreeDSL({commit, state}, updateDSLInfo) {
      let treeDSLContent = updateDSLInfo.treeDSLContent
      let editorId = updateDSLInfo.editorId
      for (let i = 0;i < state.treeDSLArray.length;i++) {
        if(state.treeDSLArray[i].editorId === editorId) {
          state.treeDSLArray[i].content = treeDSLContent
        }
      }
    },
    updateTreeUnitLayout({commit}, payload) {
      commit('UPDATE_TREE_UNIT_LAYOUTS', payload)
    },
    setDSLComponent({commit, state}, componentObj) {
      if (state.treeUnitDSLArray.length === 0) {
        //  create a new dsl object when the current TreeUnitDSLArray is empty
        let treeUnitDSLObj = {}
        treeUnitDSLObj.name = "untitled0"
        //  initialize the dsl object in the treeUnitDSLObj
        treeUnitDSLObj.dslObj = get_new_tree_dsl_obj(treeUnitDSLObj.name)
        // merge the component object with the initialized dsl object
        treeUnitDSLObj.dslObj = mergeDeep(treeUnitDSLObj.dslObj, componentObj)
        //  update the selected dsl object
        sysDatasetObj.updateSelectedDSLObject(treeUnitDSLObj.name, treeUnitDSLObj.dslObj)
        //  add dsl object into the selected dsl list
        state.selectedDSLArray.push(treeUnitDSLObj.name)
        sysDatasetObj.updateTreeDSLContentObject(treeUnitDSLObj.name, treeUnitDSLObj.dslObj)
        // complement the unitdsl object into the TreeUnitDSL list
        state.treeUnitDSLArray.push(treeUnitDSLObj)
        state.treeUnitDSLArray = JSON.parse(JSON.stringify(state.treeUnitDSLArray))
        setTimeout(function() {
          if (state.treeUnitDSLArray.length >= 1) {
            let treeUnitDSLName = state.treeUnitDSLArray[0].name
            // select the dsl object from the dsl list
            commit('UPDATE_DSLLIST_SELECTED_DSL_NAME', treeUnitDSLName)
            commit('UPDATE_TREEUNIT_DSL_NAME', treeUnitDSLName)
          }
          // update the tree unit view after update the parameters
          commit('UPDATE_TREE_UNIT_LAYOUT_STATE')
          // update the dsl object from the tree canvas view and trigger events
          sysDatasetObj.updateTreeDSLContentObject(treeUnitDSLObj.name, treeUnitDSLObj.dslObj)
          commit('UPDATE_TREE_CANVAS_LAYOUT_STATE')
          // update the dsl object from the preview panel and trigger the events
          sysDatasetObj.updateSelectedDSLObject(treeUnitDSLObj.name, treeUnitDSLObj.dslObj)
          commit('UPDATE_TREE_PREVIEW_LAYOUT_STATE')        
        }, 200)
      } else {
        // update current dsl object when the dsl object has already exist 
        for (let i = 0;i < state.treeUnitDSLArray.length;i++) {
          let treeUnitDSLObj = state.treeUnitDSLArray[i]
          if (treeUnitDSLObj.name === state.treeUnitDSLName) {
            let existingTreeDSLObj = mergeDeep(treeUnitDSLObj.dslObj, componentObj)
            console.log('existingTreeDSLObj', existingTreeDSLObj)
            treeUnitDSLObj.dslObj = existingTreeDSLObj
            // update the tree unit view after changing the parameters
            commit('UPDATE_TREE_UNIT_LAYOUT_STATE')  
            // update the dsl object in the tree canvas view and trigger the events
            sysDatasetObj.updateTreeDSLContentObject(state.treeUnitDSLName, existingTreeDSLObj)
            commit('UPDATE_TREE_CANVAS_LAYOUT_STATE')
            // update the dsl object in the preview panel and trigger the events
            sysDatasetObj.updateSelectedDSLObject(state.treeUnitDSLName, existingTreeDSLObj)
            commit('UPDATE_TREE_PREVIEW_LAYOUT_STATE')
          }
        }
        // state.treeUnitDSLArray = JSON.parse(JSON.stringify(state.treeUnitDSLArray))       
      }
      //  initialize a new dsl object
      function get_new_tree_dsl_obj(dslName) {
        let newTreeDSLObj = {}
        addDslDefaultSetting(newTreeDSLObj)
        newTreeDSLObj.Name = dslName
        return newTreeDSLObj
      }
    },
    removeDSLComponent: function({commit, state}, componentType) {
      for (let i = 0;i < state.treeUnitDSLArray.length;i++) {
        let treeUnitDSLObj = state.treeUnitDSLArray[i]
        if (treeUnitDSLObj.name === state.treeUnitDSLName) {
          let editDSLObj = treeUnitDSLObj.dslObj
          // remove some components from the dsl object
          if (componentType === 'Root') {
            editDSLObj.Layout.X.Root.Relation = 'Undefined'
            editDSLObj.Layout.Y.Root.Relation = 'Undefined'
          } else if (componentType === 'Subtree') {
            editDSLObj.Layout.X.Subtree.Relation = 'Undefined'
            editDSLObj.Layout.Y.Subtree.Relation = 'Undefined'
          } else if (componentType === 'Node') {
            editDSLObj.Element.Node = 'hidden'
          } else if (componentType === 'Link') {
            editDSLObj.Element.Link = 'hidden'
          } else if (componentType === 'CoordinateSystem') {
            delete editDSLObj.CoordinateSystem 
          }
          // update the dsl object in the tree canvas view and trigger the evnets
          sysDatasetObj.updateTreeDSLContentObject(state.treeUnitDSLName, editDSLObj)
          commit('UPDATE_TREE_CANVAS_LAYOUT_STATE')
          // update the dsl object in the preview panel and trigger the events 
          sysDatasetObj.updateSelectedDSLObject(state.treeUnitDSLName, editDSLObj)
          commit('UPDATE_TREE_PREVIEW_LAYOUT_STATE')  
        }
      }
      state.treeUnitDSLArray = JSON.parse(JSON.stringify(state.treeUnitDSLArray))
      commit('UPDATE_TREE_UNIT_LAYOUT_STATE') 
    }
  }
})

