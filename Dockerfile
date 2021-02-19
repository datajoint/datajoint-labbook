FROM node:lts-buster-slim
RUN apt-get update && apt-get install wget -y
USER node
WORKDIR /home/node
COPY --chown=node:node ./package.json ./package-lock.json  /home/node/
RUN npm install
HEALTHCHECK       \
    --timeout=30s \
    --retries=5  \
    --interval=15s \
    CMD           \
        wget -q -O /dev/null -t 1 -T 2 http://localhost:${DJLABBOOK_PORT}/login
COPY --chown=node:node ./tsconfig.json /home/node/
COPY --chown=node:node ./public  /home/node/public
COPY --chown=node:node ./src  /home/node/src
ENV DJLABBOOK_PORT 3000
ENV DJLABBOOK_BACKEND_PREFIX /api
CMD ["npm", "start"]
