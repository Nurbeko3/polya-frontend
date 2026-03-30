"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Field, BookingSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotsGrid } from "@/components/time-slots-grid";
import { PaymentDialog } from "@/components/payment-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/components/auth/auth-context";
import {
  ArrowLeftIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  CalendarIcon,
  CheckIcon,
  PhoneIcon,
  UserGroupIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatPrice, formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export default function FieldDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const fieldId = params.id as string;

  const [field, setField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchField = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/fields/${fieldId}`);
      if (response.ok) {
        const data = await response.json();
        setField(data);
      }
    } catch (error) {
      console.error("Error fetching field:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fieldId]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !fieldId) return;
    setSlotsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(`${API_URL}/bookings/slots/${fieldId}?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDate, fieldId]);

  useEffect(() => {
    fetchField();
  }, [fetchField]);

  useEffect(() => {
    if (selectedDate) {
      setSelectedSlots([]); // Clear prev selections when changing date
      fetchSlots();
    }
  }, [selectedDate, fetchSlots]);

  const handleToggleSlot = (slot: BookingSlot) => {
    setSelectedSlots(prev => {
      const exists = prev.find(s => s.id === slot.id);
      if (exists) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot].sort((a, b) => a.start_time.localeCompare(b.start_time));
      }
    });
  };

  const handleBookSlot = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePaymentSelect = async (method: "click" | "payme") => {
    if (selectedSlots.length === 0 || !field) return;

    setPaymentLoading(true);
    try {
      const userId = user?.id || 1;
      let firstPaymentUrl = "";
      
      for (const slot of selectedSlots) {
        const lockResponse = await fetch(`${API_URL}/bookings/lock?user_id=${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot_id: slot.id }),
        });

        if (!lockResponse.ok) throw new Error("Slotni band qilishda xatolik");
        const lockData = await lockResponse.json();

        const confirmResponse = await fetch(`${API_URL}/bookings/confirm?user_id=${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slot_id: slot.id,
            lock_token: lockData.lock_token,
            payment_method: method,
          }),
        });

        if (!confirmResponse.ok) throw new Error("Bron tasdiqlashda xatolik");
        const confirmData = await confirmResponse.json();

        if (!firstPaymentUrl && confirmData.payment_url) {
          firstPaymentUrl = confirmData.payment_url;
        }
      }

      if (firstPaymentUrl) {
        window.location.href = firstPaymentUrl;
      } else {
        alert("Bron muvaffaqiyatli amalga oshirildi!");
        setShowPaymentDialog(false);
        fetchSlots();
        setSelectedSlots([]);
      }
    } catch (error) {
      console.error("Error booking:", error);
      alert("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground dark:text-slate-400 text-lg">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Maydon topilmadi</h2>
          <p className="text-muted-foreground dark:text-slate-400 mb-6">Kechirasiz, bu maydon mavjud emas</p>
          <Link href="/">
            <Button>Bosh sahifaga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="glass dark:glass sticky top-0 z-50 border-b dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Orqaga</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Kirish
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-md shadow-primary/20">
                    Ro'yxatdan o'tish
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
        {field.image_url ? (
          <img src={field.image_url} alt={field.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br ${fieldColors[field.field_type] || "from-primary to-purple-600"} flex items-center justify-center text-7xl md:text-8xl shadow-2xl`}>
              {fieldIcons[field.field_type] || "🏟️"}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Field Type Badge */}
        <div className="absolute top-6 left-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${fieldColors[field.field_type] || "from-primary to-purple-600"} text-white rounded-full text-sm font-semibold shadow-lg`}>
            {fieldIcons[field.field_type]} {field.field_type}
          </span>
        </div>

        {/* Rating */}
        {field.rating > 0 && (
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <StarIconSolid className="w-5 h-5 text-amber-400" />
              <span className="font-bold">{field.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {field.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPinIcon className="w-5 h-5" />
              <span className="font-medium">{field.city}, {field.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Haqida</h2>
                <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">
                  {field.description || "Bu ajoyib sport maydoni. Keling va o'zingiz zavq oling!"}
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {[
                    { icon: UserGroupIcon, label: "Jamoa o'yini" },
                    { icon: MapIcon, label: "Yaxshi lokatsiya" },
                    { icon: StarIcon, label: "Yuqori reyting" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <feature.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium dark:text-slate-300">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Section */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Bron qilish
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-xl border-2 dark:border-slate-600"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                  
                  <div className="flex-1">
                    {selectedDate ? (
                      <>
                        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-xl">
                          <ClockIcon className="w-5 h-5 text-primary" />
                          <span className="font-semibold">{formatDate(selectedDate)}</span>
                        </div>
                        <TimeSlotsGrid
                          slots={slots}
                          selectedSlots={selectedSlots}
                          onToggleSlot={handleToggleSlot}
                          isLoading={slotsLoading}
                        />
                      </>
                    ) : (
                      <div className="h-full min-h-[200px] flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="text-center">
                          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Sana tanlang</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Slot Info */}
                {selectedSlots.length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-2xl p-5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold dark:text-white">Tanlangan vaqt ({selectedSlots.length} soat):</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Sana</p>
                        <p className="font-semibold dark:text-white">{selectedDate && formatDate(selectedDate)}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-1">Vaqt</p>
                        <p className="font-semibold dark:text-white text-sm whitespace-nowrap">
                          {selectedSlots[0].start_time} - {selectedSlots[selectedSlots.length - 1].end_time}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Jami Narx</p>
                        <p className="font-bold text-primary text-lg">{formatPrice(field.price_per_hour * selectedSlots.length)}</p>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25" 
                      size="lg"
                      onClick={handleBookSlot}
                    >
                      Bron qilish
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-24 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-purple-600 h-2" />
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary dark:text-white">
                    {formatPrice(field.price_per_hour)}
                  </div>
                  <div className="text-muted-foreground dark:text-slate-400">so'm / soat</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Manzil</p>
                      <p className="font-medium dark:text-white text-sm">{field.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ish vaqti</p>
                      <p className="font-medium dark:text-white text-sm">08:00 - 22:00</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bog'lanish</p>
                      <p className="font-medium dark:text-white text-sm">+998 71 123 45 67</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 h-12 text-base font-semibold shadow-lg" size="lg" onClick={handleBookSlot}>
                  Hoziroq bron qiling
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  To'lov Click yoki Payme orqali
                </p>
              </CardContent>
            </Card>

            {/* Owner Card */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3 dark:text-white">Ega bo'lish</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sizning maydoningizni platformaga qo'shmoqchimisiz?
                </p>
                <Button variant="outline" className="w-full">
                  Maydon qo'shish
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSelectMethod={handlePaymentSelect}
        amount={field.price_per_hour * (selectedSlots.length || 1)}
        isLoading={paymentLoading}
      />
    </div>
  );
}
