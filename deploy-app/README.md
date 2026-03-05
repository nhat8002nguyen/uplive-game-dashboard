# Production Deployment — uplive-game-dashboard

Deploy the NestJS backend + React frontend to AWS EC2 with Docker, nginx, and optional SSL.

## Architecture

```
Internet
   ↓
[AWS EC2 Instance]
   ↓
[Nginx] (Reverse Proxy + Rate Limiting + SSL/TLS)
   ├── /analytics*, /docs  →  [NestJS Backend] :3000
   └── /*                  →  [React SPA] (static files)
```

**Containers:**
- `uplive_backend` — NestJS API (in-memory storage, port 3000)
- `uplive_nginx` — nginx serving the React SPA + proxying API routes
- `uplive_certbot` — Let's Encrypt certificate renewal

No database or Redis required (data is in-memory).

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS, t3.small or larger)
- Security group: ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- SSH key access
- Optional: domain name for SSL

## Initial EC2 Setup

```bash
# Upload setup script
scp -i your-key.pem deploy-app/scripts/setup-ec2.sh ubuntu@<ec2-ip>:~/

# SSH in and run it
ssh -i your-key.pem ubuntu@<ec2-ip>
sudo bash setup-ec2.sh

# Logout and back in for docker group
exit
ssh -i your-key.pem ubuntu@<ec2-ip>
```

## Upload Code

```bash
# Create tarball (from project root on your local machine)
# COPYFILE_DISABLE=1 prevents macOS extended attrs from causing warnings on Linux
COPYFILE_DISABLE=1 tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backend/dist' \
    --exclude='frontend/dist' \
    -czf uplive-app.tar.gz .

# Upload to EC2
scp -i your-key.pem uplive-app.tar.gz ubuntu@<ec2-ip>:/opt/uplive-app/

# Extract on EC2
ssh -i your-key.pem ubuntu@<ec2-ip>
cd /opt/uplive-app
tar --warning=no-unknown-keyword -xzf uplive-app.tar.gz
```

Alternatively, use Git:

```bash
ssh -i your-key.pem ubuntu@<ec2-ip>
cd /opt/uplive-app
git clone <your-repo-url> .
```

## Configure Environment

```bash
cd /opt/uplive-app/deploy-app
cp .env.production.example .env.production
nano .env.production
```

Update values:
```bash
DOMAIN_NAME=your-domain.com       # or leave as-is for IP-only access
EMAIL_FOR_SSL=you@example.com     # required for SSL setup
```

## Deploy

```bash
cd /opt/uplive-app/deploy-app/scripts
chmod +x *.sh
./deploy.sh
```

The script will:
1. Build the NestJS backend Docker image
2. Build the React frontend and bundle it into the nginx image
3. Start all containers
4. Verify deployment via the health endpoint

## Verify

```bash
# Container status
docker compose --env-file .env.production -f docker-compose.prod.yml ps

# Health check
curl http://localhost/health
# → {"status":"ok"}

# API test
curl "http://localhost/analytics?limit=5"
```

## SSL Setup (Optional)

Requires a domain name with an A record pointing to your EC2 IP.

```bash
cd /opt/uplive-app/deploy-app/scripts
./setup-ssl.sh
```

The script will obtain a Let's Encrypt certificate and switch nginx to HTTPS with automatic renewal.

## Useful Commands

```bash
cd /opt/uplive-app/deploy-app

# View logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f

# Restart backend
docker compose --env-file .env.production -f docker-compose.prod.yml restart backend

# Monitor dashboard
./scripts/monitor.sh

# Or use the Makefile (from /opt/uplive-app/deploy-app)
make logs
make monitor
make health
make restart-backend
```

## Update Application

```bash
cd /opt/uplive-app
git pull
cd deploy-app/scripts
./deploy.sh
```

## Troubleshooting

### "tar: Ignoring unknown extended header keyword"
Harmless — macOS extended attributes in the tarball. Use `tar --warning=no-unknown-keyword -xzf ...` on EC2.

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
docker ps | grep uplive_backend

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend

# Test backend directly
curl http://localhost:3000/health  # (from inside the container network)
```

### Services Not Starting
```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

### SSL Certificate Issues
```bash
# Check certificate status
docker compose -f docker-compose.prod.yml run --rm certbot certificates

# Force renewal
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker compose -f docker-compose.prod.yml restart nginx
```
