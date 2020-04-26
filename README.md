# Drawflow

![Demo](https://github.com/jerosoler/Drawflow/blob/master/docs/drawflow.gif)

Simple flow library

## Installation

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jerosoler/Drawflow/dist/drawflow.min.css">
<script src="https://cdn.jsdelivr.net/gh/jerosoler/Drawflow/dist/drawflow.min.js"></script>

<div id="drawflow"></div>
```

var id = document.getElementById("drawflow");
```javascript
const editor = new Drawflow(id);
editor.start();
```

## Add node example
```javascript
var html = `
<div><input type="text" df-name></div>
`;
var data = { "name": '' };

//editor.addNode(name, inputs, outputs, posx, posy, class, data, html);
editor.addNode('github', 0,1,150,300, 'github', data, html);
```

## Editor
```javascript
editor.editor_mode = 'edit'; // Default
editor.editor_mode = 'fixed'; // Only scroll
```

## Modules
```javascript
editor.addModule('nameNewModule');
editor.changeModule('nameNewModule');
```

## Events
Event | Return
--- | ---
  `nodeCreated` | id
  `nodeRemoved` | id
  `nodeSelected` | id
  `connectionCreated` | { ouput_id, input_id, ouput_class, input_class }
  `connectionRemoved` | { ouput_id, input_id, ouput_class, input_class }
  `moduleCreated` | name
  `moduleChanged` | name
  `mouseMove` | { x, y }
  `zoom` | zoom_level
  `translate` | { x, y }

### Events example
```javascript
editor.on('nodeCreated', function(id) {
  console.log("Node created " + id);
})
```

## Export / Import
```javascript
var exportdata = editor.export();
editor.import(exportdata);
```
