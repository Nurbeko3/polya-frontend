"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Field, BookingSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotsGrid } from "@/components/time-slots-grid";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AddFieldDialog } from "@/components/add-field-dialog";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

const FIELD_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  football:   { icon: "⚽", label: "Futbol",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" },
  tennis:     { icon: "🎾", label: "Tennis",      color: "text-teal-600 dark:text-teal-400",       bg: "bg-teal-50 dark:bg-teal-950" },
  basketball: { icon: "🏀", label: "Basketbol",   color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950" },
  volleyball: { icon: "🏐", label: "Voleybol",    color: "text-pink-600 dark:text-pink-400",       bg: "bg-pink-50 dark:bg-pink-950" },
};

export default function FieldDetailPage() {
  const params = useParams();
  const fieldId = params.id as string;

  const [field, setField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    startTime: string;
    endTime: string;
    date: Date;
  } | null>(null);

  const { user, isAuthenticated } = useAuthStore();

  const fetchField = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Field>(`/fields/${fieldId}`);
      setField(data);
    } catch {
      // handled in UI
    } finally {
      setIsLoading(false);
    }
  }, [fieldId]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !fieldId) return;
    setSlotsLoading(true);
    try {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const data = await api.get<{ slots: BookingSlot[] }>(
        `/bookings/slots/${fieldId}?date=${y}-${m}-${d}`
      );
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDate, fieldId]);

  // Bugungi sanani client-da o'rnatamiz (hydration mismatch oldini olish uchun)
  useEffect(() => { setSelectedDate(new Date()); }, []);

  useEffect(() => { fetchField(); }, [fetchField]);
  useEffect(() => {
    if (selectedDate) {
      setSelectedSlots([]);
      fetchSlots();
    }
  }, [selectedDate, fetchSlots]);

  const handleToggleSlot = (slot: BookingSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.find((s) => s.id === slot.id);
      if (exists) return prev.filter((s) => s.id !== slot.id);
      return [...prev, slot].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
  };

  const handleBookSlot = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Iltimos, avval tizimga kiring!");
      return;
    }
    if (selectedSlots.length === 0 || !field) return;

    setBookingLoading(true);
    try {
      for (const slot of selectedSlots) {
        const lockData = await api.lockSlot(slot.id);
        await api.confirmBooking(slot.id, lockData.lock_token, "naqd");
      }
      setBookingSuccess({
        startTime: selectedSlots[0].start_time,
        endTime: selectedSlots[selectedSlots.length - 1].end_time,
        date: selectedDate!,
      });
      setSelectedSlots([]);
      fetchSlots();
    } catch (error: any) {
      toast.error(error.message || "Bron qilishda xatolik yuz berdi");
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Yuklanmoqda</span>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!field) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-6">
            <MapPinIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Maydon topilmadi</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Bu maydon mavjud emas yoki o'chirilgan.</p>
          <Link href="/">
            <Button className="rounded-2xl px-8 h-12 font-semibold">Bosh sahifaga</Button>
          </Link>
        </div>
      </div>
    );
  }

  const meta = FIELD_META[field.field_type] ?? { icon: "🏟️", label: field.field_type, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950" };
  const totalPrice = field.price_per_hour * selectedSlots.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-white/[0.06]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Orqaga</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="relative bg-slate-100 dark:bg-[#111] h-72 sm:h-96 overflow-hidden">
        {field.image_url ? (
          <>
            <img
              src={field.image_url}
              alt={field.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fallback = img.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="w-full h-full items-center justify-center hidden absolute inset-0">
              <span className="text-8xl opacity-30 select-none">{meta.icon}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl opacity-30 select-none">{meta.icon}</span>
          </div>
        )}
        {/* Solid gradient overlay — no blur */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Rating badge */}
        {field.rating > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 text-white px-3 py-1.5 rounded-xl">
            <StarIconSolid className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-semibold">{field.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Field name over hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3",
              meta.bg, meta.color
            )}>
              {meta.icon} {meta.label}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {field.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-white/70 text-sm">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{field.city}, {field.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Info strip */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-slate-100 dark:border-white/[0.06] p-6 flex flex-wrap gap-4">
              {/* Price */}
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-base">₩</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Soatlik narx</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(field.price_per_hour)} so'm</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center shrink-0">
                  <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ish vaqti</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">08:00 – 22:00</p>
                </div>
              </div>

              {/* Phone */}
              {field.phone_number && (
                <a
                  href={`tel:${field.phone_number}`}
                  className="flex items-center gap-3 flex-1 min-w-[140px] group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                    <PhoneIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Telefon</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {field.phone_number}
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Description */}
            {field.description && (
              <div className="bg-white dark:bg-[#161616] rounded-3xl border border-slate-100 dark:border-white/[0.06] p-6">
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Maydon haqida
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {field.description}
                </p>
              </div>
            )}

            {/* ── Booking section ──────────────────────────────────── */}
            <div id="booking-section" className="bg-white dark:bg-[#161616] rounded-3xl border border-slate-100 dark:border-white/[0.06] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Bron qilish</h2>
              </div>

              <div className="flex flex-col xl:flex-row gap-6">
                {/* Calendar */}
                <div className="shrink-0 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-100 dark:border-white/[0.06] p-4 self-start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-xl"
                  />
                </div>

                {/* Slots */}
                <div className="flex-1 min-w-0">
                  {selectedDate ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span>{formatDate(selectedDate)}</span>
                        <span>•</span>
                        <span>{slots.filter(s => s.status === "available").length} ta bo'sh</span>
                      </div>
                      <TimeSlotsGrid
                        slots={slots}
                        selectedSlots={selectedSlots}
                        onToggleSlot={handleToggleSlot}
                        isLoading={slotsLoading}
                      />
                    </div>
                  ) : (
                    <div className="h-full min-h-[200px] flex items-center justify-center bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.06]">
                      <div className="text-center">
                        <CalendarDaysIcon className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Sana tanlang</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Success state ──────────────────────────────────── */}
              {bookingSuccess && (
                <div className="mt-6 space-y-3">
                  {/* Main confirmation */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
                          Bron muvaffaqiyatli qabul qilindi!
                        </p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {bookingSuccess.startTime} – {bookingSuccess.endTime}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(bookingSuccess.date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Telegram notification info */}
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                          Maydon egasiga Telegram orqali yuborildi
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Bron so'rovingiz maydon egasiga Telegram orqali yetkazildi. Tasdiqlash uchun quyidagi raqamga qo'ng'iroq qiling yoki xabar yuboring.
                        </p>
                        {field.phone_number && (
                          <a
                            href={`tel:${field.phone_number}`}
                            className="inline-flex items-center gap-2 mt-3 bg-white dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <PhoneIcon className="w-4 h-4" />
                            {field.phone_number}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Boshqa vaqt bron qilish →
                  </button>
                </div>
              )}

              {/* ── Selection summary ─────────────────────────────── */}
              {!bookingSuccess && selectedSlots.length > 0 && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
                        Tanlangan vaqt
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedSlots[0].start_time} – {selectedSlots[selectedSlots.length - 1].end_time}
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">
                          ({selectedSlots.length} soat)
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Narx</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-12 rounded-2xl font-semibold text-base"
                    onClick={handleBookSlot}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Bronlanmoqda...
                      </span>
                    ) : (
                      `Bron qilish • ${formatPrice(totalPrice)} so'm`
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ───────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">

            {/* Price card */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-slate-100 dark:border-white/[0.06] p-6">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Soatlik narx
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {formatPrice(field.price_per_hour)}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">so'm / soat</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl">
                  <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                    {field.city}, {field.address}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl">
                  <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">08:00 – 22:00</span>
                </div>
                {field.phone_number && (
                  <a
                    href={`tel:${field.phone_number}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl hover:bg-slate-100 dark:hover:bg-[#222] transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{field.phone_number}</span>
                  </a>
                )}
              </div>

              <Button
                className="w-full mt-5 h-12 rounded-2xl font-semibold"
                onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Bron qilish
              </Button>
            </div>

            {/* Field owner promo */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-slate-100 dark:border-white/[0.06] p-6">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Maydon egasimisiz?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Maydoningizni qo'shing va yangi mijozlarni qabul qiling.
              </p>
              <AddFieldDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-2xl font-semibold text-sm"
                  >
                    Maydon qo'shish
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
