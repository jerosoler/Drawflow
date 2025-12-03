/**
 * Connection management module
 * Handles drawing, updating, adding and removing connections
 */

import { createCurvature } from '../utils/curvature.js';

/**
 * Start drawing a new connection
 * @param {HTMLElement} ele - Output element to connect from
 */
export function drawConnection(ele) {
  var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
  this.connection_ele = connection;
  var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
  path.classList.add("main-path");
  path.setAttributeNS(null, 'd', '');
  // path.innerHTML = 'a';
  connection.classList.add("connection");
  connection.appendChild(path);
  this.precanvas.appendChild(connection);
  var id_output = ele.parentElement.parentElement.id.slice(5);
  var output_class = ele.classList[1];
  this.dispatch('connectionStart', { output_id: id_output, output_class:  output_class });
}

/**
 * Update connection path while dragging
 * @param {number} eX - Mouse X position
 * @param {number} eY - Mouse Y position
 */
export function updateConnection(eX, eY) {
  const precanvas = this.precanvas;
  const zoom = this.zoom;
  let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
  precanvasWitdhZoom = precanvasWitdhZoom || 0;
  let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
  precanvasHeightZoom = precanvasHeightZoom || 0;
  var path = this.connection_ele.children[0];

  var line_x = this.ele_selected.offsetWidth/2 + (this.ele_selected.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
  var line_y = this.ele_selected.offsetHeight/2 + (this.ele_selected.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

  var x = eX * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x *  ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) );
  var y = eY * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y *  ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) );

  var curvature = this.curvature;
  var lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
  path.setAttributeNS(null, 'd', lineCurve);
}

/**
 * Add a connection between two nodes
 * @param {string|number} id_output - Output node ID
 * @param {string|number} id_input - Input node ID
 * @param {string} output_class - Output class name
 * @param {string} input_class - Input class name
 */
export function addConnection(id_output, id_input, output_class, input_class) {
  var nodeOneModule = this.getModuleFromNodeId(id_output);
  var nodeTwoModule = this.getModuleFromNodeId(id_input);
  if(nodeOneModule === nodeTwoModule) {

    var dataNode = this.getNodeFromId(id_output);
    var exist = false;
    for(var checkOutput in dataNode.outputs[output_class].connections){
      var connectionSearch = dataNode.outputs[output_class].connections[checkOutput]
      if(connectionSearch.node == id_input && connectionSearch.output == input_class) {
          exist = true;
      }
    }
    // Check connection exist
    if(exist === false) {
      //Create Connection
      this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.push( {"node": id_input.toString(), "output": input_class});
      this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.push( {"node": id_output.toString(), "input": output_class});

      if(this.module === nodeOneModule) {
      //Draw connection
        var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
        var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
        path.classList.add("main-path");
        path.setAttributeNS(null, 'd', '');
        // path.innerHTML = 'a';
        connection.classList.add("connection");
        connection.classList.add("node_in_node-"+id_input);
        connection.classList.add("node_out_node-"+id_output);
        connection.classList.add(output_class);
        connection.classList.add(input_class);
        connection.appendChild(path);
        this.precanvas.appendChild(connection);
        this.updateConnectionNodes('node-'+id_output);
        this.updateConnectionNodes('node-'+id_input);
      }

      this.dispatch('connectionCreated', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class});
    }
  }
}

/**
 * Update connection node paths
 * @param {string} id - Node ID
 */
export function updateConnectionNodes(id) {

  const idSearch = 'node_in_'+id;
  const idSearchOut = 'node_out_'+id;
  var line_path = this.line_path/2;
  const container = this.container;
  const precanvas = this.precanvas;
  const curvature = this.curvature;
  const reroute_curvature = this.reroute_curvature;
  const reroute_curvature_start_end = this.reroute_curvature_start_end;
  const reroute_fix_curvature = this.reroute_fix_curvature;
  const rerouteWidth = this.reroute_width;
  const zoom = this.zoom;
  let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
  precanvasWitdhZoom = precanvasWitdhZoom || 0;
  let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
  precanvasHeightZoom = precanvasHeightZoom || 0;

  const elemsOut = container.querySelectorAll(`.${idSearchOut}`);

  Object.keys(elemsOut).map(function(item, index) {
    if(elemsOut[item].querySelector('.point') === null) {

      var elemtsearchId_out = container.querySelector(`#${id}`);

      var id_search = elemsOut[item].classList[1].replace('node_in_', '');
      var elemtsearchId = container.querySelector(`#${id_search}`);

      var elemtsearch = elemtsearchId.querySelectorAll('.'+elemsOut[item].classList[4])[0]

      var eX = elemtsearch.offsetWidth/2 + (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
      var eY = elemtsearch.offsetHeight/2 + (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

      var elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0]

      var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
      var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

      var x = eX;
      var y = eY;

      const lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
      elemsOut[item].children[0].setAttributeNS(null, 'd', lineCurve );
    } else {
      const points = elemsOut[item].querySelectorAll('.point');
      let linecurve = '';
      const reoute_fix = [];
      points.forEach((item, i) => {
        if(i === 0 && ((points.length -1) === 0)) {

          var elemtsearchId_out = container.querySelector(`#${id}`);
          var elemtsearch = item;

          var eX =  (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY =  (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;

          var elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[3])[0]
          var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

          var elemtsearchId_out = item;
          var id_search = item.parentElement.classList[1].replace('node_in_', '');
          var elemtsearchId = container.querySelector(`#${id_search}`);
          var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

          var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
          var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;


          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

        } else if(i === 0) {

          var elemtsearchId_out = container.querySelector(`#${id}`);
          var elemtsearch = item;

          var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;

          var elemtsearchOut = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[3])[0]
          var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

          // SECOND
          var elemtsearchId_out = item;
          var elemtsearch = points[i+1];

          var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

        } else if (i === (points.length -1)) {

          var elemtsearchId_out = item;

          var id_search = item.parentElement.classList[1].replace('node_in_', '');
          var elemtsearchId = container.querySelector(`#${id_search}`);
          var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

          var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
          var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;
          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

        } else {
          var elemtsearchId_out = item;
          var elemtsearch = points[i+1];

          var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
          var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) +rerouteWidth;
          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * (precanvas.clientWidth / (precanvas.clientWidth * zoom)) + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * (precanvas.clientHeight / (precanvas.clientHeight * zoom)) + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);
        }

      });
      if(reroute_fix_curvature) {
        reoute_fix.forEach((itempath, i) => {
          elemsOut[item].children[i].setAttributeNS(null, 'd', itempath);
        });

      } else {
        elemsOut[item].children[0].setAttributeNS(null, 'd', linecurve);
      }

    }
  })

  const elems = container.querySelectorAll(`.${idSearch}`);
  Object.keys(elems).map(function(item, index) {

    if(elems[item].querySelector('.point') === null) {
      var elemtsearchId_in = container.querySelector(`#${id}`);

      var id_search = elems[item].classList[2].replace('node_out_', '');
      var elemtsearchId = container.querySelector(`#${id_search}`);
      var elemtsearch = elemtsearchId.querySelectorAll('.'+elems[item].classList[3])[0]

      var line_x = elemtsearch.offsetWidth/2 + (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
      var line_y = elemtsearch.offsetHeight/2 + (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

      var elemtsearchId_in = elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0]
      var x = elemtsearchId_in.offsetWidth/2 + (elemtsearchId_in.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
      var y = elemtsearchId_in.offsetHeight/2 + (elemtsearchId_in.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

      const lineCurve = createCurvature(line_x, line_y, x, y, curvature, 'openclose');
      elems[item].children[0].setAttributeNS(null, 'd', lineCurve );

    } else {
      const points = elems[item].querySelectorAll('.point');
      let linecurve = '';
      const reoute_fix = [];
      points.forEach((item, i) => {
        if(i === 0 && ((points.length -1) === 0)) {

          var elemtsearchId_out = container.querySelector(`#${id}`);
          var elemtsearch = item;

          var line_x = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var line_y = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;

          var elemtsearchIn = elemtsearchId_out.querySelectorAll('.'+item.parentElement.classList[4])[0]
          var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

          var elemtsearchId_out = item;
          var id_search = item.parentElement.classList[2].replace('node_out_', '');
          var elemtsearchId = container.querySelector(`#${id_search}`);
          var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]

          var elemtsearchOut = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
          var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

          var eX = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);


        } else if(i === 0) {
          // FIRST
          var elemtsearchId_out = item;
          var id_search = item.parentElement.classList[2].replace('node_out_', '');
          var elemtsearchId = container.querySelector(`#${id_search}`);
          var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
          var elemtsearchOut = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[3])[0]
          var line_x =  elemtsearchOut.offsetWidth/2 + (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var line_y =  elemtsearchOut.offsetHeight/2 + (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

          var eX = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'open');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

          // SECOND
          var elemtsearchId_out = item;
          var elemtsearch = points[i+1];

          var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;
          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

        } else if (i === (points.length -1)) {

          var elemtsearchId_out = item;

          var id_search = item.parentElement.classList[1].replace('node_in_', '');
          var elemtsearchId = container.querySelector(`#${id_search}`);
          var elemtsearch = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]

          var elemtsearchIn = elemtsearchId.querySelectorAll('.'+item.parentElement.classList[4])[0]
          var eX =  elemtsearchIn.offsetWidth/2 + (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom;
          var eY =  elemtsearchIn.offsetHeight/2 + (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom;

          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature_start_end, 'close');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);

        } else {

          var elemtsearchId_out = item;
          var elemtsearch = points[i+1];

          var eX = (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var eY = (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom +rerouteWidth;
          var line_x = (elemtsearchId_out.getBoundingClientRect().x - precanvas.getBoundingClientRect().x ) * precanvasWitdhZoom + rerouteWidth;
          var line_y = (elemtsearchId_out.getBoundingClientRect().y - precanvas.getBoundingClientRect().y ) * precanvasHeightZoom + rerouteWidth;
          var x = eX;
          var y = eY;

          var lineCurveSearch = createCurvature(line_x, line_y, x, y, reroute_curvature, 'other');
          linecurve += lineCurveSearch;
          reoute_fix.push(lineCurveSearch);
        }

      });
      if(reroute_fix_curvature) {
        reoute_fix.forEach((itempath, i) => {
          elems[item].children[i].setAttributeNS(null, 'd', itempath);
        });

      } else {
        elems[item].children[0].setAttributeNS(null, 'd', linecurve);
      }

    }
  })
}

/**
 * Remove the selected connection
 */
export function removeConnection() {
  if(this.connection_selected != null) {
    var listclass = this.connection_selected.parentElement.classList;
    this.connection_selected.parentElement.remove();
    //console.log(listclass);
    var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
      return item.node === listclass[1].slice(13) && item.output === listclass[4]
    });
    this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

    var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
      return item.node === listclass[2].slice(14) && item.input === listclass[3]
    });
    this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);
    this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
    this.connection_selected = null;
  }
}

/**
 * Remove a single connection between two nodes
 * @param {string|number} id_output - Output node ID
 * @param {string|number} id_input - Input node ID
 * @param {string} output_class - Output class name
 * @param {string} input_class - Input class name
 * @returns {boolean} - True if removed, false otherwise
 */
export function removeSingleConnection(id_output, id_input, output_class, input_class) {
  var nodeOneModule = this.getModuleFromNodeId(id_output);
  var nodeTwoModule = this.getModuleFromNodeId(id_input);
  if(nodeOneModule === nodeTwoModule) {
    // Check nodes in same module.

    // Check connection exist
    var exists = this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.findIndex(function(item,i) {
      return item.node == id_input && item.output === input_class
    });
    if(exists > -1) {

      if(this.module === nodeOneModule) {
        // In same module with view.
        this.container.querySelector('.connection.node_in_node-'+id_input+'.node_out_node-'+id_output+'.'+output_class+'.'+input_class).remove();
      }

      var index_out = this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.findIndex(function(item,i) {
        return item.node == id_input && item.output === input_class
      });
      this.drawflow.drawflow[nodeOneModule].data[id_output].outputs[output_class].connections.splice(index_out,1);

      var index_in = this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.findIndex(function(item,i) {
        return item.node == id_output && item.input === output_class
      });
      this.drawflow.drawflow[nodeOneModule].data[id_input].inputs[input_class].connections.splice(index_in,1);

      this.dispatch('connectionRemoved', { output_id: id_output, input_id: id_input, output_class:  output_class, input_class: input_class});
      return true;

    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Remove all connections for a node
 * @param {string} id - Node ID
 */
export function removeConnectionNodeId(id) {
  const idSearchIn = 'node_in_'+id;
  const idSearchOut = 'node_out_'+id;

  const elemsOut = this.container.querySelectorAll(`.${idSearchOut}`);
  for(var i = elemsOut.length-1; i >= 0; i--) {
    var listclass = elemsOut[i].classList;

    var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
      return item.node === listclass[2].slice(14) && item.input === listclass[3]
    });
    this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

    var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
      return item.node === listclass[1].slice(13) && item.output === listclass[4]
    });
    this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

    elemsOut[i].remove();

    this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
  }

  const elemsIn = this.container.querySelectorAll(`.${idSearchIn}`);
  for(var i = elemsIn.length-1; i >= 0; i--) {

    var listclass = elemsIn[i].classList;

    var index_out = this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
      return item.node === listclass[1].slice(13) && item.output === listclass[4]
    });
    this.drawflow.drawflow[this.module].data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

    var index_in = this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
      return item.node === listclass[2].slice(14) && item.input === listclass[3]
    });
    this.drawflow.drawflow[this.module].data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

    elemsIn[i].remove();

    this.dispatch('connectionRemoved', { output_id: listclass[2].slice(14), input_id: listclass[1].slice(13), output_class: listclass[3], input_class: listclass[4] } );
  }
}
