# Makefile for uplive-game-dashboard Production Deployment

.PHONY: help deploy start stop restart logs monitor health ssl clean build

APP_DIR=/opt/uplive-app
DEPLOY_DIR=$(APP_DIR)/deploy-app
COMPOSE=docker compose --env-file $(DEPLOY_DIR)/.env.production -f $(DEPLOY_DIR)/docker-compose.prod.yml

help:
	@echo "uplive-game-dashboard - Production Deployment"
	@echo ""
	@echo "Available commands:"
	@echo "  make deploy          - Build and deploy application"
	@echo "  make start           - Start all services"
	@echo "  make stop            - Stop all services"
	@echo "  make restart         - Restart all services"
	@echo "  make restart-backend - Restart backend only"
	@echo "  make restart-nginx   - Restart nginx only"
	@echo "  make logs            - View all logs (follow mode)"
	@echo "  make logs-backend    - View backend logs"
	@echo "  make logs-nginx      - View nginx logs"
	@echo "  make monitor         - Show monitoring dashboard"
	@echo "  make health          - Check service health"
	@echo "  make ssl             - Setup SSL/TLS"
	@echo "  make ssl-renew       - Renew SSL certificates"
	@echo "  make clean           - Clean old Docker resources"
	@echo "  make ps              - Show running containers"
	@echo "  make shell           - Access backend shell"
	@echo "  make pull            - Pull latest code from git"
	@echo "  make update          - Pull and redeploy"
	@echo ""

deploy:
	cd $(DEPLOY_DIR)/scripts && ./deploy.sh

start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

restart-backend:
	$(COMPOSE) restart backend

restart-nginx:
	$(COMPOSE) restart nginx

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-nginx:
	$(COMPOSE) logs -f nginx

monitor:
	cd $(DEPLOY_DIR)/scripts && ./monitor.sh

health:
	cd $(DEPLOY_DIR)/scripts && ./health-check.sh

ps:
	$(COMPOSE) ps

stats:
	docker stats

ssl:
	cd $(DEPLOY_DIR)/scripts && ./setup-ssl.sh

ssl-renew:
	$(COMPOSE) run --rm certbot renew
	$(COMPOSE) restart nginx

ssl-check:
	$(COMPOSE) run --rm certbot certificates

clean:
	docker system prune -f
	@echo "Cleaned up unused Docker resources"

clean-all:
	docker system prune -a -f --volumes
	@echo "WARNING: Cleaned up all Docker resources including volumes!"

build:
	$(COMPOSE) build --no-cache

rebuild: stop build start
	@echo "Application rebuilt and restarted"

pull:
	cd $(APP_DIR) && git pull

update: pull deploy
	@echo "Application updated successfully"

shell:
	$(COMPOSE) exec backend sh

test-health:
	@curl -f http://localhost/health && echo "✓ Health check passed" || echo "✗ Health check failed"

test-api:
	@echo "Testing API endpoints..."
	@curl -f http://localhost/health && echo "✓ /health OK" || echo "✗ /health FAILED"
	@curl -f "http://localhost/analytics?limit=1" && echo "✓ /analytics OK" || echo "✗ /analytics FAILED"
