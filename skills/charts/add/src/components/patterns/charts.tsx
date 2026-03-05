"use client";

import {
  LineChart as RechartsLine,
  Line,
  BarChart as RechartsBar,
  Bar,
  AreaChart as RechartsArea,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

interface ChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
}

export function LineChart({ data, dataKey, xAxisKey = "name", height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xAxisKey} stroke="var(--muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
        <Line type="monotone" dataKey={dataKey} stroke="var(--chart-1)" strokeWidth={2} dot={false} />
      </RechartsLine>
    </ResponsiveContainer>
  );
}

export function BarChart({ data, dataKey, xAxisKey = "name", height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xAxisKey} stroke="var(--muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
        <Bar dataKey={dataKey} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}

export function AreaChart({ data, dataKey, xAxisKey = "name", height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xAxisKey} stroke="var(--muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
        <Area type="monotone" dataKey={dataKey} stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.1} />
      </RechartsArea>
    </ResponsiveContainer>
  );
}

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
  innerRadius?: number;
}

export function PieChartComponent({ data, height = 300, innerRadius = 0 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={80} dataKey="value" label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
      </RechartsPie>
    </ResponsiveContainer>
  );
}

export function DonutChart(props: Omit<PieChartProps, "innerRadius">) {
  return <PieChartComponent {...props} innerRadius={50} />;
}

export function Sparkline({ data, dataKey, height = 40 }: { data: Record<string, unknown>[]; dataKey: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data}>
        <Line type="monotone" dataKey={dataKey} stroke="var(--chart-1)" strokeWidth={1.5} dot={false} />
      </RechartsLine>
    </ResponsiveContainer>
  );
}
