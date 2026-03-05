#!/bin/bash

# Deployment Script for uplive-game-dashboard

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

cd "$DEPLOY_DIR"

echo "=========================================="
echo "  uplive-game-dashboard - Deployment"
echo "=========================================="
echo ""

if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production from .env.production.example"
    exit 1
fi

COMPOSE_CMD="docker compose --env-file .env.production -f docker-compose.prod.yml"

print_step "1/6 - Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please run setup-ec2.sh first"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please run setup-ec2.sh first"
    exit 1
fi

print_info "Docker and Docker Compose are installed"

print_step "2/6 - Stopping existing containers..."
$COMPOSE_CMD down || true

print_step "3/6 - Pruning old Docker resources..."
docker system prune -f --volumes=false || true

print_step "4/6 - Building Docker images..."
$COMPOSE_CMD build --no-cache

print_step "5/6 - Starting services..."
$COMPOSE_CMD up -d

print_step "6/6 - Verifying deployment..."
sleep 10

container_status() {
    docker ps -a --filter "name=$1" --format "{{.Status}}" | head -n1
}

echo ""
if container_status "uplive_nginx" | grep -q "^Up"; then
    print_info "✓ Nginx is running"
else
    print_error "✗ Nginx is not running"
fi

if container_status "uplive_backend" | grep -q "^Up"; then
    print_info "✓ Backend is running"
else
    print_error "✗ Backend is not running"
fi

echo ""
print_info "Testing health endpoint..."
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    print_info "✓ Health check passed"
else
    print_warning "Health check failed — services may still be starting up"
    print_info "Run: $COMPOSE_CMD logs -f"
fi

echo ""
echo "=========================================="
print_info "Deployment Complete!"
echo "=========================================="
echo ""
print_info "Service Status:"
$COMPOSE_CMD ps
echo ""
print_info "Useful commands (run from deploy-app/ directory):"
echo "  View logs:         $COMPOSE_CMD logs -f"
echo "  View backend logs: $COMPOSE_CMD logs -f backend"
echo "  View nginx logs:   $COMPOSE_CMD logs -f nginx"
echo "  Stop services:     $COMPOSE_CMD down"
echo "  Restart services:  $COMPOSE_CMD restart"
echo ""

set -a
source .env.production
set +a

if [ -z "$DOMAIN_NAME" ] || [ "$DOMAIN_NAME" == "your-domain.com" ]; then
    print_warning "SSL is not configured. Run ./setup-ssl.sh after configuring your domain"
    print_info "Current access: http://$(curl -s ifconfig.me 2>/dev/null || echo '<ec2-ip>')"
else
    print_info "Access your application at: https://$DOMAIN_NAME"
fi

echo ""
