# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for vite build)
RUN npm ci

# Copy all source files
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy server code and data
COPY server ./server
COPY public ./public

# Copy compiled frontend from builder stage
COPY --from=builder /app/dist ./dist

# Create volume mount point for database persistence
VOLUME ["/app/server/data"]

EXPOSE 5001

CMD ["node", "server/index.js"]
