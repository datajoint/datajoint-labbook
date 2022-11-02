# DataJoint LabBook User Documentation 

## Latest Version

+ [Release](https://github.com/datajoint/datajoint-labbook/releases/latest)

+ [Source](https://github.com/datajoint/datajoint-labbook)

## Installation

### Dependencies

DataJoint LabBook requires `Docker` and `Docker Compose` which can be downloaded at:

+ [Docker](https://docs.docker.com/get-docker/)
+ [Docker Compose](https://docs.docker.com/compose/install/)

### Prerequisites

Download the `docker-compose-deploy.yaml` environment from the latest release
[here](https://github.com/datajoint/datajoint-labbook/releases/latest/download/docker-compose-deploy.yaml).

### Running the Application

To start the application, use the command:

```console
PHARUS_VERSION=0.1.0 DJLABBOOK_VERSION=0.1.0 docker-compose -f docker-compose-deploy.yaml up -d
```

To stop the application, use the command:

```console
PHARUS_VERSION=0.1.0 DJLABBOOK_VERSION=0.1.0 docker-compose -f docker-compose-deploy.yaml down
```