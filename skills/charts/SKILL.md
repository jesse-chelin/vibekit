---
name: charts
description: Adds Recharts dashboard components with 6 chart types (line, bar, area, pie, donut, sparkline) and a ChartCard wrapper. Use when the user needs data visualization, dashboards with graphs, analytics displays, or mentions charts/graphs/metrics.
---

# Charts — Recharts Dashboard Components

Six chart types wrapped in consistent, theme-aware components with a `ChartCard` pattern for dashboards. Built on Recharts with dark mode support.

## When NOT to Use

- User only needs simple numeric displays (use stat-card pattern instead)
- User needs complex data grids or pivot tables (use data-table pattern instead)
- User needs real-time updating charts (charts are static renders — pair with tRPC polling for live data)

## What It Adds

| File | Purpose |
|------|---------|
| `src/components/patterns/charts.tsx` | 6 chart components: LineChart, BarChart, AreaChart, PieChart, DonutChart, SparklineChart |
| `src/components/patterns/chart-card.tsx` | Card wrapper with title, description, and chart slot |

## Setup

No configuration needed. The skill installs `recharts` as a dependency. Charts are client components (they require browser APIs for rendering).

## Chart Types

| Component | Best For | Data Shape |
|-----------|----------|------------|
| `LineChart` | Trends over time | `{ name: string, value: number }[]` |
| `BarChart` | Comparing categories | `{ name: string, value: number }[]` |
| `AreaChart` | Volume over time | `{ name: string, value: number }[]` |
| `PieChart` | Part-of-whole | `{ name: string, value: number }[]` |
| `DonutChart` | Part-of-whole (with center space) | `{ name: string, value: number }[]` |
| `SparklineChart` | Inline trend indicator | `number[]` |

## Usage

### Basic Chart in a Dashboard

```tsx
"use client";

import { LineChart } from "@/components/patterns/charts";
import { ChartCard } from "@/components/patterns/chart-card";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
];

export function RevenueChart() {
  return (
    <ChartCard title="Revenue" description="Monthly revenue trend">
      <LineChart data={data} />
    </ChartCard>
  );
}
```

### Sparkline in a Stat Card

```tsx
import { SparklineChart } from "@/components/patterns/charts";

<SparklineChart data={[10, 25, 18, 30, 22, 35, 28]} height={40} />
```

### Multiple Data Series

```tsx
const multiData = [
  { name: "Jan", revenue: 400, expenses: 300 },
  { name: "Feb", revenue: 500, expenses: 280 },
];

<BarChart data={multiData} dataKeys={["revenue", "expenses"]} />
```

## With Live Data (tRPC)

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { LineChart } from "@/components/patterns/charts";
import { ChartCard } from "@/components/patterns/chart-card";

export function LiveMetricsChart() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.analytics.getMetrics.queryOptions());

  return (
    <ChartCard title="Active Users" description="Last 7 days">
      <LineChart data={data ?? []} />
    </ChartCard>
  );
}
```

## Troubleshooting

**Chart not rendering**: Charts are client components — they must be in a `"use client"` file or imported from one. They won't render in Server Components.

**Dark mode colors wrong**: Charts use CSS custom properties from the design system. If colors look off, check that the theme provider is wrapping the chart.

**Responsive sizing**: Charts fill their parent container's width. Wrap in a fixed-width container or use CSS grid to control sizing.
