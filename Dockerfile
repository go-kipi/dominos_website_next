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

# Use Node.js as the base image
FROM node:18.17.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the app's source code to the container
COPY . .

# Build the Next app
RUN yarn build

# Serve the production build
CMD ["yarn", "start"]
