"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, Field } from "@/lib/api";
import { BookingSlot } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, ClockIcon as ClockSolid, XCircleIcon } from "@heroicons/react/24/solid";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

const FIELD_ICONS: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

const FIELD_BG: Record<string, string> = {
  football:   "bg-emerald-100 dark:bg-emerald-950",
  tennis:     "bg-teal-100 dark:bg-teal-950",
  basketball: "bg-orange-100 dark:bg-orange-950",
  volleyball: "bg-pink-100 dark:bg-pink-950",
};

type FilterKey = "all" | "pending" | "booked" | "rejected";

const FILTERS: { key: FilterKey; label: string; color: string; activeColor: string }[] = [
  { key: "all",      label: "Barchasi",    color: "text-slate-500 dark:text-slate-400",    activeColor: "bg-slate-900 dark:bg-white text-white dark:text-slate-900" },
  { key: "pending",  label: "Kutilmoqda",  color: "text-violet-600 dark:text-violet-400",  activeColor: "bg-violet-600 text-white" },
  { key: "booked",   label: "Tasdiqlangan",color: "text-emerald-600 dark:text-emerald-400",activeColor: "bg-emerald-600 text-white" },
  { key: "rejected", label: "Rad etildi",  color: "text-red-500 dark:text-red-400",        activeColor: "bg-red-500 text-white" },
];

interface BookingWithField extends BookingSlot {
  field?: Field;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("uz-UZ", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isUpcoming(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const bookingDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingWithField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/");
      return;
    }
    fetchBookings();
  }, [isAuthenticated, user]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      api.setToken(token);
      const data = await api.getMyBookings();
      const all = data.bookings.filter(
        (b) => b.status === "booked" || b.status === "pending" || b.status === "rejected"
      );
      // Eng yangi bronlar tepada — ID bo'yicha kamayish tartibida
      all.sort((a, b) => b.id - a.id);

      const withFields = await Promise.all(
        all.map(async (booking) => {
          try {
            const res = await fetch(`${API_URL}/fields/${booking.field_id}`);
            if (res.ok) return { ...booking, field: await res.json() };
            return booking;
          } catch {
            return booking;
          }
        })
      );
      setBookings(withFields);
    } catch {
      toast.error("Bronlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (slotId: number) => {
    if (!window.confirm("Bronni bekor qilishni tasdiqlaysizmi?")) return;
    setCancellingId(slotId);
    try {
      api.setToken(token);
      await api.cancelBooking(slotId);
      setBookings((prev) => prev.filter((b) => b.id !== slotId));
      toast.success("Bron muvaffaqiyatli bekor qilindi");
    } catch (error: any) {
      toast.error(error.message || "Bronni bekor qilishda xatolik yuz berdi");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case "pending":  return bookings.filter((b) => b.status === "pending");
      case "booked":   return bookings.filter((b) => b.status === "booked");
      case "rejected": return bookings.filter((b) => b.status === "rejected");
      default:         return bookings;
    }
  }, [bookings, activeFilter]);

  const counts = useMemo(() => ({
    all:      bookings.length,
    pending:  bookings.filter((b) => b.status === "pending").length,
    booked:   bookings.filter((b) => b.status === "booked").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  }), [bookings]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-white/[0.06]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Orqaga</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              title="Yangilash"
            >
              <ArrowPathIcon className={cn("w-4 h-4 text-slate-500 dark:text-slate-400", isLoading && "animate-spin")} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-7 pb-8 max-w-2xl">

        {/* Title */}
        <div className="mb-6">
          {user?.name && (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              {user.name}
            </p>
          )}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bronlar tarixi</h1>
            {!isLoading && bookings.length > 0 && (
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                {bookings.length} ta
              </span>
            )}
          </div>
        </div>

        {/* Filter chips */}
        {!isLoading && bookings.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <FunnelIcon className="w-4 h-4 text-slate-400 shrink-0" />
              {FILTERS.map((f) => {
                const count = counts[f.key];
                const isActive = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                      isActive
                        ? f.activeColor
                        : "bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.08] " + f.color
                    )}
                  >
                    {f.label}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/[0.06] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && bookings.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/[0.06] rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 dark:bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CalendarDaysIcon className="w-8 h-8 text-slate-300 dark:text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Bronlar yo'q</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Hozircha hech qanday bron mavjud emas</p>
            <Link href="/"><Button className="rounded-2xl px-6 h-11 font-semibold">Maydonlarni ko'rish</Button></Link>
          </div>
        )}

        {/* Filter empty */}
        {!isLoading && bookings.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#161616] border border-slate-100 dark:border-white/[0.06] rounded-3xl">
            <div className="w-14 h-14 bg-slate-50 dark:bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FunnelIcon className="w-7 h-7 text-slate-300 dark:text-white/20" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bu filtrdagi bronlar yo'q</p>
            <button
              onClick={() => setActiveFilter("all")}
              className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Barcha bronlarni ko'rish
            </button>
          </div>
        )}

        {/* Booking list */}
        {!isLoading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
                cancellingId={cancellingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  cancellingId,
}: {
  booking: BookingWithField;
  onCancel: (id: number) => void;
  cancellingId: number | null;
}) {
  const field = booking.field;
  const icon = FIELD_ICONS[field?.field_type ?? "football"] ?? "🏟️";
  const iconBg = FIELD_BG[field?.field_type ?? "football"] ?? "bg-blue-100 dark:bg-blue-950";
  const isPending = booking.status === "pending";
  const isRejected = booking.status === "rejected";
  const upcoming = isUpcoming(booking.date);

  return (
    <div className={cn(
      "bg-white dark:bg-[#161616] border rounded-3xl overflow-hidden",
      isRejected  ? "border-red-200 dark:border-red-900/40" :
      !upcoming   ? "border-slate-100 dark:border-white/[0.04] opacity-70" :
                    "border-slate-100 dark:border-white/[0.06]"
    )}>
      <div className="p-5">

        {/* Top row */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0", iconBg)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {field?.name ?? `Maydon #${booking.field_id}`}
                </h3>
                {field?.city && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 shrink-0" />
                    {field.city}{field.address ? `, ${field.address}` : ""}
                  </p>
                )}
              </div>
              {/* Status badge */}
              {isRejected ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-xl shrink-0">
                  <XCircleIcon className="w-3.5 h-3.5" /> Rad etildi
                </span>
              ) : isPending ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-xl shrink-0">
                  <ClockSolid className="w-3.5 h-3.5 animate-pulse" /> Kutilmoqda
                </span>
              ) : upcoming ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl shrink-0">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> Tasdiqlangan
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-white/[0.04] px-2.5 py-1 rounded-xl shrink-0">
                  Yakunlandi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date & time */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <CalendarDaysIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
            {booking.start_time} – {booking.end_time}
          </div>
        </div>

        {/* Rejected notice */}
        {isRejected && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-2xl px-4 py-3 mb-4">
            <XCircleIcon className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-0.5">Maydon egasi bronni rad etdi</p>
              {booking.rejection_reason && (
                <p className="text-xs text-red-600 dark:text-red-400/80 leading-relaxed">
                  Sabab: <span className="font-medium">{booking.rejection_reason}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pending notice */}
        {isPending && (
          <div className="flex items-start gap-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 rounded-2xl px-4 py-3 mb-4">
            <ClockSolid className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-violet-700 dark:text-violet-400 leading-relaxed">
              Maydon egasi bronni hali <span className="font-semibold">tasdiqlamagan</span>. Telegram orqali xabar yuborildi.
            </p>
          </div>
        )}

        {/* Confirmed upcoming notice */}
        {!isPending && !isRejected && upcoming && (
          <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl px-4 py-3 mb-4">
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Bron tasdiqlangan. Maydon bilan bog'laning.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
          {field?.phone_number && (upcoming || isRejected) && (
            <a href={`tel:${field.phone_number}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-sm font-semibold gap-2 border-slate-200 dark:border-white/[0.08]">
                <PhoneIcon className="w-4 h-4" />
                {field.phone_number}
              </Button>
            </a>
          )}
          <Link href={`/fields/${booking.field_id}`} className={cn((!field?.phone_number || (!upcoming && !isRejected)) ? "flex-1" : "")}>
            <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-sm font-semibold border-slate-200 dark:border-white/[0.08]">
              Batafsil
            </Button>
          </Link>
          {(upcoming || isRejected) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-100 dark:border-red-900/30"
              onClick={() => onCancel(booking.id)}
              disabled={cancellingId === booking.id}
            >
              {cancellingId === booking.id
                ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                : <XMarkIcon className="w-4 h-4" />
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
