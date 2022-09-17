var compare = function(name){  
    return function(o, p){  
      var a, b;  
      if (typeof o === "object" && typeof p === "object" && o && p) {  
        a = o[name];  
        b = p[name];  
        if (a === b) {  
          return 0;  
        }  
        if (typeof a === typeof b) {  
          return a > b ? -1 : 1;  
        }  
        return typeof a > typeof b ? -1 : 1;  
      }  
      else {  
        throw ("error");  
      }  
    }  
}

function caculateStrahlerNumber(node) {
    if (node == null) return
    if (typeof(node) === 'undefined') return
    if ((typeof(node.children) === 'undefined') || (node.children.length==0)) {
        node.strahler_number = 1;
        return 1;
    }
    var freeRegisters = 0;
    var usedRegisters = 0;
    node.children.sort(compare("strahler_number"));
    for (var i = 0; i<node.children.length; i++) {  
        if(caculateStrahlerNumber(node.children[i]) > freeRegisters){
            freeRegisters = node.children[i].strahler_number;
        }
        usedRegisters = usedRegisters + 1;
        freeRegisters = freeRegisters - 1;
    }
    node.strahler_number = freeRegisters + usedRegisters;
    return freeRegisters + usedRegisters;
}

function simplify(node, threshold) {
    if (node == null) return
    if (typeof(node) === 'undefined') return
    if (node.strahler_number < threshold) {
        return null
    }
    if ((typeof(node.children) !== 'undefined') && (node.children.length !== 0)) {
        for(var i = node.children.length - 1; i >= 0 ; i--){
            if(node.children[i].strahler_number < threshold) {
                // if (typeof(node._children) === 'undefined') {
                //     node._children = []
                // }
                // node._children.push(node.children[i]);
                node.children.splice(i, 1);
            }
        }
        for (var i = 0; i < node.children.length; i++) {
            simplify(node.children[i],threshold);
        }
    }
}

function init_strahler_number(treeobj) {
    // initialize the strangler number 
    if(typeof(treeobj.strahler_number) === 'undefined') {
        treeobj["strahler_number"] = 0
    }
    if(typeof(treeobj.children) !== 'undefined') {
        for(var i = treeobj.children.length - 1; i >= 0 ; i--) {
            init_strahler_number(treeobj.children[i])
        } 
    }
}

function simplifyTreeByStrahlerNumber(root,threshold=1) {
    // simplify the hierarchical data according to the strahler number
    caculateStrahlerNumber(root);
    if(threshold > root.strahler_number){
        return {};
    }
    else{
        simplify(root,threshold);
        return root;
    }
}

function linearize_tree_obj(treeobj, treeNodeList) {
    // linearize the tree object to the node list
    treeNodeList.push(treeobj);
    if (typeof(treeobj['children']) !== 'undefined') {
        for (let i = 0; i < treeobj.children.length; i++) {
            linearize_tree_obj(treeobj.children[i], treeNodeList)
        }
    }
}

function get_strahler_number_list(treeNodeList) {
    // compute the whole strahler number list
    let strahlerNumberList = []
    for (let i = 0; i < treeNodeList.length; i++) {
        let treeNode = treeNodeList[i]
        let strahlerNumber = treeNode['strahler_number']
        if (strahlerNumberList.indexOf(strahlerNumber) === -1) {
            strahlerNumberList.push(strahlerNumber)
        }
    }
    strahlerNumberList.sort(function(a, b) {
        return b - a
    })
    return strahlerNumberList
}

function compute_strahler_number_dict(strahlerNumberList, treeNodeList) {
    //  compute the node amount with setting differen strahler number
    let strahlerNumberDict = {}
    for (let i = 0; i < strahlerNumberList.length; i++) {
        let strahlerNumber = strahlerNumberList[i]
        strahlerNumberDict[strahlerNumber] = 0
    }
    for (let temp_num in strahlerNumberDict) {
        for (let i = 0; i < treeNodeList.length; i++) {
            let treeNode = treeNodeList[i]
            let strahlerNumber = treeNode['strahler_number']
            if (strahlerNumber >= temp_num) {
                strahlerNumberDict[temp_num] += 1
            }
        }
    }
    return strahlerNumberDict
}

function compute_strahler_threshold_by_target_node_amount(strahlerNumberDict, targetNodeAmount) {
    // compute the strahler threshold by target node amount
    let strahlerNumberList = []
    for (let strahlerNumber in strahlerNumberDict) {
        strahlerNumberList.push({'strahler': strahlerNumber, 'node_amount': strahlerNumberDict[strahlerNumber]})
    }
    // sorting according to the similarity of the targetNodeAmount and the the node amount of different threshold
    strahlerNumberList.sort(function(a, b) {
        return Math.abs(a['node_amount'] - targetNodeAmount) - Math.abs(b['node_amount'] - targetNodeAmount)
    })
    return strahlerNumberList[0]['strahler']
}

export function simplify_hierarchical_data(_treeObj, targetNodeAmount) {
    // the parameters of this function is the tree object and the target node amount
    // the results is the simplified results
    let treeObj = JSON.parse(JSON.stringify(_treeObj))
    let treeNodeList = []
    init_strahler_number(treeObj)
    caculateStrahlerNumber(treeObj)
    linearize_tree_obj(treeObj, treeNodeList)
    let strahlerNumberList = get_strahler_number_list(treeNodeList)
    let strahlerNumberDict = compute_strahler_number_dict(strahlerNumberList, treeNodeList)
    let strahlerThreshold = compute_strahler_threshold_by_target_node_amount(strahlerNumberDict, targetNodeAmount)
    let simplifiedTreeObj = simplifyTreeByStrahlerNumber(treeObj, strahlerThreshold)
    return simplifiedTreeObj
}


