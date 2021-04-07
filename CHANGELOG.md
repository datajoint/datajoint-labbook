# Changelog

Observes [Semantic Versioning](https://semver.org/spec/v2.0.0.html) standard and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) convention.

## [Unreleased]
### Fixed
- Fixed flexbox grow issues with safari by adding prefix. PR #142g

## [0.1.0] - 2021-03-31
### Added
- Added sphinx docs for styleguide. PR #138
- Docstrings for all classes and functions. (#112) PR #124
- Added sphinx docs and typedoc along with the docker and docker-compose file to build them. See `Developer Documentation/General Notes` for details. (#126) PR #129
- Smaller screen layout. (#58) PR #127
- Documentation on running Jest tests w/ Docker. PR #130
- Test cases for `/login` page. (#80) PR #130
- Local testing database for `dev` Docker environment. PR #130
- Added ability to insert null into nullable blobs. (#122) PR #135
- Added github actions for auto building docs. (#110) PR #139
- Issue templates for bug reports and feature requests. PR #140
- `test` job that will run tests in GitHub Actions. PR #140
- Upload `docker-compose-deploy.yaml` environment on releases. PR #140
- Publish job that will deploy documentation updates on release. PR #140
- Include a `test` job into CI to verify Jest tests pass. (#80) PR #140

### Fixed
- Fixed bug related to old table restrictions being applied to the new selected table. (#128) PR #135
- Fixed behavior with table actions being dismounted instead of being hidden which also fix the filter not being remembered problem. (#57) PR #135
- Fixed filter behavior when the user puts and empty string in a number type, the restriction doesn't become invalid. PR #137
- License copyright issue. PR #140
- Fix issue in testing `local-db` where deletes prone to failure if logging table missing. PR #140

### Changed
- Changed the colors in CSS to match the styleguide. PR #138
- Replaced buggy column resizer with auto fit CSS table cells for now. PR #135
- Replaced usage of any with more strongly typed data types. (#125) PR #124
- Replaced the direct react component props definition with interface. PR #124
- Replaced state and props with interface instead of types. PR #124
- Hide reset to default to button due to inconsitent behavior between different attribute types. (#131) PR #135
- Updated backend routes to match with new api route conventions. (#114) PR #137
- Point contribution guideline to standard DataJoint policy document. (#113) PR #140
- Update `pharus` version reference in gitsubmodule. PR #140

### Removed
- Duplicate `volume` config for `pharus` service in `dev` Docker environment. PR #130
- `ALPHA`/`BETA` warning in README. PR #140
- Note on `dev` branch to prepare to consolidate. PR #140

## [0.1.0-beta.2] - 2021-03-11
### Added
- Added case insensitive behavior to schema and table search box (#99) PR #102
- CSS for making the primary keys look disabled/readonly for update mode PR #105
- Added number of tuples input box for fetch table viewing PR #117
- Added loading animation to table list load, table content load, and table action wait time (#107) PR #120

### Fixed
- Fixed bug of delete with datetime in primarykey crashing PR #105
- Fixed broken paging system for fetching records. Before it would fetched everything, now it only fetches only what is needed (#30) PR #117
- Fixed redundent data fetching when user switch between Table Content and Table Info PR #117
- Fixed redundent props to state copy in tableInfo component PR #117
- Fixed issue where website crashes when opening a filter card for datetime. (#104) PR #106

### Changed
- Changed date time to datetime and Timestamp to timestamp for input block labels (#108) PR #118

## [0.1.0-beta.1] - 2021-02-26
### Added
- Support for double data type (#72) PR #86
- Added search functionailty for table list similar to schema. (#73) PR #88
- Added input field for date/datetime/time/timestamp copy over for insert and update. (#47) PR #87
- Added support for reseting to null or default for insert and update (#48) PR #93
- Added support to render default values if exist for insert (#95) PR #93
- Added browser default popup to confirm before page refresh. (#7) PR #94
- Added table sorting feature (#84) PR #98
- Added more details in the error message for table content/attribute/info fetch PR #96

### Changed
- Changed dark and default logos to reflect new `DataJoint LabBook` name. PR #70
- Changed Insert and Update component code to share common form generation code, still need to do for delete (#54) PR #86
- Replaced the word delete with trash icon for filter card removal (#82) PR #87
- Hide dependency logic in update and delete action - partially fixes (#83) PR #87 #91
- Update nginx image to pull from datajoint organization. PR #94
- Changed the total number of entries in table to reflect the actual total count sent back by pharus PR #96
- Improved filter request logic to reduce unnecessary calls with configurable delay. (#85) PR #97

### Fixed
- Fixed issue with input fields for decimal, floats, and double not having the correct step settings. (#81) PR #86
- Fixed formating for time to match HH:MM:SS, before it would chop off MM and SS if was less then 10 (#74) PR #86
- Fixed issue with insert error breaking the app. (#71) PR #87
- Fixed issue with time, date, datetime, and timestamp display null as Nan::Nan, now it just display null for those fields (#75) PR #89
- Fixed broken styling that came up in the code cleaning process. PR #92
- Fixed tinyInt input field min/max value. (#77) PR #92
- Fixed typos for table type string (smallint/medium unsigned) PR #96
- Fixed part table selection not getting highlighted correctly PR #96

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

[Unreleased]: https://github.com/datajoint/datajoint-labbook/compare/0.1.0...HEAD
[0.1.0]: https://github.com/datajoint/datajoint-labbook/compare/0.1.0-beta.2...0.1.0
[0.1.0-beta.2]: https://github.com/datajoint/datajoint-labbook/compare/0.1.0-beta.1...0.1.0-beta.2
[0.1.0-beta.1]: https://github.com/datajoint/datajoint-labbook/compare/0.1.0-alpha.2...0.1.0-beta.1
[0.1.0-alpha.2]: https://github.com/datajoint/datajoint-labbook/releases/tag/0.1.0-alpha.2
