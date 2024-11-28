FROM node:16-buster
RUN mkdir /app
COPY package.json /app/
WORKDIR /app
COPY . ./

ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]

#FROM node:18-slim
#
## Set working directory
#WORKDIR /app
#
## Copy package files
#COPY package*.json ./
#
## Install dependencies
#RUN npm install
#
## Copy all project files
#COPY . .
#
## Set environment to production
#ENV NODE_ENV=production
#
## Build the Next.js app
#RUN npm run build
#
## Expose port
#EXPOSE 8080
#
## Start the Next.js app
#CMD ["npm", "start"]

