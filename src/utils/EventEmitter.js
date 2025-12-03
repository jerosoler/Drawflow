/**
 * EventEmitter class for handling custom events
 * Provides on, dispatch, and removeListener methods
 */
export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {boolean} - False if invalid parameters
   */
  on(event, callback) {
    // Check if the callback is not a function
    if (typeof callback !== 'function') {
      console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
      return false;
    }
    // Check if the event is not a string
    if (typeof event !== 'string') {
      console.error(`The event name must be a string, the given type is ${typeof event}`);
      return false;
    }
    // Check if this event not exists
    if (this.events[event] === undefined) {
      this.events[event] = {
        listeners: []
      }
    }
    this.events[event].listeners.push(callback);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   * @returns {boolean} - False if event doesn't exist
   */
  removeListener(event, callback) {
    // Check if this event not exists
    if (!this.events[event]) return false

    const listeners = this.events[event].listeners
    const listenerIndex = listeners.indexOf(callback)
    const hasListener = listenerIndex > -1
    if (hasListener) listeners.splice(listenerIndex, 1)
  }

  /**
   * Dispatch an event to all listeners
   * @param {string} event - Event name
   * @param {*} details - Event details/payload
   * @returns {boolean} - False if event doesn't exist
   */
  dispatch(event, details) {
    // Check if this event not exists
    if (this.events[event] === undefined) {
      // console.error(`This event: ${event} does not exist`);
      return false;
    }
    this.events[event].listeners.forEach((listener) => {
      listener(details);
    });
  }
}
