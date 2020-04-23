export default class Drawflow {
  constructor(container) {
    this.container = container;
    this.precanvas = null;
    this.nodeId = 1;
    this.ele_selected = null;
    this.node_selected = null;
    this.drag = false;
    this.editor_selected = false;
    this.connection = false;
    this.connection_ele = null;
    this.connection_selected = null;
    this.canvas_x = 0;
    this.canvas_y = 0;
    this.pos_x = 0;
    this.pos_y = 0;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.line_path = 5;
    this.first_click = null;

    this.select_elements = null;
    this.drawflow = { "drawflow": { "Home": { "data": {} }}};
    // Configurable options
    this.zoom = 1;
    this.zoom_max = 1.6;
    this.zoom_min = 0.5;

    // Mobile
    this.evCache = new Array();
    this.prevDiff = -1;
  }

  start () {
    // console.info("Start Drawflow!!");
    this.container.classList.add("parent-drawflow");
    this.precanvas = document.createElement('div');
    this.precanvas.classList.add("drawflow");
    this.container.appendChild(this.precanvas);

    this.container.addEventListener('mouseup', this.dragEnd.bind(this));
    this.container.addEventListener('mousemove', this.position.bind(this));
    this.container.addEventListener('mousedown', this.click.bind(this) );

    this.container.addEventListener('touchend', this.dragEnd.bind(this));
    this.container.addEventListener('touchmove', this.position.bind(this));
    this.container.addEventListener('touchstart', this.click.bind(this));

    window.addEventListener('keyup', this.key.bind(this));
    this.container.addEventListener('wheel', this.zoom_enter.bind(this));

    this.container.addEventListener('input', this.updateNodeValue.bind(this));
    /* Mobile zoom */
    this.container.onpointerdown = this.pointerdown_handler.bind(this);
    this.container.onpointermove = this.pointermove_handler.bind(this);
    this.container.onpointerup = this.pointerup_handler.bind(this);
    this.container.onpointercancel = this.pointerup_handler.bind(this);
    this.container.onpointerout = this.pointerup_handler.bind(this);
    this.container.onpointerleave = this.pointerup_handler.bind(this);

    this.load();
  }

  /* Mobile zoom */
  pointerdown_handler(ev) {
   this.evCache.push(ev);
  }

  pointermove_handler(ev) {
   for (var i = 0; i < this.evCache.length; i++) {
     if (ev.pointerId == this.evCache[i].pointerId) {
        this.evCache[i] = ev;
     break;
     }
   }

   if (this.evCache.length == 2) {
     // Calculate the distance between the two pointers
     var curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);

     if (this.prevDiff > 100) {
       if (curDiff > this.prevDiff) {
         // The distance between the two pointers has increased

         this.zoom_in();
       }
       if (curDiff < this.prevDiff) {
         // The distance between the two pointers has decreased
         this.zoom_out();
       }
     }
     this.prevDiff = curDiff;
   }
  }

  pointerup_handler(ev) {
    this.remove_event(ev);
    if (this.evCache.length < 2) {
      this.prevDiff = -1;
    }
  }
  remove_event(ev) {
   // Remove this event from the target's cache
   for (var i = 0; i < this.evCache.length; i++) {
     if (this.evCache[i].pointerId == ev.pointerId) {
       this.evCache.splice(i, 1);
       break;
     }
   }
  }
  /* End Mobile Zoom */
  load() {
    for (var key in this.drawflow.drawflow.Home.data) {
      this.addNodeImport(this.drawflow.drawflow.Home.data[key], this.precanvas);
      this.nodeId = key+1;
    }
    for (var key in this.drawflow.drawflow.Home.data) {
      this.updateConnectionNodes('node-'+key);
    }
  }
  click(e) {
    this.first_click = e.target;
    this.ele_selected = e.target;
    if(e.target.closest(".drawflow_content_node") != null) {
      this.ele_selected = e.target.closest(".drawflow_content_node").parentElement;
    }
    switch (this.ele_selected.classList[0]) {
      case 'drawflow-node':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.connection_selected = null;
        }
        this.node_selected = this.ele_selected;
        this.node_selected.classList.add("selected");
        this.drag = true;
        break;
      case 'output':
        this.connection = true;
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.connection_selected = null;
        }
        this.drawConnection(e.target);
        break;
      case 'parent-drawflow':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.connection_selected = null;
        }
        this.editor_selected = true;
        break;
      case 'drawflow':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.connection_selected = null;
        }
        this.editor_selected = true;
        break;
      case 'main-path':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
        }
        if(this.connection_selected != null) {
          this.connection_selected.classList.remove("selected");
          this.connection_selected = null;
        }
        this.connection_selected = this.ele_selected;
        this.connection_selected.classList.add("selected");
      break;
      default:
    }
    if (e.type === "touchstart") {
      this.pos_x = e.touches[0].clientX;
      this.pos_y = e.touches[0].clientY;
    } else {
      this.pos_x = e.clientX;
      this.pos_y = e.clientY;
    }
  }

  position(e) {
    if (e.type === "touchmove") {
      var e_pos_x = e.touches[0].clientX;
      var e_pos_y = e.touches[0].clientY;
    } else {
      var e_pos_x = e.clientX;
      var e_pos_y = e.clientY;
    }


    if(this.connection) {
      this.updateConnection(e_pos_x, e_pos_y);
    }
    if(this.editor_selected) {
      /*if (e.ctrlKey) {
        this.selectElements(e_pos_x, e_pos_y);
      } else { */
      x =  this.canvas_x + (-(this.pos_x - e_pos_x))
      y = this.canvas_y + (-(this.pos_y - e_pos_y))
      // console.log(canvas_x +' - ' +pos_x + ' - '+ e_pos_x + ' - ' + x);
      this.precanvas.style.transform = "translate("+x+"px, "+y+"px) scale("+this.zoom+")";
      //}
    }
    if(this.drag) {

      var x = (this.pos_x - e_pos_x) * this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom);
      var y = (this.pos_y - e_pos_y) * this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom);
      this.pos_x = e_pos_x;
      this.pos_y = e_pos_y;

      this.ele_selected.style.top = (this.ele_selected.offsetTop - y) + "px";
      this.ele_selected.style.left = (this.ele_selected.offsetLeft - x) + "px";

      this.drawflow.drawflow.Home.data[this.ele_selected.id.slice(5)].pos_x = (this.ele_selected.offsetLeft - x);
      this.drawflow.drawflow.Home.data[this.ele_selected.id.slice(5)].pos_y = (this.ele_selected.offsetTop - y);

      this.updateConnectionNodes(this.ele_selected.id, e_pos_x, e_pos_y)
    }

    if (e.type === "touchmove") {
      this.mouse_x = e_pos_x;
      this.mouse_y = e_pos_y;
    }

  }

  dragEnd(e) {
    if(this.select_elements != null) {
      this.select_elements.remove();
      this.select_elements = null;
    }

    if (e.type === "touchend") {
      var e_pos_x = this.mouse_x;
      var e_pos_y = this.mouse_y;
      var ele_last = document.elementFromPoint(e_pos_x, e_pos_y);
    } else {
      var e_pos_x = e.clientX;
      var e_pos_y = e.clientY;
      var ele_last = e.target;
    }

    if(this.editor_selected) {
      this.canvas_x = this.canvas_x + (-(this.pos_x - e_pos_x));
      this.canvas_y = this.canvas_y + (-(this.pos_y - e_pos_y));
      this.editor_selected = false;
    }
    if(this.connection === true) {
      if(ele_last.classList[0] === 'input') {
        // Fix connection;
        var output_id = this.ele_selected.parentElement.parentElement.id;
        var output_class = this.ele_selected.classList[1];
        var input_id = ele_last.parentElement.parentElement.id;
        var input_class = ele_last.classList[1];

        if(this.container.querySelectorAll('.connection.node_in_'+input_id+'.node_out_'+output_id+'.'+output_class+'.'+input_class).length === 0) {
        // Conection no exist save connection

        this.connection_ele.classList.add("node_in_"+input_id);
        this.connection_ele.classList.add("node_out_"+output_id);
        this.connection_ele.classList.add(output_class);
        this.connection_ele.classList.add(input_class);
        var id_input = input_id.slice(5);
        var id_output = output_id.slice(5);

        this.drawflow.drawflow.Home.data[id_output].outputs[output_class].connections.push( {"node": id_input, "output": input_class});
        this.drawflow.drawflow.Home.data[id_input].inputs[input_class].connections.push( {"node": id_output, "input": output_class});

        this.connection_ele = null;
      } else {
        // Connection exists Remove Connection;
        this.connection_ele.remove();
        this.connection_ele = null;
      }

      } else {
        // Remove Connection;
        this.connection_ele.remove();
        this.connection_ele = null;
      }
    }

    this.drag = false;
    this.connection = false;
    this.ele_selected = null;
    this.editor_selected = false;

  }
  key(e) {
    if(e.key === "Delete") {
      if(this.node_selected != null) {
        if(this.first_click.tagName !== 'INPUT' && this.first_click.tagName !== 'TEXTAREA') {
          this.removeNodeId(this.node_selected.id);
        }
      }
      if(this.connection_selected != null) {
        this.removeConnection();
      }
    }
  }

  zoom_enter(event, delta) {
    if (event.ctrlKey) {
      event.preventDefault()
      if(event.deltaY > 0) {
        // Zoom Out
        this.zoom_out();
      } else {
        // Zoom In
        this.zoom_in();
      }
      //this.precanvas.style.transform = "translate("+this.canvas_x+"px, "+this.canvas_y+"px) scale("+this.zoom+")";
    }
  }
  zoom_refresh(){
    this.precanvas.style.transform = "translate("+this.canvas_x+"px, "+this.canvas_y+"px) scale("+this.zoom+")";
  }
  zoom_in() {
    if(this.zoom < this.zoom_max) {
        this.zoom+=0.1;
        this.zoom_refresh();
    }
  }
  zoom_out() {
    if(this.zoom > this.zoom_min) {
      this.zoom-=0.1;
        this.zoom_refresh();
    }
  }
  zoom_reset(){
    if(this.zoom != 1) {
      this.zoom = 1;
      this.zoom_refresh();
    }
  }

  drawConnection(ele) {
    var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    this.connection_ele = connection;
    var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
    path.classList.add("main-path");
    path.setAttributeNS(null, 'd', '');
    // path.innerHTML = 'a';
    connection.classList.add("connection");
    connection.appendChild(path);
    this.precanvas.appendChild(connection);

  }

  updateConnection(eX, eY) {
    var path = this.connection_ele.children[0];

    var line_x = this.ele_selected.offsetWidth/2 + this.line_path/2 + this.ele_selected.parentElement.parentElement.offsetLeft + this.ele_selected.offsetLeft;
    var line_y = this.ele_selected.offsetHeight/2 + this.line_path/2 + this.ele_selected.parentElement.parentElement.offsetTop + this.ele_selected.offsetTop;

    var x = eX * ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) - (this.precanvas.getBoundingClientRect().x *  ( this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) );
    var y = eY * ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) - (this.precanvas.getBoundingClientRect().y *  ( this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) );

    var curvature = 0.5;
    var hx1 = line_x + Math.abs(x - line_x) * curvature;
    var hx2 = x - Math.abs(x - line_x) * curvature;

    // path.setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' L '+ x +' '+ y +''); // SIMPLE LINE
    // console.log('M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );
    path.setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y);
  }

  updateConnectionNodes(id) {
    // Aquí nos quedamos;
    const idSearch = 'node_in_'+id;
    const idSearchOut = 'node_out_'+id;
    var line_path = this.line_path/2;
    const elemsOut = document.getElementsByClassName(idSearchOut);
    Object.keys(elemsOut).map(function(item, index) {

      var elemtsearchId_out = document.getElementById(id);

      var id_search = elemsOut[item].classList[1].replace('node_in_', '');
      var elemtsearchId = document.getElementById(id_search);

      var elemtsearch = elemtsearchId.querySelectorAll('.'+elemsOut[item].classList[4])[0]

      var eX = elemtsearch.offsetWidth/2 + line_path + elemtsearch.parentElement.parentElement.offsetLeft + elemtsearch.offsetLeft;
      var eY = elemtsearch.offsetHeight/2 + line_path + elemtsearch.parentElement.parentElement.offsetTop + elemtsearch.offsetTop;

      var line_x = elemtsearchId_out.offsetLeft + elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0].offsetLeft + elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0].offsetWidth/2 + line_path;
      var line_y = elemtsearchId_out.offsetTop + elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0].offsetTop + elemtsearchId_out.querySelectorAll('.'+elemsOut[item].classList[3])[0].offsetHeight/2 + line_path;

      var x = eX;
      var y = eY;

      var curvature = 0.5;
      var hx1 = line_x + Math.abs(x - line_x) * curvature;
      var hx2 = x - Math.abs(x - line_x) * curvature;
      // console.log('M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );
      elemsOut[item].children[0].setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );

    })

    const elems = document.getElementsByClassName(idSearch);
    Object.keys(elems).map(function(item, index) {
      // console.log("In")
      var elemtsearchId_in = document.getElementById(id);

      var id_search = elems[item].classList[2].replace('node_out_', '');
      var elemtsearchId = document.getElementById(id_search);

      var elemtsearch = elemtsearchId.querySelectorAll('.'+elems[item].classList[3])[0]

      var line_x = elemtsearch.offsetWidth/2 + line_path + elemtsearch.parentElement.parentElement.offsetLeft + elemtsearch.offsetLeft;
      var line_y = elemtsearch.offsetHeight/2 + line_path + elemtsearch.parentElement.parentElement.offsetTop + elemtsearch.offsetTop;

      var x = elemtsearchId_in.offsetLeft + elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0].offsetLeft + elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0].offsetWidth/2 + line_path;
      var y = elemtsearchId_in.offsetTop + elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0].offsetTop + elemtsearchId_in.querySelectorAll('.'+elems[item].classList[4])[0].offsetHeight/2 + line_path;

      var curvature = 0.5;
      var hx1 = line_x + Math.abs(x - line_x) * curvature;
      var hx2 = x - Math.abs(x - line_x) * curvature;
      // console.log('M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );
      elems[item].children[0].setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );

    })
  }

  /*selectElements(eX, eY) {
    if(this.select_elements == null) {
      var div = document.createElementNS('http://www.w3.org/2000/svg',"svg");
      this.select_elements = div;
      this.pos_click_x = eX;
      this.pos_click_y = eY;
        var rect = document.createElementNS('http://www.w3.org/2000/svg',"rect");
        rect.setAttributeNS(null, 'd', '');
      // rect.innerHTML = 'a';
      div.classList.add("selectbox");
      div.appendChild(rect);
      this.precanvas.appendChild(div);
    }

    this.select_elements.children[0].setAttributeNS(null, 'x', this.pos_click_x - this.precanvas.offsetLeft - this.canvas_x);
    this.select_elements.children[0].setAttributeNS(null, 'y', this.pos_click_y - this.precanvas.offsetTop - this.canvas_y);
    this.select_elements.children[0].setAttributeNS(null, 'width', eX - this.pos_click_x);
    this.select_elements.children[0].setAttributeNS(null, 'height', eY - this.pos_click_y);
  }*/

  addNode (num_in, num_out, ele_pos_x, ele_pos_y, classoverride, data, html) {

    const parent = document.createElement('div');
    parent.classList.add("parent-node");

    const node = document.createElement('div');
    node.innerHTML = "";
    node.setAttribute("id", "node-"+this.nodeId);
    node.classList.add("drawflow-node");
    if(classoverride != '') {
      node.classList.add(classoverride);
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
    content.innerHTML = html;
    Object.entries(data).forEach(function (key, value) {
      if(typeof key[1] === "object") {
        insertObjectkeys(null, key[0], key[0]);
      } else {
        var elems = content.querySelectorAll('[df-'+key[0]+']');
          for(var i = 0; i < elems.length; i++) {
            elems[i].value = key[1];
          }
      }
    })

    function insertObjectkeys(object, name, completname) {
      if(object === null) {
        var object = data[name];
      } else {
        var object = object[name]
      }
      Object.entries(object).forEach(function (key, value) {
        if(typeof key[1] === "object") {
          insertObjectkeys(object, key[0], name+'-'+key[0]);
        } else {
          var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
            for(var i = 0; i < elems.length; i++) {
              elems[i].value = key[1];
            }
        }
      });
    }
    node.appendChild(inputs);
    node.appendChild(content);
    node.appendChild(outputs);
    node.style.top = ele_pos_y + "px";
    node.style.left = ele_pos_x + "px";
    parent.appendChild(node);
    this.precanvas.appendChild(parent);
    var json = {
      id: this.nodeId,
      data: data,
      class: classoverride,
      html: html,
      inputs: json_inputs,
      outputs: json_outputs,
      pos_x: ele_pos_x,
      pos_y: ele_pos_y,
    }
    this.drawflow.drawflow.Home.data[this.nodeId] = json;

    this.nodeId++;
  }

  addNodeImport (dataNode, precanvas) {
    const parent = document.createElement('div');
    parent.classList.add("parent-node");

    const node = document.createElement('div');
    node.innerHTML = "";
    node.setAttribute("id", "node-"+dataNode.id);
    node.classList.add("drawflow-node");
    if(dataNode.class != '') {
      node.classList.add(dataNode.class);
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
    content.innerHTML = dataNode.html;
    Object.entries(dataNode.data).forEach(function (key, value) {
      if(typeof key[1] === "object") {
        insertObjectkeys(null, key[0], key[0]);
      } else {
        var elems = content.querySelectorAll('[df-'+key[0]+']');
          for(var i = 0; i < elems.length; i++) {
            elems[i].value = key[1];
          }
      }
    })

    function insertObjectkeys(object, name, completname) {
      if(object === null) {
        var object = dataNode.data[name];
      } else {
        var object = object[name]
      }
      Object.entries(object).forEach(function (key, value) {
        if(typeof key[1] === "object") {
          insertObjectkeys(object, key[0], name+'-'+key[0]);
        } else {
          var elems = content.querySelectorAll('[df-'+completname+'-'+key[0]+']');
            for(var i = 0; i < elems.length; i++) {
              elems[i].value = key[1];
            }
        }
      });
    }
    node.appendChild(inputs);
    node.appendChild(content);
    node.appendChild(outputs);
    node.style.top = dataNode.pos_y + "px";
    node.style.left = dataNode.pos_x + "px";
    parent.appendChild(node);
    this.precanvas.appendChild(parent);
  }

  updateNodeValue(event) {
    var attr = event.target.attributes
    for(var i= 0; i < attr.length; i++) {
      if(attr[i].nodeName.startsWith('df-')) {
        this.drawflow.drawflow.Home.data[event.target.closest(".drawflow_content_node").parentElement.id.slice(5)].data[attr[i].nodeName.slice(3)] = event.target.value;
      }

    }


  }

  removeNodeId(id) {
    document.getElementById(id).remove();
    delete this.drawflow.drawflow.Home.data[id.slice(5)];
    this.removeConnectionNodeId(id);
  }

  removeConnection() {
    if(this.connection_selected != null) {
      var listclass = this.connection_selected.parentElement.classList;
      this.connection_selected.parentElement.remove();

      var index_out = this.drawflow.drawflow.Home.data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      this.drawflow.drawflow.Home.data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);

      var index_in = this.drawflow.drawflow.Home.data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
      this.drawflow.drawflow.Home.data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

      this.connection_selected = null;
    }
  }

  removeConnectionNodeId(id) {
    const idSearchIn = 'node_in_'+id;
    const idSearchOut = 'node_out_'+id;

    const elemsOut = document.getElementsByClassName(idSearchOut);
    for(var i = elemsOut.length-1; i >= 0; i--) {

      var listclass = elemsOut[i].classList;
      /*
      var index_out = this.drawflow.drawflow.Home.data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      this.drawflow.drawflow.Home.data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);
      */
      var index_in = this.drawflow.drawflow.Home.data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
      this.drawflow.drawflow.Home.data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);

      elemsOut[i].remove();
    }

    const elemsIn = document.getElementsByClassName(idSearchIn);
    for(var i = elemsIn.length-1; i >= 0; i--) {

      var listclass = elemsIn[i].classList;

      var index_out = this.drawflow.drawflow.Home.data[listclass[2].slice(14)].outputs[listclass[3]].connections.findIndex(function(item,i) {
        return item.node === listclass[1].slice(13) && item.output === listclass[4]
      });
      this.drawflow.drawflow.Home.data[listclass[2].slice(14)].outputs[listclass[3]].connections.splice(index_out,1);
      /*
      var index_in = this.drawflow.drawflow.Home.data[listclass[1].slice(13)].inputs[listclass[4]].connections.findIndex(function(item,i) {
        return item.node === listclass[2].slice(14) && item.input === listclass[3]
      });
      this.drawflow.drawflow.Home.data[listclass[1].slice(13)].inputs[listclass[4]].connections.splice(index_in,1);
      */
      elemsIn[i].remove();
    }
  }
  clear () {
    this.precanvas.innerHTML = "";
    this.drawflow = { "drawflow": { "Home": { "data": {} }}};
  }
  export () {
    return this.drawflow;
  }

  import (data) {
    this.clear();
    this.drawflow = data;
    this.load();
  }
}
