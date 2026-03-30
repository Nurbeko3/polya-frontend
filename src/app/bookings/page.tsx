"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, BookingSlot, Field } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/components/auth/auth-context";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

const fieldIcons: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

interface BookingWithField extends BookingSlot {
  field?: Field;
}

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<BookingWithField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMyBookings(user.id);
        const bookingsWithFields = await Promise.all(
          data.bookings.map(async (booking) => {
            try {
              const response = await fetch(`${API_URL}/fields/${booking.field_id}`);
              const field = await response.json();
              return { ...booking, field };
            } catch {
              return booking;
            }
          })
        );
        setBookings(bookingsWithFields);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, user]);

  const handleCancelBooking = async (slotId: number) => {
    if (!user || !confirm("Bronni bekor qilishni tasdiqlaysizmi?")) return;

    setCancellingId(slotId);
    try {
      await api.cancelBooking(slotId, user.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === slotId ? { ...b, status: "available" as const } : b
        )
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Bronni bekor qilishda xatolik yuz berdi");
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Kirish talab qilinadi</h2>
          <p className="text-muted-foreground mb-6">Iltimos, tizimga kiring</p>
          <Link href="/login">
            <Button>Kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "booked" && isUpcoming(b.date)
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "booked" && !isUpcoming(b.date)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="glass dark:glass sticky top-0 z-50 border-b dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Orqaga</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">
          Mening bronlarim
        </h1>
        <p className="text-muted-foreground mb-8">
          Sizning barcha bronlaringiz
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2 dark:text-white">
              Bronlar yo'q
            </h2>
            <p className="text-muted-foreground mb-6">
              Hozircha hech qanday bron mavjud emas
            </p>
            <Link href="/">
              <Button>Maydonlarni ko'rish</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Kelgusi bronlar
                </h2>
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="dark:bg-slate-800 dark:border-slate-700 overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-24 h-24 md:h-auto bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl">
                            {fieldIcons[booking.field?.field_type || "football"] || "🏟️"}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold dark:text-white">
                                {booking.field?.name || `Maydon #${booking.field_id}`}
                              </h3>
                              <Badge className="bg-green-500">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Tasdiqlangan
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(booking.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {booking.start_time} - {booking.end_time}
                              </div>
                              {booking.field && (
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="w-4 h-4" />
                                  {booking.field.city}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <Link href={`/fields/${booking.field_id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  Batafsil
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingId === booking.id}
                              >
                                <XMarkIcon className="w-4 h-4 mr-1" />
                                Bekor qilish
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
                <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-muted-foreground" />
                  O'tgan bronlar
                </h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="dark:bg-slate-800 dark:border-slate-700 opacity-75"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-24 h-24 md:h-auto bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-4xl">
                            {fieldIcons[booking.field?.field_type || "football"] || "🏟️"}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold dark:text-white">
                                {booking.field?.name || `Maydon #${booking.field_id}`}
                              </h3>
                              <Badge variant="secondary">Yakunlangan</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(booking.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {booking.start_time} - {booking.end_time}
                              </div>
                              {booking.field && (
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
