# Use official Node.js runtime as base image
FROM node:18-alpine

# Install system dependencies needed for building and health checks
RUN apk add --no-cache python3 make g++ curl

# Enable Corepack for Yarn v3 support
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files and Yarn configuration
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install all dependencies (including dev dependencies for building)
RUN yarn install --immutable

# Add node_modules/.bin to PATH for build tools
ENV PATH="/app/node_modules/.bin:$PATH"

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=development
ENV SKIP_ENV_VALIDATION=1

# Build the application (with all dev dependencies available)
RUN yarn build

# Clean up dev dependencies to reduce final image size
RUN yarn install --production --ignore-scripts --prefer-offline

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S medusa -u 1001
RUN chown -R medusa:nodejs /app
USER medusa

# Expose port
EXPOSE 9000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

# Define environment variables
ENV NODE_ENV=production
ENV PORT=9000

# Run database migrations and start the application
CMD ["npm", "run", "deploy:production"]