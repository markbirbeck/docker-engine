# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.6.0] - 2018-08-13
### Added
- Switch to streaming if `follow` or `logs` is present (#19).

## [v0.5.1] - 2018-08-13
### Added
- Stream flag should check for String('true') rather than Boolean(true) (#18).

## [v0.5.0] - 2018-08-11
### Added
- Support streaming of output from API (#14).
- Switch to using Swagger client only to build request (#15).

## [v0.4.0] - 2018-06-18
### Added
- Use debug module for logging tunnel messages (#12).

## [v0.3.0] - 2018-06-16
### Added
- Support the use of SSH tunnelling without requiring separate app (#10).

## [v0.2.2] - 2018-06-14
### Fixed
- Requests to API with payload and query parameters are failing (#7).

## [v0.2.0] - 2018-06-13
### Added
- Use very specific version of Node in `Dockerfile` for tests (latest LTS)
- Replace `http.request` with `docker-modem` (#2).
- Ensure the tests are generic ready for CI/CD (#3).

## v0.1.1 - 2018-06-05
### Added
- Initialise Swagger client from local file.

[v0.2.0]: https://github.com/markbirbeck/docker-engine/compare/v0.1.1...v0.2.0
[v0.2.2]: https://github.com/markbirbeck/docker-engine/compare/v0.2.0...v0.2.2
[v0.3.0]: https://github.com/markbirbeck/docker-engine/compare/v0.2.2...v0.3.0
[v0.4.0]: https://github.com/markbirbeck/docker-engine/compare/v0.3.0...v0.4.0
[v0.5.0]: https://github.com/markbirbeck/docker-engine/compare/v0.4.0...v0.5.0
[v0.5.1]: https://github.com/markbirbeck/docker-engine/compare/v0.5.0...v0.5.1
[v0.6.0]: https://github.com/markbirbeck/docker-engine/compare/v0.5.1...v0.6.0
[Unreleased]: https://github.com/markbirbeck/docker-engine/compare/v0.6.0...HEAD
