# =============================================================================
# Nginx Dockerfile - Builds frontend and serves it with reverse proxy
# =============================================================================
# This Dockerfile:
#   1. Builds the React (Vite) frontend
#   2. Copies the dist to Nginx html directory
#   3. Configures Nginx to serve SPA + proxy /api to backend
#
# Build context: repo root (.)
# Usage in docker-compose:
#   nginx:
#     build:
#       context: .
#       dockerfile: nginx/Dockerfile
# =============================================================================

# Stage 1: Build frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy entire frontend folder (includes package.json, src/, scripts/, public/, configs, etc.)
COPY ./samah-store-frontend/ /app/

# Install dependencies
RUN npm ci


# Build for production (VITE_API_BASE_URL empty = use relative paths)
ENV VITE_API_BASE_URL=""
RUN npm run build

# Stage 2: Nginx with built frontend
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Create directory for SSL certificates (used later)
RUN mkdir -p /etc/nginx/ssl

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
