# DataJoint LabBook

![Demo GIF Failed](docs/sphinx/_static/images/walkthroughDemoOptimized.gif)

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
PHARUS_VERSION=0.4.0 DJLABBOOK_VERSION=0.1.1 docker-compose -f docker-compose-deploy.yaml up -d
```

To stop the application, use the command:

```bash
PHARUS_VERSION=0.4.0 DJLABBOOK_VERSION=0.1.1 docker-compose -f docker-compose-deploy.yaml down
```

## References

+ https://datajoint.org  -- start page
+ https://github.com/datajoint/pharus -- Pharus (a DataJoint REST API backend)
+ https://docs.datajoint.org -- up-to-date documentation
+ https://tutorials.datajoint.io -- step-by-step tutorials

## Citation

+ If your work uses DataJoint LabBook, please cite the following Research Resource Identifier (RRID) and manuscript.

+ DataJoint ([RRID:SCR_014543](https://scicrunch.org/resolver/SCR_014543)) - DataJoint LabBook (version `<Enter version number>`)

+ Yatsenko D, Nguyen T, Shen S, Gunalan K, Turner CA, Guzman R, Sasaki M, Sitonic D, Reimer J, Walker EY, Tolias AS. DataJoint Elements: Data Workflows for Neurophysiology. bioRxiv. 2021 Jan 1. doi: https://doi.org/10.1101/2021.03.30.437358