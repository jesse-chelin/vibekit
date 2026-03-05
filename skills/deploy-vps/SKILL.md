---
name: deploy-vps
description: Deploys app to a bare VPS with Caddy reverse proxy (auto-SSL), systemd service, and firewall configuration. Use when the user has a VPS, mentions DigitalOcean/Hetzner/Linode, wants to self-host with a custom domain, or needs full server control. Requires deploy-docker skill.
---

# Deploy: VPS

Deploy to any VPS with Caddy (automatic HTTPS via Let's Encrypt), systemd for process management, Docker for the app, and UFW firewall rules.

## When NOT to Use

- User doesn't have a VPS or server (suggest deploy-vercel or deploy-cloudflare instead)
- User wants managed hosting without server maintenance (suggest deploy-vercel)
- User wants a self-hosted PaaS with a web dashboard (suggest deploy-coolify)
- User doesn't have a domain name pointed to their server IP

## What It Adds

| File | Purpose |
|------|---------|
| `deploy/Caddyfile` | Reverse proxy config with automatic HTTPS |
| `deploy/vibekit.service` | systemd unit file for auto-start on boot |
| `deploy/setup-vps.sh` | Server setup: installs Docker, Caddy, configures firewall |
| `deploy/deploy.sh` | Deployment script: pull, build, restart with zero downtime |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. `deploy-docker` skill is already installed (this skill depends on it)
2. User has SSH access to their VPS: `ssh user@server-ip`
3. A domain name is pointed to the server's IP address (A record)
4. The server runs a supported OS (Ubuntu 22.04+, Debian 12+, or similar)

## Setup

### 1. Prepare the Server

SSH into your VPS and run the setup script:

```bash
scp -r deploy/ user@your-server:~/vibekit-deploy/
ssh user@your-server
chmod +x ~/vibekit-deploy/setup-vps.sh
sudo ~/vibekit-deploy/setup-vps.sh
```

The script will:
1. Install Docker and Docker Compose
2. Install Caddy web server
3. Configure UFW firewall (allow SSH, HTTP, HTTPS only)
4. Set up the systemd service
5. Create the app directory at `/opt/vibekit`

### 2. Configure Domain

Edit `deploy/Caddyfile` and replace `your-domain.com` with your actual domain:

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

Caddy automatically obtains and renews SSL certificates from Let's Encrypt.

### 3. First Deploy

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh user@your-server
```

### 4. Subsequent Deploys

Just run the deploy script again — it pulls the latest code, rebuilds, and restarts with minimal downtime.

## Architecture

```
Internet → Caddy (HTTPS :443) → Docker (app :3000) → PostgreSQL (:5432)
                                     ↑
                              systemd manages
```

- **Caddy**: Reverse proxy, auto-SSL, HTTP→HTTPS redirect
- **Docker Compose**: Runs app + PostgreSQL containers
- **systemd**: Ensures Docker containers restart on boot/crash
- **UFW**: Only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open

## Post-Deploy Verification

After deploying, verify:
1. `curl https://your-domain.com/api/health` returns 200
2. `sudo systemctl status vibekit` shows "active (running)"
3. SSL certificate is valid: `curl -vI https://your-domain.com 2>&1 | grep "SSL certificate"`

## Troubleshooting

**SSL certificate not issuing**: Verify your domain's A record points to the server IP. Caddy needs ports 80 and 443 open to complete the ACME challenge.

**502 Bad Gateway from Caddy**: The Docker containers aren't running. Check `docker compose -f /opt/vibekit/docker-compose.yml ps` and `docker compose logs`.

**deploy.sh fails**: Ensure the deploy user has Docker permissions (`sudo usermod -aG docker $USER`) and SSH key auth is set up.

**Firewall blocking access**: Check `sudo ufw status`. Required rules: `22/tcp ALLOW`, `80/tcp ALLOW`, `443/tcp ALLOW`.
