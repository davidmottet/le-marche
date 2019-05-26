FROM node:carbon-alpine

WORKDIR /app

COPY package.json ./

RUN npm i -g nodemon

RUN npm i

COPY . .

EXPOSE 80

EXPOSE 443

CMD [ "npm", "run", "dev" ]
