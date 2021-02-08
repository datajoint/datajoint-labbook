<div
<p align="center">
  <em>👷‍♀️ <b>Under Construction</b> 👷</em>
  <img src="under_contruction.png" alt="construction_fig"/>  
</p>
</div>

> :warning: The DJGUI project is still early in its life and the maintainers are currently actively developing with a priority of addressing first critical issues directly related to the deliveries of [Alpha](https://github.com/datajoint/DJ-GUI-React/milestone/1) and [Beta](https://github.com/datajoint/DJ-GUI-React/milestone/2) milestones. Please be advised that while working through our milestones, we may restructure/refactor the codebase without warning until we issue our [Official Release](https://github.com/datajoint/DJ-GUI-React/milestone/3) currently planned as `0.1.0` on `2021-03-31`.

# DJ GUI React Frontend

Serves as the React frontend for DJGUI project complimented by [REST API backend](https://github.com/datajoint/DJ-GUI-API). This repo is the single source of truth for development efforts on DJGUI Frontend.

Requirements:
- [Docker](https://docs.docker.com/get-docker/  )
- [Docker Compose](https://docs.docker.com/compose/install/)

## Branches

For now, developing under the following policy for branches:
- `dev`: Feature-complete, DEMO-ready progress. Might be a bit rough around the edges or lacking in docs, tests but functional. Demonstrates latest features that have been completed.
- `master`: Polished, release-ready source with relevant docs, tests. More stable and less likely to undergo any refactoring/restructuring.

## Run Locally

1) Copy `local-docker-compose.yaml` to `docker-compose.yaml`. This file is untracked so feel free to modify as necessary. Idea is to commit anything generic but system/setup dependent should go on 'your' version i.e. local UID/GID, etc.
2) `docker-compose pull` to ensure images are cached before taking an outage.
3) Check the first comment which will provide best instruction on how to start the service.

> :warning: The docker-compose file looks for the `dj-gui-api` docker network which from the name implies it is created from the backend for this application. If that network is not created first it might complain but you can create it manually as well.


## References

- DJGUI REST API Backend:
  - https://github.com/datajoint/DJ-GUI-API
- Under construction image credits:
  - https://www.pngfind.com/mpng/ooiim_under-construction-tape-png-under-construction-transparent-png/
