/**
 * Node management module
 * Handles adding, removing, and updating nodes
 */

import { getUuid } from '../utils/uuid.js';

/**
 * Register a node type
 * @param {string} name - Node type name
 * @param {HTMLElement|Object} html - HTML element or component
 * @param {Object} props - Props for the component
 * @param {Object} options - Options for the component
 */
export function registerNode(name, html, props = null, options = null) {
  this.noderegister[name] = {html: html, props: props, options: options};
}

/**
 * Get a node by ID
 * @param {string|number} id - Node ID
 * @returns {Object} - Node data
 */
export function getNodeFromId(id) {
  var moduleName = this.getModuleFromNodeId(id)
  return JSON.parse(JSON.stringify(this.drawflow.drawflow[moduleName].data[id]));
}

/**
 * Get nodes by name
 * @param {string} name - Node name
 * @returns {Array} - Array of node IDs
 */
export function getNodesFromName(name) {
  var nodes = [];
  const editor = this.drawflow.drawflow
  Object.keys(editor).map(function(moduleName, index) {
    for (var node in editor[moduleName].data) {
      if(editor[moduleName].data[node].name == name) {
        nodes.push(editor[moduleName].data[node].id);
      }
    }
  });
  return nodes;
}

/**
 * Add a new node
 * @param {string} name - Node name
 * @param {number} num_in - Number of inputs
 * @param {number} num_out - Number of outputs
 * @param {number} ele_pos_x - X position
 * @param {number} ele_pos_y - Y position
 * @param {string} classoverride - CSS classes
 * @param {Object} data - Node data
 * @param {string|HTMLElement} html - HTML content or component name
 * @param {boolean} typenode - Node type flag
 * @returns {string|number} - New node ID
 */
export function addNode(name, num_in, num_out, ele_pos_x, ele_pos_y, classoverride, data, html, typenode = false) {
  if (this.useuuid) {
    var newNodeId = getUuid();
  } else {
    var newNodeId = this.nodeId;
  }
  const parent = document.createElement('div');
  parent.classList.add("parent-node");

  const node = document.createElement('div');
  node.innerHTML = "";
  node.setAttribute("id", "node-"+newNodeId);
  node.classList.add("drawflow-node");
  if(classoverride != '') {
    node.classList.add(...classoverride.split(' '));
  }

  const inputs = document.createElement('div');
  inputs.classList.add("inputs");

  const outputs = document.createElement('div');
  outputs.classList.add("outputs");

  const json_inputs = {}
  for(var x = 0; x < num_in; x++) {
    const input = document.createElement('div');
    input.classList.add("input");
    input.classList.add("input_"+(x+1));
    json_inputs["input_"+(x+1)] = { "connections": []};
    inputs.appendChild(input);
  }

  const json_outputs = {}
  for(var x = 0; x < num_out; x++) {
    const output = document.createElement('div');
    output.classList.add("output");
    output.classList.add("output_"+(x+1));
    json_outputs["output_"+(x+1)] = { "connections": []};
    outputs.appendChild(output);
  }

  const content = document.createElement('div');
  content.classList.add("drawflow_content_node");
  if(typenode === false) {
    content.innerHTML = html;
  } else if (typenode === true) {
    content.appendChild(this.noderegister[html].html.cloneNode(true));
  } else {
    if(parseInt(this.render.version) === 3 ) {
      //Vue 3
      let wrapper = this.render.h(this.noderegister[html].html, this.noderegister[html].props, this.noderegister[html].options);
      wrapper.appContext = this.parent;
      this.render.render(wrapper,content);

    } else {
      // Vue 2
      let wrapper = new this.render({
        parent: this.parent,
        render: h => h(this.noderegister[html].html, { props: this.noderegister[html].props }),
        ...this.noderegister[html].options
      }).$mount()
      //
      content.appendChild(wrapper.$el);
    }
  }

  Object.entries(data).forEach(function (key, value) {
    if(typeof key[1] === "object") {
      insertObjectkeys(null, key[0], key[0]);
    } else {
      var elems = content.querySelectorAll('[df-'+key[0]+']');
        for(var i = 0; i < elems.length; i++) {
          elems[i].value = key[1];
          if(elems[i].isContentEditable) {
            elems[i].innerText = key[1];
          }
        }
    }
  })

  function insertObjectkeys(object, name, completname) {
    if(object === null) {
      var object = data[name];
    } else {
      var object = object[name]
    }
    if(object !== null) {
      Object.entries(object).forEach(function (key, value) {
        if(typeof key[1] === "object") {
          insertObjectkeys(object, key[0], completname+'-'+key[0]);
        } else {
          var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
            for(var i = 0; i < elems.length; i++) {
              elems[i].value = key[1];
              if(elems[i].isContentEditable) {
                elems[i].innerText = key[1];
              }
            }
        }
      });
    }
  }
  node.appendChild(inputs);
  node.appendChild(content);
  node.appendChild(outputs);
  node.style.top = ele_pos_y + "px";
  node.style.left = ele_pos_x + "px";
  parent.appendChild(node);
  this.precanvas.appendChild(parent);
  var json = {
    id: newNodeId,
    name: name,
    data: data,
    class: classoverride,
    html: html,
    typenode: typenode,
    inputs: json_inputs,
    outputs: json_outputs,
    pos_x: ele_pos_x,
    pos_y: ele_pos_y,
  }
  this.drawflow.drawflow[this.module].data[newNodeId] = json;
  this.dispatch('nodeCreated', newNodeId);
  if (!this.useuuid) {
    this.nodeId++;
  }
  return newNodeId;
}

/**
 * Add a node from import data
 * @param {Object} dataNode - Node data
 * @param {HTMLElement} precanvas - Precanvas element
 */
export function addNodeImport(dataNode, precanvas) {
  const parent = document.createElement('div');
  parent.classList.add("parent-node");

  const node = document.createElement('div');
  node.innerHTML = "";
  node.setAttribute("id", "node-"+dataNode.id);
  node.classList.add("drawflow-node");
  if(dataNode.class != '') {
    node.classList.add(...dataNode.class.split(' '));
  }

  const inputs = document.createElement('div');
  inputs.classList.add("inputs");

  const outputs = document.createElement('div');
  outputs.classList.add("outputs");

  Object.keys(dataNode.inputs).map(function(input_item, index) {
    const input = document.createElement('div');
    input.classList.add("input");
    input.classList.add(input_item);
    inputs.appendChild(input);
    Object.keys(dataNode.inputs[input_item].connections).map(function(output_item, index) {

      var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
      var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
      path.classList.add("main-path");
      path.setAttributeNS(null, 'd', '');
      // path.innerHTML = 'a';
      connection.classList.add("connection");
      connection.classList.add("node_in_node-"+dataNode.id);
      connection.classList.add("node_out_node-"+dataNode.inputs[input_item].connections[output_item].node);
      connection.classList.add(dataNode.inputs[input_item].connections[output_item].input);
      connection.classList.add(input_item);

      connection.appendChild(path);
      precanvas.appendChild(connection);

    });
  });

  for(var x = 0; x < Object.keys(dataNode.outputs).length; x++) {
    const output = document.createElement('div');
    output.classList.add("output");
    output.classList.add("output_"+(x+1));
    outputs.appendChild(output);
  }

  const content = document.createElement('div');
  content.classList.add("drawflow_content_node");

  if(dataNode.typenode === false) {
    content.innerHTML = dataNode.html;
  } else if (dataNode.typenode === true) {
    content.appendChild(this.noderegister[dataNode.html].html.cloneNode(true));
  } else {
    if(parseInt(this.render.version) === 3 ) {
      //Vue 3
      let wrapper = this.render.h(this.noderegister[dataNode.html].html, this.noderegister[dataNode.html].props, this.noderegister[dataNode.html].options);
      wrapper.appContext = this.parent;
      this.render.render(wrapper,content);

    } else {
      //Vue 2
      let wrapper = new this.render({
        parent: this.parent,
        render: h => h(this.noderegister[dataNode.html].html, { props: this.noderegister[dataNode.html].props }),
        ...this.noderegister[dataNode.html].options
      }).$mount()
      content.appendChild(wrapper.$el);
    }
  }

  Object.entries(dataNode.data).forEach(function (key, value) {
    if(typeof key[1] === "object") {
      insertObjectkeys(null, key[0], key[0]);
    } else {
      var elems = content.querySelectorAll('[df-'+key[0]+']');
        for(var i = 0; i < elems.length; i++) {
          elems[i].value = key[1];
          if(elems[i].isContentEditable) {
            elems[i].innerText = key[1];
          }
        }
    }
  })

  function insertObjectkeys(object, name, completname) {
    if(object === null) {
      var object = dataNode.data[name];
    } else {
      var object = object[name]
    }
    if(object !== null) {
      Object.entries(object).forEach(function (key, value) {
        if(typeof key[1] === "object") {
          insertObjectkeys(object, key[0], completname+'-'+key[0]);
        } else {
          var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
            for(var i = 0; i < elems.length; i++) {
              elems[i].value = key[1];
              if(elems[i].isContentEditable) {
                elems[i].innerText = key[1];
              }
            }
        }
      });
    }
  }
  node.appendChild(inputs);
  node.appendChild(content);
  node.appendChild(outputs);
  node.style.top = dataNode.pos_y + "px";
  node.style.left = dataNode.pos_x + "px";
  parent.appendChild(node);
  this.precanvas.appendChild(parent);
}

/**
 * Update node value from input event
 * @param {Event} event - Input event
 */
export function updateNodeValue(event) {
  var attr = event.target.attributes
  for (var i = 0; i < attr.length; i++) {
          if (attr[i].nodeName.startsWith('df-')) {
              var keys = attr[i].nodeName.slice(3).split("-");
              var target = this.drawflow.drawflow[this.module].data[event.target.closest(".drawflow_content_node").parentElement.id.slice(5)].data;
              for (var index = 0; index < keys.length - 1; index += 1) {
                  if (target[keys[index]] == null) {
                      target[keys[index]] = {};
                  }
                  target = target[keys[index]];
              }
              target[keys[keys.length - 1]] = event.target.value;
              if(event.target.isContentEditable) {
                target[keys[keys.length - 1]] = event.target.innerText;
              }
              this.dispatch('nodeDataChanged', event.target.closest(".drawflow_content_node").parentElement.id.slice(5));
        }
  }
}

/**
 * Update node data from ID
 * @param {string|number} id - Node ID
 * @param {Object} data - New data
 */
export function updateNodeDataFromId(id, data) {
  var moduleName = this.getModuleFromNodeId(id)
  this.drawflow.drawflow[moduleName].data[id].data = data;
  if(this.module === moduleName) {
    const content = this.container.querySelector('#node-'+id);

    Object.entries(data).forEach(function (key, value) {
      if(typeof key[1] === "object") {
        insertObjectkeys(null, key[0], key[0]);
      } else {
        var elems = content.querySelectorAll('[df-'+key[0]+']');
          for(var i = 0; i < elems.length; i++) {
            elems[i].value = key[1];
            if(elems[i].isContentEditable) {
              elems[i].innerText = key[1];
            }
          }
      }
    })

    function insertObjectkeys(object, name, completname) {
      if(object === null) {
        var object = data[name];
      } else {
        var object = object[name]
      }
      if(object !== null) {
        Object.entries(object).forEach(function (key, value) {
          if(typeof key[1] === "object") {
            insertObjectkeys(object, key[0], completname+'-'+key[0]);
          } else {
            var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
              for(var i = 0; i < elems.length; i++) {
                elems[i].value = key[1];
                if(elems[i].isContentEditable) {
                  elems[i].innerText = key[1];
                }
              }
          }
        });
      }
    }

  }
}

/**
 * Add an input to a node
 * @param {string|number} id - Node ID
 */
export function addNodeInput(id) {
  var moduleName = this.getModuleFromNodeId(id)
  const infoNode = this.getNodeFromId(id)
  const numInputs = Object.keys(infoNode.inputs).length;
  if(this.module === moduleName) {
    //Draw input
    const input = document.createElement('div');
    input.classList.add("input");
    input.classList.add("input_"+(numInputs+1));
    const parent = this.container.querySelector('#node-'+id+' .inputs');
    parent.appendChild(input);
    this.updateConnectionNodes('node-'+id);

  }
  this.drawflow.drawflow[moduleName].data[id].inputs["input_"+(numInputs+1)] = { "connections": []};
}

/**
 * Add an output to a node
 * @param {string|number} id - Node ID
 */
export function addNodeOutput(id) {
  var moduleName = this.getModuleFromNodeId(id)
  const infoNode = this.getNodeFromId(id)
  const numOutputs = Object.keys(infoNode.outputs).length;
  if(this.module === moduleName) {
    //Draw output
    const output = document.createElement('div');
    output.classList.add("output");
    output.classList.add("output_"+(numOutputs+1));
    const parent = this.container.querySelector('#node-'+id+' .outputs');
    parent.appendChild(output);
    this.updateConnectionNodes('node-'+id);

  }
  this.drawflow.drawflow[moduleName].data[id].outputs["output_"+(numOutputs+1)] = { "connections": []};
}

/**
 * Remove an input from a node
 * @param {string|number} id - Node ID
 * @param {string} input_class - Input class name
 */
export function removeNodeInput(id, input_class) {
  var moduleName = this.getModuleFromNodeId(id)
  const infoNode = this.getNodeFromId(id)
  if(this.module === moduleName) {
    this.container.querySelector('#node-'+id+' .inputs .input.'+input_class).remove();
  }
  const removeInputs = [];
  Object.keys(infoNode.inputs[input_class].connections).map(function(key, index) {
    const id_output = infoNode.inputs[input_class].connections[index].node;
    const output_class = infoNode.inputs[input_class].connections[index].input;
    removeInputs.push({id_output, id, output_class, input_class})
  })
  // Remove connections
  removeInputs.forEach((item, i) => {
    this.removeSingleConnection(item.id_output, item.id, item.output_class, item.input_class);
  });

  delete this.drawflow.drawflow[moduleName].data[id].inputs[input_class];

  // Update connection
  const connections = [];
  const connectionsInputs = this.drawflow.drawflow[moduleName].data[id].inputs
  Object.keys(connectionsInputs).map(function(key, index) {
    connections.push(connectionsInputs[key]);
  });
  this.drawflow.drawflow[moduleName].data[id].inputs = {};
  const input_class_id = input_class.slice(6);
  let nodeUpdates = [];
  connections.forEach((item, i) => {
    item.connections.forEach((itemx, f) => {
      nodeUpdates.push(itemx);
    });
    this.drawflow.drawflow[moduleName].data[id].inputs['input_'+ (i+1)] = item;
  });
  nodeUpdates =  new Set(nodeUpdates.map(e => JSON.stringify(e)));
  nodeUpdates = Array.from(nodeUpdates).map(e => JSON.parse(e));

  if(this.module === moduleName) {
    const eles = this.container.querySelectorAll("#node-"+id +" .inputs .input");
    eles.forEach((item, i) => {
      const id_class = item.classList[1].slice(6);
      if(parseInt(input_class_id) < parseInt(id_class)) {
        item.classList.remove('input_'+id_class);
        item.classList.add('input_'+(id_class-1));
      }
    });

  }

  nodeUpdates.forEach((itemx, i) => {
    this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections.forEach((itemz, g) => {
        if(itemz.node == id) {
          const output_id = itemz.output.slice(6);
          if(parseInt(input_class_id) < parseInt(output_id)) {
            if(this.module === moduleName) {
              const ele = this.container.querySelector(".connection.node_in_node-"+id+".node_out_node-"+itemx.node+"."+itemx.input+".input_"+output_id);
              ele.classList.remove('input_'+output_id);
              ele.classList.add('input_'+(output_id-1));
            }
            if(itemz.points) {
                this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections[g] = { node: itemz.node, output: 'input_'+(output_id-1), points: itemz.points }
            } else {
                this.drawflow.drawflow[moduleName].data[itemx.node].outputs[itemx.input].connections[g] = { node: itemz.node, output: 'input_'+(output_id-1)}
            }
          }
        }
    });
  });
  this.updateConnectionNodes('node-'+id);
}

/**
 * Remove an output from a node
 * @param {string|number} id - Node ID
 * @param {string} output_class - Output class name
 */
export function removeNodeOutput(id, output_class) {
  var moduleName = this.getModuleFromNodeId(id)
  const infoNode = this.getNodeFromId(id)
  if(this.module === moduleName) {
    this.container.querySelector('#node-'+id+' .outputs .output.'+output_class).remove();
  }
  const removeOutputs = [];
  Object.keys(infoNode.outputs[output_class].connections).map(function(key, index) {
    const id_input = infoNode.outputs[output_class].connections[index].node;
    const input_class = infoNode.outputs[output_class].connections[index].output;
    removeOutputs.push({id, id_input, output_class, input_class})
  })
  // Remove connections
  removeOutputs.forEach((item, i) => {
    this.removeSingleConnection(item.id, item.id_input, item.output_class, item.input_class);
  });

  delete this.drawflow.drawflow[moduleName].data[id].outputs[output_class];

  // Update connection
  const connections = [];
  const connectionsOuputs = this.drawflow.drawflow[moduleName].data[id].outputs
  Object.keys(connectionsOuputs).map(function(key, index) {
    connections.push(connectionsOuputs[key]);
  });
  this.drawflow.drawflow[moduleName].data[id].outputs = {};
  const output_class_id = output_class.slice(7);
  let nodeUpdates = [];
  connections.forEach((item, i) => {
    item.connections.forEach((itemx, f) => {
      nodeUpdates.push({ node: itemx.node, output: itemx.output });
    });
    this.drawflow.drawflow[moduleName].data[id].outputs['output_'+ (i+1)] = item;
  });
  nodeUpdates =  new Set(nodeUpdates.map(e => JSON.stringify(e)));
  nodeUpdates = Array.from(nodeUpdates).map(e => JSON.parse(e));

  if(this.module === moduleName) {
    const eles = this.container.querySelectorAll("#node-"+id +" .outputs .output");
    eles.forEach((item, i) => {
      const id_class = item.classList[1].slice(7);
      if(parseInt(output_class_id) < parseInt(id_class)) {
        item.classList.remove('output_'+id_class);
        item.classList.add('output_'+(id_class-1));
      }
    });

  }

  nodeUpdates.forEach((itemx, i) => {
    this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections.forEach((itemz, g) => {
        if(itemz.node == id) {
          const input_id = itemz.input.slice(7);
          if(parseInt(output_class_id) < parseInt(input_id)) {
            if(this.module === moduleName) {

              const ele = this.container.querySelector(".connection.node_in_node-"+itemx.node+".node_out_node-"+id+".output_"+input_id+"."+itemx.output);
              ele.classList.remove('output_'+input_id);
              ele.classList.remove(itemx.output);
              ele.classList.add('output_'+(input_id-1));
              ele.classList.add(itemx.output);
            }
            if(itemz.points) {
                this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections[g] = { node: itemz.node, input: 'output_'+(input_id-1), points: itemz.points }
            } else {
                this.drawflow.drawflow[moduleName].data[itemx.node].inputs[itemx.output].connections[g] = { node: itemz.node, input: 'output_'+(input_id-1)}
            }
          }
        }
    });
  });

  this.updateConnectionNodes('node-'+id);
}

/**
 * Remove a node by ID
 * @param {string} id - Node ID (with 'node-' prefix)
 */
export function removeNodeId(id) {
  this.removeConnectionNodeId(id);
  var moduleName = this.getModuleFromNodeId(id.slice(5))
  if(this.module === moduleName) {
    this.container.querySelector(`#${id}`).remove();
  }
  delete this.drawflow.drawflow[moduleName].data[id.slice(5)];
  this.dispatch('nodeRemoved', id.slice(5));
}
