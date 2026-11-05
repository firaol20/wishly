# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma Client & Compile TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma Client and compiled build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Use non-root node user for security
USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
