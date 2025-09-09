# Simplified Medusa Dockerfile for Railway deployment
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ curl

# Enable Corepack for Yarn v3
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy only essential files first
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy core application files
COPY app.js ./
COPY medusa-config.js ./
COPY api ./api

# Install only production dependencies
RUN yarn install --production --immutable

# Skip the complex build process for now - use the app directly
ENV NODE_ENV=production
ENV PORT=9000

# Expose port
EXPOSE 9000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

# Start the application directly
CMD ["node", "app.js"]
