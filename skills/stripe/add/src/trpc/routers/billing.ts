import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  getOrCreateCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getPlanByPriceId,
  PLANS,
} from "@/lib/stripe";

export const billingRouter = createTRPCRouter({
  /**
   * Get the current user's subscription status.
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) return { plan: "free" as const, isActive: false, periodEnd: null };

    const plan = getPlanByPriceId(user.stripePriceId);
    const isActive = user.stripeCurrentPeriodEnd
      ? new Date(user.stripeCurrentPeriodEnd) > new Date()
      : false;

    return {
      plan,
      isActive: plan !== "free" && isActive,
      periodEnd: user.stripeCurrentPeriodEnd,
      hasCustomer: !!user.stripeCustomerId,
    };
  }),

  /**
   * List available plans with pricing info.
   */
  getPlans: protectedProcedure.query(() => {
    return Object.entries(PLANS).map(([key, plan]) => ({
      key,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      features: plan.features,
      priceId: plan.priceId,
    }));
  }),

  /**
   * Create a Stripe Checkout session and return the URL for redirect.
   */
  createCheckout: protectedProcedure
    .input(z.object({ priceId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { email: true, name: true },
      });

      if (!user) throw new Error("User not found");

      const customerId = await getOrCreateCustomer(
        ctx.session.user.id,
        user.email,
        user.name
      );

      const session = await createCheckoutSession(customerId, input.priceId);
      return { url: session.url };
    }),

  /**
   * Create a Stripe Billing Portal session for managing subscription.
   */
  createPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new Error("No billing account found. Subscribe to a plan first.");
    }

    const session = await createBillingPortalSession(user.stripeCustomerId);
    return { url: session.url };
  }),
});
