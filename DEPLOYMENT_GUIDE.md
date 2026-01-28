# =============================================================================
# SAMAH STORE - Production Deployment Guide
# =============================================================================
# Target: DigitalOcean Ubuntu Droplet
# Domain: samah-store.tech
# Stack: Docker Compose (PostgreSQL + Spring Boot + React + Nginx)
# =============================================================================

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Server Setup](#server-setup)
4. [Deployment](#deployment)
5. [SSL Setup (Let's Encrypt)](#ssl-setup)
6. [Verification](#verification)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# On your DigitalOcean droplet:
git clone <your-repo-url> /opt/samah-store
cd /opt/samah-store
cp .env.example .env
nano .env  # Fill in secrets
docker compose up -d --build
```

---

## Prerequisites

### DigitalOcean Droplet Specs (Recommended)
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 1 vCPU minimum (2 recommended)
- **Disk**: 25GB SSD minimum

### Domain Configuration
1. Point your domain to the droplet IP:
   - `samah-store.tech` → A record → `<DROPLET_IP>`
   - `www.samah-store.tech` → A record → `<DROPLET_IP>`
2. Wait for DNS propagation (5-30 minutes)

---

## Server Setup

### Step 1: Connect to Droplet
```bash
ssh root@<DROPLET_IP>
```

### Step 2: Update System
```bash
apt update && apt upgrade -y
```

### Step 3: Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 4: Create Non-Root User (Security Best Practice)
```bash
# Create user
adduser samah
usermod -aG docker samah
usermod -aG sudo samah

# Switch to new user
su - samah
```

### Step 5: Configure Firewall
```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## Deployment

### Step 1: Clone Repository
```bash
cd /opt
sudo git clone <your-repo-url> samah-store
sudo chown -R samah:samah samah-store
cd samah-store
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Generate secure secrets
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')"

# Edit .env with your values
nano .env
```

**Required .env values:**
```env
POSTGRES_DB=samah_store
POSTGRES_USER=samah
POSTGRES_PASSWORD=<generated-password>
JWT_SECRET=<generated-64-char-secret>
CORS_ALLOWED_ORIGINS=https://samah-store.tech,https://www.samah-store.tech
```

### Step 3: Build and Start
```bash
# Build and start all services
docker compose up -d --build

# Watch logs during startup
docker compose logs -f
```

### Step 4: Verify Services
```bash
# Check all containers are running
docker compose ps

# Expected output:
# NAME              STATUS              PORTS
# samah-db          Up (healthy)        5432/tcp
# samah-backend     Up (healthy)        8080/tcp
# samah-frontend    Up (healthy)        80/tcp
# samah-nginx       Up (healthy)        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## SSL Setup

### Option 1: SSL on Host (Recommended)

This approach uses Certbot on the host to manage certificates, then mounts them into Docker.

```bash
# Install Certbot
sudo apt install certbot -y

# Stop nginx temporarily to free port 80
docker compose stop nginx

# Obtain certificate
sudo certbot certonly --standalone \
  -d samah-store.tech \
  -d www.samah-store.tech \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Copy certificates to nginx/ssl directory
sudo cp /etc/letsencrypt/live/samah-store.tech/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/samah-store.tech/privkey.pem nginx/ssl/
sudo chown samah:samah nginx/ssl/*.pem
chmod 600 nginx/ssl/*.pem

# Update nginx config to enable SSL
nano nginx/default.conf
# Uncomment the SSL lines (listen 443, ssl_certificate, etc.)
# Uncomment the HTTP->HTTPS redirect server block

# Restart nginx
docker compose up -d nginx
```

**Auto-renewal setup:**
```bash
# Create renewal script
sudo nano /etc/cron.d/certbot-renew

# Add this content:
0 3 * * * root certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/samah-store.tech/*.pem /opt/samah-store/nginx/ssl/ && docker compose -f /opt/samah-store/docker-compose.yml restart nginx"
```

### Option 2: SSL Inside Docker (Alternative)

Use a Docker-based SSL solution with nginx-proxy and acme-companion:

```yaml
# Add to docker-compose.yml (replace existing nginx service):
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
    networks:
      - external

  acme-companion:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-acme
    volumes_from:
      - nginx-proxy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - acme:/etc/acme.sh
    environment:
      DEFAULT_EMAIL: your-email@example.com
    networks:
      - external
```

---

## Verification

### Health Checks
```bash
# API health
curl http://samah-store.tech/api/health

# Expected response:
# {"status":"UP","timestamp":"..."}

# Frontend
curl -I http://samah-store.tech/

# Database connectivity (from backend logs)
docker compose logs backend | grep -i "database"
```

### Test Key Endpoints
```bash
# Public categories
curl http://samah-store.tech/api/categories

# Public products
curl http://samah-store.tech/api/products

# Login (replace with test credentials)
curl -X POST http://samah-store.tech/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin@test.com","password":"password"}'
```

---

## Maintenance

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100 backend
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Update Application
```bash
cd /opt/samah-store

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Check logs
docker compose logs -f
```

### Database Backup
```bash
# Create backup
docker compose exec db pg_dump -U samah samah_store > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T db psql -U samah samah_store < backup_20260127.sql
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL - this deletes data!)
# docker volume prune
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker compose logs <service-name>

# Check container status
docker compose ps -a

# Inspect container
docker inspect samah-backend
```

### Database Connection Failed
```bash
# Check if db is healthy
docker compose ps db

# Check db logs
docker compose logs db

# Test connection from backend
docker compose exec backend wget -qO- http://localhost:8080/api/health
```

### 502 Bad Gateway
```bash
# Check if backend is running
docker compose ps backend

# Check backend health
docker compose logs backend | tail -50

# Restart backend
docker compose restart backend
```

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes
```

---

## Architecture Overview

```
                    ┌─────────────────────────────────────────────┐
                    │              DigitalOcean Droplet           │
                    │                                             │
    Internet        │  ┌─────────────────────────────────────┐   │
        │           │  │           Nginx (Port 80/443)       │   │
        │           │  │         Reverse Proxy + SSL         │   │
        ▼           │  └─────────────┬───────────────────────┘   │
   ┌────────┐       │                │                           │
   │ Client │◄──────┼────────────────┤                           │
   └────────┘       │                │                           │
                    │       ┌────────┴────────┐                  │
                    │       │                 │                  │
                    │       ▼                 ▼                  │
                    │  ┌─────────┐       ┌─────────┐            │
                    │  │Frontend │       │ Backend │            │
                    │  │ (React) │       │ (Spring)│            │
                    │  │ :80     │       │  :8080  │            │
                    │  └─────────┘       └────┬────┘            │
                    │                         │                  │
                    │                         ▼                  │
                    │                   ┌──────────┐             │
                    │                   │PostgreSQL│             │
                    │                   │  :5432   │             │
                    │                   └──────────┘             │
                    │                                             │
                    │  [Internal Network - Not Exposed]           │
                    └─────────────────────────────────────────────┘
```

---

## Security Checklist

- [ ] Strong POSTGRES_PASSWORD (32+ characters)
- [ ] Strong JWT_SECRET (64+ characters)
- [ ] .env file permissions: `chmod 600 .env`
- [ ] UFW firewall enabled (only 22, 80, 443 open)
- [ ] SSL/TLS enabled with valid certificate
- [ ] Regular backups configured
- [ ] Non-root user for application
- [ ] Docker images regularly updated

---

## Support

For issues, check:
1. Container logs: `docker compose logs -f`
2. System resources: `htop`, `df -h`
3. Network connectivity: `curl -v http://localhost/api/health`

---

*Last updated: January 2026*
