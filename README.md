# User Documentation

> ⚠️ The DataJoint LabBook project is still early in its life and the maintainers are currently actively developing with a priority of addressing first critical issues directly related to the deliveries of [Alpha](https://github.com/datajoint/datajoint-labbook/milestone/1) and [Beta](https://github.com/datajoint/datajoint-labbook/milestone/2) milestones. Please be advised that while working through our milestones, we may restructure/refactor the codebase without warning until we issue our [Official Release](https://github.com/datajoint/datajoint-labbook/milestone/3) currently planned as `0.1.0` on `2021-03-31`.

DataJoint LabBook is a graphical user interface built using React to facilitate working with DataJoint computational pipelines.

- [Documentation](https://datajoint.github.io/datajoint-labbook)
- [Release](https://github.com/datajoint/datajoint-labbook/releases/latest)
- [Source](https://github.com/datajoint/datajoint-labbook)


## Installation

If you have not done so already, please install the following dependencies:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Prerequisites

Download the `docker-compose-deploy.yaml` docker environment from the release located [here](https://github.com/datajoint/datajoint-labbook/releases/latest/download/docker-compose-deploy.yaml).

## Running the application

To start the application, use the command:

```bash
PHARUS_VERSION=0.1.0b2 DJLABBOOK_VERSION=0.1.0-beta.2 docker-compose -f docker-compose-deploy.yaml up -d
```

To stop the application, use the command:

```bash
PHARUS_VERSION=0.1.0b2 DJLABBOOK_VERSION=0.1.0-beta.2 docker-compose -f docker-compose-deploy.yaml down
```

## References

- DataJoint
  - https://datajoint.io
- Pharus (a DataJoint REST API backend):
  - https://github.com/datajoint/pharus
