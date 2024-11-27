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
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the app and build it
COPY . .
RUN npm run build

# Stage 2: Create the production-ready image
FROM node:18-slim AS runner

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --production --frozen-lockfile

# Copy built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

# Expose the port and set Next.js to start
EXPOSE 8080
CMD ["npm", "run", "start"]
