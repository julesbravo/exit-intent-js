// Vanilla JS Exit Intent Detection Library

// Helper: page-view counter using localStorage so we can optionally delay
// exit-intent detection until the visitor has landed on the site a certain
// number of times.
const PAGE_VIEW_STORAGE_KEY = 'exit-intent-page-views';

function getPageViews(key = PAGE_VIEW_STORAGE_KEY) {
  try {
    const raw = localStorage.getItem(key);
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  } catch (e) {
    // localStorage may be disabled or unavailable (SSR, privacy mode, etc.)
    return 0;
  }
}

function setPageViews(count, key = PAGE_VIEW_STORAGE_KEY) {
  try {
    localStorage.setItem(key, String(count));
  } catch (_) {
    /* no-op */
  }
}

/**
 * Increment the persisted page-view counter.
 * @param {number} amount – how much to increment by (default 1)
 * @param {string} key – override storage key if you need to isolate counters.
 * @returns {number} The new total after incrementing.
 */
function incrementPageViews(amount = 1, key = PAGE_VIEW_STORAGE_KEY) {
  const updated = getPageViews(key) + amount;
  setPageViews(updated, key);
  return updated;
}

incrementPageViews();


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
    pageViewsToTrigger: 5, // Fire immediately when this many page views is reached
    ...options
  };


  

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
    timers.forEach(clearTimeout); // Clear all timeouts
    timers = [];
    listeners.forEach(({el, type, fn}) => el.removeEventListener(type, fn)); // Remove all event listeners
    listeners = [];
    if (idleTimeout) clearTimeout(idleTimeout);
    if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
  }

  // Call this to trigger exit intent and cleanup
  function trigger(reason) {
    // Dispatch a custom event on window (do NOT destroy – we now allow multiple fires)
    log("triggered with reason: " + reason);
    const event = new CustomEvent(config.eventName, { detail: reason });
    window.dispatchEvent(event);
  }

  // If the visitor has now reached the required number of page views, fire
  // the event immediately and skip the other detectors.
  const currentViews = getPageViews();
  if (config.pageViewsToTrigger && currentViews >= config.pageViewsToTrigger) {
    if (config.debug) {
      console.log(`exit-intent: pageViewsToTrigger reached (${currentViews}). Firing immediately.`);
    }
    trigger('pageViews');

    // Continue setting up the other detectors – removing the early return allows
    // multiple reasons to be caught even after the immediate page-view trigger.
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
      // Check if focus moved to a child iframe - if so, don't trigger exit intent
      // Use setTimeout to allow the browser to update document.activeElement
      setTimeout(() => {
        const activeElement = document.activeElement;
        
        // If the active element is an iframe and it's a child of this document,
        // then the user is still on the page and we shouldn't trigger exit intent
        if (activeElement && activeElement.tagName === 'IFRAME') {
          // Check if this iframe is a child of the current document
          if (document.contains(activeElement)) {
            log('Window blur ignored - focus moved to child iframe');
            return;
          }
        }
        
        trigger('windowBlur');
      }, 0);
    }
    window.addEventListener('blur', onBlur);
    listeners.push({el: window, type: 'blur', fn: onBlur});
  }

  // Return destroy for manual cleanup if needed
  return { destroy };
}

// Attach helper so consumers can manually bump the counter in SPAs.
observeExitIntent.incrementPageViews = incrementPageViews;

// Export for module usage (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = observeExitIntent;
} 