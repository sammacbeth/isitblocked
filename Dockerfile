FROM node:18-alpine

WORKDIR /home/node/app
RUN mkdir -p /home/node/app && \
    chown -R node:node /home/node/app
USER node
COPY package.json package-lock.json /home/node/app/
RUN npm ci
COPY blocklists /home/node/app/blocklists
COPY *.ts *.js *.json /home/node/app/
COPY src /home/node/app/src
RUN npm run build

CMD ["node", "build/server.js"]
EXPOSE 9000
