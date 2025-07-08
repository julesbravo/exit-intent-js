# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-22
### Added
- Initial open-source release of `exit-intent-js`.
  - Detects exit intent via time-on-page, idle time, mouse leave, tab visibility change and window blur.
  - Customisable options & callback via custom event.
  - Zero dependencies, <6 KB minified.
- Cypress E2E test suite covering all detection modes.

## [1.1.0] - 2025-05-22
### Added
- `pageViewsToTrigger` option to fire exit-intent immediately once the visitor has viewed the site a configurable number of times.
- `observeExitIntent.incrementPageViews()` helper for SPAs to manually bump the counter on client-side route changes.
- Cypress test coverage and documentation examples for the new feature. 

## [1.1.1] - 2025-06-16
### Fixed
- Fixed issue where iframe focus would incorrectly trigger window blur exit intent detection. Now properly distinguishes between legitimate window blur events (user switching tabs/apps) and iframe focus events within the same page.

## [1.2.0] - 2025-01-04
### Added
- **Responsive scroll thresholds**: The `scrollUpThreshold` option now supports different values for mobile and desktop devices
  - New object format: `{ mobile: 200, desktop: 400 }` for device-specific thresholds
  - Added `mobileBreakpoint` option (default: 768px) for customizing mobile detection
  - Mobile devices get lower thresholds (200px default) for easier triggering on touch devices
  - Desktop devices get higher thresholds (400px default) to reduce false positives from mouse wheel scrolling
  - Automatic device detection based on screen width
  - Backward compatibility maintained - existing number format still works
- Enhanced debug logging for scroll detection includes device type and threshold information
- Updated examples and documentation with responsive scroll threshold usage