FROM node:10

WORKDIR /usr/src/relayer

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "node", "js/server.js" ]
