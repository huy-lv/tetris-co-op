# Dockerfile for Tetris Server Only
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy server package.json and yarn.lock
COPY server/package.json server/yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Development dependencies for building
FROM base AS builder
WORKDIR /app

# Copy server source code
COPY server/package.json server/yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy server source code
COPY server/ .
# Build the application
RUN yarn build

# Production image - only server
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 tetris

# Copy built server from builder stage
COPY --from=builder --chown=tetris:nodejs /app/dist ./dist
COPY --from=deps --chown=tetris:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=tetris:nodejs /app/package.json ./package.json

# Switch to non-root user
USER tetris

# Expose server port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
