---
name: stripe
description: Adds Stripe payments, subscriptions, and billing portal. Use when the user needs to charge money, accept payments, manage subscriptions, or add a billing page. Handles checkout sessions, webhook processing, and customer lifecycle.
---

# Stripe — Payments & Subscriptions

Complete Stripe integration with checkout sessions, subscription management, billing portal, and webhook processing backed by database subscription tracking.

## When NOT to Use

- User only needs one-time donations or tips (Stripe is overkill — suggest a simple payment link)
- User wants to accept crypto payments (Stripe doesn't handle crypto natively)
- User is building a marketplace where sellers get paid directly (this skill handles single-merchant billing only — marketplaces need Stripe Connect)
- The app has no monetization or billing features

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User has a Stripe account (test mode is fine for development)
2. At least two subscription products/prices are created in the Stripe Dashboard
3. User is ready to set 5 environment variables (see setup section)
4. Database schema can be modified (adds 4 fields to User model)

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe SDK, customer management, checkout/portal sessions |
| `src/trpc/routers/billing.ts` | tRPC router: subscription query, checkout/portal mutations, plan listing |
| `src/app/(app)/settings/billing/page.tsx` | Billing page with current plan, pricing cards, upgrade/manage buttons |
| `src/app/(app)/settings/billing/loading.tsx` | Skeleton loading state |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler for checkout, subscription, and invoice events |

Prisma schema modifications: adds `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd` fields to User model.

## Setup

### 1. Stripe Account and API Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. In the Dashboard, go to **Developers > API keys**
3. Copy the **Secret key** → `STRIPE_SECRET_KEY`
4. Copy the **Publishable key** → `STRIPE_PUBLISHABLE_KEY`

### 2. Create Products and Prices

In the Dashboard, go to **Products** and create two subscription products:

- **Pro Plan** — e.g. $19/month → copy Price ID → `STRIPE_PRO_PRICE_ID`
- **Business Plan** — e.g. $49/month → copy Price ID → `STRIPE_BUSINESS_PRICE_ID`

### 3. Configure Webhooks

**Development** — use the Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret (whsec_...) → STRIPE_WEBHOOK_SECRET
```

**Production** — in the Dashboard, go to **Developers > Webhooks**:

- Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 4. Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
```

### 5. Push Database Changes

```bash
pnpm db:push
```

## Architecture

### Data Flow

1. User clicks "Upgrade" → `billing.createCheckout` → Stripe Checkout → redirect
2. User pays → Stripe sends `checkout.session.completed` webhook → DB updated
3. Subscription changes → Stripe sends webhook → DB updated
4. User clicks "Manage Billing" → `billing.createPortal` → Stripe Portal → redirect

### Subscription Tracking

All subscription state is stored on the User model:
- `stripeCustomerId` — maps to Stripe customer
- `stripeSubscriptionId` — active subscription
- `stripePriceId` — which plan (compare against env vars)
- `stripeCurrentPeriodEnd` — billing period end

### Checking Subscription in Your Code

```typescript
const user = await ctx.db.user.findUnique({ where: { id: userId } });
const isActive = user?.stripeCurrentPeriodEnd
  ? new Date(user.stripeCurrentPeriodEnd) > new Date()
  : false;
```

## Testing

- Use test mode keys (`sk_test_` / `pk_test_`)
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC
- Declined card: `4000 0000 0000 0002`
- Use `stripe trigger checkout.session.completed` to test webhooks

## Troubleshooting

**Webhook signature verification fails**: Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or Dashboard. The route uses `req.text()` for raw body — do not add body parsing middleware.

**Customer not found**: Customers are created on first checkout. If deleted from Stripe, clear `stripeCustomerId` in the database.

**Subscription not updating**: Check webhook delivery at Stripe Dashboard > Developers > Webhooks > Recent events.
