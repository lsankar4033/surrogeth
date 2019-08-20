FROM node:10

WORKDIR /usr/src/relayer

COPY package*.json ./
COPY .env ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "node", "js/index.js" ]
