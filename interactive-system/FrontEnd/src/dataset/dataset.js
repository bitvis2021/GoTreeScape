import { addDslDefaultSetting } from '@/dsl-processing/add_dsl_default_setting.js'
import { getGoTreeGrammarObj } from '@/communication/sendData.js'
import { simplify_hierarchical_data } from '@/data-processing/simplify_hierarchical_data.js'

export function Dataset () {
    // the hierarchical dataset of the selected panel
	this.selectTreeDataStr = null
	this.selectTreeData = null
	this.selectNodeArrayWithValue = null
    this.selectNodeArrayWithValueObj = null
    // the hierarchical dataset of the preview panel
    this.previewTreeDataStr = null
    this.previewTreeData = null
    this.previewNodeArrayWithValue = null
    this.previewNodeArrayWithValueObj = null
    // the hierarchical data of the thumbnail panel
    this.thumbnailTreeDataStr = null
    this.thumbnailTreeData = null
    this.thumbnailNodeArrayWithValue = null
    this.thumbnailNodeArrayWithValueObj = null
    // set the threshold of the preview panel and thumbnail panel
    this.thumbnailTargetNodeAmount = 10
    this.previewTargetNodeAmount = 20
    // 
	this.selectedDSLObject = {} //hierarchicalData, treeIndexWithDSL, treeDSLContentObj
	this.allTreeObjIdArray = []
	this.layoutParas = {}
	this.attrObjArray = {}
	//
	this.originalTreeUnitData = null
	this.originalTreeUnitDataStr = null
	this.treeUnitNodeArrayWithValue = null
	//	Raw data owned by the user
	this.allTreeDatasetArray = []
	this.allTreeTemplateArray = []
    this.traditionalTreeVisObjList = []
    this.treeVisDSLObjCollection = []   
    this.existedTreeVisCollection = []
    // selected hierarchical data name
    this.selectedTreeDataName = null
}
//	Defines the prototype for Rect, the methods inside the RecT object
Dataset.prototype = {
	init: function() {
	},
	updateSelectDataset: function (selectedTreeDataName) {
        this.selectedTreeDataName = selectedTreeDataName
		// let selectTreeDataStr = JSON.stringify(this.getOriginalTreeData(selectedTreeDataName))
        let selectTreeDataStr = this.getOriginalTreeData(selectedTreeDataName)
		if (typeof(selectTreeDataStr) !== 'undefined') {
			//	Updates the default String value for the hierarchical data
			this.selectTreeDataStr = selectTreeDataStr
			let selectTreeData = {}
			try {
				if (typeof(selectTreeDataStr) === 'string') {
					selectTreeData = JSON.parse(selectTreeDataStr)
				} else {
					selectTreeData = selectTreeDataStr
				}
			} catch(e) {
		        console.log('catch JSON parse error in function updateDataset')
		    }
			//	When hierarchical data is updated by default, an index is added to the node of the hierarchical data
			this.addNodexIndex(selectTreeData)
			this.selectTreeData = selectTreeData
			//	Updates the array of nodes with attribute values
			this.selectNodeArrayWithValue = this.computeNodeArray(selectTreeData)
			// this.allTreeObjIdArray = this.computeTreeObjIdArray(this.nodeArrayWithValue)
			this.selectNodeArrayWithValueObj = this.computeNodeArrayWithValueObj(selectTreeData)
			//	Updates the hierarchicalData variable in the Layout parameter
			// this.layoutParas.hierarchicalData = originalTreeData
		}
	},
    // update the underlying hierarchical data of the thumbnails on the tree visualization landscape
    updateThumbnailDataset: function() {
        let selectTreeDataStr = this.selectTreeDataStr
        let thumbnailTargetNodeAmount = this.thumbnailTargetNodeAmount
        if (typeof(selectTreeDataStr) !== 'undefined') {
            let selectTreeData = {}
            try {
                if (typeof(selectTreeDataStr) === 'string') {
                    selectTreeData = JSON.parse(selectTreeDataStr)
                } else {
                    selectTreeData = selectTreeDataStr
                }
            } catch(e) {
                console.log('catch JSON parse error in function updateDataset')
            }
            let thumbnailTreeData = simplify_hierarchical_data(selectTreeData, thumbnailTargetNodeAmount)
            this.addNodexIndex(thumbnailTreeData)
            this.thumbnailTreeDataStr = JSON.stringify(thumbnailTreeData)
            // When hierarchical data is updated by default, an index is added to the node of the hierarchical data
            this.thumbnailTreeData = thumbnailTreeData
            console.log('thumbnailTreeData', thumbnailTreeData)
            // Updates the array of nodes with attribute values
            this.thumbnailNodeArrayWithValue = this.computeNodeArray(thumbnailTreeData)
            this.thumbnailNodeArrayWithValueObj = this.computeNodeArrayWithValueObj(thumbnailTreeData)
        }
    },
    // update the preview hierarchical data of the preview panel
    updatePreviewDataset: function() {
        let selectTreeDataStr = this.selectTreeDataStr
        let previewTargetNodeAmount = this.previewTargetNodeAmount
        if (typeof(selectTreeDataStr) !== 'undefined') {
            let selectTreeData = {}
            try {
                if (typeof(selectTreeDataStr) === 'string') {
                    selectTreeData = JSON.parse(selectTreeDataStr)
                } else {
                    selectTreeData = selectTreeDataStr
                }
            } catch(e) {
                console.log('catch JSON parse error in function updateDataset')
            }
            let previewTreeData = simplify_hierarchical_data(selectTreeData, previewTargetNodeAmount)
            this.addNodexIndex(previewTreeData)
            this.previewTreeDataStr = JSON.stringify(previewTreeData)
            // When hierarchical data is updated by default, an index is added to the node of the hierarchical data
            this.previewTreeData = previewTreeData
            // Updates the array of nodes with attribute values
            this.previewNodeArrayWithValue = this.computeNodeArray(previewTreeData)
            this.previewNodeArrayWithValueObj = this.computeNodeArrayWithValueObj(previewTreeData)
        }
    },
    // updatePreviewDataset: function(previewTreeDataName) {
    //     let previewTreeDataStr = this.getOriginalTreeData(previewTreeDataName)
    //     if (typeof(previewTreeDataStr) !== 'undefined') {
    //
    //         this.previewTreeDataStr = previewTreeDataStr
    //         let previewTreeData = {}
    //         try {
    //             if (typeof(previewTreeDataStr) === 'string') {
    //                 previewTreeData = JSON.parse(previewTreeDataStr)
    //             } else {
    //                 previewTreeData = previewTreeDataStr
    //             }
    //         } catch(e) {
    //             console.log('catch JSON parse error in function updateDataset')
    //         }
    //
    //         this.addNodexIndex(previewTreeData)
    //         this.previewTreeData = previewTreeData
    //
    //         this.previewNodeArrayWithValue = this.computeNodeArray(previewTreeData)
    //         // this.allTreeObjIdArray = this.computeTreeObjIdArray(this.nodeArrayWithValue)
    //         this.previewNodeArrayWithValueObj = this.computeNodeArrayWithValueObj(previewTreeData)
    //         console.log('previewNodeArrayWithValueObj', this.previewNodeArrayWithValueObj)
    //
    //         // this.layoutParas.hierarchicalData = originalTreeData
    //     }
    // },
    updateTraditionalTreeVisObjList: function() {
        this.traditionalTreeVisObjList = [
            {'index': 12658, 'label': 'BarcodeTree', 'type': 'traditional'},
            {'index': 9630, 'label': 'Node-Link1', 'type': 'traditional'},
            {'index': 10196, 'label': 'ArcTree', 'type': 'traditional'},
            {'index': 59868, 'label': 'Accordion', 'type': 'traditional'},
            {'index': 59225, 'label': 'BeamTree', 'type': 'traditional'},
            {'index': 12658,  'label': 'BarcodeTree', 'type': 'traditional'},
            {'index': 3193, 'label': 'Icicle plot', 'type': 'traditional'},
            {'index': 46404, 'label': 'Outside-in hierarchy', 'type': 'traditional'},
            {'index': 39114, 'label': 'Sunburst2', 'type': 'traditional'},
            {'index': 34389, 'label': 'Cheops', 'type': 'traditional'},
            {'index': 2543, 'label': 'Treemap-slice', 'type': 'traditional'},
            {'index': 31301, 'label': 'Treemap-slice', 'type': 'traditional'},
            {'index': 8437, 'label': 'Indentation', 'type': 'traditional'},
            {'index': 11048, 'label': 'IPTP', 'type': 'traditional'},
            {'index': 21493, 'label': 'Ellimaps', 'type': 'traditional'}
        ]
        for (let i = 0; i < this.traditionalTreeVisObjList.length; i++) {
            let traditionalTreeVisObj = this.traditionalTreeVisObjList[i]
            let treeVisIndex = traditionalTreeVisObj['index']
            traditionalTreeVisObj['dsl'] = this.treeVisDSLObjCollection[treeVisIndex]
            // let formData = {'dslName': treeVisIndex}
            // getGoTreeGrammarObj(formData, function(singleTreeDSLObj, dslName) {
            //     traditionalTreeVisObj['dsl'] = singleTreeDSLObj
            // })
        }
    },

	computeNodeArrayWithValueObj: function(originalTreeData) {
        let nodeArrayWithValue = this.computeNodeArray(originalTreeData)
		let nodeArrayWithValueObj = {}
		for (let i = 0; i < nodeArrayWithValue.length; i++) {
			nodeArrayWithValueObj[nodeArrayWithValue[i].data.index] = nodeArrayWithValue[i].data
			nodeArrayWithValueObj[nodeArrayWithValue[i].data.index]['depth'] = nodeArrayWithValue[i]['depth']
			nodeArrayWithValueObj[nodeArrayWithValue[i].data.index]['height'] = nodeArrayWithValue[i]['height']			
		}
		return nodeArrayWithValueObj
	},
    //  assign all nodes within nodeArrayWithValueObj as dslNameIndex, and return treeIndexWithDSL object
    computeAllNodeTreeIndexWithDSL: function(nodeArrayWithValueObj, dslNameIndex) {
      let treeIndexWithDSL = {}
      for (let item in nodeArrayWithValueObj) {
        treeIndexWithDSL[item] = dslNameIndex
      }
      return treeIndexWithDSL
    },
    // the function about getNodeArrayWithValueObj
	getNodeArrayWithValueObjPreview: function() {
		return this.previewNodeArrayWithValueObj
	},
    getNodeArrayWithValueObjSelect: function() {
        return this.selectNodeArrayWithValueObj
    },
    getNodeArrayWithValueObjThumbnail: function() {
        return this.thumbnailNodeArrayWithValueObj
    },
    // the function about getNodeArrayWithValue
    getNodeArrayWithValueSelect: function() {
        return this.selectNodeArrayWithValue
    },
    getNodeArrayWithValuePreview: function() {
        return this.previewNodeArrayWithValue
    },
    getNodeArrayWithValueThumbnail: function() {
        return this.thumbnailNodeArrayWithValue
    },
	//	Returns this subtree in the current hierarchy data, based on the node's index
	findSelectedObjectById: function(findNodeIndex) {
      let originalTreeData = this.originalTreeData
      let findNodeObj = findNodeById(originalTreeData, findNodeIndex)
      return findNodeObj
      function findNodeById (parentNodeObj, findNodeIndex) {
        if (parentNodeObj.index === findNodeIndex) {
          return parentNodeObj
        } 
        if (typeof(parentNodeObj.children) !== 'undefined') {
          let findNodeObj = null
          for (let i = 0; i < parentNodeObj.children.length; i++) {
             findNodeObj = findNodeById(parentNodeObj.children[i], findNodeIndex)
             if ((findNodeObj != null) && (typeof(findNodeObj) !== 'undefined')) {
              return findNodeObj
             }
          }
        }
      }
    },
	// 	Evaluates the index array of the hierarchical data object
	computeTreeObjIdArray: function(nodeArrayWithValue) {
		let allTreeObjIdArray = []
		for (let i = 0;i < nodeArrayWithValue.length;i++) {
			allTreeObjIdArray.push(nodeArrayWithValue[i].data.index)
		}
		return allTreeObjIdArray
	},
	getAllTreeObjIdArray: function () {
		return this.allTreeObjIdArray
	},
    // update the treeunit dataset   
	updateTreeUnitDataset: function (originalTreeUnitData) {
        //  update the default hierarchical data in the string format
		this.originalTreeUnitDataStr = JSON.stringify(originalTreeUnitData)
        //  update the default hierarchical data, add index on the nodes of hierarchical dataset   
		this.addNodexIndex(originalTreeUnitData)
		this.originalTreeUnitData = originalTreeUnitData
        //  update the node list according to tree unit object
		this.treeUnitNodeArrayWithValue = this.computeNodeArray(originalTreeUnitData)
	},
    // get the TreeDSLContentObj according to the treeIndexWithDSL object
    getTreeDSLContentObj: function(treeIndexWithDSL) {
        let treeDSLContentObj = {}
        for(let item in treeIndexWithDSL) {
           let dslName = treeIndexWithDSL[item]
           treeDSLContentObj[dslName] = this.getTreeDSLObject(dslName)
        }
        return treeDSLContentObj
    },
    //
    loadTreeDSLContentObjFromServer: function(treeIndexWithDSL, loadDataCallBack) {
        let treeDSLContentObj = {}
        let deferObjArray = []
        let index = 0
        // the matching relationship between dsl name and dsl index
        let deferObjDic = {}
        let treeDSLList = []
        let _treeIndexWithDSL = JSON.parse(JSON.stringify(treeIndexWithDSL))
        for (let item in _treeIndexWithDSL) {
            if (treeDSLList.indexOf(_treeIndexWithDSL[item]) === -1) {
                treeDSLList.push(_treeIndexWithDSL[item])
            }
        }
        for(let i = 0;i < treeDSLList.length; i++) {
            let dslName = treeDSLList[i]
            deferObjArray.push($.Deferred())
        }
        $.when(...deferObjArray).then(function() {
            loadDataCallBack(treeDSLContentObj, _treeIndexWithDSL)
        })
        for(let i = 0;i < treeDSLList.length; i++) {
            let dslName = treeDSLList[i]
            if (typeof(treeDSLContentObj[dslName]) !== 'undefined') {
                deferObjArray[i].resolve()
            } else {
                this.loadTreeDSLObject(dslName, function(singleTreeDSLObj, dslName) {
                   treeDSLContentObj[dslName] = singleTreeDSLObj
                   let dslIndex = treeDSLList.indexOf(dslName)
                   deferObjArray[dslIndex].resolve()
                })
            }
        }
    },
    // the function about get tree dataset
    getTreeDatasetSelect: function () {
        let self = this
        let treeDatasetSelect = {}
        try{
            if (typeof(self.selectTreeDataStr) === 'string') {
                console.log('parse funtion')
                treeDatasetSelect = JSON.parse(self.selectTreeDataStr)
            } 
        } catch(e) {
            console.log('catch JSON parse error in function getTreeDataset')
        }
        if (typeof(self.selectTreeDataStr) === 'object') {
            treeDatasetSelect = self.selectTreeDataStr
        }
        return treeDatasetSelect
    },
	getTreeDatasetPreview: function() {
		let self = this
		let treeDatasetPreview = {}
		try{
			if (typeof(self.previewTreeDataStr) === 'string') {
				console.log('parse funtion')
				treeDatasetPreview = JSON.parse(self.previewTreeDataStr)
			} 
		} catch(e) {
	        console.log('catch JSON parse error in function getTreeDataset')
	    }
		if (typeof(self.previewTreeDataStr) === 'object') {
			treeDatasetPreview = self.previewTreeDataStr
		}
		return treeDatasetPreview
	},
    getTreeDatasetThumbnail: function() {
        let self = this
        let treeDatasetThumbnail = {}
        try{
            if (typeof(self.thumbnailTreeDataStr) === 'string') {
                console.log('parse funtion')
                treeDatasetThumbnail = JSON.parse(self.thumbnailTreeDataStr)
            } 
        } catch(e) {
            console.log('catch JSON parse error in function getTreeDataset')
        }
        if (typeof(self.thumbnailTreeDataStr) === 'object') {
            treeDatasetThumbnail = self.thumbnailTreeDataStr
        }
        return treeDatasetThumbnail
    },
	getTreeUnitDataset: function() {
		return this.originalTreeUnitData
	},
    loadTreeDSLObject: function(dslName, callbackFunc) {
        let formData = {'dslName': dslName}
        getGoTreeGrammarObj(formData, callbackFunc)
    },
	getTreeDSLObject: function(dslName) {
        if (dslName in this.selectedDSLObject) {
            return this.selectedDSLObject[dslName]
        } 
	},
	getNodeArray: function() {
		return this.selectNodeArrayWithValue
	},
	getTreeUnitNodeArray: function() {
		return this.treeUnitNodeArrayWithValue
	},
	//	Update the layout parameters
	updateLayoutParas: function(layoutParas) {
		this.layoutParas = layoutParas
	},
	getLayoutParas: function() {
		return this.layoutParas
	},
	updateTreeUnitLayoutParas: function(treeUnitLayoutParas) {
		this.treeUnitLayoutParas = treeUnitLayoutParas
	},
	getTreeUnitLayoutParas: function() {
		return this.treeUnitLayoutParas
	},
    // compute the node array of the hierarchical dataset   
	computeNodeArray: function (data) {
		var nodes = d3.hierarchy(data)
        //  compute the node list according to the 
		var nodesArray = []
        //  compute the node list with value
		this.computeValue(nodes, nodesArray)
		return nodesArray
	},

	addNodexIndex: function (root) {
	  var queue = [];
	  var index = 0
	  queue.push(root);
	  while(queue.length !== 0){
	    var element = queue.shift();
	    if ((typeof(element) !== 'undefined') && (element != null)) {
		    element.index = 'index-' + index;
		    index = index + 1;
		    if (element.children !== undefined) {
		      for (var i=0; i<element.children.length; i++) {
		        queue.push(element.children[i]);
		      }
		    }
		}
	  }
	},
	//	Pass in hierarchical data to compute the attribute values of nodes in the hierarchical data
	computeValue: function (nodes, nodesArray) {
		let children = nodes.children
		nodesArray.push(nodes)
		if (typeof(children) !== 'undefined') {
			let value = 0
			for (let i = 0; i < children.length; i++) {
				this.computeValue(children[i], nodesArray)
				value = value + children[i].data.value
			}
			if (typeof(nodes.data.value) === 'undefined') {
				nodes.data.value = value
			}
		}
	},
	//	Breadth first traversal
	addTopDownIndex: function (root) {
	  var queue = [];
	  var topDownNodeIndex = 0
	  queue.push(root);
	  while(queue.length !== 0){
	    var element = queue.shift();
	    element.topDownNodeIndex = topDownNodeIndex;
	    topDownNodeIndex = topDownNodeIndex + 1;
	    if (element.children !== undefined) {
	      for (var i=0; i<element.children.length; i++) {
	        queue.push(element.children[i]);
	      }
	    }
	  }
	},
	//	The depth-first traversal method is used to calculate the index value of bottom-up, which is the calculation order of node positions
	addBottomUpIndex: function (root) {
		let bottomUpNodeIndex = 0
		innerAddBottomUpIndex(root)
		function innerAddBottomUpIndex (root) {
			let children = root.children
			if (typeof(children) !== 'undefined') {
				for (let i = 0; i < children.length; i++) {
					innerAddBottomUpIndex(children[i])
				}
			} 
			root.bottomUpNodeIndex = bottomUpNodeIndex
			bottomUpNodeIndex = bottomUpNodeIndex + 1
		}
	},
	//	Updates the selected DSL object
	updateSingleSelectedDSLObject: function(realdslname, dslObject) {
		this.selectedDSLObject[realdslname] = dslObject
	},
	//	Initializes the selected DSL object
	initSelectedDSLObject: function(selectedDSLArray) {
		let self = this
		let filteredSelectedDSLArray = []
		for (let i = 0; i < self.allTreeTemplateArray.length; i++) {
			let templateName = self.allTreeTemplateArray[i].treename
			let dslObject = null
			try {
				dslObject = JSON.parse(JSON.stringify(self.allTreeTemplateArray[i].template))				
			} catch(e) {
	        	console.log('catch JSON parse error in function initSelectedDSLObject')
	   		}
	   		if (dslObject != null) {
	   			if (selectedDSLArray.indexOf(templateName) !== -1) {
					self.selectedDSLObject[templateName] = dslObject
					filteredSelectedDSLArray.push(templateName)
				}
	   		}
		}
		return filteredSelectedDSLArray
	},
	//	Updates the selected DSL object
	updateSelectedDSLObject: function(dslName, dslObject) {
		this.selectedDSLObject[dslName] = dslObject
	},
	//	Updates the DSLcontent object
	updateTreeDSLContentObject: function(dslName, dslObject) {
		let treeDSLContentObj = this.layoutParas.treeDSLContentObj
		if (typeof(treeDSLContentObj) !== 'undefined') {
			if (typeof(treeDSLContentObj[dslName]) !== 'undefined') {
				treeDSLContentObj[dslName] = dslObject
			}
		}
	},
	getAllSelectedDSLObject: function() {
		return this.selectedDSLObject
	},
	getSelectedDSLObject: function(dslName) {
		return this.selectedDSLObject[dslName]
	},
	//	Check whether a DSL object exists
	isDSLObjectExist: function(dslName) {
		if (typeof(this.selectedDSLObject[dslName]) === 'undefined') {
			return false
		} else {
            return true
		}
	},
	//  Extract all attribute names
    extractAttrArray: function() {
      let hierarchicalData = this.originalTreeData
      let attrObjArray = [
        {
          attrName: 'height',
          attrType: 'number'
        },
        {
          attrName: 'width',
          attrType: 'number'
        },
        {
          attrName: 'rdepth',
          attrType: 'number'
        },
        {
          attrName: 'depth',
          attrType: 'number'  
        },
        {
          attrName: 'index',
          attrType: 'string'
        }
      ]
      // TODO
      // for (let attrName in hierarchicalData) {
      //   if ((attrName !== 'children') && (attrName !== 'index')) {
      //     let value = hierarchicalData[attrName]
      //     let attrType = typeof(value)
      //     if (attrType !== 'object') {
      //     	if (attrObjArray.map(function(e) { return e.attrName; }).indexOf(attrName) === -1) {
	     //      	attrObjArray.push({
		    //        attrName: attrName,
		    //        attrType: attrType
		    //     })
	     //    }
      //     }
          
      //   }
      // }
      return attrObjArray
    },
    //	Gets the data object based on the file name
    getOriginalTreeData: function (selectedTreeDataName) {
    	for (let i = 0;i < this.allTreeDatasetArray.length;i++) {
    		if (this.allTreeDatasetArray[i].filename === selectedTreeDataName) {
    			return this.allTreeDatasetArray[i].treedata
    		}
    	}
    },
    getOriginalTreeTemplate: function(selectedTreeTemplateName) {
    	let self = this
    	for (let i = 0;i < self.allTreeTemplateArray.length;i++) {
    		if (self.allTreeTemplateArray[i].treename === selectedTreeTemplateName) {
    			let originalTreeTemplate = {}
    			try {
    				originalTreeTemplate = JSON.parse(JSON.stringify(self.allTreeTemplateArray[i].template))
    			} catch(e) {
	        		console.log('catch JSON parse error in function getOriginalTreeTemplate')
	   			}
    			return originalTreeTemplate
    		}
    	}
    },
    removeOriginalTreeTemplate: function (removeTreeTemplateName) {
    	for (let i = 0;i < this.allTreeTemplateArray.length;i++) {
    		if (this.allTreeTemplateArray[i].treename === removeTreeTemplateName) {
    			let removedTemplateObj = this.allTreeTemplateArray.splice(i, 1)
    			return removedTemplateObj[0]
    		}
    	}
    	return null
    },
    getTreeDatasetArray: function () {
    	return this.allTreeDatasetArray
    },
    getTreeTemplateArray: function () {
    	return this.allTreeTemplateArray
    },
    //	Gets the DSL object based on the tree visual name
    getUserTreeTemplateArray: function () {
    	let userTemplateObjArray = this.allTreeTemplateArray.filter(d => (d.username !== 'root'))
    	let userTemplateArray = []
    	for (let i = 0;i < userTemplateObjArray.length;i++) {
    		try {
    			userTemplateArray.push(JSON.parse(JSON.stringify(userTemplateObjArray[i])))
    		} catch(e) {
	        	console.log('catch JSON parse error in function getUserTreeTemplateArray')
	   		}
    	}
    	return userTemplateArray
    },
    getSystemTreeTemplateArray: function() {
    	let systemTemplateObjArray = this.allTreeTemplateArray.filter(d => (d.username === 'root'))
    	let systemTemplateArray = []
    	for (let i = 0;i < systemTemplateObjArray.length;i++) {
    		try {
    			systemTemplateArray.push(JSON.parse(JSON.stringify(systemTemplateObjArray[i])))
    		} catch(e) {
	        	console.log('catch JSON parse error in function getSystemTreeTemplateArray')
	   		}
    	}
    	return systemTemplateArray
    },
    addTreeTemplateArray: function (treeTemplateArray) {
    	for (let i = 0; i < treeTemplateArray.length; i++) {
    		let templateObj = {}
    		try {
    			if (typeof(treeTemplateArray[i].template) === 'string') {
    				templateObj = JSON.parse(treeTemplateArray[i].template)
    			} else {
    				templateObj = JSON.parse(JSON.stringify(treeTemplateArray[i].template))
    			}
    		} catch(e) {
	        	console.log('catch JSON parse error in function addTreeTemplateArray')
	   		} 
	   		treeTemplateArray[i].template = templateObj
    		addDslDefaultSetting(treeTemplateArray[i].template)
    		let treeTemplateObj = treeTemplateArray[i]        	
    		let treeTemplateIndex = this.allTreeTemplateArray.findIndex(d => (d.treename === treeTemplateObj.treename));//&& (d.username === treeTemplateObj.username)
    		if (treeTemplateIndex === -1) {
    			this.allTreeTemplateArray.push(treeTemplateObj)
    		} else {
    			console.log('treeTemplateObj.treename', treeTemplateObj.treename)
    		}
    	}
    },
    //	Adds an array of data sets to the hierarchical data
    addTreeDatasetArray: function (treeDatasetArray) {
    	for (let i = 0; i < treeDatasetArray.length; i++) {
    		let treeDatasetObj = treeDatasetArray[i]
    		let treeDatasetIndex = this.allTreeDatasetArray.findIndex(d => (d.filename === treeDatasetObj.filename)); //&& (d.username === treeDatasetObj.username)
    		// if this file object does not exist, then add it in the TreeDataset Array
            if (treeDatasetIndex === -1) {
    			this.allTreeDatasetArray.push(treeDatasetArray[i])
    		}
    	}
    },
    //	Adds a data set to the hierarchical data
    addTreeDataset: function (treeDatasetObj) {
    	let treeDatasetIndex = this.allTreeDatasetArray.findIndex(d => (d.filename === treeDatasetObj.filename)); //&& (d.username === treeDatasetObj.username)
        // if this file object does not exist, then add it in the TreeDataset Array
        if (treeDatasetIndex === -1) {
    		this.allTreeDatasetArray.push(treeDatasetObj)
    	}
    },
    // tree vis dsl collection
    addTreeVisCollectionDataset: function(treevisCollectionStr) {
        let treevisCollection = treevisCollectionStr.split('\n')
        for (let i = 0;i < treevisCollection.length; i++) {
            let treevisDslStr = treevisCollection[i]
            if (treevisDslStr.length > 0) {
                treevisDslStr = treevisDslStr.replace('orthogonal', 'straight')
                this.treeVisDSLObjCollection.push(JSON.parse(treevisDslStr))
            }
        }
    },
    addExistedTreeVisCollectionDataset: function(existedTreeVisCollectionDataset) {
        let existedTreevisCollection = []
        console.log('existedTreeVisCollectionDataset', existedTreeVisCollectionDataset)
        for(let treeVisName in existedTreeVisCollectionDataset) {
            let treevisIndexList = existedTreeVisCollectionDataset[treeVisName]
            for(let i = 0; i < treevisIndexList.length; i++) {
                let treevisIndex = Number(treevisIndexList[i])
                if (existedTreevisCollection.indexOf(treevisIndex) === -1) {
                    existedTreevisCollection.push(treevisIndex)
                    break
                }
            }
        }
        console.log('existedTreevisCollection', existedTreevisCollection)
        this.existedTreeVisCollection = existedTreevisCollection
    },
    isTemplateExisted: function (treename) {
    	for (let i = 0;i < this.allTreeTemplateArray.length; i++) {
    		if (this.allTreeTemplateArray[i].treename === treename) {
    			return true
    		}
    	}
    	return false
    },
    removeAllUserTemplate: function () {
    	for (let i = 0;i < this.allTreeTemplateArray.length; i++) {
    		if (this.allTreeTemplateArray[i].username !== 'root') {
    			this.allTreeTemplateArray.splice(i, 1)
    			i = i - 1
    		}
    	}
    },
    removeAllUserDataset: function () {
    	for (let i = 0;i < this.allTreeDatasetArray.length; i++) {
    		if (this.allTreeDatasetArray[i].username !== 'root') {
    			this.allTreeDatasetArray.splice(i, 1)
    			i = i - 1
    		}
    	}
    },
    //	Updates the array of DSLS in the currently selected node
	getCurrentTreeDSLArray: function(focusedTreeObjArray) {
		let currentTreeDSLArray = []
		let layoutParas = this.getLayoutParas()
		let treeIndexWithDSL = layoutParas.treeIndexWithDSL
		for(let item in treeIndexWithDSL) {
			//   Make sure it is the currently selected node
			if (focusedTreeObjArray.indexOf(item) !== -1) {
				let dslName = treeIndexWithDSL[item]
				if (currentTreeDSLArray.indexOf(dslName) === -1) {
		            currentTreeDSLArray.push(dslName)
		        }
			}
		}
		return currentTreeDSLArray
	},
	//	Update the parameters of the tree visual layout
	updateLayoutParas: function(focusedTreeObjArray, dslItem) {
		let layoutParas = this.getLayoutParas()
		if (typeof (layoutParas.treeIndexWithDSL) === "undefined") {
			layoutParas.treeIndexWithDSL = {}
		}
		let treeIndexWithDSL = layoutParas.treeIndexWithDSL
		for (let i = 0; i < focusedTreeObjArray.length; i++) {
		    let treeNodeObjIndex = focusedTreeObjArray[i]
		    treeIndexWithDSL[treeNodeObjIndex] = dslItem
		}
		//	Modify the DSL in the treeDSLContentObj object
		let treeDSLContentObj = {}
		for(let item in treeIndexWithDSL) {
			let dslName = treeIndexWithDSL[item]
			treeDSLContentObj[dslName] = this.getTreeDSLObject(dslName)
		}
		layoutParas.treeDSLContentObj = treeDSLContentObj
	},
	// Update the elements in the treeUnitDSLArray array
	updateTreeUnitDSLArray: function (currentTreeDSLArray, _treeUnitDSLArray) {
		let layoutParas = this.getLayoutParas()
		let treeUnitDSLArray = []
		try {
			treeUnitDSLArray = JSON.parse(JSON.stringify(_treeUnitDSLArray))
	    } catch(e) {
	        console.log('catch JSON parse error in function updateTreeUnitDSLArray')
	    }
		let treeDSLContentObj = layoutParas.treeDSLContentObj
		for (let i = 0; i < currentTreeDSLArray.length; i++) {
    		let item = currentTreeDSLArray[i]
    		if (treeUnitDSLArray.filter(function(d) {return d.name === item}).length === 0) {
    			let itemVisible = false
	    		if (self.treeUnitDSLName === item) {
	    			itemVisible = true
	    		}
	    		treeUnitDSLArray.push(
	    			{
	    				name: item, 
	    				dslObj: treeDSLContentObj[item], 
	    				visible: itemVisible
	    			}
	    		)
    		}
    	}
    	return treeUnitDSLArray
	},
    /**
     * [judge whether the link should diaply on the top]
     * @param  {[type]}  dslContentObject [description]
     * @return {Boolean}                  [description]
     */
    getLinkDisplayTop: function(dslContentObjectDict) {
      let linkDisplayTop = true
      for (let dslName in dslContentObjectDict) {
        let dslContentObject = dslContentObjectDict[dslName]
        let dslObjElement = dslContentObject.Element
        if (dslObjElement.Link == 'hidden') {
          linkDisplayTop = false
          continue
        } 
        if (dslObjElement.LinkDisplay == 'bottom') {
          linkDisplayTop = false
          continue
        }
        if (typeof(dslObjElement.LinkDisplay) === 'undefined') {
          linkDisplayTop = this.extractLinkDisplayAttrByLayout(dslContentObject)
          continue
        }
      }
      return linkDisplayTop
    },
    /**
     * compute the link display attribute according to other layout attribute
     * element: circle | rectangle, ellipse, triangle
     * layout: root-sibling: x, y -  both include | one side include
     *         sibling: x, y - both flatten | one side flatten
     */
    extractLinkDisplayAttrByLayout: function (dslContentObject) {
        let dslObjElement = dslContentObject.Element
        let dslObjLayout = dslContentObject.Layout
        let dslObjCoordinateSystem = dslContentObject.CoordinateSystem
        // detailed rules
        let rootXRelation = dslObjLayout['X']['Root']['Relation']
        let siblingXRelation = dslObjLayout['X']['Subtree']['Relation']
        let rootYRelation = dslObjLayout['Y']['Root']['Relation']
        let siblingYRelation = dslObjLayout['Y']['Subtree']['Relation']
        let elementNodeType = dslObjElement['Node']
        let linkDisplayTop = true
        // the criteria of the link display computation
        if ((rootXRelation === 'include') && (rootYRelation === 'include')) {
            linkDisplayTop = true
            return linkDisplayTop
        }
        if (((rootXRelation === 'include') && (rootYRelation !== 'juxtapose')) || ((rootYRelation === 'include') && (rootXRelation !== 'juxtapose'))) {
            if (elementNodeType === 'circle') {
                linkDisplayTop = false
                return linkDisplayTop
            }
            if ((siblingXRelation === 'flatten') && (siblingYRelation === 'flatten')) {
                linkDisplayTop = false
                return linkDisplayTop
            }
            linkDisplayTop = true
            return linkDisplayTop
        } 
        if (((rootYRelation === 'include') && (siblingYRelation === 'align')) 
            || ((rootXRelation === 'include') && (siblingXRelation === 'align'))) {
            if (elementNodeType === 'circle') {
                linkDisplayTop = false
                return linkDisplayTop
            } else {
                linkDisplayTop = true
                return linkDisplayTop
            }
        }
        return false
    }
}
