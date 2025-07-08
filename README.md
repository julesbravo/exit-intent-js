# Exit Intent Detection Library
[![npm](https://img.shields.io/npm/v/exit-intent-js)](https://www.npmjs.com/package/exit-intent-js) [![CI](https://github.com/julesbravo/exit-intent-js/actions/workflows/ci.yml/badge.svg)](https://github.com/julesbravo/exit-intent-js/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/julesbravo/exit-intent-js)](LICENSE)

A lightweight, vanilla JavaScript library for detecting exit intent on web pages. Useful for showing popups, surveys, or capturing feedback before users leave your site.

## Features
- Detects exit intent via multiple signals:
  - Time on page
  - User idle time
  - Mouse leaves window
  - Tab/document visibility change
  - Window loses focus (blur)
  - Pages Viewed
  - Fast upward scrolling
- Customizable options
- Simple API
- No dependencies

## Installation

Copy `src/exit-intent.js` into your project, or install via npm (if published):

```sh
npm install exit-intent-js
```

## Usage

```js
import observeExitIntent from './src/exit-intent';

const { destroy } = observeExitIntent({
  eventName: 'my-exit-event',
  timeOnPage: 10000,
  debug: true
});

window.addEventListener('my-exit-event', e => {
  console.log('Exit intent detected:', e.detail);
});

// To manually clean up listeners and timers:
// destroy();
```

## Options

| Option            | Type     | Default      | Description                                                                 |
|-------------------|----------|--------------|-----------------------------------------------------------------------------|
| `timeOnPage`      | number   | `15000`      | Time (ms) spent on page before triggering exit intent. `0` disables.        |
| `idleTime`        | number   | `8000`       | Time (ms) idle (no interaction) before triggering. `0` disables.            |
| `mouseLeaveDelay` | number   | `1000`       | Delay (ms) after mouse leaves window before triggering. `0` disables.       |
| `tabChange`       | boolean  | `true`       | Trigger when tab/document becomes hidden.                                    |
| `windowBlur`      | boolean  | `true`       | Trigger when window loses focus (user switches tabs/apps or minimizes).      |
| `eventName`       | string   | `'exit-intent'` | Name of the custom event dispatched on window.                          |
| `debug`           | boolean  | `false`      | Enable debug logging to console.                                            |
| `pageViewsToTrigger` | number | `0` | Fire the exit-intent event immediately once the stored page-view counter reaches this threshold. `0` disables the feature. |
| `scrollUpThreshold` | number\|object | `{mobile: 200, desktop: 400}` | Minimum pixels scrolled up to trigger exit intent. Can be a number (legacy) or object with `mobile` and `desktop` properties for responsive thresholds. |
| `mobileBreakpoint` | number | `768` | Screen width threshold (px) for mobile detection. Used with responsive `scrollUpThreshold`. |
| `scrollUpInterval` | number | `100` | Interval (ms) to check scroll position for upward movement. |

By default the library stores a persistent page-view counter in `localStorage` under the key `exit-intent-page-views` and automatically increments that value every time the script is evaluated (i.e. on a full page load).  
If you have a single-page-app (SPA) and want to increment the counter on client-side route changes, call:

```js
observeExitIntent.incrementPageViews(); // bump by 1 (or pass a custom amount)
```

## Responsive Scroll Thresholds

The `scrollUpThreshold` option supports responsive thresholds for different device types:

### Object Format (Recommended)
```js
observeExitIntent({
  scrollUpThreshold: {
    mobile: 200,   // Lower threshold for mobile devices (≤ 768px)
    desktop: 400   // Higher threshold for desktop devices (> 768px)
  },
  mobileBreakpoint: 768 // Screen width threshold for mobile detection
});
```

### Legacy Number Format (Still Supported)
```js
observeExitIntent({
  scrollUpThreshold: 300 // Same threshold for all devices
});
```

### Benefits of Responsive Thresholds
- **Mobile devices**: Lower threshold (200px) makes it easier to trigger on touch devices where scrolling patterns differ
- **Desktop devices**: Higher threshold (400px) reduces false positives from mouse wheel scrolling
- **Automatic detection**: The library automatically detects device type based on screen width
- **Backward compatibility**: Existing code using number values continues to work

## Exit Intent Reasons

The custom event's `detail` property will be one of:
- `'timeOnPage'`    — Time on page exceeded
- `'idleTime'`      — User idle for too long
- `'mouseLeave'`    — Mouse left window
- `'tabChange'`     — Tab/document became hidden
- `'windowBlur'`    — Window lost focus
- `'scrollUp'`      — User scrolled up quickly

## Examples

### 1. Basic usage (vanilla JS)

```js
observeExitIntent({
  timeOnPage: 5000,
  idleTime: 3000,
  mouseLeaveDelay: 500,
  tabChange: true,
  windowBlur: true,
  scrollUpThreshold: {
    mobile: 200,   // 200px threshold for mobile devices
    desktop: 400   // 400px threshold for desktop devices
  },
  mobileBreakpoint: 768,
  scrollUpInterval: 50,
  eventName: 'exit-intent',
  debug: true
});

window.addEventListener('exit-intent', e => {
  alert('Exit intent detected! Reason: ' + e.detail);
});
```

### 2. Triggering a Postscript Popup on exit-intent

If you use [Postscript](https://postscript.io/) for SMS pop-ups, you can open a popup only when exit intent is detected. A full working page lives in [`examples/postscript.html`](examples/postscript.html). 
---

## Cleanup

The function returns an object with a `destroy` method to remove all listeners and timers:

```js
const { destroy } = observeExitIntent();
// ...
destroy();
```

## License
MIT 