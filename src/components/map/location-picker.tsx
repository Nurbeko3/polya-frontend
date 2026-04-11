"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface LocationValue {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

interface LocationPickerProps {
  value?: LocationValue | null;
  onChange: (val: LocationValue) => void;
}

function makePinEl(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    display:flex; flex-direction:column; align-items:center;
    cursor:grab; transition:transform 0.2s;
  `;
  el.innerHTML = `
    <div style="
      width:36px; height:36px;
      background:#2563eb; border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 4px 16px rgba(37,99,235,0.5), 0 0 0 3px white;
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="transform:rotate(45deg); font-size:14px; line-height:1; display:block;">📍</span>
    </div>
    <div style="
      width:6px; height:6px; background:#2563eb;
      border-radius:50%; margin-top:-2px; opacity:0.5;
    "></div>
  `;
  return el;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz,ru,en`,
      { headers: { "Accept-Language": "uz,ru,en" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const road = addr.road || addr.pedestrian || addr.street || "";
    const suburb = addr.suburb || addr.neighbourhood || addr.quarter || "";
    const city =
      addr.city || addr.town || addr.village || addr.county || "Toshkent";
    const address = [road, suburb].filter(Boolean).join(", ") || data.display_name?.split(",")[0] || "";
    return { address, city };
  } catch {
    return { address: "", city: "Toshkent" };
  }
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const placeMarker = useCallback(
    async (lng: number, lat: number) => {
      const map = mapRef.current;
      if (!map) return;

      markerRef.current?.remove();

      const el = makePinEl();

      markerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, 6], draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current.on("dragend", async () => {
        const { lng: newLng, lat: newLat } = markerRef.current!.getLngLat();
        const geo = await reverseGeocode(newLat, newLng);
        onChange({ lat: newLat, lng: newLng, ...geo });
      });

      const geo = await reverseGeocode(lat, lng);
      onChange({ lat, lng, ...geo });
    },
    [onChange]
  );

  /* ── Init map ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial: [number, number] = value
      ? [value.lng, value.lat]
      : [69.2401, 41.2995];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: initial,
      zoom: value ? 15 : 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("click", (e) => placeMarker(e.lngLat.lng, e.lngLat.lat));

    mapRef.current = map;

    if (value) {
      map.once("load", () => placeMarkerSilent(value.lng, value.lat));
    }

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent marker (no geocode, for restoring saved value)
  const placeMarkerSilent = (lng: number, lat: number) => {
    const map = mapRef.current;
    if (!map) return;
    markerRef.current?.remove();
    const el = makePinEl();
    markerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, 6], draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    markerRef.current.on("dragend", async () => {
      const { lng: nLng, lat: nLat } = markerRef.current!.getLngLat();
      const geo = await reverseGeocode(nLat, nLng);
      onChange({ lat: nLat, lng: nLng, ...geo });
    });
  };

  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 16, duration: 800 });
        placeMarker(coords.longitude, coords.latitude);
      },
      () => {}
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10" style={{ height: 280 }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Instruction overlay */}
      {!value && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/30">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-white/70 whitespace-nowrap">
              📍 Xaritani bosib lokatsiyani belgilang
            </p>
          </div>
        </div>
      )}

      {/* Selected coords */}
      {value && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/30">
            <p className="text-[10px] font-black text-emerald-600">✓ Lokatsiya belgilandi</p>
            <p className="text-[10px] text-slate-500 dark:text-white/50 font-medium">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </p>
          </div>
        </div>
      )}

      {/* My location button */}
      <button
        type="button"
        onClick={handleMyLocation}
        className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-xl bg-white dark:bg-slate-800
                   shadow-lg border border-slate-200 dark:border-slate-700
                   flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="Mening joylashuvim"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 4" />
        </svg>
      </button>

      <style>{`
        .maplibregl-ctrl-top-right { top: 6px !important; right: 6px !important; }
        .maplibregl-ctrl-group { border-radius: 12px !important; overflow: hidden; }
      `}</style>
    </div>
  );
}
