---
name: maps
description: Adds interactive Leaflet maps with markers, popups, geocoding, and a location picker component. Use when the user needs maps, location features, address selection, mentions maps/geolocation, or is building anything location-based. No API key required.
---

# Maps — Leaflet Integration

Interactive maps using Leaflet — no API key required, free and open-source. Includes marker components, popups, geocoding via Nominatim, and a location picker for forms.

## When NOT to Use

- User needs satellite imagery or Street View (use Google Maps API instead)
- User needs driving directions or route optimization (Leaflet doesn't include routing)
- User needs indoor maps or floor plans
- The app has no location-related features

## What It Adds

| File | Purpose |
|------|---------|
| `src/components/patterns/map.tsx` | Map component with markers, popups, and clustering |
| `src/components/patterns/location-picker.tsx` | Form field: click-to-select location with geocoding |
| `src/lib/geocoding.ts` | Nominatim geocoding (address → coordinates, coordinates → address) |

## Setup

No API keys or configuration needed. The skill installs `leaflet`, `react-leaflet`, and `@types/leaflet`.

IMPORTANT: Leaflet requires CSS to render correctly. The map component imports Leaflet CSS automatically, but if you use maps outside the provided components, include:
```tsx
import "leaflet/dist/leaflet.css";
```

## Usage

### Basic Map with Markers

```tsx
"use client";

import { Map } from "@/components/patterns/map";

const markers = [
  { position: [51.505, -0.09] as [number, number], popup: "London" },
  { position: [48.856, 2.352] as [number, number], popup: "Paris" },
];

export function StoreMap() {
  return <Map center={[51.505, -0.09]} zoom={5} markers={markers} className="h-96" />;
}
```

### Location Picker in a Form

```tsx
"use client";

import { LocationPicker } from "@/components/patterns/location-picker";

export function CreateEventForm() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <LocationPicker
      value={location}
      onChange={setLocation}
      placeholder="Click the map to select a location"
    />
  );
}
```

### Geocoding (Address Lookup)

```typescript
import { geocode, reverseGeocode } from "@/lib/geocoding";

// Address → coordinates
const results = await geocode("1600 Pennsylvania Ave, Washington DC");
// [{ lat: 38.8977, lng: -77.0365, displayName: "White House..." }]

// Coordinates → address
const address = await reverseGeocode(38.8977, -77.0365);
// "1600 Pennsylvania Avenue NW, Washington, DC 20500"
```

## Architecture

- Maps are client components (Leaflet requires the DOM)
- Tiles load from OpenStreetMap's free tile server
- Geocoding uses Nominatim (free, rate-limited to 1 req/second)
- No data leaves your server except tile requests and geocoding queries

### Rate Limiting Note

Nominatim's usage policy allows max 1 request per second. The geocoding helper includes built-in rate limiting. For high-volume geocoding, consider a paid provider (Mapbox, Google).

## Troubleshooting

**Map shows gray tiles**: Leaflet CSS is not loaded. Ensure `leaflet/dist/leaflet.css` is imported.

**Map not rendering**: Leaflet needs a container with explicit height. Add `className="h-96"` or a fixed height.

**Markers invisible**: Default Leaflet marker icons reference images from `node_modules`. The Map component uses inline SVG markers to avoid this issue.

**Geocoding returns empty results**: Nominatim requires specific address formats. Try a simpler query (city name instead of full address).
