"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MapMarker {
  position: [number, number];
  popup?: string;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  height?: string;
}

export function Map({
  center = [51.505, -0.09],
  zoom = 13,
  markers = [],
  className,
  height = "400px",
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!).setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      markers.forEach((marker) => {
        const m = L.marker(marker.position).addTo(map);
        if (marker.popup) m.bindPopup(marker.popup);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers]);

  return <div ref={mapRef} className={cn("rounded-lg border", className)} style={{ height }} />;
}
