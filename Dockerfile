# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

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