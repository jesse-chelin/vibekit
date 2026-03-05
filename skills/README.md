# Vibekit Skills

Skills are self-contained feature packages that can be installed and removed cleanly.

## Available Skills

### Feature Skills
| Skill | Description |
|-------|-------------|
| ollama | Local LLM via Ollama |
| cloud-llm | OpenAI / Claude / OpenRouter |
| stripe | Payments & subscriptions |
| file-uploads | S3-compatible file storage |
| email | Transactional email via Resend |
| realtime-chat | WebSocket chat |
| maps | Leaflet maps |
| charts | Recharts dashboard components |
| pdf | PDF generation |
| background-jobs | BullMQ + Redis |
| admin-panel | Auto-generated admin CRUD |
| notifications-push | Web push notifications |
| analytics | PostHog integration |
| rbac | Role-based access control |
| i18n | Internationalization |

### Deployment Skills
| Skill | Description |
|-------|-------------|
| deploy-docker | Dockerfile + docker-compose + Postgres |
| deploy-cloudflare | Cloudflare Tunnel |
| deploy-tailscale | Tailscale Funnel |
| deploy-vercel | Vercel deployment |
| deploy-coolify | Coolify self-hosted PaaS |
| deploy-vps | VPS with Caddy + systemd |

## Install a Skill

```bash
npx tsx skills-engine/index.ts apply <skill-name>
```

## Remove a Skill

```bash
npx tsx skills-engine/index.ts remove <skill-name>
```

## Create a Custom Skill

See `.claude/docs/adding-a-skill.md` for the full guide.
