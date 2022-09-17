//20210904 by jiHe Wu.
//the tree in ICCVG2002
var root={
    name : 'A',
    strahler_number : 0,
    children : [
        {
            name : 'A',
            strahler_number : 0,
            children : [
                {
                    name : 'A',
                    strahler_number : 0,
                    children : [],
                    _children : []
                },
                {
                    name : 'A',
                    strahler_number : 0,
                    children : [],
                    _children : []
                },
                {
                    name : 'A',
                    strahler_number : 0,
                    children : [],
                    _children : []
                }
            ],
            _children : []
        },
        {
            name : 'A',
            strahler_number : 0,
            children : [
                {
                    name : 'A',
                    strahler_number : 0,
                    children : [
                        {
                            name : 'A',
                            strahler_number : 0,
                            children : [],
                            _children : []
                        },
                        {
                            name : 'A',
                            strahler_number : 0,
                            children : [],
                            _children : []
                        }
                    ],
                    _children : []
                },
                {
                    name : 'A',
                    strahler_number : 0,
                    children : [],
                    _children : []
                }
            ],
            _children : []
        },
        {
            name : 'A',
            strahler_number : 0,
            children : [],
            _children : []
        },
        {
            name : 'A',
            strahler_number : 0,
            children : [],
            _children : []
        }
    ],
    _children : []
};

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

function caculateStrahlerNumber(node){
    if (node == null) return
    if (typeof(node) === 'undefined') return

    if(node.children.length==0){
        node.strahler_number = 1;
        return 1;
    }
    var freeRegisters = 0;
    var usedRegisters = 0;
    node.children.sort(compare("strahler_number"));
    for(var i = 0;i<node.children.length; i++){  
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
    if(node.children.length !==0){
        for(var i = node.children.length - 1; i >= 0 ; i--){
            if(node.children[i].strahler_number < threshold) {
                node._children.push(node.children[i]);
                node.children.splice(i, 1);
            }
        }
        for (var i = 0; i < node.children.length; i++) {
            simplify(node.children[i],threshold);
        }
    }
}

function simplifyTreeByStrahlerNumber(root,threshold=1){
    caculateStrahlerNumber(root);
    if(threshold > root.strahler_number){
        return {};
    }
    else{
        simplify(root,threshold);
        return root;
    }
}

var ans = simplifyTreeByStrahlerNumber(root,3);

console.log(ans);