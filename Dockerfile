# Multi-stage Dockerfile for Medusa v2 Production
# Stage 1: Dependencies Installation
FROM node:20-alpine AS deps
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@3.2.1 --activate

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages ./packages
COPY integration-tests ./integration-tests

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.yarn \
    YARN_CACHE_FOLDER=/root/.yarn \
    yarn install --immutable --network-timeout 100000

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack
RUN corepack enable && corepack prepare yarn@3.2.1 --activate

# Copy everything from deps stage
COPY --from=deps /app ./

# Copy source code first
COPY . .

# Explicitly copy and verify config file
COPY medusa-config.js /app/medusa-config.js
RUN ls -la /app/medusa-config.js && echo "✅ Config file verified in builder stage"

# Build with optimized settings
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build:prod

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies only
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/yarn.lock ./
COPY --from=builder --chown=nodejs:nodejs /app/.yarnrc.yml ./
COPY --from=builder --chown=nodejs:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/app.js ./
COPY --from=builder --chown=nodejs:nodejs /app/dev-server.js ./
COPY --from=builder --chown=nodejs:nodejs /app/medusa-config.js /app/medusa-config.js
COPY --from=builder --chown=nodejs:nodejs /app/api ./api

# Verify config file is accessible and set proper permissions
RUN ls -la /app/medusa-config.js && echo "✅ Config file verified in production stage"
RUN chmod 644 /app/medusa-config.js

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
EXPOSE 3000
CMD ["node", "app.js"]