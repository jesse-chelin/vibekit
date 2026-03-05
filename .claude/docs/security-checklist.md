# Security Checklist

## Always

- [ ] Use `protectedProcedure` for all authenticated tRPC endpoints
- [ ] Validate ALL inputs with Zod schemas
- [ ] Scope database queries to `ctx.session.user.id`
- [ ] Use Prisma (parameterized queries) — never raw SQL
- [ ] Keep secrets in `.env.local` (gitignored)
- [ ] Never prefix secrets with `NEXT_PUBLIC_`

## File Uploads

- [ ] Validate file type server-side (don't trust client)
- [ ] Enforce max file size (default: 10MB)
- [ ] Use signed URLs for downloads
- [ ] Store in S3-compatible storage, not filesystem

## Authentication

- [ ] CSRF protection via Auth.js (automatic)
- [ ] HttpOnly session cookies (automatic)
- [ ] Rate limit auth endpoints (10 requests/minute)

## Headers

Security headers are set in `next.config.ts`:
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
