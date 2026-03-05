---
name: deploy-cloudflare
description: Deploys app via Cloudflare Tunnel with automatic HTTPS, DNS configuration, and Docker integration. Use when the user wants to expose their app to the internet, needs a public URL, or mentions Cloudflare. Requires deploy-docker skill.
---

# Deploy: Cloudflare Tunnel

Exposes your Docker-hosted app to the internet via Cloudflare Tunnel with automatic HTTPS and DNS — no port forwarding or static IP needed.

## What It Adds

| File | Purpose |
|------|---------|
| `cloudflared/config.yml` | Tunnel routing configuration |
| `docker-compose.cloudflare.yml` | Docker Compose override adding cloudflared service |
| `scripts/setup-cloudflare.sh` | Automated tunnel creation, DNS setup, and token extraction |

## When NOT to Use

- User doesn't have a Cloudflare account or custom domain (use deploy-tailscale for domain-free sharing)
- User wants Vercel-style managed hosting with git integration (use deploy-vercel)
- User only needs local development (no deploy skill needed)
- User wants to deploy directly to Cloudflare Workers/Pages (this uses Tunnels for Docker-based apps, not Workers)

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. `deploy-docker` skill is already installed
2. User has a Cloudflare account with at least one domain
3. Docker and Docker Compose are available on the host machine
4. User can run `cloudflared` (will be installed by setup script if missing)

## Prerequisites

- `deploy-docker` skill must be installed first
- A Cloudflare account with a domain (free tier works)
- Docker and Docker Compose on the host machine

## Setup

### Option A: Automated (Recommended)

```bash
chmod +x scripts/setup-cloudflare.sh
./scripts/setup-cloudflare.sh
```

The script will:
1. Check/install cloudflared CLI
2. Log you in to Cloudflare
3. Create a tunnel
4. Configure DNS routing
5. Write the tunnel token to `.env.local`
6. Generate `cloudflared/config.yml`

### Option B: Manual

1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
2. Login: `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create vibekit`
4. Route DNS: `cloudflared tunnel route dns vibekit your-domain.com`
5. Copy the tunnel token from the Cloudflare Dashboard → Zero Trust → Tunnels
6. Set `CLOUDFLARE_TUNNEL_TOKEN` in `.env.local`

### Running

```bash
docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d
```

Your app will be available at `https://your-domain.com` with automatic HTTPS.

## Architecture

```
Internet → Cloudflare CDN (HTTPS) → Cloudflare Tunnel → cloudflared container → app container (:3000)
```

- No inbound ports needed on your server
- Cloudflare handles SSL termination, DDoS protection, and CDN caching
- The tunnel is authenticated via token — no secrets exposed
- Zero Trust access policies can be added via Cloudflare Dashboard

## Troubleshooting

**Tunnel not connecting**: Check `docker compose logs cloudflared`. Verify `CLOUDFLARE_TUNNEL_TOKEN` is set correctly in `.env.local`.

**502 Bad Gateway**: The app container isn't ready yet. Check `docker compose logs app`. The cloudflared service depends on the app service being started.

**DNS not resolving**: Verify the CNAME record exists in your Cloudflare DNS dashboard. It may take a few minutes to propagate.

**Updating the domain**: Edit `cloudflared/config.yml` and restart the cloudflared container.
