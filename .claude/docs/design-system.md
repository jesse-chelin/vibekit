# Design System

## The One Rule

**Page content padding is ALWAYS `p-4 md:p-6`. Every page. No exceptions.**

This single rule prevents the most common layout inconsistency in AI-generated apps. Internalize it.

## Color Tokens

All colors use CSS custom properties via Tailwind. NEVER use raw hex, rgb, oklch, or opacity values.

### Backgrounds
| Token | Usage |
|-------|-------|
| `bg-background` | Page background (darkest) |
| `bg-card` | Cards, dialogs, popovers |
| `bg-muted` | Subtle backgrounds, disabled states |
| `bg-popover` | Dropdowns, tooltips |
| `bg-primary` | Primary action buttons |
| `bg-destructive` | Danger buttons, error backgrounds |
| `bg-primary/10` | Subtle accent tint (badges, highlights) |

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

## Grids

```
Stats:    grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
Cards:    grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
Features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

## Shadows & Elevation

Minimal — this is a dark-first, flat design:
- Cards: border only, no shadow
- Dialogs: `shadow-lg` (subtle)
- Dropdowns: `shadow-md`
- Do NOT use `shadow-xl` or `shadow-2xl`

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
