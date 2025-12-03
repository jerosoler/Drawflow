/**
 * Mobile touch and zoom handling mixin
 * Provides mobile device support for multi-touch zooming
 */

/**
 * Initialize mobile handlers on the given context
 * @param {object} context - Drawflow instance
 */
export function initMobileHandlers(context) {
  context.evCache = new Array();
  context.prevDiff = -1;
}

/**
 * Handle pointer down event
 * @param {PointerEvent} ev - Pointer event
 */
export function pointerdown_handler(ev) {
  this.evCache.push(ev);
}

/**
 * Handle pointer move event for pinch-to-zoom
 * @param {PointerEvent} ev - Pointer event
 */
export function pointermove_handler(ev) {
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

/**
 * Handle pointer up/cancel/out/leave events
 * @param {PointerEvent} ev - Pointer event
 */
export function pointerup_handler(ev) {
  this.remove_event(ev);
  if (this.evCache.length < 2) {
    this.prevDiff = -1;
  }
}

/**
 * Remove event from cache
 * @param {PointerEvent} ev - Pointer event to remove
 */
export function remove_event(ev) {
  // Remove this event from the target's cache
  for (var i = 0; i < this.evCache.length; i++) {
    if (this.evCache[i].pointerId == ev.pointerId) {
      this.evCache.splice(i, 1);
      break;
    }
  }
}
