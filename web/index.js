/**
 * function map()
 * @param {Number} n Value
 * @param {Number} start1 source floor
 * @param {Number} stop1 source ceiling
 * @param {Number} start2 target floor
 * @param {Number} stop2 target ceiling
 * @returns {Number} Value between new boundaries
 */
function map(n, start1, stop1, start2, stop2) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  return newval;
}

de = d3.select('svg');
de.attr("stroke", "none")
  .attr("fill", "grey");
de.selectAll('path').on('mouseover', set_active)
                    .on('mouseout', set_inactive);

de.select('#outline').style.eventHandler = "none";

function set_active(d, i, nodes) {
  nodes[i].style.stroke = "black";
  nodes[i].style.zIndex = 10;
}

function set_inactive(d, i, nodes) {
  nodes[i].style.stroke = "none";
  nodes[i].style.zIndex = 0;
}