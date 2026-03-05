import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layout/section";
import { FadeIn, SlideUp, StaggerList, StaggerItem } from "@/components/shared/motion";
import { Zap, Shield, Sparkles, Globe } from "lucide-react";

/* Replace: swap icons, titles, and descriptions to match your app */
const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built on Next.js with server components for blazing performance.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Authentication, input validation, and security headers built in.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Sparkles,
    title: "Beautiful UI",
    description: "Curated component library with consistent, modern design.",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: Globe,
    title: "Ready to Deploy",
    description: "Docker, Vercel, or VPS — deploy anywhere with one command.",
    color: "bg-amber-500/10 text-amber-500",
  },
];

/* Replace: describe your app's 3-step onboarding flow */
const steps = [
  {
    step: "1",
    title: "Create your account",
    description: "Sign up in seconds with just your email address.",
  },
  {
    step: "2",
    title: "Set up your workspace",
    description: "Configure your team, invite members, and customize settings.",
  },
  {
    step: "3",
    title: "Start building",
    description: "Jump right in with templates, guides, and a powerful dashboard.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <Section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <FadeIn className="relative mx-auto max-w-3xl text-center">
          {/* Replace: your app's tagline badge */}
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm font-medium">
            Production-ready in minutes
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {/* Replace: your app's headline */}
            Build production apps{" "}
            <span className="text-primary">in minutes</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {/* Replace: your app's value proposition */}
            A complete, production-ready web app starter. Beautiful design,
            real-time features, and a skills system that grows with you.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="shadow-sm">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </FadeIn>
      </Section>

      {/* Features */}
      <Section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <SlideUp className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {/* Replace: features section heading */}
              Everything you need
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              {/* Replace: features section description */}
              Start building right away with a full suite of tools and features.
            </p>
          </SlideUp>
          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const [bgColor, textColor] = feature.color.split(" ");
              return (
                <StaggerItem key={feature.title}>
                  <div className="hover-lift rounded-lg border bg-card p-6 transition-all hover:border-primary/30">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}
                    >
                      <feature.icon className={`h-5 w-5 ${textColor}`} />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <div className="mx-auto max-w-4xl">
          <SlideUp className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {/* Replace: how-it-works heading */}
              Get started in three steps
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              {/* Replace: how-it-works description */}
              From sign-up to your first project in under a minute.
            </p>
          </SlideUp>
          <StaggerList className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <StaggerItem key={item.step}>
                <div className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </Section>

      {/* CTA */}
      <Section className="border-t bg-muted/50">
        <SlideUp className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {/* Replace: CTA heading */}
            Ready to start building?
          </h2>
          <p className="mt-2 text-muted-foreground">
            {/* Replace: CTA description */}
            Clone the repo, run one command, and start creating.
          </p>
          <Button asChild size="lg" className="mt-6 shadow-sm">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </SlideUp>
      </Section>
    </>
  );
}
