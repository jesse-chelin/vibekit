# Component Catalog

## UI Primitives (shadcn/ui)

These are the ~37 curated components. Do NOT add new ones without explicit user request.

| Component | Import | When to Use |
|-----------|--------|-------------|
| Accordion | `@/components/ui/accordion` | Expandable content sections. Chevron animates on open/close. Use `type="single"` or `type="multiple"` |
| Alert | `@/components/ui/alert` | Inline status messages. Variants: `default`, `destructive`, `warning`, `success`. Pair with `AlertTitle` + `AlertDescription` |
| Avatar | `@/components/ui/avatar` | User profile images |
| Badge | `@/components/ui/badge` | Status labels, tags, counts |
| Breadcrumb | `@/components/ui/breadcrumb` | Navigation hierarchy in topbar |
| Button | `@/components/ui/button` | All actions. Variants: `default`, `destructive`, `outline`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-xs`, `icon-lg` |
| Calendar | `@/components/ui/calendar` | Date picking in forms |
| Card | `@/components/ui/card` | Content containers. Use `CardHeader` + `CardContent` |
| Checkbox | `@/components/ui/checkbox` | Multiple selections, todo items |
| Collapsible | `@/components/ui/collapsible` | Show/hide content sections. Lighter than Accordion — use for single collapsible areas |
| Command | `@/components/ui/command` | Command palette (Cmd+K search) |
| Dialog | `@/components/ui/dialog` | Modal dialogs. Use Drawer on mobile instead |
| Drawer | `@/components/ui/drawer` | Bottom sheets for mobile. Pair with Dialog for responsive |
| Dropdown Menu | `@/components/ui/dropdown-menu` | Action menus (right-click, "..." button) |
| Input | `@/components/ui/input` | Text inputs. Always pair with Label |
| Input OTP | `@/components/ui/input-otp` | Verification codes only |
| Label | `@/components/ui/label` | Form field labels. Always use with inputs |
| Pagination | `@/components/ui/pagination` | Page navigation for data tables |
| Popover | `@/components/ui/popover` | Floating content (date pickers, color pickers) |
| Progress | `@/components/ui/progress` | Progress bars for uploads, long operations |
| Radio Group | `@/components/ui/radio-group` | Single selection from options |
| Scroll Area | `@/components/ui/scroll-area` | Custom scrollbars for overflow areas |
| Select | `@/components/ui/select` | Dropdown selection. Use for 3+ options |
| Separator | `@/components/ui/separator` | Visual dividers between sections |
| Sheet | `@/components/ui/sheet` | Side panels, mobile navigation. `sm:max-w-lg` on left/right sides |
| Sidebar | `@/components/ui/sidebar` | App navigation sidebar |
| Skeleton | `@/components/ui/skeleton` | Loading placeholders in loading.tsx |
| Switch | `@/components/ui/switch` | Toggle settings on/off |
| Table | `@/components/ui/table` | Data display (use with DataTable pattern) |
| Tabs | `@/components/ui/tabs` | Tabbed content (settings, detail views) |
| Textarea | `@/components/ui/textarea` | Multi-line text input |
| Toggle | `@/components/ui/toggle` | Binary on/off button. Variants: `default`, `outline`. Sizes: `default`, `sm`, `lg`. Use for toolbar formatting buttons |
| Toggle Group | `@/components/ui/toggle-group` | Group of toggles with shared variant/size. Use `type="single"` or `type="multiple"` for toolbar button groups |
| Sonner | `@/components/ui/sonner` | Toast notifications. Import `Toaster` in layout, call `toast.success("Done!")` from `sonner` package. Position: bottom-right, richColors, closeButton |
| Tooltip | `@/components/ui/tooltip` | Hover hints. NEVER put critical info in tooltips (not accessible on mobile) |
| Chart | `@/components/ui/chart` | Chart container, tooltip, legend for Recharts. See ChartCard pattern below |
| FieldError | `@/components/ui/field-error` | Form validation error message. Renders as `<p role="alert">` with destructive color. Returns null when empty |

## Pattern Components

These are composed business components built from UI primitives. Use them instead of building your own.

### PageHeader
```tsx
import { PageHeader } from "@/components/layout/page-header";

<PageHeader
  title="Projects"
  description="Manage your projects and track progress."
  actions={<Button><Plus className="h-4 w-4 mr-2" />New Project</Button>}
/>
```
**When:** Top of every app page. Title is required, description and actions are optional.

### EmptyState
```tsx
import { EmptyState } from "@/components/patterns/empty-state";
import { Briefcase } from "lucide-react";

<EmptyState
  icon={Briefcase}
  title="No projects yet"
  description="Create your first project to get started."
  action={{ label: "New Project", href: "/projects/new" }}
  // Or use onClick for client components: action={{ label: "New Project", onClick: handleCreate }}
/>
```
**When:** EVERY list, table, or grid when data is empty. NEVER show a blank area.
**Required props:** icon, title, description. Action button strongly recommended.
**Styling:** Uses solid border (not dashed), primary-tinted icon container. Looks clean and intentional, not like a placeholder.

### StatCard
```tsx
import { StatCard } from "@/components/patterns/stat-card";

<StatCard
  title="Total Projects"
  value={42}
  icon={Briefcase}
  iconColor="text-blue-500"
  trend={{ value: 12, label: "from last month" }}
/>
```
**When:** Dashboard metrics, KPI displays. Use in a grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
**Props:** `iconColor` accepts a Tailwind text color class (e.g., `text-blue-500`, `text-emerald-500`) — the icon container auto-generates a matching tinted background. Use a different color for each stat to add visual variety. `value` accepts string or number — numbers get a slot-machine rolling animation on mount and value changes.
**Wrap in motion:** `StaggerList` on the grid + `StaggerItem` on each card for entrance animation.

### ChartCard
```tsx
import { ChartCard } from "@/components/patterns/chart-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

<ChartCard title="Revenue" description="Monthly revenue over 6 months.">
  <ChartContainer config={config} className="h-[250px] w-full">
    <AreaChart data={data} accessibilityLayer>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#gradient)" strokeWidth={2} />
    </AreaChart>
  </ChartContainer>
</ChartCard>
```
**When:** Any chart visualization — wraps the chart in a Card with consistent header styling.
**Chart types available:** `AreaChart`, `BarChart`, `LineChart`, `PieChart` from `recharts`. Always use `ChartContainer` (provides responsive sizing + theme CSS vars) and `ChartTooltip` with `ChartTooltipContent` (frosted-glass tooltip matching overlay style).
**Colors:** Use `var(--chart-1)` through `var(--chart-5)` for chart data series. Define colors in the `ChartConfig` object.

### DataTable
```tsx
import { DataTable } from "@/components/patterns/data-table";

<DataTable
  columns={columns}
  data={projects}
  searchKey="name"
  searchPlaceholder="Search projects..."
/>
```
**When:** Lists with sorting, filtering, search, pagination, and row selection.
**Must pair with:** EmptyState (when filtered results are empty) and loading skeleton.

### ConfirmDialog
```tsx
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";

<ConfirmDialog
  title="Delete project?"
  description="This will permanently delete the project and all its tasks. This can't be undone."
  onConfirm={handleDelete}
  variant="destructive"
/>
```
**When:** Before any destructive action (delete, reset, revoke). Never delete without confirmation.

### FormSection
```tsx
import { FormSection } from "@/components/patterns/form-section";

<FormSection title="General" description="Basic project information.">
  <Input ... />
  <Textarea ... />
</FormSection>
```
**When:** Grouping related form fields. Uses consistent spacing and typography.

### SettingsLayout
```tsx
import { SettingsLayout } from "@/components/patterns/settings-layout";

<SettingsLayout
  tabs={[
    { value: "general", label: "General", content: <GeneralSettings /> },
    { value: "team", label: "Team", content: <TeamSettings /> },
  ]}
/>
```
**When:** Settings pages with multiple sections. Renders as vertical tabs on desktop, horizontal on mobile.

### DetailLayout
```tsx
import { DetailLayout } from "@/components/patterns/detail-layout";

<DetailLayout
  main={<ProjectContent />}
  sidebar={<ProjectMeta />}
/>
```
**When:** Detail pages that need a main content area + metadata sidebar. Sidebar stacks below on mobile.

### Wizard
```tsx
import { Wizard } from "@/components/patterns/wizard";

<Wizard
  steps={[
    { title: "Basics", content: <Step1 /> },
    { title: "Details", content: <Step2 /> },
    { title: "Done", content: <Step3 /> },
  ]}
  onComplete={handleFinish}
/>
```
**When:** Multi-step flows (onboarding, complex creation). Shows step indicator and handles navigation.

### SearchCommand
```tsx
import { SearchCommand } from "@/components/patterns/search-command";
```
**When:** Cmd+K global search. Already integrated in the app layout.

### UserNav
```tsx
import { UserNav } from "@/components/patterns/user-nav";
```
**When:** User avatar + dropdown in topbar. Already integrated.

### ActivityFeed
```tsx
import { ActivityFeed } from "@/components/patterns/activity-feed";
```
**When:** Timeline of events (dashboard, project detail). Shows who did what, when.

### LiveIndicator
```tsx
import { LiveIndicator } from "@/components/patterns/live-indicator";
```
**When:** Online status dots, "live" connection indicators. Pulsing green dot.

### NotificationCenter
```tsx
import { NotificationCenter } from "@/components/patterns/notification-center";
```
**When:** Bell icon with unread count badge. Already in topbar.

### Combobox
```tsx
import { Combobox } from "@/components/patterns/combobox";

<Combobox
  options={[
    { value: "next", label: "Next.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ]}
  value={framework}
  onValueChange={setFramework}
  placeholder="Select framework..."
  searchPlaceholder="Search frameworks..."
/>
```
**When:** Searchable dropdown selection. Prefer over plain `Select` when the option list is long (5+) and users need to search. Built on `Command` + `Popover`. Width auto-matches trigger.

### CopyButton
```tsx
import { CopyButton } from "@/components/patterns/copy-button";

<CopyButton value={apiKey} />
```
**When:** Copy text to clipboard. Shows check icon with `text-success` for 2s after copy. Uses `size="icon-sm"` (32px). Pair with `truncate` text for long IDs/URLs.

### DatePicker
```tsx
import { DatePicker } from "@/components/patterns/date-picker";

<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Pick a date"
/>
```
**When:** Date selection in forms. Built on `Calendar` + `Popover`. Displays formatted date via `date-fns` (`format(date, "PPP")`).

### FilterBar
```tsx
import { FilterBar } from "@/components/patterns/filter-bar";

<FilterBar
  searchValue={search}
  onSearchChange={setSearch}
  filters={[
    { key: "status", label: "Status", options: [
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ]},
    { key: "priority", label: "Priority", options: [
      { value: "high", label: "High" },
      { value: "low", label: "Low" },
    ]},
  ]}
  activeFilters={activeFilters}
  onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
/>
```
**When:** Search + multi-filter bar above data tables or lists. Shows search input with icon + select dropdowns per filter + active filter badges with remove buttons. Use alongside `DataTable` or custom lists.

### Kbd
```tsx
import { Kbd } from "@/components/patterns/kbd";

<Kbd>⌘K</Kbd>
<Kbd>Ctrl</Kbd>+<Kbd>S</Kbd>
```
**When:** Displaying keyboard shortcuts inline. Monospace font, 10px, border + muted background. NOT a client component.

### PricingCard
```tsx
import { PricingCard } from "@/components/patterns/pricing-card";

<PricingCard
  name="Pro"
  price="$19"
  period="/month"
  description="For growing teams"
  features={["Unlimited projects", "Priority support", "Advanced analytics"]}
  cta="Get Started"
  highlighted
/>
```
**When:** Pricing plan display on marketing pages. Use in a grid: `grid-cols-1 md:grid-cols-3 gap-6`. The `highlighted` prop adds `border-primary`, `shadow-md`, and a "Popular" badge. NOT a client component.

## Layout Components

| Component | Import | When to Use |
|-----------|--------|-------------|
| AppSidebar | `@/components/layout/app-sidebar` | Auto in (app) layout. Collapsible, sheet on mobile |
| AppTopbar | `@/components/layout/app-topbar` | Auto in (app) layout. Breadcrumbs + user nav |
| MarketingNav | `@/components/layout/marketing-nav` | Auto in (marketing) layout. Responsive nav |
| MarketingFooter | `@/components/layout/marketing-footer` | Auto in (marketing) layout. Links + brand |
| PageHeader | `@/components/layout/page-header` | Top of every page. Title + description + actions |
| Section | `@/components/layout/section` | Marketing page sections with max-width container |

## Shared Components

| Component | Import | When to Use |
|-----------|--------|-------------|
| Icons | `@/components/shared/icons` | Re-exported lucide icons for consistency |
| Logo | `@/components/shared/logo` | App logo in sidebar and marketing nav |
| ThemeToggle | `@/components/shared/theme-toggle` | Dark/light/system mode switcher |
| Providers | `@/components/shared/providers` | All app providers composed (auto in root layout) |
| Motion | `@/components/shared/motion` | FadeIn, SlideUp, ScaleIn, StaggerList presets |

## Common Mistakes

1. **Building a custom card layout** instead of using `Card` + `CardHeader` + `CardContent`
2. **Building a custom empty state** instead of using `EmptyState` component
3. **Using Dialog on mobile** — use Drawer (bottom sheet) for mobile-friendly dialogs
4. **Putting critical info in Tooltip** — tooltips don't work on mobile (no hover)
5. **Using Tabs for navigation** — Tabs are for content switching within a page, not page navigation
6. **Skipping Skeleton** in loading.tsx — always use skeleton shapes that match the real content layout
7. **Writing custom form error `<p>` tags** instead of using `FieldError` component — it handles null children, has `role="alert"` for a11y, and uses `text-destructive` consistently
8. **Using `text-white` or raw colors** on badges/indicators — use `text-destructive-foreground`, `text-primary-foreground`, etc.
9. **Building custom chart wrappers** instead of using `ChartCard` + `ChartContainer` — they provide consistent styling and frosted-glass tooltips
10. **Using `cursor-default`** on interactive elements — all buttons, checkboxes, selects, tabs, dropdown items use `cursor-pointer` (already applied to all UI primitives)
11. **Overriding animation timing** on Sheet, Popover, or DropdownMenu — animation curves are defined globally in `globals.css` via `data-slot` selectors. Do not add inline `duration-*` classes
