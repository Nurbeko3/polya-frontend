"use client";

import { BookingSlot } from "@/types";
import { cn } from "@/lib/utils";
import { ClockIcon, LockClosedIcon } from "@heroicons/react/24/outline";

interface TimeSlotsGridProps {
  slots: BookingSlot[];
  selectedSlots: BookingSlot[];
  onToggleSlot: (slot: BookingSlot) => void;
  isLoading?: boolean;
}

export function TimeSlotsGrid({
  slots,
  selectedSlots,
  onToggleSlot,
  isLoading,
}: TimeSlotsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Bu kun uchun vaqtlar mavjud emas
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isAvailable = slot.status === "available";
        const isSelected = selectedSlots.some(s => s.id === slot.id);
        const isLocked = slot.status === "locked";

        return (
          <button
            key={slot.id}
            onClick={() => isAvailable && onToggleSlot(slot)}
            disabled={!isAvailable}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
              isAvailable && !isSelected && "hover:border-primary hover:bg-primary/5 cursor-pointer",
              isSelected && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
              !isAvailable && !isLocked && "bg-muted/50 text-muted-foreground cursor-not-allowed",
              isLocked && "bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed"
            )}
          >
            {isLocked ? (
              <LockClosedIcon className="w-4 h-4 mb-1" />
            ) : (
              <ClockIcon className="w-4 h-4 mb-1" />
            )}
            <span className="text-sm font-medium">
              {slot.start_time}
            </span>
          </button>
        );
      })}
    </div>
  );
}
