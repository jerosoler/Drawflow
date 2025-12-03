/**
 * Module management module
 * Handles creating, switching, and removing modules (workspaces)
 */

/**
 * Get the module name from a node ID
 * @param {string|number} id - Node ID
 * @returns {string} - Module name
 */
export function getModuleFromNodeId(id) {
  var nameModule;
  const editor = this.drawflow.drawflow
  Object.keys(editor).map(function(moduleName, index) {
    Object.keys(editor[moduleName].data).map(function(node, index2) {
      if(node == id) {
        nameModule = moduleName;
      }
    })
  });
  return nameModule;
}

/**
 * Add a new module
 * @param {string} name - Module name
 */
export function addModule(name) {
  this.drawflow.drawflow[name] =  { "data": {} };
  this.dispatch('moduleCreated', name);
}

/**
 * Change to a different module
 * @param {string} name - Module name
 */
export function changeModule(name) {
  this.dispatch('moduleChanged', name);
  this.module = name;
  this.precanvas.innerHTML = "";
  this.canvas_x = 0;
  this.canvas_y = 0;
  this.pos_x = 0;
  this.pos_y = 0;
  this.mouse_x = 0;
  this.mouse_y = 0;
  this.zoom = 1;
  this.zoom_last_value = 1;
  this.precanvas.style.transform = '';
  this.import(this.drawflow, false);
}

/**
 * Remove a module
 * @param {string} name - Module name
 */
export function removeModule(name) {
  if(this.module === name) {
    this.changeModule('Home');
  }
  delete this.drawflow.drawflow[name];
  this.dispatch('moduleRemoved', name);
}

/**
 * Clear the currently selected module
 */
export function clearModuleSelected() {
  this.precanvas.innerHTML = "";
  this.drawflow.drawflow[this.module] =  { "data": {} };
}

/**
 * Clear all modules and reset to default
 */
export function clear() {
  this.precanvas.innerHTML = "";
  this.drawflow = { "drawflow": { "Home": { "data": {} }}};
}

/**
 * Export the drawflow data
 * @returns {Object} - Exported data
 */
export function exportDrawflow() {
  const dataExport = JSON.parse(JSON.stringify(this.drawflow));
  this.dispatch('export', dataExport);
  return dataExport;
}

/**
 * Import drawflow data
 * @param {Object} data - Data to import
 * @param {boolean} notifi - Whether to dispatch import event
 */
export function importDrawflow(data, notifi = true) {
  this.clear();
  this.drawflow = JSON.parse(JSON.stringify(data));
  this.load();
  if(notifi) {
    this.dispatch('import', 'import');
  }
}
