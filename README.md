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
- Customizable options
- Simple API
- No dependencies

## Installation

Copy `src/exit-intent.js` into your project, or install via npm (if published):

```sh
npm install exit-intent
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

## Exit Intent Reasons

The custom event's `detail` property will be one of:
- `'timeOnPage'`    — Time on page exceeded
- `'idleTime'`      — User idle for too long
- `'mouseLeave'`    — Mouse left window
- `'tabChange'`     — Tab/document became hidden
- `'windowBlur'`    — Window lost focus

## Example

```js
observeExitIntent({
  timeOnPage: 5000,
  idleTime: 3000,
  mouseLeaveDelay: 500,
  tabChange: true,
  windowBlur: true,
  eventName: 'exit-intent',
  debug: true
});

window.addEventListener('exit-intent', e => {
  alert('Exit intent detected! Reason: ' + e.detail);
});
```

## Cleanup

The function returns an object with a `destroy` method to remove all listeners and timers:

```js
const { destroy } = observeExitIntent();
// ...
destroy();
```

## License
MIT 