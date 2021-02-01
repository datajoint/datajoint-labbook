# DJ GUI React Front End

Make sure you run ```npm install``` to download all the require modules first

To launch development simply run these commands
1) ```docker-compose pull``` (Need to pull the base image used for launching the node) [Should be a one time thing]
2) ```docker-compose up```

NOTE: The docker-compose file looks for the docker network dj-gui-api, which from the name implies is the backend for this application. If that network is not created first it might complain, but you can create it manaully to bypass that.

To use this application, please clone ```git@github.com:vathes/DJ-GUI-API.git``` create an empty .env file in the root directory of the repo then run these two commands ```docker-compose build``` then ```docker-compose up```
