/**
 * Reroute point management module
 * Handles creating and removing reroute points on connections
 */

import { createCurvature } from '../utils/curvature.js';

/**
 * Handle double click for reroute points
 * @param {MouseEvent} e - Mouse event
 */
export function dblclick(e) {
  if(this.connection_selected != null && this.reroute) {
    this.createReroutePoint(this.connection_selected);
  }

  if(e.target.classList[0] === 'point') {
    this.removeReroutePoint(e.target);
  }
}

/**
 * Create a reroute point on the selected connection
 * @param {HTMLElement} ele - Connection element
 */
export function createReroutePoint(ele) {
  this.connection_selected.classList.remove("selected");
  const nodeUpdate = this.connection_selected.parentElement.classList[2].slice(9);
  const nodeUpdateIn = this.connection_selected.parentElement.classList[1].slice(13);
  const output_class = this.connection_selected.parentElement.classList[3];
  const input_class = this.connection_selected.parentElement.classList[4];
  this.connection_selected = null;
  const point = document.createElementNS('http://www.w3.org/2000/svg',"circle");
  point.classList.add("point");
  var pos_x = this.pos_x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)));
  var pos_y = this.pos_y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)));

  point.setAttributeNS(null, 'cx', pos_x);
  point.setAttributeNS(null, 'cy', pos_y);
  point.setAttributeNS(null, 'r', this.reroute_width);

  let position_add_array_point = 0;
  if(this.reroute_fix_curvature) {

    const numberPoints = ele.parentElement.querySelectorAll(".main-path").length;
    var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
    path.classList.add("main-path");
    path.setAttributeNS(null, 'd', '');

    ele.parentElement.insertBefore(path, ele.parentElement.children[numberPoints]);
    if(numberPoints === 1) {
      ele.parentElement.appendChild(point);
    }  else {
      const search_point = Array.from(ele.parentElement.children).indexOf(ele)
      position_add_array_point = search_point;
      ele.parentElement.insertBefore(point, ele.parentElement.children[search_point+numberPoints+1]);
    }

  } else {
    ele.parentElement.appendChild(point);
  }

  const nodeId = nodeUpdate.slice(5);
  const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
    return item.node ===  nodeUpdateIn && item.output === input_class;
  });

  if(this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points === undefined)  {
    this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points = [];
  }

  if(this.reroute_fix_curvature) {

    if(position_add_array_point > 0 || this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points !== []) {
      this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.splice(position_add_array_point, 0, { pos_x: pos_x, pos_y: pos_y });
    } else {
      this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.push({ pos_x: pos_x, pos_y: pos_y });
    }

    ele.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
      item.classList.remove("selected");
    });

  } else {
    this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.push({ pos_x: pos_x, pos_y: pos_y });
  }

  this.dispatch('addReroute', nodeId);
  this.updateConnectionNodes(nodeUpdate);
}

/**
 * Remove a reroute point
 * @param {HTMLElement} ele - Reroute point element
 */
export function removeReroutePoint(ele) {
  const nodeUpdate = ele.parentElement.classList[2].slice(9)
  const nodeUpdateIn = ele.parentElement.classList[1].slice(13);
  const output_class = ele.parentElement.classList[3];
  const input_class = ele.parentElement.classList[4];

  let numberPointPosition = Array.from(ele.parentElement.children).indexOf(ele);
  const nodeId = nodeUpdate.slice(5);
  const searchConnection = this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections.findIndex(function(item,i) {
    return item.node ===  nodeUpdateIn && item.output === input_class;
  });

  if(this.reroute_fix_curvature) {
     const numberMainPath = ele.parentElement.querySelectorAll(".main-path").length
     ele.parentElement.children[numberMainPath-1].remove();
     numberPointPosition -= numberMainPath;
     if(numberPointPosition < 0) {
       numberPointPosition = 0;
     }
  } else {
    numberPointPosition--;
  }
  this.drawflow.drawflow[this.module].data[nodeId].outputs[output_class].connections[searchConnection].points.splice(numberPointPosition,1);

  ele.remove();
  this.dispatch('removeReroute', nodeId);
  this.updateConnectionNodes(nodeUpdate);
}

/**
 * Add reroute points from import data
 * @param {Object} dataNode - Node data
 */
export function addRerouteImport(dataNode) {
  const reroute_width = this.reroute_width
  const reroute_fix_curvature = this.reroute_fix_curvature
  const container = this.container;
  Object.keys(dataNode.outputs).map(function(output_item, index) {
    Object.keys(dataNode.outputs[output_item].connections).map(function(input_item, index) {
      const points = dataNode.outputs[output_item].connections[input_item].points
      if(points !== undefined) {

        points.forEach((item, i) => {
          const input_id = dataNode.outputs[output_item].connections[input_item].node;
          const input_class = dataNode.outputs[output_item].connections[input_item].output;
          const ele = container.querySelector('.connection.node_in_node-'+input_id+'.node_out_node-'+dataNode.id+'.'+output_item+'.'+input_class);

          if(reroute_fix_curvature) {
            if(i === 0) {
              for (var z = 0; z < points.length; z++) {
                var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
                path.classList.add("main-path");
                path.setAttributeNS(null, 'd', '');
                ele.appendChild(path);

              }
            }
          }

          const point = document.createElementNS('http://www.w3.org/2000/svg',"circle");
          point.classList.add("point");
          var pos_x = item.pos_x;
          var pos_y = item.pos_y;

          point.setAttributeNS(null, 'cx', pos_x);
          point.setAttributeNS(null, 'cy', pos_y);
          point.setAttributeNS(null, 'r', reroute_width);

          ele.appendChild(point);
        });
      };
    });
  });
}
