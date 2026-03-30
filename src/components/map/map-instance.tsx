"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Field } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LocateIcon } from "lucide-react";

// Fix for default marker icons in Leaflet with Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function RecenterButton({ coords }: { coords: [number, number] }) {
  const map = useMap();
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        map.setView(coords, map.getZoom());
      }}
      className="absolute bottom-6 right-6 z-[1000] bg-white dark:bg-slate-800 p-3 rounded-full shadow-2xl border dark:border-slate-700 hover:scale-110 active:scale-95 transition-all text-primary pointer-events-auto"
      title="Mening joylashuvim"
    >
      <LocateIcon className="w-6 h-6" />
    </button>
  );
}

interface MapInstanceProps {
  fields: Field[];
}

export default function MapInstance({ fields }: MapInstanceProps) {
  const [userLocation, setUserLocation] = useState<[number, number]>([41.2995, 69.2401]); // Default to Tashkent

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:invert dark:hue-rotate-[180deg] dark:brightness-[0.6] dark:contrast-[1.2]"
        />
        
        {fields.map((field) => (
          field.latitude && field.longitude && (
            <Marker 
              key={field.id} 
              position={[field.latitude, field.longitude]}
            >
              <Popup keepInView>
                <div className="p-1 min-w-[200px] font-sans">
                  {field.image_url && (
                    <img src={field.image_url} alt={field.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <h3 className="font-bold text-sm mb-0.5 text-slate-900">{field.name}</h3>
                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">{field.address}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary">{field.price_per_hour.toLocaleString()} so'm/s</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <span className="text-xs font-black">{field.rating}</span>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                    </div>
                  </div>
                  <Link href={`/fields/${field.id}`}>
                    <Button size="sm" className="w-full h-9 text-xs font-bold tracking-tight rounded-xl">
                      BRON QILISH
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        <RecenterButton coords={userLocation} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 4px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid white;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
        .leaflet-popup-content {
          margin: 8px;
        }
        .leaflet-container {
          background: #f8fafc;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
