export function getIsRootCentricAttribute (coordinateSystemObj) {
    // the output value indicates whether the root centric is root-centric
    // the Center attribute is 'root' or 'parent', 
    //     if PolarCenterType is 'root', then return True
    //     if PolarCenterType is 'parent', then return False
    if (coordinateSystemObj.Category === 'polar') {
        if (typeof(coordinateSystemObj.PolarCenterType) === 'undefined') {
            // the default value of PolarCenterType is 'root'
            return true
        } else {
            // the value of PolarCenterType could be 'root' or 'parent'
            return coordinateSystemObj.PolarCenterType === 'parent' ? false : true
        }
    }
    return true
}