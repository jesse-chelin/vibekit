import Stripe from "stripe";
import { db } from "@/lib/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Plans configuration — maps price IDs to display info.
 * Keep in sync with your Stripe Dashboard products.
 */
export const PLANS = {
  free: {
    name: "Free",
    description: "For personal projects",
    priceId: null,
    price: 0,
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    description: "For growing teams",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 19,
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Team collaboration",
    ],
  },
  business: {
    name: "Business",
    description: "For organizations",
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    price: 49,
    features: [
      "Everything in Pro",
      "Custom branding",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/**
 * Get or create a Stripe customer for a user.
 * Stores the customer ID on the User record for future lookups.
 */
export async function getOrCreateCustomer(userId: string, email: string, name?: string | null) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout session for a subscription.
 */
export async function createCheckoutSession(customerId: string, priceId: string) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    subscription_data: {
      metadata: { customerId },
    },
  });
}

/**
 * Create a Stripe Billing Portal session.
 */
export async function createBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });
}

/**
 * Look up which plan key corresponds to a given price ID.
 */
export function getPlanByPriceId(priceId: string | null): PlanKey {
  if (!priceId) return "free";
  if (priceId === PLANS.pro.priceId) return "pro";
  if (priceId === PLANS.business.priceId) return "business";
  return "free";
}

/**
 * Handle subscription state changes — called from webhook handler.
 */
export async function upsertSubscription(
  stripeCustomerId: string,
  subscription: Stripe.Subscription
) {
  const user = await db.user.findFirst({
    where: { stripeCustomerId },
    select: { id: true },
  });

  if (!user) {
    console.error(`No user found for Stripe customer ${stripeCustomerId}`);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id ?? null;

  await db.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

/**
 * Clear subscription data when a subscription is canceled/deleted.
 */
export async function cancelSubscription(stripeCustomerId: string) {
  const user = await db.user.findFirst({
    where: { stripeCustomerId },
    select: { id: true },
  });

  if (!user) return;

  await db.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });
}
