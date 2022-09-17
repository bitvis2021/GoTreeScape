export function computeTreevisNodePath (d) {
    let radius = 3
    let rectPathObj = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(-Math.PI)
        .endAngle(Math.PI)
    return rectPathObj()
}