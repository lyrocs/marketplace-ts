# ============================================================================
# Matrix Microservice Dockerfile (NestJS TCP)
# ============================================================================

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
ENV PNPM_HOME=/pnpm

# ============================================================================
# Dependencies stage
# ============================================================================
FROM base AS deps
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/matrix/package.json ./apps/matrix/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ============================================================================
# Builder stage
# ============================================================================
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/matrix/node_modules ./apps/matrix/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm prisma generate

# Build matrix microservice
WORKDIR /app/apps/matrix
RUN pnpm build

# ============================================================================
# Production stage
# ============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/matrix/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/matrix/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3002

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
