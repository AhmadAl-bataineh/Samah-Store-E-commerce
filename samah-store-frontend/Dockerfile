# =============================================================================
# Frontend Dockerfile - Multi-stage build for Vite React app
# =============================================================================
# Build output: /app/dist (Vite default)
# Served via Nginx reverse proxy (not directly)
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build for production
# NOTE: VITE_API_BASE_URL is empty for production (relative paths via reverse proxy)
ENV VITE_API_BASE_URL=""
RUN npm run build

# Stage 2: Production - Nginx to serve static files
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
