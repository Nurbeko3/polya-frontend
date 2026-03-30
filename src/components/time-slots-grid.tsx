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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
         <ClockIcon className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-3" />
         <span className="text-sm font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Vaqtlar topilmadi</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              "group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 overflow-hidden",
              isAvailable && !isSelected && "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-primary hover:scale-[1.02] cursor-pointer",
              isSelected && "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]",
              !isAvailable && !isLocked && "bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.05] text-slate-300 dark:text-white/10 cursor-not-allowed opacity-60",
              isLocked && "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-500 dark:text-orange-400 cursor-not-allowed"
            )}
          >
            {isLocked ? (
              <LockClosedIcon className="w-4 h-4 mb-1" />
            ) : (
              <ClockIcon className={cn("w-4 h-4 mb-1 transition-colors", isAvailable && !isSelected ? "text-primary/40 group-hover:text-primary" : "text-inherit")} />
            )}
            <span className="text-sm font-black uppercase tracking-tight">
              {slot.start_time}
            </span>
            
            {/* Glossy Overlay for selection */}
            {isSelected && (
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
