# Design System

## The One Rule

**Page content padding is ALWAYS `p-4 md:p-6`. Every page. No exceptions.**

This single rule prevents the most common layout inconsistency in AI-generated apps. Internalize it.

## Color Tokens

All colors use CSS custom properties via Tailwind. NEVER use raw hex, rgb, or opacity values.

**Default palette:** Warm neutral tones with teal primary (`#2AB4A0`). The warmth comes from subtle brown/amber undertones in backgrounds and borders (not cool blue/gray). This is the vibekit default — during `/setup`, the user can choose a different vibe/palette.

### Backgrounds
| Token | Usage |
|-------|-------|
| `bg-background` | Page background (darkest layer) |
| `bg-card` | Cards, dialogs — elevated surface, visually distinct from background |
| `bg-muted` | Subtle backgrounds, disabled states — lighter/cooler than secondary |
| `bg-secondary` | Button backgrounds, subtle interactive surfaces — distinct from muted |
| `bg-accent` | Hover/interactive highlights — warm tint |
| `bg-popover` | Dropdowns, tooltips — highest elevation layer |
| `bg-primary` | Primary action buttons |
| `bg-destructive` | Danger buttons, error backgrounds |
| `bg-primary/10` | Subtle accent tint (icon containers, badges, highlights) |

### Surface Elevation (Dark Mode)

Dark mode uses layered surfaces with warm brown tinting for depth. Each level is visually distinct:

| Level | Token | Usage |
|-------|-------|-------|
| Base | `bg-background` | Page background — darkest (`#201f1e`) |
| Sidebar | `bg-sidebar` | Sidebar — slightly darker than base |
| Surface | `bg-card` | Cards, panels — noticeably lighter than background |
| Elevated | `bg-popover` | Popovers, dropdowns — lightest |
| Interactive | `bg-accent` | Hover states, active items |

This creates layered depth visible in modern dark UIs. The warm undertones make surfaces feel organic rather than cold gray.

### Colored Icon Containers

Use distinct colors per category or entity type. Each stat, feature, or entity should have its own color:

| Color | Background | Text | Use For |
|-------|------------|------|---------|
| Blue | `bg-blue-500/10` | `text-blue-500` | Primary entities, projects, totals |
| Emerald | `bg-emerald-500/10` | `text-emerald-500` | Success, completion, done states |
| Amber | `bg-amber-500/10` | `text-amber-500` | In-progress, pending, time-related |
| Violet | `bg-violet-500/10` | `text-violet-500` | Analytics, rates, percentages |
| Rose | `bg-rose-500/10` | `text-rose-500` | Urgent, overdue, alerts |

Use the `iconColor` prop on `StatCard` to set these automatically.

### Text
| Token | Usage |
|-------|-------|
| `text-foreground` | Primary text — headings, body |
| `text-muted-foreground` | Secondary text — descriptions, labels, metadata |
| `text-card-foreground` | Text inside cards |
| `text-primary` | Accent text — links, active states |
| `text-destructive` | Error text |

### Borders
| Token | Usage |
|-------|-------|
| `border-border` | Default borders — cards, dividers |
| `border-input` | Form input borders |

### Overlay
| Token | Usage |
|-------|-------|
| `--overlay-bg` | Frosted-glass background for all floating surfaces (dialogs, sheets, dropdowns, popovers, tooltips, chart tooltips). Applied via inline `style={{ backgroundColor: "var(--overlay-bg)", backdropFilter: "blur(16px) saturate(1.4)", WebkitBackdropFilter: "blur(16px) saturate(1.4)" }}` |

This replaces the old solid `bg-popover` on floating surfaces. All overlay components (Dialog, Sheet, DropdownMenu, Popover, Select, ChartTooltipContent) and the **sticky topbar** already have this applied — do NOT override it with `bg-*` classes.

### Sticky Topbar

The app topbar (`AppTopbar`) is `sticky top-0 z-30` with the frosted-glass overlay style. It stays visible on scroll and blurs content beneath it.

### Status Colors
| State | Background | Text |
|-------|------------|------|
| Success | `bg-success` or `bg-green-500/10` | `text-green-500` |
| Warning | `bg-warning` or `bg-yellow-500/10` | `text-yellow-500` |
| Error | `bg-destructive` or `bg-red-500/10` | `text-destructive` |
| Info | `bg-primary/10` | `text-primary` |

## Typography Scale

Information-dense by default. Use these sizes consistently.

| Element | Classes | Size |
|---------|---------|------|
| Page title | `text-2xl font-semibold tracking-tight` | 24px |
| Section title | `text-lg font-medium` | 18px |
| Card title | `text-base font-medium` | 16px |
| Body text | `text-sm` | 14px (default) |
| Labels | `text-sm font-medium` | 14px bold |
| Captions / metadata | `text-xs text-muted-foreground` | 12px |
| Badges | `text-xs font-medium` | 12px |

### Rules
- Max 3 text hierarchy levels visible at once (title → subtitle → body)
- Use `text-muted-foreground` for secondary information, not a lighter font weight
- Large numbers: always use `.toLocaleString()` for readability (1,234 not 1234)
- Dates: use relative format ("2 hours ago") for recent, absolute for old ("Jan 15, 2025")

## Spacing Scale (MANDATORY)

Use ONLY these values. Do not invent new spacing.

| Context | Value | Classes |
|---------|-------|---------|
| Page content padding | 16px → 24px | `p-4 md:p-6` |
| Between page sections | 24px | `space-y-6` |
| Card internal padding | shadcn default | `CardContent` |
| Form field gaps | 16px | `space-y-4` |
| Grid gaps | 16px or 24px | `gap-4` or `gap-6` |
| Inline element gaps | 8px | `gap-2` |
| Tight element gaps | 4px | `gap-1` |
| Between label and input | 8px | `space-y-2` |
| Between icon and text | 8px | `gap-2` |
| Button group gaps | 8px | `gap-2` |

### Spacing Violations to Avoid
- `p-3` for page content (use `p-4`)
- `p-5` for page content (use `p-4` or `p-6`)
- `space-y-3` between sections (use `space-y-4` or `space-y-6`)
- `gap-3` in grids (use `gap-4`)
- Any `p-7`, `p-8`, `space-y-7`, `space-y-8` (too loose for information-dense UI)

## Page Structure Template

Every app page MUST follow this structure:

```tsx
// p-4 md:p-6 padding — ALWAYS
// space-y-6 between sections — ALWAYS
<div className="flex-1 space-y-6 p-4 md:p-6">
  <PageHeader title="..." description="..." actions={...} />

  {/* Section 1 */}
  <Card>
    <CardHeader>
      <CardTitle>Section Title</CardTitle>
    </CardHeader>
    <CardContent>
      {/* content */}
    </CardContent>
  </Card>

  {/* Section 2 */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* grid items */}
  </div>
</div>
```

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| default | 320px+ | Mobile — single column, full-width cards |
| `sm:` | 640px | Small tablet — 2-column grids |
| `md:` | 768px | Tablet — sidebar visible, page padding increases |
| `lg:` | 1024px | Desktop — 3-column grids, detail sidebars |

### Responsive Patterns
```
Grid:         grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
Page padding: p-4 md:p-6
Sidebar:      hidden md:flex (sheet/drawer on mobile)
Detail panel: full-page on mobile, sidebar on lg:
Font size:    same on all sizes (don't scale up)
```

## Touch Targets

All interactive elements: minimum 44px on mobile.

```tsx
// Good — 40px button with padding to reach 44px
<Button size="default" className="h-10">Click</Button>

// Bad — tiny target
<button className="text-xs p-1">Click</button>
```

## Interactive States

Every interactive element MUST have ALL of these:

| State | Classes |
|-------|---------|
| Default | Base styles |
| Hover | `hover:bg-accent hover:text-accent-foreground` |
| Focus | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Disabled | `disabled:opacity-50 disabled:pointer-events-none` |
| Loading | Inline `Loader2` spinner + disabled |
| Active/Selected | `bg-primary text-primary-foreground` or `data-[state=active]` |

### Button Loading Pattern
```tsx
<Button disabled={isPending}>
  {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
  {isPending ? "Saving..." : "Save"}
</Button>
```

## Animations

Only use presets from `@/components/shared/motion.tsx`:

| Preset | Usage |
|--------|-------|
| `FadeIn` | Default entrance — opacity 0→1, 200ms |
| `SlideUp` | Cards, sections — translateY 8→0 + fade, 200ms |
| `ScaleIn` | Modals, popovers — scale 0.95→1 + fade, 150ms |
| `StaggerList` + `StaggerItem` | Lists — sequential fade for items |

DO NOT create custom animations. DO NOT use `framer-motion` features beyond these presets.

### When to Use Motion

| Page Section | Wrapper | Why |
|-------------|---------|-----|
| Landing hero | `FadeIn` | Subtle entrance, doesn't overwhelm |
| Landing features grid | `StaggerList` + `StaggerItem` | Sequential reveal draws attention |
| Landing how-it-works | `StaggerList` + `StaggerItem` | Same pattern as features |
| Landing CTA | `SlideUp` | Draws eye to the call to action |
| Dashboard stat cards | `StaggerList` + `StaggerItem` | Stats appear one by one |
| Dashboard activity/content | `SlideUp` | Content slides up after stats |
| Detail page sections | `FadeIn` | Gentle entrance for content-heavy pages |
| Modals/dialogs | `ScaleIn` | Standard dialog entrance |

Pages should feel alive on first load, not static. But don't over-animate — one entrance animation per section is enough.

## Grids

```
Stats:    grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
Cards:    grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
Features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

## Shadows & Elevation

Elevation comes primarily from surface color differences, not shadows. A full shadow scale is defined in CSS custom properties (`--shadow-2xs` through `--shadow-2xl`) with light/dark variants — dark mode shadows are more opaque.

- Cards at rest: border only, no shadow
- Cards on hover (interactive): `hover:shadow-sm` via the `hover-lift` CSS class
- Primary CTA buttons: `shadow-sm` for subtle depth
- Dropdowns/popovers: `shadow-md`
- Dialogs/sheets: `shadow-lg`
- Chart tooltips: `shadow-xl`

### Border Radius

Base radius: `--radius: 8px`. All radius tokens (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`) resolve to the same `8px` value for a uniform, consistent look across all elements.

## Interactive Glow Effect

Checkbox, RadioGroup, and Switch all have a subtle primary-colored glow when checked/active:

```
data-[state=checked]:shadow-[0_0_6px_1px] data-[state=checked]:shadow-primary/40
```

This is already applied to all three components. Do NOT remove it or add custom glow effects — use this pattern consistently for all toggleable inputs.

## Letter Spacing

A base `--tracking-normal: -0.01em` is applied to the body. The tracking scale is:

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-tighter` | -0.06em | Large marketing headings |
| `tracking-tight` | -0.035em | Page titles, stat card values |
| `tracking-normal` | -0.01em | Body text (default) |
| `tracking-wide` | 0.015em | All-caps labels (rarely used) |

### Hover Utilities

Two CSS utility classes for interactive feedback:

| Class | Effect | Use On |
|-------|--------|--------|
| `hover-lift` | Subtle `border-color` transition on hover | Feature cards, stat cards, interactive list items |
| `press-down` | `scale(0.98)` on active | Buttons, clickable cards |

These are CSS transitions (not keyframe animations), so they stay within the "no custom animations" constraint.

### Cursor

All interactive elements (buttons, checkboxes, radio buttons, switches, select triggers, tabs, dropdown items, command items) use `cursor-pointer`. Disabled elements use `cursor-not-allowed`. This is already applied to all UI primitives.

### Auto-Hiding Scrollbars

Scrollbars are invisible by default and appear on hover (using `scrollbar-width: thin` and custom `::-webkit-scrollbar` styles). This keeps the UI clean and reduces visual clutter. The scrollbar thumb uses `var(--border)` color.

### Micro-Animations

Floating surfaces (popovers, dropdowns) use subtle scale micro-animations via CSS custom properties:
- **Open:** 120ms, `cubic-bezier(0.16, 1, 0.3, 1)`, scale from 0.98
- **Close:** 80ms, `cubic-bezier(0.4, 0, 1, 1)`, scale to 0.98
- **Slide distance:** `slide-in-from-*-1` (4px), not `slide-in-from-*-2`

Sheet animations use a "gravity-feel" curve:
- **Open:** 400ms, `cubic-bezier(0.16, 1, 0.3, 1)` — fast start, soft landing
- **Close:** 200ms, `cubic-bezier(0.5, 0, 1, 1)` — accelerates away

These are defined in `globals.css` via `data-slot` selectors. Do NOT override animation timing on individual components.

### Grain Texture

A subtle SVG noise grain overlay (`body::after`) adds texture at `opacity: 0.06`. This is a global effect — do not remove or duplicate it.

## Content Overflow

| Content Type | Handling |
|-------------|----------|
| Single-line text | `truncate` (ellipsis) |
| Multi-line text | `line-clamp-2` or `line-clamp-3` |
| Long URLs/IDs | `truncate` + copy button |
| Tables | Horizontal scroll on mobile (`overflow-x-auto`) |
| Images | `object-cover` with aspect ratio (`aspect-video`, `aspect-square`) |

## Icons

- Library: `lucide-react` (import individually for tree-shaking)
- Inline with text: `h-4 w-4`
- In buttons: `h-4 w-4` (left of label with `gap-2`)
- Empty states: `h-8 w-8` or `h-12 w-12`
- Page features: `h-5 w-5`
- Never use emoji as icons
