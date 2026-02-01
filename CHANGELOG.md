# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.3.2](https://github.com/edward-shen/MMM-pages/compare/v1.3.1...v1.3.2) (2026-02-01)


### Fixed

* respect hiddenOnStartup flag for modules on pages ([1a416dc](https://github.com/edward-shen/MMM-pages/commit/1a416dcd829eee2e91abde8241a7e65f0b3df473)), closes [#71](https://github.com/edward-shen/MMM-pages/issues/71)


### Chores

* add demo scripts and change package type from module to commonjs ([1592dc7](https://github.com/edward-shen/MMM-pages/commit/1592dc72e8e9f72688c0b4ef001d3cc1f550a634))
* add git hooks and lint-staged for pre-commit linting ([fe71823](https://github.com/edward-shen/MMM-pages/commit/fe71823c0a7ab260f76b97ceab84fa7bc65419ed))
* add JSDoc validation with eslint-plugin-jsdoc ([4b9033c](https://github.com/edward-shen/MMM-pages/commit/4b9033c7f3d0f6a5fd695e62fb1c5b1217ff76b0))
* add step to run unit tests in automated tests workflow ([4701684](https://github.com/edward-shen/MMM-pages/commit/4701684d42adafff43b8711a7c2ec7616ac84cf8))


### Code Refactoring

* improve error message clarity in updatePages() ([feba3ee](https://github.com/edward-shen/MMM-pages/commit/feba3eeacaad87c80bdf68da3d9535319632a7e1))


### Tests

* add comprehensive unit tests (67 tests) ([c7f1327](https://github.com/edward-shen/MMM-pages/commit/c7f1327545c4eaea9f633808c8d71f1364cf6598))
* add unit tests for animation and timer functionality in MMM-pages ([8461816](https://github.com/edward-shen/MMM-pages/commit/8461816af7d4e55844e3cc787067647ca697dceb))

## [1.3.1](https://github.com/edward-shen/MMM-pages/compare/v1.3.0...v1.3.1) (2026-01-31)


### Chores

* adapt stylistic plugin config to new pattern ([a4f7459](https://github.com/edward-shen/MMM-pages/commit/a4f74590239a7984351f2297ad94da04ea65a3c8))
* add changelog config and release script ([400100e](https://github.com/edward-shen/MMM-pages/commit/400100e761074473fa21304737869692adb615be))
* change CI environment to use ubuntu-slim ([f436afb](https://github.com/edward-shen/MMM-pages/commit/f436afbe46fd2887c52ad2e3631a00caf6748ecf))
* update actions/checkout to v6 in automated tests workflow ([d90e45f](https://github.com/edward-shen/MMM-pages/commit/d90e45ff95397d29267c05f8cdb26b4daf361b27))
* update devDependencies ([2b01a78](https://github.com/edward-shen/MMM-pages/commit/2b01a7818aad8c0b78dd3d87502a24139c34efec))

## [1.3.0](https://github.com/edward-shen/MMM-pages/compare/v1.2.1...v1.3.0) - 2025-11-11

### Added

- feat: add rotationHomePageHidden config for separate hidden page timeout - this solves issue [#67](https://github.com/edward-shen/MMM-pages/issues/67)

### Changed

- chore: remove deprecated 'excludes' config option (6 years after deprecation)
- chore: remove deprecated 'rotationFirstPage' config option (5 years after deprecation)
- refactor: introduce `clearTimers()` method to simplify timer management
- refactor: remove redundant 'const self = this' variables
- chore: update actions/setup-node to version 6 in automated tests workflow
- chore: update devDependencies

## [1.2.1](https://github.com/edward-shen/MMM-pages/compare/v1.2.0...v1.2.1) - 2025-09-01

### Added

- chore: add dependabot configuration for GitHub Actions and npm updates

### Changed

- chore: update actions/checkout to version 5 in automated tests workflow
- chore: update devDependencies

## [1.2.0](https://github.com/edward-shen/MMM-pages/compare/v1.1.2...v1.2.0) - 2025-07-26

### Added

- feat: implement automatic timeout for hidden pages (request [#90](https://github.com/edward-shen/MMM-pages/issues/90))

### Changed

- chore: update devDependencies
- refactor: simplify rotation control logic in `setRotation` method

### Fixed

- fix: correct rotation state check in `setRotation` method
- fix: use config value for rotation delay

## [1.1.2](https://github.com/edward-shen/MMM-pages/compare/v1.1.1...v1.1.2) - 2025-06-11 - Maintenance Release

### Changed

- chore: add "type": "module" to `package.json`
- chore: simplify ESLint config
- chore: switch to YAML issue templates
- chore: update devDependencies
- refactor: get rid of negated-conditions and add `no-negated-condition` rule to ESLint config

## [1.1.1](https://github.com/edward-shen/MMM-pages/compare/v1.1.0...v1.1.1) - 2025-03-26 - Maintenance Release

### Changed

- chore: review ESLint config and add markdown linting
- chore: update devDependencies
- chore: use `node --run` instead of `npm run` to run scripts

## [1.1.0](https://github.com/edward-shen/MMM-pages/compare/v1.0.1...v1.1.0) - 2025-03-25 - Feature Release

### Added

- feat: Add individual rotation time for each page (#88)
- docs: Add example configuration files in directory `example_configs`

## [1.0.1](https://github.com/edward-shen/MMM-pages/compare/v1.0.0...v1.0.1) - 2025-03-23 - Maintenance Release

### Changed

- chore: Run tests always with lts version of node
- chore: Switch license file to Markdown for better readability
- chore: Update devDependencies
- chore: Review ESLint configuration
- chore: Simplify ESLint calls in package.json
- chore: Remove unused CSS file

## [1.0.0](https://github.com/edward-shen/MMM-pages/releases/tag/v1.0.0) - 2024-12-16

Since there was no CHANGELOG.md before version 1.0.0, changes are only documented from this version on.
