> [!WARNING]
> **This repository is archived and no longer maintained** (November 2026).
>
> DataJoint LabBook was built for DataJoint 0.13 and 0.14, through the [Pharus](https://github.com/datajoint/pharus) REST API, and has not been updated for DataJoint 2.x. The source, the releases, the [documentation site](https://datajoint.github.io/datajoint-labbook/) and the `datajoint/datajoint-labbook` Docker images remain available as they are, but they will receive no further changes, including security fixes.
>
> To browse and edit DataJoint 2.x pipelines, use [DataJoint for Python](https://github.com/datajoint/datajoint-python) directly. See the [DataJoint documentation](https://docs.datajoint.com).

![Demo GIF Failed](docs/sphinx/_static/images/walkthroughDemoOptimized.gif)

# User Documentation

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
PHARUS_VERSION=0.1.0 DJLABBOOK_VERSION=0.1.0 docker-compose -f docker-compose-deploy.yaml up -d
```

To stop the application, use the command:

```bash
PHARUS_VERSION=0.1.0 DJLABBOOK_VERSION=0.1.0 docker-compose -f docker-compose-deploy.yaml down
```

## References

- DataJoint
  - https://datajoint.io
- Pharus (a DataJoint REST API backend):
  - https://github.com/datajoint/pharus
