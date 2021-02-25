# Changelog

Observes [Semantic Versioning](https://semver.org/spec/v2.0.0.html) standard and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) convention.

## [Unreleased]
### Changed
- Modify dark and default logos to reflect new `DataJoint LabBook` name. PR #70
- Refactor Insert and Update component code to share common form generation code
- Added support for double data type
- Fixed issue with input fields for decimal, floats, and double not having the correct step settings.
- Updated formating for time to match HH:MM:SS, before it would chop off MM and SS if was less then 10


## [0.1.0-alpha.2] - 2021-02-19
### Added
- Provide a database server login/logout interface. Page refresh also triggers logout.
- View, sort, and substring search on schemas.
- View tables that correspond to schemas.
- View table definitions
- Paged view of table records. Primary keys highlighted.
- Filter support of table records using cards for compounding restrictions.
- Support for DataJoint attribute types: `varchar`, `int`, `float`, `datetime`, `date`, `time`, `decimal`, `uuid`.
- Insert single record with copy over functionality.
- Update single record with copy over functionality. Corresponding dependencies shown as warning to user.
- Delete single record. Corresponding dependencies shown as warning to user.
- Multi database server connections supported by opening new tabs.
- Support of DJ NEURO - [Managed Database Hosting](https://djneuro.io/services/) users.

[Unreleased]: https://github.com/datajoint/datajoint-labbook/compare/0.1.0-alpha.2...HEAD
[0.1.0-alpha.2]: https://github.com/datajoint/datajoint-labbook/releases/tag/0.1.0-alpha.2