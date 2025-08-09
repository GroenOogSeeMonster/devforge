# Multi-stage build for DevForge Frontend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN VITE_API_URL=${VITE_API_URL} npm run build

# Production image, copy all the files and run the app
FROM nginx:alpine AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (nginx default)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 