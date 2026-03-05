---
description: Verify UI matches vibekit design system and component conventions
---

Audit a component or page against the vibekit design system. Check for brand consistency and correct use of design tokens.

## Design System Reference

### Color Tokens (use these, never raw hex/oklch)
- **Backgrounds:** `bg-background`, `bg-card`, `bg-muted`, `bg-popover`
- **Text:** `text-foreground`, `text-muted-foreground`, `text-card-foreground`
- **Accent:** `bg-primary`, `text-primary`, `bg-primary/10` (subtle tint)
- **Borders:** `border-border`, `border-input`
- **Status:** `bg-destructive` / `text-destructive`, `bg-success`, `bg-warning`

### Typography
- Body: `text-sm` (14px) — information-dense default
- Page titles: `text-2xl font-semibold tracking-tight`
- Section titles: `text-lg font-medium`
- Labels: `text-sm font-medium`
- Captions/metadata: `text-xs text-muted-foreground`

### Spacing
- Page padding: `p-4 md:p-6` (NO other values)
- Section gaps: `space-y-6`
- Card padding: default from shadcn Card
- Form field gaps: `space-y-4`
- Grid gaps: `gap-4` or `gap-6`
- Inline gaps: `gap-2`

### Interactive States
- Hover: token-based hover variant (`hover:bg-accent`, `hover:text-accent-foreground`)
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Disabled: `disabled:opacity-50 disabled:pointer-events-none`
- Selected: `data-[state=active]:bg-background` or `bg-primary text-primary-foreground`

### Shared Components (use these, don't rebuild)
- `PageHeader` — Page title + description + action buttons
- `EmptyState` — Empty list/table placeholder with icon + CTA
- `StatCard` — Metric + trend
- `DataTable` — Sortable, filterable table
- `ConfirmDialog` — Destructive action confirmation
- `FormSection` — Grouped form fields
- `SettingsLayout` — Tabbed settings pages
- `DetailLayout` — Main + sidebar detail view

### Icons
- Library: `lucide-react` (import individually)
- Sizes: `h-4 w-4` inline, `h-5 w-5` buttons, `h-8 w-8` or `h-12 w-12` for empty states
- Never use emoji as icons in the UI

## Audit Checklist

For the target component ($ARGUMENTS):

1. **Color usage** — No raw hex/rgb/oklch values; all colors from semantic tokens
2. **Component reuse** — Uses shared pattern components where applicable (no custom empty state, no custom card layouts)
3. **Typography** — Correct font sizes and weights per hierarchy
4. **Spacing** — Consistent with `p-4 md:p-6` page padding, `space-y-6` sections
5. **Responsive** — Mobile layout works (no horizontal overflow, touch-friendly targets)
6. **States** — Loading skeleton, error state, empty state all present
7. **Hover/focus** — Interactive elements have visible hover + focus-visible states
8. **Borders** — Uses `border-border`, not arbitrary opacity values
9. **Animations** — Uses motion.tsx presets only (fadeIn, slideUp, scaleIn, staggerChildren)
10. **Dark/light** — Works in both themes (no hardcoded colors)

Report violations with file:line and the correct fix.
