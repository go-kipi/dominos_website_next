FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Set environment to production
ENV NODE_ENV=production

ENV NEXT_PUBLIC_APP_HOST="https://ver-api.heilasystems.com/"
# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
