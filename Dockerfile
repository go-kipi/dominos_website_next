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

# Install dependencies only when needed
FROM node:18-slim AS deps
WORKDIR /app

# Install git and other necessary tools
RUN apk add --no-cache git

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-slim AS builder
WORKDIR /app

# Install git again in case it's needed in the builder
RUN apk add --no-cache git

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# Production image, copy all the files and run the app
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 8080

CMD ["yarn", "start"]


