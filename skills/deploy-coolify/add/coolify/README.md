# Coolify Quick Reference

## Dashboard

- **Deployments**: View build logs, rollback to previous versions
- **Environment**: Add/edit environment variables
- **Domains**: Configure custom domains with auto-SSL
- **Logs**: View container runtime logs

## Common Operations

### Redeploy
Click "Deploy" in the Coolify Dashboard, or push to your git repository (auto-deploy on push).

### Rollback
Go to Deployments → select a previous successful deployment → click "Rollback".

### View Logs
Dashboard → Application → Logs

Or SSH into your server:
```bash
docker logs <container-name> -f
```

### Restart
Dashboard → Application → "Restart" button

### Database Access
```bash
# SSH into your server, then:
docker exec -it <postgres-container> psql -U vibekit -d vibekit
```

### Backup Database
```bash
docker exec <postgres-container> pg_dump -U vibekit vibekit > backup.sql
```

### Restore Database
```bash
docker exec -i <postgres-container> psql -U vibekit vibekit < backup.sql
```

## Resource Monitoring

Coolify shows CPU and memory usage per container in the Dashboard.

To adjust resource limits, edit `docker-compose.coolify.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1024M
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs for missing env vars or dependency issues |
| App won't start | Check container logs for runtime errors |
| Database connection refused | Verify `DATABASE_URL` and that db service is healthy |
| SSL not working | Check domain DNS points to your server IP |
| Out of memory | Increase memory limits in docker-compose |
