# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0](https://github.com/edward-shen/MMM-pages/compare/v1.1.2...v1.2.0) - 2025-07-26

### Added

- feat: implement automatic timeout for hidden pages (request [#90](https://github.com/edward-shen/MMM-pages/issues/90))

### Changed

- chore: Update devDependencies
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
