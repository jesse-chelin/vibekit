"use client";

import { FormSection } from "@/components/patterns/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-8">
      <FormSection title="Profile" description="Update your personal information.">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="Demo User" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue="demo@vibekit.dev" />
        </div>
        <Button>Save Changes</Button>
      </FormSection>

      <FormSection title="Preferences" description="Customize your experience.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Receive updates via email</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Marketing Emails</p>
            <p className="text-xs text-muted-foreground">Receive tips and product updates</p>
          </div>
          <Switch />
        </div>
      </FormSection>
    </div>
  );
}
