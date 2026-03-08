"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterDefinition[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  className,
}: FilterBarProps) {
  const activeEntries = Object.entries(activeFilters).filter(
    ([, v]) => v && v !== "all"
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={activeFilters[filter.key] ?? "all"}
            onValueChange={(v) => onFilterChange(filter.key, v)}
          >
            <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      {activeEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {activeEntries.map(([key, val]) => {
            const filterDef = filters.find((f) => f.key === key);
            const optLabel = filterDef?.options.find(
              (o) => o.value === val
            )?.label;
            return (
              <Badge key={key} variant="secondary" className="gap-1 pr-1">
                {filterDef?.label}: {optLabel ?? val}
                <button
                  type="button"
                  onClick={() => onFilterChange(key, "all")}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
