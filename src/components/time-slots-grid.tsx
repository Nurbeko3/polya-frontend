"use client";

import { BookingSlot } from "@/types";
import { cn } from "@/lib/utils";
import { LockClosedIcon } from "@heroicons/react/24/solid";

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
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.06]">
        <LockClosedIcon className="w-6 h-6 text-slate-300 dark:text-white/20 mb-2" />
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
          Bu kun uchun vaqt topilmadi
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isAvailable = slot.status === "available" || slot.status === "rejected";
        const isSelected = selectedSlots.some((s) => s.id === slot.id);
        const isLocked = slot.status === "locked";
        const isPending = slot.status === "pending";
        const isBooked = slot.status === "booked";

        return (
          <button
            key={slot.id}
            onClick={() => isAvailable && onToggleSlot(slot)}
            disabled={!isAvailable}
            className={cn(
              "relative flex flex-col items-center justify-center h-14 rounded-2xl border text-sm font-semibold transition-all duration-150 select-none",
              isAvailable && !isSelected && [
                "bg-white dark:bg-[#1e1e1e]",
                "border-slate-200 dark:border-white/[0.08]",
                "text-slate-700 dark:text-slate-200",
                "hover:border-blue-400 dark:hover:border-blue-500",
                "hover:bg-blue-50 dark:hover:bg-blue-950/60",
                "hover:text-blue-700 dark:hover:text-blue-300",
                "cursor-pointer active:scale-95",
              ],
              isSelected && [
                "bg-blue-600 dark:bg-blue-500",
                "border-blue-600 dark:border-blue-500",
                "text-white",
                "shadow-md shadow-blue-600/25 dark:shadow-blue-500/20",
                "cursor-pointer active:scale-95",
              ],
              isLocked && [
                "bg-amber-50 dark:bg-amber-950/40",
                "border-amber-200 dark:border-amber-700/40",
                "text-amber-500 dark:text-amber-400",
                "cursor-not-allowed",
              ],
              isPending && [
                "bg-violet-50 dark:bg-violet-950/40",
                "border-violet-200 dark:border-violet-700/40",
                "text-violet-500 dark:text-violet-400",
                "cursor-not-allowed",
              ],
              isBooked && [
                "bg-slate-50 dark:bg-[#1a1a1a]",
                "border-slate-100 dark:border-white/[0.04]",
                "text-slate-300 dark:text-white/20",
                "cursor-not-allowed",
              ]
            )}
          >
            {isLocked && (
              <LockClosedIcon className="w-3 h-3 mb-0.5 opacity-70" />
            )}
            <span className="leading-none">{slot.start_time}</span>
            {isPending && (
              <span className="text-[10px] font-medium opacity-70 mt-0.5">kutilmoqda</span>
            )}
            {isBooked && (
              <span className="text-[10px] font-medium opacity-60 mt-0.5">band</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
