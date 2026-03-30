"use client";

import { useState, useEffect } from "react";
import { Field } from "@/types";
import { ArrowLeftIcon, MapIcon, LocateIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import dynamic from "next/dynamic";

// The actual map logic stays in a client-side only component
const MapInstance = dynamic(() => import("@/components/map/map-instance"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse">
      <MapIcon className="w-12 h-12 text-slate-300 animate-bounce" />
    </div>
  )
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

export default function MapPage() {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    // Fetch fields
    fetch(`${API_URL}/fields/`)
      .then(res => res.json())
      .then(data => setFields(data.fields || []))
      .catch(err => console.error("Error fetching fields:", err));
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="glass dark:glass sticky top-0 z-50 border-b dark:border-slate-800 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Orqaga</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapInstance fields={fields} />

        {/* Floating Search Info */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-sm font-bold dark:text-white whitespace-nowrap">
              {fields.length} ta maydon atrofingizda
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
