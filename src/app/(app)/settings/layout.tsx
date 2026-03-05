import { PageHeader } from "@/components/layout/page-header";
import { SettingsLayout } from "@/components/patterns/settings-layout";

const settingsTabs = [
  { label: "General", href: "/settings/general" },
  { label: "Team", href: "/settings/team" },
  { label: "Billing", href: "/settings/billing" },
];

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <SettingsLayout tabs={settingsTabs}>{children}</SettingsLayout>
    </div>
  );
}
