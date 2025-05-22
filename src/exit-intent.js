// Vanilla JS Exit Intent Detection Library
// Usage: observeExitIntent(options)
//
// Options:
//   timeOnPage: number (ms, default: 15000)
//     Time spent on the page before triggering exit intent. Set to 0 to disable.
//
//   idleTime: number (ms, default: 5000)
//     Time spent idle (no user interaction) before triggering exit intent. Set to 0 to disable.
//     Uses IdleDetector if available, otherwise falls back to manual detection.
//
//   mouseLeaveDelay: number (ms, default: 1000)
//     Delay after mouse leaves the window before triggering exit intent. Set to 0 to disable.
//
//   tabChange: boolean (default: true)
//     Whether to trigger exit intent when the user changes tabs (document becomes hidden).
//
//   windowBlur: boolean (default: true)
//     Whether to trigger exit intent when the window loses focus (user switches tabs/apps or minimizes).
//
//   eventName: string (default: 'exit-intent')
//     The name of the custom event dispatched on window when exit intent is detected.
//
// Example:
//   observeExitIntent({ eventName: 'my-exit-event', timeOnPage: 10000 });
//   window.addEventListener('my-exit-event', e => console.log('Exit intent:', e.detail));


function observeExitIntent(options = {}) {
  // Merge user options with defaults
  const config = {
    timeOnPage: 15000, // ms, 0 disables
    idleTime: 8000, // ms, 0 disables
    mouseLeaveDelay: 1000, // ms, 0 disables
    tabChange: true, // true/false
    windowBlur: true, // true/false
    eventName: 'exit-intent', // event name for the custom event
    debug: false, // true/false
    ...options
  };

  // Internal state
  let triggered = false; // Whether exit intent has already been triggered
  let timers = []; // Store all timeouts for cleanup
  let listeners = []; // Store all event listeners for cleanup
  let idleTimeout = null; // For manual idle detection
  let mouseLeaveTimer = null; // For mouse leave delay

  function log(message) {
    if (config.debug) {
      console.log(message);
    }
  }

  // Helper to clean up all listeners and timers
  function destroy() {
    log("destroy");
    triggered = true;
    timers.forEach(clearTimeout); // Clear all timeouts
    timers = [];
    listeners.forEach(({el, type, fn}) => el.removeEventListener(type, fn)); // Remove all event listeners
    listeners = [];
    if (idleTimeout) clearTimeout(idleTimeout);
    if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
  }

  // Call this to trigger exit intent and cleanup
  function trigger(reason) {
    if (!triggered) {
      destroy();
      // Dispatch a custom event on window
      log("triggered with reason: " + reason);
      const event = new CustomEvent(config.eventName, { detail: reason });
      window.dispatchEvent(event);
    }
  }

  // 1. Time on page: trigger after a set time
  if (config.timeOnPage > 0) {
    timers.push(setTimeout(() => trigger('timeOnPage'), config.timeOnPage));
  }

  // 2. Idle Time: use IdleDetector if available, otherwise fallback to manual
  if (config.idleTime > 0) {
    // Manual idle detection fallback
    let idleTimer;
    function resetIdle() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => trigger('idleTime'), config.idleTime);
    }
    // Reset idle timer on user activity
    ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(type => {
      const fn = resetIdle;
      window.addEventListener(type, fn);
      listeners.push({el: window, type, fn});
    });
    resetIdle();
  }

  // 3. Mouse leaves window: trigger after delay if mouse leaves and doesn't return
  if (config.mouseLeaveDelay > 0) {
    function onMouseOut(e) {
      // Only trigger if mouse leaves window (not just an element)
      if (!e.relatedTarget && !e.toElement) {
        mouseLeaveTimer = setTimeout(() => trigger('mouseLeave'), config.mouseLeaveDelay);
      }
    }
    function onMouseOver() {
      // Cancel timer if mouse re-enters window
      if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
    }
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('mouseover', onMouseOver);
    listeners.push({el: window, type: 'mouseout', fn: onMouseOut});
    listeners.push({el: window, type: 'mouseover', fn: onMouseOver});
  }

  // 4. Tab changes: trigger when document becomes hidden
  if (config.tabChange) {
    function onVisibility() {
      if (document.visibilityState === 'hidden') {
        trigger('tabChange');
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    listeners.push({el: document, type: 'visibilitychange', fn: onVisibility});
  }

  // 5. Window blur: trigger when window loses focus
  if (config.windowBlur) {
    function onBlur() {
      trigger('windowBlur');
    }
    window.addEventListener('blur', onBlur);
    listeners.push({el: window, type: 'blur', fn: onBlur});
  }

  // Return destroy for manual cleanup if needed
  return { destroy };
}

// Export for module usage (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = observeExitIntent;
} 