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