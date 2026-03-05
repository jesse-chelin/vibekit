---
name: deploy-tailscale
description: Deploys app via Tailscale Funnel for secure sharing with friends, family, or team. Use when the user wants to share their app securely, mentions Tailscale, needs a private URL, or has a home server. No port forwarding or domain needed.
---

# Deploy: Tailscale Funnel

Share your app securely via Tailscale Funnel — automatic HTTPS, no port forwarding, no domain purchase needed. Works from any machine with Tailscale installed.

## When NOT to Use

- User needs a custom domain (Tailscale Funnel only provides `.ts.net` URLs — use deploy-cloudflare or deploy-vps)
- User expects high traffic (Funnel is rate-limited and not designed for high-throughput production apps)
- User wants CDN caching for static assets (Tailscale doesn't include a CDN)
- User doesn't want to install Tailscale on their machine

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User has a Tailscale account (free for personal use)
2. Tailscale is installed: `tailscale --version`
3. Tailscale is connected: `tailscale status`
4. Funnel is enabled on the tailnet (admin console → DNS → Enable Funnel)

## What It Adds

| File | Purpose |
|------|---------|
| `scripts/setup-tailscale.sh` | Automated Tailscale Funnel configuration with validation |
| `scripts/tailscale-service.sh` | Creates a systemd user service for auto-start on boot |
| `tailscale/README.md` | Quick reference for common Tailscale commands |

## Prerequisites

- Tailscale account (free for personal use): https://tailscale.com
- Tailscale installed on the machine running the app
- Funnel enabled on your tailnet (admin console → DNS → Enable Funnel)

## Setup

### Quick Start

```bash
chmod +x scripts/setup-tailscale.sh
./scripts/setup-tailscale.sh
```

The script will:
1. Verify Tailscale is installed and connected
2. Check if Funnel is enabled on your tailnet
3. Configure `tailscale serve` to proxy port 3000
4. Enable Funnel for public access
5. Display your public HTTPS URL

### Auto-Start on Boot (Optional)

```bash
chmod +x scripts/tailscale-service.sh
./scripts/tailscale-service.sh
```

Creates a systemd user service that starts the app and configures Tailscale Serve on boot.

## How It Works

```
Internet → Tailscale Funnel (HTTPS) → Tailscale Serve → localhost:3000
```

- **Tailscale Serve** proxies traffic from your Tailscale hostname to localhost:3000
- **Tailscale Funnel** opens that proxy to the public internet with automatic TLS
- Your app gets a URL like `https://your-machine.tailnet-name.ts.net`
- No static IP, no port forwarding, no domain needed

### Funnel vs Serve

| Feature | Tailscale Serve | Tailscale Funnel |
|---------|-----------------|------------------|
| Access | Tailnet only (your devices) | Public internet |
| HTTPS | Yes (internal cert) | Yes (Let's Encrypt) |
| Use case | Private access for you | Sharing with anyone |

## Tailscale vs Cloudflare Tunnel

| | Tailscale Funnel | Cloudflare Tunnel |
|---|---|---|
| Domain needed | No (uses .ts.net) | Yes (any domain) |
| Custom domain | No | Yes |
| CDN/caching | No | Yes |
| Free tier | 1 funnel node | Unlimited tunnels |
| Best for | Personal/small team | Public-facing apps |

## Troubleshooting

**"Funnel is not enabled"**: Go to Tailscale admin console → DNS → Enable HTTPS → Enable Funnel.

**"Tailscale is not connected"**: Run `tailscale up` to connect. You may need `sudo tailscale up` on Linux.

**App not accessible**: Verify `tailscale serve status` shows your configuration. Check that your app is running on port 3000.

**Slow response**: Funnel traffic routes through Tailscale's DERP relays. This adds some latency vs direct connections. For performance-critical apps, consider Cloudflare Tunnel instead.
