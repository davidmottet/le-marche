FROM node:carbon-alpine

WORKDIR /app

RUN apk --no-cache add git

COPY package.json ./

RUN npm i

COPY . .
