# Use official Node.js runtime as base image
FROM node:18-alpine

# Enable Corepack for Yarn v3 support
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files and Yarn configuration
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose port
EXPOSE 9000

# Define environment variable
ENV NODE_ENV=production

# Run database migrations and start the application
CMD ["npm", "run", "deploy:production"]