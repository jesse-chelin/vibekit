# Deployment

## Development (Default)

Zero infrastructure needed. Open Claude Code and run `/setup`, then:
```bash
pnpm dev
```
Uses SQLite, runs on localhost:3000.

## Production Options

| Method | Skill | Best For |
|--------|-------|----------|
| Docker + PostgreSQL | deploy-docker | Self-hosted, any infrastructure |
| Cloudflare Tunnel | deploy-cloudflare | Free public URL, no port forwarding |
| Tailscale Funnel | deploy-tailscale | Secure sharing, home server |
| Vercel | deploy-vercel | Managed hosting, auto-deploy |
| Coolify | deploy-coolify | Self-hosted PaaS |
| VPS + Caddy | deploy-vps | Full control, auto-SSL |

Install a deployment skill:
```bash
npx tsx skills-engine/index.ts apply deploy-docker
```

## Environment Variables

See `.env.example` for all required variables.
