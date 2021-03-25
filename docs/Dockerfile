FROM python:3.9.2-slim-buster
WORKDIR /src
RUN apt-get update &&\
    apt-get install nodejs npm -y &&\
    apt-get install python3-sphinx -y &&\
    pip install sphinx-rtd-theme m2r2 &&\
    npm install typedoc