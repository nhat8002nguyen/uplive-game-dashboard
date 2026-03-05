#!/bin/bash

# Monitoring Script for uplive-game-dashboard

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

cd "$DEPLOY_DIR"

if [ -f ".env.production" ]; then
    COMPOSE_CMD="docker compose --env-file .env.production -f docker-compose.prod.yml"
else
    COMPOSE_CMD="docker compose -f docker-compose.prod.yml"
fi

clear
echo "=========================================="
echo "  uplive-game-dashboard - Monitoring"
echo "=========================================="
echo ""

echo -e "${BLUE}=== Container Status ===${NC}"
$COMPOSE_CMD ps
echo ""

echo -e "${BLUE}=== Resource Usage ===${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo ""

echo -e "${BLUE}=== Health Checks ===${NC}"
if curl -f -s http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend health: OK"
else
    echo -e "${RED}✗${NC} Backend health: FAILED"
fi
echo ""

echo -e "${BLUE}=== Recent Backend Logs (last 10 lines) ===${NC}"
$COMPOSE_CMD logs --tail=10 backend
echo ""

echo -e "${BLUE}=== Nginx Access (last 5 requests) ===${NC}"
docker exec uplive_nginx tail -n 5 /var/log/nginx/access.log 2>/dev/null || echo "No logs available"
echo ""

echo -e "${BLUE}=== Nginx Errors (last 5) ===${NC}"
docker exec uplive_nginx tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "No errors"
echo ""

echo "=========================================="
echo "Useful commands:"
echo "  Follow logs:    $COMPOSE_CMD logs -f"
echo "  Restart app:    $COMPOSE_CMD restart"
echo "  Backend shell:  $COMPOSE_CMD exec backend sh"
echo "=========================================="
