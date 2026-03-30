"use client";

import Link from "next/link";
import { Field } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";

interface FieldCardProps {
  field: Field;
}

export function FieldCard({ field }: FieldCardProps) {
  const fieldIcons: Record<string, string> = {
    football: "⚽",
    tennis: "🎾",
    basketball: "🏀",
    volleyball: "🏐",
  };

  const fieldColors: Record<string, string> = {
    football: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    tennis: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    basketball: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    volleyball: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  return (
    <Link href={`/fields/${field.id}`} className="block">
      <Card className="overflow-hidden h-full group dark:border-slate-700">
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
          {field.image_url ? (
            <img
              src={field.image_url}
              alt={field.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {fieldIcons[field.field_type] || "🏟️"}
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm dark:bg-slate-800/90">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {field.city}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${fieldColors[field.field_type]}`}>
              {fieldIcons[field.field_type]} {field.field_type}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors dark:text-white">
            {field.name}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mb-3 line-clamp-1">
            {field.address}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(field.price_per_hour)}
              </span>
              <span className="text-sm text-muted-foreground dark:text-slate-400">/soat</span>
            </div>
            {field.rating > 0 && (
              <div className="flex items-center gap-1 text-amber-500">
                <StarIconSolid className="w-4 h-4" />
                <span className="font-medium">{field.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
