# Tailscale Quick Reference

## Common Commands

```bash
# Check connection status
tailscale status

# View serve configuration
tailscale serve status

# Expose app to your tailnet only (no public access)
tailscale serve https / http://localhost:3000

# Expose app to the public internet
tailscale funnel 443 on

# Stop public access (keep tailnet access)
tailscale funnel 443 off

# Remove all serve configuration
tailscale serve reset

# View your machine's Tailscale IP
tailscale ip

# View your machine's public funnel URL
tailscale funnel status
```

## Access Control

### Tailnet-only (private)
Only devices on your Tailscale network can access the app:
```bash
tailscale serve https / http://localhost:3000
# No funnel — only your devices can reach it
```

### Public (funnel)
Anyone on the internet can access via your `.ts.net` URL:
```bash
tailscale serve https / http://localhost:3000
tailscale funnel 443 on
```

### ACL-based restrictions
For fine-grained access, configure ACLs in the Tailscale admin console:
https://login.tailscale.com/admin/acls

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not connected" | `sudo tailscale up` |
| "Funnel not available" | Enable in admin console → DNS → Funnel |
| App unreachable | Check `tailscale serve status` and that app is on port 3000 |
| Slow connections | Funnel routes via DERP relays — some latency is normal |
