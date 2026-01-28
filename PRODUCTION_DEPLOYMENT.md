# Production Deployment Guide for samah-store.tech

## Architecture Overview

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (DNS + CDN)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Nginx       │
                    │ (Reverse Proxy) │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                                 ▼
    ┌───────────────┐                ┌───────────────┐
    │   Frontend    │                │   Backend     │
    │ (Static/Vite) │                │ (Spring Boot) │
    │   /dist/*     │                │  :8080/api/*  │
    └───────────────┘                └───────────────┘
```

## 1. Frontend Build

```bash
cd samah-store-frontend

# Install dependencies
npm install

# Build for production (uses .env.production)
npm run build

# Output: dist/ folder ready to serve
```

## 2. Backend Build

```bash
# From project root
./mvnw clean package -DskipTests -Pprod

# Or on Windows:
mvnw.cmd clean package -DskipTests -Pprod

# Output: target/samah-store-*.jar
```

## 3. Nginx Configuration

Create `/etc/nginx/sites-available/samah-store.tech`:

```nginx
server {
    listen 80;
    server_name samah-store.tech www.samah-store.tech;
    
    # Redirect HTTP to HTTPS (Cloudflare handles SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name samah-store.tech www.samah-store.tech;

    # SSL certificates (if not using Cloudflare Full SSL)
    # ssl_certificate /etc/letsencrypt/live/samah-store.tech/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/samah-store.tech/privkey.pem;
    
    # For Cloudflare Flexible SSL, use their origin certificate or skip
    # If using Cloudflare Full (Strict), use Let's Encrypt certs above

    # Frontend static files
    root /var/www/samah-store/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads proxy to backend
    location /uploads/ {
        proxy_pass http://127.0.0.1:8080/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint (for monitoring)
    location = /health {
        proxy_pass http://127.0.0.1:8080/api/health;
        access_log off;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/samah-store.tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Backend Systemd Service

Create `/etc/systemd/system/samah-store.service`:

```ini
[Unit]
Description=Samah Store Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/samah-store/backend
ExecStart=/usr/bin/java -jar -Xmx512m -Dspring.profiles.active=prod samah-store.jar
Restart=always
RestartSec=10

# Environment variables
Environment=DATABASE_URL=jdbc:postgresql://localhost:5432/samah_store
Environment=JWT_SECRET=YOUR_64_CHAR_RANDOM_SECRET_HERE_CHANGE_THIS_IN_PRODUCTION
Environment=CORS_ALLOWED_ORIGINS=https://samah-store.tech,https://www.samah-store.tech
Environment=UPLOAD_DIR=/var/www/samah-store/uploads
Environment=UPLOAD_BASE_URL=/uploads

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable samah-store
sudo systemctl start samah-store
sudo systemctl status samah-store
```

## 5. Cloudflare Configuration

### DNS Records
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | YOUR_SERVER_IP | Proxied (orange) |
| A | www | YOUR_SERVER_IP | Proxied (orange) |

### SSL/TLS Settings
- Mode: **Full (strict)** if using Let's Encrypt certs
- Mode: **Full** if using Cloudflare origin cert
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**

### Page Rules (Optional)
- `samah-store.tech/api/*` → Cache Level: Bypass
- `samah-store.tech/uploads/*` → Cache Level: Standard, Edge TTL: 1 day

## 6. Environment Variables Summary

### Backend (production)
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/samah_store
JWT_SECRET=<64+ character random string>
CORS_ALLOWED_ORIGINS=https://samah-store.tech,https://www.samah-store.tech
UPLOAD_DIR=/var/www/samah-store/uploads
UPLOAD_BASE_URL=/uploads
PORT=8080
```

### Frontend (build time)
```bash
# .env.production (already configured)
VITE_API_BASE_URL=  # Empty for same-origin deployment
```

## 7. Verification Commands

### Check Backend Health
```bash
curl https://samah-store.tech/api/health
# Expected: {"status":"UP","service":"samah-store-api","timestamp":"..."}
```

### Check Frontend
```bash
curl -I https://samah-store.tech/
# Expected: HTTP/2 200, Content-Type: text/html
```

### Check API Proxy
```bash
curl https://samah-store.tech/api/categories
# Expected: JSON array of categories
```

### Check Uploads
```bash
curl -I https://samah-store.tech/uploads/some-image.jpg
# Expected: HTTP/2 200, Content-Type: image/jpeg
```

## 8. Troubleshooting

### API returns 502 Bad Gateway
- Check backend is running: `systemctl status samah-store`
- Check backend logs: `journalctl -u samah-store -f`
- Verify port 8080 is listening: `netstat -tlnp | grep 8080`

### CORS Errors
- If frontend and backend are same-origin (via Nginx proxy), CORS should not apply
- Check browser DevTools Network tab for actual error
- Verify `CORS_ALLOWED_ORIGINS` env var includes your domain

### Images Not Loading
- Check upload directory permissions
- Verify Nginx `/uploads/` location is correct
- Check backend `UPLOAD_DIR` and `UPLOAD_BASE_URL` settings

### SSL Certificate Issues
- If using Cloudflare Full (strict), ensure valid cert on server
- Use `certbot` for Let's Encrypt: `sudo certbot --nginx -d samah-store.tech -d www.samah-store.tech`

## 9. Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend URL | http://localhost:5173 | https://samah-store.tech |
| Backend URL | http://localhost:8080 | https://samah-store.tech/api |
| API calls | Vite proxy `/api/*` → :8080 | Nginx proxy `/api/*` → :8080 |
| CORS | Not needed (proxy) | Not needed (same-origin via Nginx) |
| SSL | None | Cloudflare + Let's Encrypt |
| DB | Local PostgreSQL | Production PostgreSQL |
| Uploads | `./uploads/` | `/var/www/samah-store/uploads/` |
