=============
General Notes
=============

Requirements
============

- `Docker <https://docs.docker.com/get-docker/>`_
- `Docker Compose <https://docs.docker.com/compose/install/>`_

Working with Source
===================

Branch Targets
--------------

The source repo is the single source of truth for development efforts on DataJoint LabBook frontend development.

For now, development observes the following policy for branches so you should use this to determine appropriate branch to target in PR's.

- ``dev``: Feature-complete, DEMO-ready progress. Might be a bit rough around the edges or lacking in docs, tests but functional. Demonstrates latest features that have been completed.
- ``master``: Polished, release-ready source with relevant docs, tests. More stable and less likely to undergo any refactoring/restructuring.

Run Locally w/ Docker
---------------------

#. Copy a ``*-docker-compose.yaml`` file corresponding to your usage to ``docker-compose.yaml``. This file is untracked so feel free to modify as necessary. Idea is to commit anything generic but system/setup dependent should go on 'your' version i.e. local UID/GID, etc.
#. Check the first comment which will provide the best instruction on how to start the service; yes, it is a bit long. Note: Any of the keyword arguments prepended to the ``docker-compose`` command can be safely moved into a dedicated ``.env`` and read automatically if they are not evaluated i.e. ``$(...)``. Below is a brief description of the non-evaluated environment variables:

  .. code-block:: bash

    PY_VER=3.8    # (pharus) Python version: 3.6|3.7|3.8
    IMAGE=djtest  # (pharus) Image type:     djbase|djtest|djlab|djlabhub
    DISTRO=alpine # (pharus) Distribution:   alpine|debian

Run Tests w/ Docker
-------------------

To run the test watcher, perform the following:

#. In one terminal, start the ``dev`` Docker environment with the above instructions to start LabBook and Pharus with hot-reload support.
#. In another terminal, you can run the watcher using:

  .. code-block:: bash

    docker exec -it datajoint-labbook_datajoint-labbook_1 npm test -- --coverage
    # OR to just run it once:
    docker exec -ite CI=true datajoint-labbook_datajoint-labbook_1 npm test -- --coverage

Building the Docs
-----------------

Docs are based on sphinx and typedocs where the latter is used for autodoc-ing the typescript code base.

To build docs simply run: ``docker-compose -f docker-compose-docs.yaml up``. The build docs should be located under ``/docs/build/html/index.html``.

Working with git submodule dependency
-------------------------------------

``pharus`` is treated as a backend dependency managed by git's builtin ``submodules``. It allows us to nest entire git repos with separate history and easy access. Below are some helpful commands to be used after cloning the source repo.

First time git submodule initialization
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``git submodule init` then `git submodule update``

Update submodules to latest (Update to latest master version)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``git submodule foreach git pull``

Create a new submodule
~~~~~~~~~~~~~~~~~~~~~~

``git submodule add -b master git@github.com:datajoint/pharus.git``

References
==========
- DataJoint

  - https://datajoint.io

- Pharus (a DataJoint REST API backend):

  - https://github.com/datajoint/pharus
