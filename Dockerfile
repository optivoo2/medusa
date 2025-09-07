# 🚀 Medusa Backend Dockerfile for Coolify/Portainer
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Create production environment
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Create startup script
RUN echo '#!/bin/sh\n\
echo "🚀 Starting Medusa Backend..."\n\
echo "Environment: $NODE_ENV"\n\
echo "Port: $PORT"\n\
\n\
# Run database migrations if DATABASE_URL is set\n\
if [ ! -z "$DATABASE_URL" ]; then\n\
  echo "📊 Running database migrations..."\n\
  npx medusa db:migrate\n\
else\n\
  echo "⚠️  DATABASE_URL not set, skipping migrations"\n\
fi\n\
\n\
# Start the server\n\
echo "🎯 Starting Medusa server..."\n\
exec node app.js' > /app/start.sh

RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["/app/start.sh"]
