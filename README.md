<div
<p align="center">
  <em>👷‍♀️ <b>Under Construction</b> 👷</em>
  <img src="https://raw.githubusercontent.com/datajoint/datajoint-labbook/master/under_contruction.png" alt="construction_fig"/>  
</p>
</div>

> ⚠️ The DataJoint LabBook project is still early in its life and the maintainers are currently actively developing with a priority of addressing first critical issues directly related to the deliveries of [Alpha](https://github.com/datajoint/datajoint-labbook/milestone/1) and [Beta](https://github.com/datajoint/datajoint-labbook/milestone/2) milestones. Please be advised that while working through our milestones, we may restructure/refactor the codebase without warning until we issue our [Official Release](https://github.com/datajoint/datajoint-labbook/milestone/3) currently planned as `0.1.0` on `2021-03-31`.

# DataJoint LabBook

A frontend with graphical user interface for DataJoint pipelines built using React.

This repo is the single source of truth for development efforts on DataJoint LabBook frontend development.

## Requirements for Preferred Setup

- [Docker](https://docs.docker.com/get-docker/  )
- [Docker Compose](https://docs.docker.com/compose/install/)

## Branches

For now, development observes the following policy for branches:
- `dev`: Feature-complete, DEMO-ready progress. Might be a bit rough around the edges or lacking in docs, tests but functional. Demonstrates latest features that have been completed.
- `master`: Polished, release-ready source with relevant docs, tests. More stable and less likely to undergo any refactoring/restructuring.

## Run Locally w/ Docker

1) Copy a `*-docker-compose.yaml` file corresponding to your usage to `docker-compose.yaml`. This file is untracked so feel free to modify as necessary. Idea is to commit anything generic but system/setup dependent should go on 'your' version i.e. local UID/GID, etc.
2) Check the first comment which will provide the best instruction on how to start the service; yes, it is a bit long. Note: Any of the keyword arguments prepended to the `docker-compose` command can be safely moved into a dedicated `.env` and read automatically if they are not evaluated i.e. `$(...)`. Below is a brief description of the non-evaluated environment variables:

  ```shell
  PY_VER=3.8    # (pharus) Python version: 3.6|3.7|3.8
  IMAGE=djtest  # (pharus) Image type:     djbase|djtest|djlab|djlabhub
  DISTRO=alpine # (pharus) Distribution:   alpine|debian
  ```

## Working with git submodule dependency

`pharus` is treated as a backend dependency managed by git's builtin submodules. It allows us to nest entire git repos with separate history and easy access. Below are some helpful commands to be used after cloning the source repo.

### First time git submodule initialization

`git submodule init` then `git submodule update`

### Update submodules to latest (Update to latest master version)

`git submodule foreach git pull`

### Create a new submodule

`git submodule add -b master git@github.com:datajoint/pharus.git`

## Building the docs
Docs are based off sphinx and typedocs where the latter is use for autodocing the typescript code base

To build docs simply run: `docker-compose -f docker-compose-docs.yaml up`. The build docs should be located under `/docs/build/html/index.html`

## References

- Pharus (a DataJoint REST API backend):
  - https://github.com/datajoint/pharus
- Under construction image credits:
  - https://www.pngfind.com/mpng/ooiim_under-construction-tape-png-under-construction-transparent-png/
