# Use official Node.js runtime as base image
FROM node:18-alpine

# Install system dependencies needed for building
RUN apk add --no-cache python3 make g++

# Enable Corepack for Yarn v3 support
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files and Yarn configuration
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install all dependencies (including dev dependencies for building)
RUN yarn install

# Add both global and local node_modules/.bin to PATH
ENV PATH="/usr/local/lib/node_modules/.bin:/app/node_modules/.bin:$PATH"

# Copy source code
COPY . .

# Fix TypeScript config template variables for all packages
RUN find . -name "tsconfig.json" -exec sed -i 's/\${configDir}/./g' {} \;

# Build the application (with all dev dependencies available)
RUN yarn build

# Clean up dev dependencies to reduce final image size
RUN yarn install --production --ignore-scripts --prefer-offline

# Expose port
EXPOSE 9000

# Define environment variable
ENV NODE_ENV=production

# Run database migrations and start the application
CMD ["npm", "run", "deploy:production"]