---
name: email
description: Adds transactional email via Resend with React Email templates, email preview route, and ready-to-use templates (welcome, password reset, notification). Use when the user needs to send emails, mentions email notifications, wants welcome emails, password reset emails, or transactional messaging.
---

# Email — Transactional Email via Resend

Send beautiful transactional emails using Resend and React Email. Includes pre-built templates for welcome, password reset, and notification emails, plus a dev preview route.

## When NOT to Use

- User only needs in-app notifications (use the notification-center pattern instead)
- User wants marketing/bulk email (Resend is for transactional email — suggest Mailchimp or similar)
- User doesn't want to set up a custom domain for email sending (Resend requires domain verification for production)

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/email.ts` | Resend client and send helpers |
| `src/components/email/welcome.tsx` | Welcome email template (React Email) |
| `src/components/email/password-reset.tsx` | Password reset email template |
| `src/components/email/notification.tsx` | Generic notification email template |
| `src/app/api/email-preview/route.ts` | Dev-only email preview endpoint |

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User has a Resend account: https://resend.com (free tier: 100 emails/day)
2. For production: a custom domain verified in Resend (required to send from your own address)
3. User understands free tier sends from `onboarding@resend.dev` only

## Setup

### 1. Get API Key

1. Create account at https://resend.com
2. Go to API Keys → Create API Key
3. Copy the key

### 2. Environment Variables

```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@your-domain.com
```

For development without a verified domain:
```env
EMAIL_FROM=onboarding@resend.dev
```

### 3. Verify Domain (Production)

In Resend Dashboard → Domains → Add Domain. Add the DNS records Resend provides (SPF, DKIM, DMARC).

CRITICAL: Without domain verification, you can only send to your own email address. Production apps MUST have a verified domain.

## Architecture

```
App Code → email.ts sendEmail() → Resend API → Recipient Inbox
                ↓
        React Email Template
         (rendered to HTML)
```

- Templates are React components rendered to HTML at send time
- Dev preview route renders templates in the browser for testing
- All sends are async and non-blocking

## Usage

### Sending an Email

```typescript
import { sendWelcomeEmail, sendNotificationEmail } from "@/lib/email";

// In a tRPC procedure or API route
await sendWelcomeEmail({
  to: user.email,
  name: user.name ?? "there",
});

await sendNotificationEmail({
  to: user.email,
  subject: "New comment on your project",
  message: "Someone commented on your project 'My App'.",
  actionUrl: "https://your-app.com/projects/123",
  actionLabel: "View Comment",
});
```

### Previewing Templates

During development, visit `/api/email-preview?template=welcome` to see how templates render in the browser.

Available templates: `welcome`, `password-reset`, `notification`

### Creating New Templates

1. Create a new component in `src/components/email/`
2. Use React Email components (`Html`, `Head`, `Body`, `Container`, `Text`, `Button`, etc.)
3. Add a send helper in `src/lib/email.ts`
4. Add preview support in the preview route

## Post-Install Verification

1. Set `RESEND_API_KEY` in `.env.local`
2. Start the app: `pnpm dev`
3. Visit `/api/email-preview?template=welcome` — you should see the rendered template
4. Test sending by calling `sendWelcomeEmail` from a tRPC procedure

## Troubleshooting

**403 Forbidden from Resend**: Your API key is invalid or revoked. Generate a new one.

**Emails not arriving**: Check Resend Dashboard → Logs for delivery status. Emails may be in spam.

**Can only send to own email**: You haven't verified a domain. Free tier without domain verification only allows sending to the account owner's email.

**Template looks different in email clients**: Email HTML rendering varies widely. Test with the preview route and Resend's built-in preview feature. Avoid complex CSS.
