FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
WORKDIR /app/packages/backend
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/prisma ./prisma

USER nestjs

EXPOSE 3000

ENV PORT 3000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
