"use client";

import { useCallback, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

interface LocaleSwitcherProps {
  currentLocale: Locale;
  onLocaleChange?: (locale: Locale) => void;
  className?: string;
}

/**
 * Locale switcher dropdown. Stores preference in a cookie and reloads
 * to apply the new locale. Pass `onLocaleChange` to handle custom logic
 * (e.g. next-intl router-based locale switching).
 */
export function LocaleSwitcher({
  currentLocale,
  onLocaleChange,
  className,
}: LocaleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (value: string) => {
      const locale = value as Locale;

      if (onLocaleChange) {
        startTransition(() => {
          onLocaleChange(locale);
        });
        return;
      }

      // Default: store in cookie and reload
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
      window.location.reload();
    },
    [onLocaleChange]
  );

  return (
    <Select value={currentLocale} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className={className ?? "w-36"}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
