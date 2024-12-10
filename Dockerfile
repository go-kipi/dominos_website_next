#FROM node:16-buster
#RUN mkdir /app
#COPY package.json /app/
#WORKDIR /app
#COPY . ./
#
#ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
#RUN npm install
#RUN npm run build
#EXPOSE 8080
#CMD ["npm", "start"]

# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
#FROM node:12-slim
#
## Create and change to the app directory.
#WORKDIR /usr/src/app
#
## Copy application dependency manifests to the container image.
## A wildcard is used to ensure both package.json AND package-lock.json are copied.
## Copying this separately prevents re-running npm install on every code change.
#COPY package*.json ./
#
## Install production dependencies.
#RUN npm install --only=production
#
## Copy local code to the container image.
#COPY . ./
#
## Run the web service on container startup.
#CMD [ "npm", "start" ]


FROM node:12-slim
RUN mkdir /app
COPY package.json /app/
WORKDIR /app
COPY . ./

ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
