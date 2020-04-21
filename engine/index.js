var Draflow = function (canvas) {
    var canvas = canvas;
    var canvas_x = 0;
    var canvas_y = 0;
    var original_canvas = canvas;
    var pos_x, pos_y;
    var pos_click_x;
    var pos_click_y;
    var mouse_x, mouse_y;
    var drag = false;
    var connection = false;
    var ele_selected = null;
    var select_elements = null;
    var node_selected = null;
    var editor_selected = false;
    var connection_ele = null;
    var nodeId = 1;
    var zoom = 1;
    original_canvas.classList.add("parent-drawflow");

    var precanvas = document.createElement('div');
    precanvas.classList.add("drawflow");
    canvas.appendChild(precanvas);

    canvas = precanvas;
    original_canvas.addEventListener('contextmenu', function(e) {
      add();
      e.preventDefault();
    }, false);

    function add() {
      var parent = document.createElement('div');
      parent.classList.add("parent-node");

      var node = document.createElement('div');
      node.innerHTML = "";
      node.setAttribute("id", "node-"+nodeId);
      node.classList.add("node");
      var input = document.createElement('div');
      input.classList.add("input");

      var output = document.createElement('div');
      output.classList.add("output");
      node.appendChild(input);
      var input2 = document.createElement('div');
      input2.classList.add("input");
      node.appendChild(input2);
      node.appendChild(output);
      var output2 = document.createElement('div');
      output2.classList.add("output");
      node.appendChild(output2);
      parent.appendChild(node);
      canvas.appendChild(parent);
      nodeId++;
    }
    function drawConnection(ele) {
      var connection = document.createElementNS('http://www.w3.org/2000/svg',"svg");
      connection_ele = connection;
      var path = document.createElementNS('http://www.w3.org/2000/svg',"path");
      path.classList.add("main-path");
      path.setAttributeNS(null, 'd', '');
      // path.innerHTML = 'a';
      connection.classList.add("connection");
      connection.appendChild(path);
      canvas.appendChild(connection);

    }
    function updateConnection(eX, eY) {
      var path = connection_ele.children[0];

      //var x = pos_x - eX;
      //var y = pos_y - eY;
      //pos_x = eX;
      //pos_y = eY;

      // ele_selected  == output click

      //e.clientX * canvas.clientWidth / (canvas.clientWidth * zoom) ;
      var line_x = ele_selected.offsetWidth/2 + 2.5 + ele_selected.parentElement.offsetLeft + ele_selected.offsetLeft;
      var line_y = ele_selected.offsetHeight/2 + 2.5 + ele_selected.parentElement.offsetTop + ele_selected.offsetTop;

      //var x = eX - canvas.offsetLeft - canvas_x;
      //(pos_x - e.clientX) * canvas.clientWidth / (canvas.clientWidth * zoom)

      //var x = eX - canvas.offsetLeft - canvas_x;
      //console.log(canvas.offsetLeft *  ( canvas.clientWidth / (canvas.clientWidth * zoom)) );

      var x = eX * ( canvas.clientWidth / (canvas.clientWidth * zoom)) - (canvas.getBoundingClientRect().x *  ( canvas.clientWidth / (canvas.clientWidth * zoom)) );
      var y = eY * ( canvas.clientHeight / (canvas.clientHeight * zoom)) - (canvas.getBoundingClientRect().y *  ( canvas.clientHeight / (canvas.clientHeight * zoom)) );
      //var y = eY - canvas.offsetTop - canvas_y;
      var curvature = 0.5;
      var hx1 = line_x + Math.abs(x - line_x) * curvature;
      var hx2 = x - Math.abs(x - line_x) * curvature;

      // path.setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' L '+ x +' '+ y +''); // SIMPLE LINE
      // console.log('M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y );
      path.setAttributeNS(null, 'd', 'M '+ line_x +' '+ line_y +' C '+ hx1 +' '+ line_y +' '+ hx2 +' ' + y +' ' + x +'  ' + y);
    }

    function updateConnectionNodes(id) {
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

    function selectElements(eX, eY) {
      if(select_elements == null) {
        var div = document.createElementNS('http://www.w3.org/2000/svg',"svg");
        select_elements = div;
        pos_click_x = eX;
        pos_click_y = eY;
          var rect = document.createElementNS('http://www.w3.org/2000/svg',"rect");
          rect.setAttributeNS(null, 'd', '');
        // rect.innerHTML = 'a';
        div.classList.add("selectbox");
        div.appendChild(rect);
        canvas.appendChild(div);
      }


      select_elements.children[0].setAttributeNS(null, 'x', pos_click_x - canvas.offsetLeft - canvas_x);
      select_elements.children[0].setAttributeNS(null, 'y', pos_click_y - canvas.offsetTop - canvas_y);
      select_elements.children[0].setAttributeNS(null, 'width', eX - pos_click_x);
      select_elements.children[0].setAttributeNS(null, 'height', eY - pos_click_y);
    }


    function position(e) {
      if (e.type === "touchmove") {
        var e_pos_x = e.touches[0].clientX;
        var e_pos_y = e.touches[0].clientY;
      } else {
        var e_pos_x = e.clientX;
        var e_pos_y = e.clientY;
      }

      if(connection) {
        //var newx = e.clientX - (e.clientX - (e.clientX*zoom));

        //var newx = e.clientX * canvas.clientWidth / (canvas.clientWidth * zoom) ;
        //var newy = e.clientY * canvas.clientHeight / (canvas.clientHeight * zoom);

        updateConnection(e_pos_x, e_pos_y);
      }
      if(editor_selected) {
        if (e.ctrlKey) {
          selectElements(e_pos_x, e_pos_y);
        } else {
        x =  canvas_x + (-(pos_x - e_pos_x))
        y = canvas_y + (-(pos_y - e_pos_y))
        // console.log(canvas_x +' - ' +pos_x + ' - '+ e_pos_x + ' - ' + x);
        canvas.style.transform = "translate("+x+"px, "+y+"px) scale("+zoom+")";
        }
      }
      if(drag) {

        var x = (pos_x - e_pos_x) * canvas.clientWidth / (canvas.clientWidth * zoom);
        // console.log(pos_x)
        // console.log(e_pos_x);
        var y = (pos_y - e_pos_y) * canvas.clientHeight / (canvas.clientHeight * zoom);
        pos_x = e_pos_x;
        pos_y = e_pos_y;



        ele_selected.style.top = (ele_selected.offsetTop - y) + "px";
        ele_selected.style.left = (ele_selected.offsetLeft - x) + "px";


        /*ele_selected.style.top = (ele_selected.offsetTop - canvas.offsetTop - y) + "px";
        ele_selected.style.left = (ele_selected.offsetLeft - canvas.offsetLeft -x) + "px";*/

        updateConnectionNodes(ele_selected.id, e_pos_x, e_pos_y)
      }

      if (e.type === "touchmove") {
        mouse_x = e_pos_x;
        mouse_y = e_pos_y;
      }

    }

    function click(e) {
      ele_selected = e.target;
      switch (e.target.classList[0]) {
        case 'node':
          if(node_selected != null) {
            node_selected.classList.remove("selected");
          }
          node_selected = ele_selected;
          node_selected.classList.add("selected");
          drag = true;
          break;
        case 'output':
          connection = true;
          if(node_selected != null) {
            node_selected.classList.remove("selected");
            node_selected = null;
          }
          drawConnection(e.target);
          break;
        case 'parent-drawflow':
          if(node_selected != null) {
            node_selected.classList.remove("selected");
            node_selected = null;
          }
          editor_selected = true;
          break;
        case 'drawflow':
          if(node_selected != null) {
            node_selected.classList.remove("selected");
            node_selected = null;
          }
          editor_selected = true;
          break;
        default:
      }

       if (e.type === "touchstart") {
         pos_x = e.touches[0].clientX;
         pos_y = e.touches[0].clientY;
       } else {
         pos_x = e.clientX;
         pos_y = e.clientY;
       }



    }

    function dragEnd(e) {
      if(select_elements != null) {
        select_elements.remove();
        select_elements = null;
      }

      if (e.type === "touchend") {
        var e_pos_x = mouse_x;
        var e_pos_y = mouse_y;
        var ele_last = document.elementFromPoint(e_pos_x, e_pos_y);
        console.log(e);
      } else {
        var e_pos_x = e.clientX;
        var e_pos_y = e.clientY;
        var ele_last = e.target;
      }

      if(editor_selected) {
        canvas_x = canvas_x + (-(pos_x - e_pos_x));
        canvas_y = canvas_y + (-(pos_y - e_pos_y));
      }
      if(connection === true) {
        if(ele_last.classList[0] === 'input') {
          // Fix connection;
          var output_id = ele_selected.parentElement.id;
          var input_id = ele_last.parentElement.id;
          connection_ele.classList.add("node_in_"+input_id);
          connection_ele.classList.add("node_out_"+output_id);
          connection_ele = null;
        } else {
          // Remove Connection;
          connection_ele.remove();
          connection_ele = null;
        }
      }
      /*if(ele_last.classList[0] === 'node') {
        node_selected.classList.remove("selected");
        node_selected = null;
      }*/
      drag = false;
      connection = false;
      ele_selected = null;
      editor_selected = false;

    }

    function zoom_enter(event, delta) {
      if (event.ctrlKey) {
        event.preventDefault()
        if(event.deltaY > 0) {
          // Zoom Out
          if(zoom > 0.5) {
            zoom-=0.1;
          }

        } else {
          // Zoom In
          if(zoom < 1.6) {
              zoom+=0.1;
          }

        }

        // (pos_x - e_pos_x) * canvas.clientWidth / (canvas.clientWidth * zoom);
        //canvas_x = (canvas_x) * (canvas.clientWidth / (canvas.clientWidth * zoom));
        //canvas_y = (canvas_y) * (canvas.clientHeight / (canvas.clientHeight * zoom));
        canvas.style.transform = "translate("+canvas_x+"px, "+canvas_y+"px) scale("+zoom+")";
      }
    }

    original_canvas.addEventListener('mouseup', dragEnd);
    original_canvas.addEventListener('mousemove', position);
    original_canvas.addEventListener('mousedown', click);

    original_canvas.addEventListener('touchend', dragEnd);
    original_canvas.addEventListener('touchmove', position);
    original_canvas.addEventListener('touchstart', click);


    original_canvas.addEventListener('wheel', zoom_enter);

    add();
}
