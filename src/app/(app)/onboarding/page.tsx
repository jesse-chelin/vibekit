"use client";

import { useRouter } from "next/navigation";
import { Wizard } from "@/components/patterns/wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();

  const steps = [
    {
      title: "Welcome!",
      description: "Let's get you set up. Tell us a bit about yourself.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">What should we call you?</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">What do you do?</Label>
            <Input id="role" placeholder="e.g. Developer, Designer, PM" />
          </div>
        </div>
      ),
    },
    {
      title: "Your workspace",
      description: "Set up your first project.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project name</Label>
            <Input id="project" placeholder="My first project" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Describe it briefly</Label>
            <Textarea id="desc" placeholder="What are you working on?" rows={3} />
          </div>
        </div>
      ),
    },
    {
      title: "You're all set!",
      description: "Everything is ready. Let's get started.",
      content: (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-4xl">🎉</p>
            <p className="mt-2 text-lg font-medium">Welcome aboard!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click complete to go to your dashboard.
            </p>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Wizard steps={steps} onComplete={() => router.push("/dashboard")} />
    </div>
  );
}
