=============
General Notes
=============

Requirements
============

- `Docker <https://docs.docker.com/get-docker/>`_
- `Docker Compose <https://docs.docker.com/compose/install/>`_

Working with Source
===================

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


Deploying behind an Apache proxy
-------------------------------------

Rather than serve the application directly, you may wish to place it behind a proxy server such as Apache or NginX.  For Apache, use a ``.conf`` file such as:

 .. code-block:: bash

  Listen YOUR_PORT
  <VirtualHost YOUR_URL:YOUR_PORT>
    ServerName YOUR_URL

    # configure SSL                                                                                                                                                                  
    SSLEngine on
    SSLCertificateKeyFile /path/to/key_file
    SSLCertificateFile /path/to/cert/file
    SSLCertificateChainFile /path/to/chain/file
    SSLProxyEngine on
    SSLProxyVerify none
    SSLProxyCheckPeerName off
    SSLProxyCheckPeerCN off
    SSLProxyCheckPeerExpire off

    ProxyPass / https://127.0.0.1:50283/
    ProxyPassReverse / https://127.0.0.1:50283/
  </VirtualHost>

Assuming that the application is served internally on port 50283, that you have replaced YOUR_URL and YOUR_PORT with the external URL and port you wish for users to use to connnect to it, and that you have replaced the SSL file locations above with the locations to your certficate files.  Your provided SSL certificates will then be used instead of the self-signed ones provided by the application.

References
==========
- DataJoint

  - https://datajoint.io

- Pharus (a DataJoint REST API backend):

  - https://github.com/datajoint/pharus
