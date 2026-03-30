"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { FieldType } from "@/types";

import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch: (filters: {
    city?: string;
    field_type?: FieldType;
    min_price?: string;
    max_price?: string;
  }) => void;
  isLoading?: boolean;
}

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [city, setCity] = useState("");
  const [fieldType, setFieldType] = useState<FieldType | "all">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    onSearch({
      city: city || undefined,
      field_type: fieldType === "all" ? undefined : (fieldType as FieldType),
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
    });
  };

  const handleClear = () => {
    setCity("");
    setFieldType("all");
    setMinPrice("");
    setMaxPrice("");
    onSearch({});
  };

  return (
    <div className="relative z-20 group">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-black/5 border border-white dark:border-slate-700/50 p-3 mb-10 transition-all duration-500 hover:shadow-primary/5">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* City Search */}
          <div className="flex-1 w-full lg:min-w-[240px]">
            <div className="relative group/input">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
              <Input
                placeholder="Shahar yoki tuman..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-12 h-14 bg-transparent border-none rounded-2xl text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          
          <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

          {/* Sport Select */}
          <div className="w-full lg:w-[220px]">
            <Select 
              value={fieldType} 
              onValueChange={(v) => {
                const newType = v as FieldType | "all";
                setFieldType(newType);
                onSearch({
                  city: city || undefined,
                  field_type: newType === "all" ? undefined : (newType as FieldType),
                  min_price: minPrice || undefined,
                  max_price: maxPrice || undefined,
                });
              }}
            >
              <SelectTrigger className="h-14 bg-transparent border-none rounded-2xl focus:ring-0 focus:ring-offset-0 shadow-none px-4 group/select">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-muted-foreground group-hover/select:text-primary transition-colors" />
                  <SelectValue placeholder="Sport turi" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-800/90">
                <SelectItem value="all" className="rounded-xl">Barcha turlar</SelectItem>
                <SelectItem value="football" className="rounded-xl">⚽ Futbol</SelectItem>
                <SelectItem value="tennis" className="rounded-xl">🎾 Tennis</SelectItem>
                <SelectItem value="basketball" className="rounded-xl">🏀 Basketbol</SelectItem>
                <SelectItem value="volleyball" className="rounded-xl">🏐 Voleybol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

          {/* Price Filters */}
          <div className="flex items-center gap-2 px-2 w-full lg:w-auto">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Dan"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-12 w-full lg:w-24 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-xl text-sm focus-visible:ring-0"
              />
            </div>
            <span className="text-slate-300 dark:text-slate-600">−</span>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Gacha"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-12 w-full lg:w-24 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-xl text-sm focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0 lg:pl-2">
            <Button 
              size="lg"
              onClick={handleSearch} 
              disabled={isLoading}
              className="flex-1 lg:flex-none h-14 px-8 rounded-[24px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Qidirish"
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClear}
              className="w-14 h-14 rounded-[24px] text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              title="Tozalash"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

