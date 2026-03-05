"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Check, CreditCard, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: subscription, isLoading: subLoading } = trpc.billing.getSubscription.useQuery();
  const { data: plans, isLoading: plansLoading } = trpc.billing.getPlans.useQuery();

  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again?");
    },
  });

  const createPortal = trpc.billing.createPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again?");
    },
  });

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("You're all set! Your subscription is now active.");
      router.replace("/settings/billing");
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("No worries — you can upgrade anytime.");
      router.replace("/settings/billing");
    }
  }, [searchParams, router]);

  const isLoading = subLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const currentPlanKey = subscription?.plan ?? "free";
  const paidPlans = plans?.filter((p) => p.priceId) ?? [];

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="mt-1">
                {subscription?.isActive
                  ? `Your ${currentPlanKey.charAt(0).toUpperCase() + currentPlanKey.slice(1)} plan renews on ${subscription.periodEnd ? formatDate(subscription.periodEnd) : "—"}.`
                  : "You're on the free plan. Upgrade to unlock more features."}
              </CardDescription>
            </div>
            <Badge variant={subscription?.isActive ? "default" : "secondary"}>
              {currentPlanKey.charAt(0).toUpperCase() + currentPlanKey.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        {subscription?.isActive && subscription?.hasCustomer && (
          <CardContent>
            <Button
              variant="outline"
              onClick={() => createPortal.mutate()}
              disabled={createPortal.isPending}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {createPortal.isPending ? "Opening..." : "Manage Billing"}
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Pricing Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Free plan card */}
        <Card className={currentPlanKey === "free" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-lg">Free</CardTitle>
            <CardDescription>For personal projects</CardDescription>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              $0<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Up to 3 projects
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Basic analytics
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Community support
              </li>
            </ul>
            {currentPlanKey === "free" ? (
              <Button className="mt-6 w-full" variant="secondary" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className="mt-6 w-full"
                variant="outline"
                onClick={() => createPortal.mutate()}
                disabled={createPortal.isPending}
              >
                Downgrade
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Paid plan cards */}
        {paidPlans.map((plan) => {
          const isCurrent = plan.key === currentPlanKey;
          return (
            <Card key={plan.key} className={isCurrent ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.key === "pro" && !isCurrent && (
                    <Badge variant="secondary">Popular</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button className="mt-6 w-full" variant="secondary" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="mt-6 w-full"
                    onClick={() => plan.priceId && createCheckout.mutate({ priceId: plan.priceId })}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? "Redirecting..." : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
