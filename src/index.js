export default class Drawflow {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.precanvas = null;
    this.nodeId = 1;
    this.ele_selected = null;
    this.node_selected = null;
    this.drag = false;
    this.editor_selected = false;
    this.connection = false;
    this.connection_ele = null;
    this.canvas_x = 0;
    this.canvas_y = 0;
    this.pos_x = 0;
    this.pos_y = 0;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.zoom = 1;
    this.select_elements = null;
  }

  start () {
    console.log("Start Drawflow!!");
    this.container.classList.add("parent-drawflow");
    this.precanvas = document.createElement('div');
    this.precanvas.classList.add("drawflow");
    this.container.appendChild(this.precanvas);


    this.container.addEventListener('mouseup', this.dragEnd.bind(this));
    this.container.addEventListener('mousemove', this.position.bind(this));
    this.container.addEventListener('mousedown', this.click.bind(this) );

    this.container.addEventListener('touchend', this.dragEnd.bind(this));
    this.container.addEventListener('touchmove', this.position.bind(this));
    this.container.addEventListener('touchstart', this.click.bind(this) );

    this.container.addEventListener('wheel', this.zoom_enter.bind(this));

  }

  click(e) {
    this.ele_selected = e.target;
    switch (e.target.classList[0]) {
      case 'node':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
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
        this.drawConnection(e.target);
        break;
      case 'parent-drawflow':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
        }
        this.editor_selected = true;
        break;
      case 'drawflow':
        if(this.node_selected != null) {
          this.node_selected.classList.remove("selected");
          this.node_selected = null;
        }
        this.editor_selected = true;
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
      //var newx = e.clientX - (e.clientX - (e.clientX*zoom));

      //var newx = e.clientX * canvas.clientWidth / (canvas.clientWidth * zoom) ;
      //var newy = e.clientY * canvas.clientHeight / (canvas.clientHeight * zoom);

      this.updateConnection(e_pos_x, e_pos_y);
    }
    if(this.editor_selected) {
      if (e.ctrlKey) {
        this.selectElements(e_pos_x, e_pos_y);
      } else {
      x =  this.canvas_x + (-(this.pos_x - e_pos_x))
      y = this.canvas_y + (-(this.pos_y - e_pos_y))
      // console.log(canvas_x +' - ' +pos_x + ' - '+ e_pos_x + ' - ' + x);
      this.precanvas.style.transform = "translate("+x+"px, "+y+"px) scale("+this.zoom+")";
      }
    }
    if(this.drag) {

      var x = (this.pos_x - e_pos_x) * this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom);
      // console.log(pos_x)
      // console.log(e_pos_x);
      var y = (this.pos_y - e_pos_y) * this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom);
      this.pos_x = e_pos_x;
      this.pos_y = e_pos_y;



      this.ele_selected.style.top = (this.ele_selected.offsetTop - y) + "px";
      this.ele_selected.style.left = (this.ele_selected.offsetLeft - x) + "px";


      /*ele_selected.style.top = (ele_selected.offsetTop - canvas.offsetTop - y) + "px";
      ele_selected.style.left = (ele_selected.offsetLeft - canvas.offsetLeft -x) + "px";*/

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
        var output_id = this.ele_selected.parentElement.id;
        var input_id = ele_last.parentElement.id;
        this.connection_ele.classList.add("node_in_"+input_id);
        this.connection_ele.classList.add("node_out_"+output_id);
        this.connection_ele = null;
      } else {
        // Remove Connection;
        this.connection_ele.remove();
        this.connection_ele = null;
      }
    }
    /*if(ele_last.classList[0] === 'node') {
      node_selected.classList.remove("selected");
      node_selected = null;
    }*/
    this.drag = false;
    this.connection = false;
    this.ele_selected = null;
    this.editor_selected = false;

  }

  zoom_enter(event, delta) {
    if (event.ctrlKey) {
      event.preventDefault()
      if(event.deltaY > 0) {
        // Zoom Out
        if(this.zoom > 0.5) {
          this.zoom-=0.1;
        }

      } else {
        // Zoom In
        if(this.zoom < 1.6) {
            this.zoom+=0.1;
        }

      }

      // (pos_x - e_pos_x) * canvas.clientWidth / (canvas.clientWidth * zoom);
      //canvas_x = (canvas_x) * (canvas.clientWidth / (canvas.clientWidth * zoom));
      //canvas_y = (canvas_y) * (canvas.clientHeight / (canvas.clientHeight * zoom));
      this.precanvas.style.transform = "translate("+this.canvas_x+"px, "+this.canvas_y+"px) scale("+this.zoom+")";
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


    var line_x = this.ele_selected.offsetWidth/2 + 2.5 + this.ele_selected.parentElement.offsetLeft + this.ele_selected.offsetLeft;
    var line_y = this.ele_selected.offsetHeight/2 + 2.5 + this.ele_selected.parentElement.offsetTop + this.ele_selected.offsetTop;



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

    const elemsOut = document.getElementsByClassName(idSearchOut);
    Object.keys(elemsOut).map(function(item, index) {
      // console.log("Out")
      var elemtsearchId_out = document.getElementById(id);

      var id_search = elemsOut[item].classList[1].replace('node_in_', '');
      var elemtsearchId = document.getElementById(id_search);

      var elemtsearch = elemtsearchId.querySelectorAll('.input')[0]


      var eX = elemtsearch.offsetWidth/2 + 2.5 + elemtsearch.parentElement.offsetLeft + elemtsearch.offsetLeft;
      var eY = elemtsearch.offsetHeight/2 + 2.5 + elemtsearch.parentElement.offsetTop + elemtsearch.offsetTop;

      var line_x = elemtsearchId_out.offsetLeft + elemtsearchId_out.querySelectorAll('.output')[0].offsetLeft + elemtsearchId_out.querySelectorAll('.output')[0].offsetWidth/2 + 2.5;
      var line_y = elemtsearchId_out.offsetTop + elemtsearchId_out.querySelectorAll('.output')[0].offsetTop + elemtsearchId_out.querySelectorAll('.output')[0].offsetHeight/2 + 2.5;

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

      var elemtsearch = elemtsearchId.querySelectorAll('.output')[0]

      var line_x = elemtsearch.offsetWidth/2 + 2.5 + elemtsearch.parentElement.offsetLeft + elemtsearch.offsetLeft;
      var line_y = elemtsearch.offsetHeight/2 + 2.5 + elemtsearch.parentElement.offsetTop + elemtsearch.offsetTop;

      var eX = elemtsearchId_in.offsetLeft;
      var eY = elemtsearchId_in.offsetTop;

      var x = eX + 2.5;
      var y = eY + elemtsearch.offsetTop/2 + elemtsearch.offsetHeight/2 + 2.5;

      var curvature = 0.5;
      var hx1 = line_x + Math.abs(x - line_x) * curvature;
      var hx2 = x - Math.abs(x - line_x) * curvature;
      // console.log('M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );
      elems[item].children[0].setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );

    })
  }

  selectElements(eX, eY) {
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
  }

  addNode () {
    const parent = document.createElement('div');
    parent.classList.add("parent-node");

    const node = document.createElement('div');
    node.innerHTML = "";
    node.setAttribute("id", "node-"+this.nodeId);
    node.classList.add("node");
    const input = document.createElement('div');
    input.classList.add("input");

    const output = document.createElement('div');
    output.classList.add("output");
    node.appendChild(input);
    const input2 = document.createElement('div');
    input2.classList.add("input");
    node.appendChild(input2);
    node.appendChild(output);
    const output2 = document.createElement('div');
    output2.classList.add("output");
    node.appendChild(output2);
    parent.appendChild(node);
    this.precanvas.appendChild(parent);
    this.nodeId++;
  }

}
