#!/bin/bash

# Health Check Script for uplive-game-dashboard
# Returns 0 if all services are healthy, 1 otherwise

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

cd "$DEPLOY_DIR"

EXIT_CODE=0

if ! docker ps | grep -q "uplive_nginx"; then
    echo "ERROR: Nginx container is not running"
    EXIT_CODE=1
fi

if ! docker ps | grep -q "uplive_backend"; then
    echo "ERROR: Backend container is not running"
    EXIT_CODE=1
fi

if ! curl -f -s http://localhost/health > /dev/null 2>&1; then
    echo "ERROR: Health endpoint is not responding"
    EXIT_CODE=1
fi

if [ $EXIT_CODE -eq 0 ]; then
    echo "OK: All services are healthy"
fi

exit $EXIT_CODE
