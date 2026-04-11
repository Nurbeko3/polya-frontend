"use client";

import { useEffect, useState } from "react";
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
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

const fieldIcons: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

const fieldColors: Record<string, string> = {
  football: "from-green-500 to-emerald-600",
  tennis: "from-emerald-500 to-teal-600",
  basketball: "from-orange-500 to-amber-600",
  volleyball: "from-pink-500 to-rose-600",
};

interface BookingWithField extends BookingSlot {
  field?: Field;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
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

function BookingSkeleton() {
  return (
    <div className="h-40 rounded-[32px] bg-slate-100 dark:bg-white/5 animate-pulse" />
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
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

      const bookingsWithFields = await Promise.all(
        data.bookings
          .filter((b) => b.status === "booked")
          .map(async (booking) => {
            try {
              const response = await fetch(`${API_URL}/fields/${booking.field_id}`);
              if (response.ok) {
                const field = await response.json();
                return { ...booking, field };
              }
              return booking;
            } catch {
              return booking;
            }
          })
      );
      setBookings(bookingsWithFields);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error("Bronlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (slotId: number) => {
    const confirmed = window.confirm("Bronni bekor qilishni tasdiqlaysizmi?");
    if (!confirmed) return;

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

  const upcomingBookings = bookings.filter((b) => isUpcoming(b.date));
  const pastBookings = bookings.filter((b) => !isUpcoming(b.date));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <header className="glass dark:glass sticky top-0 z-50 border-b border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-all" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bosh sahifaga</span>
          </Link>
          <div className="p-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Title */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white/20 mb-2">
            {user?.name}
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white">
            Mening bronlarim
          </h1>
          {!isLoading && (
            <p className="text-slate-400 dark:text-white/30 font-bold text-sm mt-2">
              {bookings.length > 0
                ? `${bookings.length} ta bron topildi`
                : "Hozircha bronlar yo'q"}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <BookingSkeleton key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[48px]">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[28px] flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-white/20" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-2 dark:text-white">
              Bronlar yo'q
            </h2>
            <p className="text-slate-400 dark:text-white/30 font-bold mb-8 text-sm">
              Hozircha hech qanday bron mavjud emas
            </p>
            <Link href="/">
              <Button className="rounded-2xl px-8 font-black uppercase tracking-widest h-12">
                Maydonlarni ko'rish
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming */}
            {upcomingBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                    Kelgusi bronlar
                  </h2>
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                      cancellingId={cancellingId}
                      upcoming
                    />
                  ))}
                </div>
              </section>
            )}

            {/* History */}
            {pastBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-slate-400 dark:text-white/30" />
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                    Bron qilish tarixi
                  </h2>
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-400 px-3 py-1 rounded-full">
                    {pastBookings.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                      cancellingId={cancellingId}
                      upcoming={false}
                    />
                  ))}
                </div>
              </section>
            )}
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
  upcoming,
}: {
  booking: BookingWithField;
  onCancel: (id: number) => void;
  cancellingId: number | null;
  upcoming: boolean;
}) {
  const field = booking.field;
  const color = fieldColors[field?.field_type || "football"];

  return (
    <div
      className={cn(
        "bg-white dark:bg-white/[0.03] border rounded-[32px] overflow-hidden shadow-sm transition-all",
        upcoming
          ? "border-slate-200 dark:border-white/8 hover:border-primary/30 dark:hover:border-primary/20"
          : "border-slate-100 dark:border-white/5 opacity-70"
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Left color bar */}
        <div
          className={cn(
            "sm:w-20 h-20 sm:h-auto flex items-center justify-center text-4xl shrink-0 bg-gradient-to-br",
            upcoming ? color : "from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800"
          )}
        >
          {fieldIcons[field?.field_type || "football"] || "🏟️"}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="font-black text-lg dark:text-white leading-tight">
                {field?.name || `Maydon #${booking.field_id}`}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-0.5">
                {field?.field_type}
              </p>
            </div>
            {upcoming ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-wider shrink-0">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Tasdiqlangan
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-wider shrink-0">
                Yakunlangan
              </span>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
              <CalendarIcon className="w-4 h-4 shrink-0 text-slate-300 dark:text-white/20" />
              <span className="font-bold">{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
              <ClockIcon className="w-4 h-4 shrink-0 text-slate-300 dark:text-white/20" />
              <span className="font-bold">{booking.start_time} – {booking.end_time}</span>
            </div>
            {field?.address && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
                <MapPinIcon className="w-4 h-4 shrink-0 text-slate-300 dark:text-white/20" />
                <span className="font-bold">{field.city}, {field.address}</span>
              </div>
            )}
            {field?.phone_number && (
              <a
                href={`tel:${field.phone_number}`}
                className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
              >
                <PhoneIcon className="w-4 h-4 shrink-0" />
                <span className="font-black">{field.phone_number}</span>
              </a>
            )}
          </div>

          {/* Actions */}
          {upcoming && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Link href={`/fields/${booking.field_id}`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl font-black uppercase tracking-wider text-[10px] h-9"
                >
                  Batafsil
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-black uppercase tracking-wider text-[10px] h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-100 dark:border-red-900/20"
                onClick={() => onCancel(booking.id)}
                disabled={cancellingId === booking.id}
              >
                {cancellingId === booking.id ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    Bekor qilinmoqda
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <XMarkIcon className="w-3.5 h-3.5" />
                    Bekor qilish
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
