"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

// ─── Rolling Number ───────────────────────────────────────────────────────────

function RollingNumber({ value }: { value: string | number }) {
  const str = String(value);
  // Split into numeric chunks and non-numeric chunks
  const parts = str.match(/(\d+\.?\d*)|([^\d]+)/g) || [str];

  return (
    <span className="inline-flex items-baseline overflow-hidden">
      {parts.map((part, i) => {
        if (/^\d+\.?\d*$/.test(part)) {
          return <RollingDigits key={i} value={part} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function RollingDigits({ value }: { value: string }) {
  const chars = value.split("");

  return (
    <span className="inline-flex">
      {chars.map((char, i) =>
        char === "." ? (
          <span key={i}>.</span>
        ) : (
          <RollingDigit key={i} digit={parseInt(char, 10)} delay={i * 60} />
        )
      )}
    </span>
  );
}

function RollingDigit({ digit, delay }: { digit: number; delay: number }) {
  const [mounted, setMounted] = useState(false);
  const prevDigitRef = useRef(digit);
  const [animating, setAnimating] = useState(false);

  // Initial mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Animate on value change after mount
  useEffect(() => {
    if (!mounted) return;
    if (digit !== prevDigitRef.current) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 500);
      prevDigitRef.current = digit;
      return () => clearTimeout(timer);
    }
  }, [digit, mounted]);

  // Use top offset instead of transform to avoid compounding with parent transforms (e.g. hover-lift)
  const offset = mounted ? -digit * 1.2 : 1.2;

  return (
    <span
      className="inline-block relative overflow-hidden"
      style={{ width: "0.6em", height: "1.2em" }}
    >
      <span
        className="absolute inset-x-0 flex flex-col items-center ease-out"
        style={{
          top: `${offset}em`,
          transitionProperty: "top",
          transitionDuration: animating ? "500ms" : mounted ? "800ms" : "0ms",
          transitionDelay: mounted && !animating ? `${delay}ms` : "0ms",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="flex items-center justify-center"
            style={{ height: "1.2em" }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  trend,
  className,
}: StatCardProps) {
  const iconBg = iconColor
    ? iconColor.replace("text-", "bg-").replace(/(\w+-\d+)/, "$1/10")
    : "bg-primary/10";
  const iconText = iconColor || "text-primary";

  return (
    <Card className={cn("hover-lift hover:border-primary/30 gap-0 p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              iconBg
            )}
          >
            <Icon className={cn("h-4 w-4", iconText)} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight">
        <RollingNumber value={value} />
      </p>
      {(description || trend) && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {trend && (
            <>
              {trend.value >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span
                className={cn(
                  "font-medium",
                  trend.value >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            </>
          )}
          {description && <span>{description}</span>}
        </div>
      )}
    </Card>
  );
}
