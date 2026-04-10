"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, BookingSlot, Field } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { API_URL } from "@/lib/api";

const fieldIcons: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

interface BookingWithField extends BookingSlot {
  field?: Field;
}

function BookingSkeleton() {
  return (
    <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
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
      // Token sync kuchaytirish — api client token eng so'nggi bo'lsin
      api.setToken(token);
      const data = await api.getMyBookings();
      const bookingsWithFields = await Promise.all(
        data.bookings.map(async (booking) => {
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
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Bronni bekor qilishda xatolik yuz berdi");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("uz-UZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isUpcoming = (date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  };

  const upcomingBookings = bookings.filter((b) => b.status === "booked" && isUpcoming(b.date));
  const pastBookings = bookings.filter((b) => b.status === "booked" && !isUpcoming(b.date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="glass dark:glass sticky top-0 z-50 border-b dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Bosh sahifa</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 dark:text-white">Mening bronlarim</h1>
          {!isLoading && (
            <p className="text-muted-foreground">
              {bookings.length > 0 ? `${bookings.length} ta bron topildi` : "Hozircha bronlar yo'q"}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <BookingSkeleton key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2 dark:text-white">Bronlar yo'q</h2>
            <p className="text-muted-foreground mb-6">Hozircha hech qanday bron mavjud emas</p>
            <Link href="/">
              <Button>Maydonlarni ko'rish</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Kelgusi bronlar
                  <span className="ml-1 text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {upcomingBookings.length}
                  </span>
                </h2>
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="dark:bg-slate-800 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-24 h-24 md:h-auto bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl flex-shrink-0">
                            {fieldIcons[booking.field?.field_type || "football"] || "🏟️"}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-semibold dark:text-white">
                                {booking.field?.name || `Maydon #${booking.field_id}`}
                              </h3>
                              <Badge className="bg-emerald-500 text-white flex-shrink-0">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Tasdiqlangan
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                                {formatDate(booking.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                {booking.start_time} – {booking.end_time}
                              </div>
                              {booking.field?.city && (
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                                  {booking.field.city}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/fields/${booking.field_id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">Batafsil</Button>
                              </Link>
                              <Button
                                variant="outline" size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    Bekor qilinmoqda...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <XMarkIcon className="w-4 h-4" />
                                    Bekor qilish
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 dark:text-white/60 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-muted-foreground" />
                  O'tgan bronlar
                  <span className="ml-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                    {pastBookings.length}
                  </span>
                </h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="dark:bg-slate-800 dark:border-slate-700 opacity-70">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-24 h-24 md:h-auto bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-4xl flex-shrink-0">
                            {fieldIcons[booking.field?.field_type || "football"] || "🏟️"}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-semibold dark:text-white">
                                {booking.field?.name || `Maydon #${booking.field_id}`}
                              </h3>
                              <Badge variant="secondary">Yakunlangan</Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(booking.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {booking.start_time} – {booking.end_time}
                              </div>
                              {booking.field?.city && (
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="w-4 h-4" />
                                  {booking.field.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
