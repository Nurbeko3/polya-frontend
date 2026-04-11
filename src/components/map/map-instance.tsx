"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Field } from "@/types";
import Link from "next/link";

const FIELD_COLORS: Record<string, string> = {
  football: "#10b981",
  tennis: "#f59e0b",
  basketball: "#f97316",
  volleyball: "#8b5cf6",
};
const FIELD_ICONS: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

function createMarkerEl(field: Field): HTMLElement {
  const color = FIELD_COLORS[field.field_type] || "#2563eb";
  const icon = FIELD_ICONS[field.field_type] || "🏟️";

  const el = document.createElement("div");
  el.style.cssText = `
    display:flex; flex-direction:column; align-items:center;
    cursor:pointer; transition:transform 0.2s;
  `;

  // SVG pin — uchi pastga, anchor:bottom bilan to'g'ri joylashadi
  el.innerHTML = `
    <div style="
      position:relative; width:42px; height:42px;
      background:${color}; border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 4px 16px ${color}66, 0 0 0 3px white;
      display:flex; align-items:center; justify-content:center;
      transition:transform 0.2s, box-shadow 0.2s;
    " class="pin-body">
      <span style="transform:rotate(45deg); font-size:18px; line-height:1; display:block;">${icon}</span>
    </div>
    <div style="
      width:8px; height:8px; background:${color};
      border-radius:50%; margin-top:-2px; opacity:0.5;
      box-shadow:0 2px 6px ${color}55;
    "></div>
  `;

  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.2) translateY(-4px)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1) translateY(0)";
  });

  return el;
}

function popupHtml(field: Field): string {
  const icon = FIELD_ICONS[field.field_type] || "🏟️";
  return `
    <div style="width:220px;font-family:inherit;border-radius:16px;overflow:hidden;">
      ${field.image_url
        ? `<img src="${field.image_url}" alt="${field.name}"
              style="width:100%;height:110px;object-fit:cover;display:block;" />`
        : `<div style="width:100%;height:80px;background:linear-gradient(135deg,#1e293b,#334155);
                        display:flex;align-items:center;justify-content:center;font-size:36px;">${icon}</div>`
      }
      <div style="padding:12px 14px 14px;">
        <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;
                    color:#64748b;margin-bottom:4px;">${field.field_type}</div>
        <div style="font-size:15px;font-weight:900;color:#0f172a;margin-bottom:4px;
                    line-height:1.2;">${field.name}</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:10px;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${field.city}, ${field.address}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:16px;font-weight:900;color:#2563eb;">
            ${field.price_per_hour.toLocaleString()} so'm/s
          </span>
          ${field.rating > 0 ? `<span style="font-size:11px;font-weight:700;color:#f59e0b;">★ ${field.rating.toFixed(1)}</span>` : ""}
        </div>
        <a href="/fields/${field.id}"
           style="display:block;text-align:center;padding:10px;border-radius:12px;
                  background:#2563eb;color:white;font-size:11px;font-weight:900;
                  text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;">
          Bron qilish →
        </a>
      </div>
    </div>
  `;
}

interface MapInstanceProps {
  fields: Field[];
}

export default function MapInstance({ fields }: MapInstanceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  /* ── Init map ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [69.2401, 41.2995], // Tashkent
      zoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  /* ── Field markers ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const fieldsWithCoords = fields.filter((f) => f.latitude && f.longitude);

    const addMarkers = () => {
      fieldsWithCoords.forEach((field) => {
        const el = createMarkerEl(field);
        const popup = new maplibregl.Popup({
          offset: 30,
          closeButton: false,
          maxWidth: "240px",
          className: "polya-popup",
        }).setHTML(popupHtml(field));

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, 6] })
          .setLngLat([field.longitude!, field.latitude!])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit bounds if markers exist
      if (fieldsWithCoords.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        fieldsWithCoords.forEach((f) => bounds.extend([f.longitude!, f.latitude!]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 });
      } else if (fieldsWithCoords.length === 1) {
        map.flyTo({
          center: [fieldsWithCoords[0].longitude!, fieldsWithCoords[0].latitude!],
          zoom: 15, duration: 1000,
        });
      }
    };

    if (map.isStyleLoaded()) {
      addMarkers();
    } else {
      map.once("load", addMarkers);
    }
  }, [fields]);

  /* ── User location ── */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setUserLocation([coords.longitude, coords.latitude]),
      () => {}
    );
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    userMarkerRef.current?.remove();

    const el = document.createElement("div");
    el.style.cssText = `
      width:18px; height:18px; border-radius:50%;
      background:#2563eb; border:3px solid white;
      box-shadow:0 0 0 4px rgba(37,99,235,0.25), 0 4px 12px rgba(37,99,235,0.4);
    `;
    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map);
  }, [userLocation]);

  const flyToUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.flyTo({ center: userLocation, zoom: 15, duration: 800 });
  };

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />

      {/* My Location button */}
      <button
        onClick={flyToUser}
        className="absolute bottom-24 right-4 z-[10] w-11 h-11 rounded-2xl bg-white dark:bg-slate-800
                   shadow-xl border border-slate-200 dark:border-slate-700
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
        .polya-popup .maplibregl-popup-content {
          padding: 0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
          border: none;
        }
        .polya-popup .maplibregl-popup-tip { display: none; }
        .maplibregl-ctrl-bottom-right { bottom: 80px !important; right: 8px !important; }
        .maplibregl-ctrl-bottom-left  { bottom: 8px  !important; left: 8px  !important; }
      `}</style>
    </div>
  );
}
