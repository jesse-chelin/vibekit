---
name: i18n
description: Adds internationalization with next-intl supporting 5 languages (English, Spanish, French, German, Japanese). Use when the user wants multi-language support, locale switching, translated UI, or mentions internationalization/i18n/localization.
---

# i18n — Internationalization

Full internationalization with next-intl: 5 languages, locale switcher component, routing helpers, and comprehensive translation coverage for all app screens.

## What It Adds

| File | Purpose |
|------|---------|
| `src/i18n/config.ts` | Locale list, names, and type definitions |
| `src/i18n/request.ts` | next-intl server request configuration |
| `src/i18n/routing.ts` | Locale routing definition |
| `src/i18n/navigation.ts` | Internationalized Link, redirect, usePathname, useRouter |
| `src/i18n/messages/en.json` | English translations (complete) |
| `src/i18n/messages/es.json` | Spanish translations (complete) |
| `src/i18n/messages/fr.json` | French translations (complete) |
| `src/i18n/messages/de.json` | German translations (complete) |
| `src/i18n/messages/ja.json` | Japanese translations (complete) |
| `src/components/patterns/locale-switcher.tsx` | Dropdown locale switcher component |

## When NOT to Use

- The app will only ever be used in one language
- User wants machine translation only (this uses hand-written translations — suggest a translation API for auto-translation)
- User needs right-to-left (RTL) layout support for Arabic/Hebrew (this skill doesn't include RTL CSS — it would need to be added)

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. User knows which languages they need (this skill includes en, es, fr, de, ja)
2. User understands new translation keys must be added to ALL language files when adding features
3. If the app already has hardcoded English strings, they'll need to be replaced with translation keys

## Languages

| Code | Language | Coverage |
|------|----------|----------|
| `en` | English | Full |
| `es` | Español (Latin American) | Full |
| `fr` | Français (European) | Full |
| `de` | Deutsch | Full |
| `ja` | 日本語 | Full |

## Setup

### 1. Install Dependencies

The skill installs `next-intl` automatically.

### 2. Add Provider

Wrap your root layout with the next-intl provider. In `src/app/layout.tsx`:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({ children }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### 3. Add Locale Switcher

Add the `LocaleSwitcher` component to your navigation or settings page:

```tsx
import { LocaleSwitcher } from '@/components/patterns/locale-switcher';
```

## Usage

### In Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  return <h1>{t('title')}</h1>;
}
```

### In Client Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>;
}
```

### Navigation

Use the internationalized navigation helpers instead of `next/link`:

```tsx
import { Link } from '@/i18n/navigation';

<Link href="/dashboard">Dashboard</Link>
```

## Translation Keys Structure

```
common.*       — Shared UI text (save, cancel, delete, etc.)
nav.*          — Navigation labels
auth.*         — Authentication screens
dashboard.*    — Dashboard page
projects.*     — Project management
tasks.*        — Task management
settings.*     — Settings pages
errors.*       — Error pages and messages
onboarding.*   — Onboarding wizard
```

## Adding a New Language

1. Create `src/i18n/messages/xx.json` (copy `en.json` as template)
2. Translate all keys
3. Add the locale code to `src/i18n/config.ts` and `src/i18n/routing.ts`
4. Add the locale name to `localeNames` in `config.ts`

## Troubleshooting

**Missing translations show key names**: Make sure all keys exist in the language file. next-intl falls back to the key name if a translation is missing.

**Locale not changing**: The `LocaleSwitcher` stores the preference in a cookie. Make sure cookies are not blocked.

**Server component translations not working**: Ensure `getMessages()` is called in the layout and passed to `NextIntlClientProvider`.
