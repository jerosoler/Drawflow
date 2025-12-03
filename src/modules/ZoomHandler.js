/**
 * Zoom handling module
 * Provides zoom in, out, reset and mouse wheel zoom functionality
 */

/**
 * Handle mouse wheel zoom event
 * @param {WheelEvent} event - Wheel event
 * @param {number} delta - Optional delta value
 */
export function zoom_enter(event, delta) {
  if (event.ctrlKey) {
    event.preventDefault()
    if(event.deltaY > 0) {
      // Zoom Out
      this.zoom_out();
    } else {
      // Zoom In
      this.zoom_in();
    }
  }
}

/**
 * Refresh zoom display after zoom value change
 */
export function zoom_refresh() {
  this.dispatch('zoom', this.zoom);
  this.canvas_x = (this.canvas_x / this.zoom_last_value) * this.zoom;
  this.canvas_y = (this.canvas_y / this.zoom_last_value) * this.zoom;
  this.zoom_last_value = this.zoom;
  this.precanvas.style.transform = "translate("+this.canvas_x+"px, "+this.canvas_y+"px) scale("+this.zoom+")";
}

/**
 * Zoom in by zoom_value increment
 */
export function zoom_in() {
  if(this.zoom < this.zoom_max) {
    this.zoom+=this.zoom_value;
    this.zoom_refresh();
  }
}

/**
 * Zoom out by zoom_value decrement
 */
export function zoom_out() {
  if(this.zoom > this.zoom_min) {
    this.zoom-=this.zoom_value;
    this.zoom_refresh();
  }
}

/**
 * Reset zoom to 1
 */
export function zoom_reset() {
  if(this.zoom != 1) {
    this.zoom = 1;
    this.zoom_refresh();
  }
}
