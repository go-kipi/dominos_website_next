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
#
# Stage 1: Build the Next.js application

# Stage 1: Build dependencies and cache
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first to cache dependencies
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy the rest of the files and build the app
COPY . .
RUN npm run build

# Stage 2: Prepare the production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the build output
COPY --from=builder /app/ ./

EXPOSE 8080

CMD ["npm", "run", "start"]

