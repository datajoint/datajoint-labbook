# DJ GUI React Front End

Single source of truth for development efforts on DJGUI Frontend.

## Branches

For now, developing under the following policy for branches:
- `dev`: Feature-complete, DEMO-ready progress. Might be a bit rough around the edges or lacking in docs, tests but functional. Demonstrates latest features that have been completed.
- `master`: Polished, release-ready source with relevant docs, tests. More stable and less likely to undergo any refactoring/restructuring.

## Run Locally

1) Copy `local-docker-compose.yaml` to `docker-compose.yaml`. This file is untracked so feel free to modify as necessary. Idea is to commit anything generic but system/setup dependent should go on 'your' version i.e. local UID/GID, etc.
2) `docker-compose pull` to ensure images are cached before taking an outage.
3) Check the first comment which will provide best instruction on how to start the service.

NOTE: The docker-compose file looks for the `dj-gui-api` docker network which from the name implies is the backend for this application. If that network is not created first it might complain, but you can create it manually to bypass that.


## Feature Request and Bugs

Please file it under issues within the repo.
