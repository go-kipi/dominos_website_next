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

#
#FROM node:16-slim
#RUN mkdir /app
#COPY package.json /app/
#WORKDIR /app
#COPY . ./
#
#ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
##RUN npm install
##RUN npm run build
#EXPOSE 8080
#CMD ["npm", "start"]


## Base image for building the app
#FROM node:16-slim AS builder
#WORKDIR /app
#
## Copy only the necessary files for dependency installation
#COPY package.json package-lock.json* ./
#
## Install dependencies
#RUN npm install
#
## Copy the rest of the application files
#COPY . ./
#
## Build the Next.js application
#RUN npm run build
#
## Production image
#FROM node:16-slim
#WORKDIR /app
#
## Copy build output and necessary files from the builder
#COPY --from=builder /app/package.json /app/package-lock.json* ./
#COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
#
## Install production dependencies only
#RUN npm install --production
#
## Expose port and set environment variables
#EXPOSE 8080
#ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
#
## Run the application
#CMD ["npm", "start"]

#FROM node:16-slim
#
## Create app directory
#WORKDIR /app
#
## Copy only package and lock files first
#COPY package.json package-lock.json* ./
#
## Install dependencies
#RUN npm install
#
## Copy the rest of the application files
#COPY . ./
#
## Build the application
#RUN npm run build
#
## Expose the port
#EXPOSE 8080
#
## Set environment variable
#ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
#
## Start the app in production mode
#CMD ["npm", "start"]
# Base image for building the app
#FROM node:16-slim
#
## Set working directory
#WORKDIR /app
#
## Copy only necessary files for runtime
#COPY package.json package-lock.json* ./
#RUN npm install --production
#
## Copy pre-built files
#COPY .next ./.next
#COPY public ./public
#
## Set environment variables
#ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
#
## Expose the app's port
#EXPOSE 8080
#
## Start the application
#CMD ["npm", "start"]


## Step 1: Use an official Node.js runtime as a build image
#FROM node:18-alpine AS builder
#
## Set working directory
#WORKDIR /app
#
## Copy package.json and package-lock.json (or yarn.lock) for dependency installation
#COPY package.json package-lock.json ./
#
## Install dependencies
#RUN npm install --legacy-peer-deps
#
## Copy the rest of the application files
#COPY . .
#
## Build the Next.js app
#RUN npm run build
#
## Install production dependencies only
#RUN npm prune --production
#
#
## Step 2: Create a lightweight runtime image
#FROM node:18-alpine AS runner
#
## Set working directory
#WORKDIR /app
#
## Copy production dependencies from the builder stage
#COPY --from=builder /app/node_modules ./node_modules
#
## Copy the built Next.js application from the builder stage
#COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
#COPY --from=builder /app/package.json ./package.json
#
## Set environment variables
#ENV NODE_ENV=production
#ENV PORT=8080
#
## Expose port 8080 for Cloud Run
#EXPOSE 8080
#
## Start the Next.js app
#CMD ["npm", "start"]


FROM node:16-slim

# Create app directory
WORKDIR /app

# Copy only package and lock files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . ./

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8080

# Set environment variable
ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"

# Start the app in production mode
CMD ["npm", "start"]
