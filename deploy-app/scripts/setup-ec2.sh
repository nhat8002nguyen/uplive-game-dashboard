#!/bin/bash

# EC2 Setup Script for uplive-game-dashboard
# Sets up a fresh Ubuntu EC2 instance with Docker and Docker Compose

set -e

echo "=========================================="
echo "  uplive-game-dashboard - EC2 Setup"
echo "=========================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

print_info "Updating system packages..."
apt-get update
apt-get upgrade -y

print_info "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    git \
    htop \
    vim

print_info "Installing Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

print_info "Starting and enabling Docker service..."
systemctl start docker
systemctl enable docker

print_info "Configuring firewall (UFW)..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw status

print_info "Creating application directory..."
mkdir -p /opt/uplive-app
chown -R $SUDO_USER:$SUDO_USER /opt/uplive-app

print_info "Configuring Docker log rotation..."
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker

print_info "Setting up automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

print_info "Optimizing system settings for production..."
cat >> /etc/security/limits.conf <<EOF
* soft nofile 65536
* hard nofile 65536
EOF

cat >> /etc/sysctl.conf <<EOF
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
EOF

sysctl -p

print_info "Adding user to docker group..."
groupadd -f docker
usermod -aG docker $SUDO_USER || true

print_info "Setting up log rotation..."
cat > /etc/logrotate.d/uplive-app <<EOF
/opt/uplive-app/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $SUDO_USER $SUDO_USER
    sharedscripts
}
EOF

echo ""
echo "=========================================="
print_info "EC2 Setup Complete!"
echo "=========================================="
echo ""
print_info "Next steps:"
echo "1. Logout and login again (or run: newgrp docker)"
echo "2. Upload your code to /opt/uplive-app"
echo "3. Configure .env.production"
echo "4. Run: ./deploy-app/scripts/deploy.sh"
echo ""
print_warning "Remember to:"
echo "  - Configure DNS A record pointing to this EC2 instance"
echo "  - Open ports 80 and 443 in AWS Security Group"
echo "  - Run setup-ssl.sh after deployment for HTTPS"
echo ""
