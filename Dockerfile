FROM node:lts-buster-slim
USER node
WORKDIR /home/node
COPY --chown=node:node ./package.json ./package-lock.json  /home/node/
RUN npm install
COPY --chown=node:node ./tsconfig.json ./yarn.lock  /home/node/
COPY --chown=node:node ./public  /home/node/public
COPY --chown=node:node ./src  /home/node/src
CMD ["npm", "start"]
