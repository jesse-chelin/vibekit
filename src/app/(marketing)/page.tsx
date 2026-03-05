import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { Zap, Shield, Sparkles, Globe } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built on Next.js with server components for blazing performance.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Authentication, input validation, and security headers built in.",
  },
  {
    icon: Sparkles,
    title: "Beautiful UI",
    description: "Curated component library with consistent, modern design.",
  },
  {
    icon: Globe,
    title: "Ready to Deploy",
    description: "Docker, Vercel, or VPS — deploy anywhere with one command.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <Section className="py-20 md:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Build production apps{" "}
            <span className="text-primary">in minutes</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            A complete, production-ready web app starter. Beautiful design,
            real-time features, and a skills system that grows with you.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything you need
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
            Start building right away with a full suite of tools and features.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to start building?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Clone the repo, run one command, and start creating.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
