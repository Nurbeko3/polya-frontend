"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Field, BookingSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotsGrid } from "@/components/time-slots-grid";
import { PaymentDialog } from "@/components/payment-dialog";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AddFieldDialog } from "@/components/add-field-dialog";
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
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";


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
  const fieldId = params.id as string;

  const [field, setField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  const fetchField = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Field>(`/fields/${fieldId}`);
      setField(data);
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
      // Timezone shift muammosini tuzatish: yyyy-MM-dd formatida local vaqt bilan olish
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const data = await api.get<{ slots: BookingSlot[] }>(`/bookings/slots/${fieldId}?date=${dateStr}`);
      setSlots(data.slots || []);
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
      setSelectedSlots([]);
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
    if (!isAuthenticated || !user) {
      toast.error("Iltimos, avval tizimga kiring!", {
        description: "Bron qilish uchun ro'yxatdan o'tishingiz yoki tizimga kirishingiz kerak."
      });
      // Optionally redirect to login or show auth dialog
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePaymentSelect = async (method: "click" | "payme") => {
    if (selectedSlots.length === 0 || !field || !user) return;

    setPaymentLoading(true);
    let firstPaymentUrl = "";

    try {
      for (const slot of selectedSlots) {
        // Lock the slot — uses JWT auth via api client (no manual user_id needed)
        const lockData = await api.lockSlot(slot.id);

        // Confirm (initiate payment) — uses JWT auth via api client
        const confirmData = await api.confirmBooking(slot.id, lockData.lock_token, method);

        if (!firstPaymentUrl && confirmData.payment_url) {
          firstPaymentUrl = confirmData.payment_url;
        }
      }

      if (firstPaymentUrl) {
        window.location.href = firstPaymentUrl;
      } else {
        toast.success("Bron muvaffaqiyatli amalga oshirildi!");
        setShowPaymentDialog(false);
        fetchSlots();
        setSelectedSlots([]);
      }
    } catch (error: any) {
      console.error("Error booking:", error);
      toast.error(error.message || "Bron qilishda xatolik yuz berdi", {
        description: "Iltimos, qayta urinib ko'ring.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-white/[0.03] p-12 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
             <MapPinIcon className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black mb-2 dark:text-white uppercase tracking-tight">Maydon topilmadi</h2>
          <p className="text-slate-500 dark:text-white/40 mb-8 font-bold">Kechirasiz, bu maydon mavjud emas</p>
          <Link href="/">
            <Button size="lg" className="rounded-2xl px-10 font-black uppercase tracking-widest h-14">Bosh sahifaga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <header className="glass dark:glass sticky top-0 z-50 border-b border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-all" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bosh sahifaga</span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="p-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
               <ThemeToggle />
             </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-[400px] bg-slate-200 dark:bg-[#0a0a0a] overflow-hidden">
        {field.image_url ? (
          <img src={field.image_url} alt={field.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-40 h-40 rounded-[40px] bg-gradient-to-br ${fieldColors[field.field_type] || "from-primary to-purple-600"} flex items-center justify-center text-7xl shadow-2xl opacity-80 rotate-3`}>
              {fieldIcons[field.field_type] || "🏟️"}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#050505] via-transparent to-black/20" />
        
        {field.rating > 0 && (
          <div className="absolute top-10 right-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/20 shadow-2xl animate-in fade-in zoom-in">
              <StarIconSolid className="w-5 h-5 text-amber-400" />
              <span className="font-black text-white">{field.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-col gap-4">
               <div className={`inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-gradient-to-r ${fieldColors[field.field_type]} text-white text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                  {fieldIcons[field.field_type]} {field.field_type}
               </div>
               <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter drop-shadow-sm">
                 {field.name}
               </h1>
               <div className="flex items-center gap-2 text-slate-500 dark:text-white/40 font-bold text-sm">
                 <MapPinIcon className="w-4 h-4 text-primary" />
                 <span>{field.city}, {field.address}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl shadow-black/5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white/20 mb-6">Haqida</h2>
                <p className="text-lg font-bold text-slate-600 dark:text-white/70 leading-relaxed max-w-2xl">
                  {field.description || "Bu ajoyib sport maydoni. Keling va o'zingiz zavq oling!"}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">
                  {[
                    { icon: UserGroupIcon, label: "Jamoa o'yini", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { icon: MapIcon, label: "Yaxshi lokatsiya", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { icon: StarIcon, label: "Yuqori reyting", color: "text-amber-500", bg: "bg-amber-500/10" },
                  ].map((feature, i) => (
                    <div key={i} className="flex flex-col items-start gap-3 p-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[32px] transition-all hover:border-primary/20 group">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", feature.bg)}>
                        <feature.icon className={cn("w-6 h-6", feature.color)} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.1em] dark:text-white/60">{feature.label}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl shadow-black/5">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                         <CalendarIcon className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white/20">Bron qilish</h2>
                   </div>
                </div>
                
                <div className="flex flex-col xl:flex-row gap-10">
                  <div className="flex-shrink-0 bg-slate-50 dark:bg-white/[0.02] p-6 rounded-[32px] border border-slate-100 dark:border-white/5">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-2xl"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                  
                  <div className="flex-1">
                    {selectedDate ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/[0.03] rounded-3xl border border-slate-100 dark:border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                 <ClockIcon className="w-5 h-5 text-primary" />
                              </div>
                              <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{formatDate(selectedDate)}</span>
                           </div>
                        </div>
                        <TimeSlotsGrid
                          slots={slots}
                          selectedSlots={selectedSlots}
                          onToggleSlot={handleToggleSlot}
                          isLoading={slotsLoading}
                        />
                      </div>
                    ) : (
                      <div className="h-full min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-white/[0.02] rounded-[40px] border-2 border-dashed border-slate-100 dark:border-white/5">
                        <div className="text-center">
                          <CalendarIcon className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20">Sana tanlang</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSlots.length > 0 && (
                  <div className="mt-10 bg-primary/10 border border-primary/20 dark:border-primary/10 rounded-[40px] p-10 animate-in slide-in-from-top-4">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                             <CheckIcon className="w-8 h-8" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Tanlangan vaqt</p>
                             <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                                {selectedSlots.length} soat • {selectedSlots[0].start_time} - {selectedSlots[selectedSlots.length - 1].end_time}
                             </h4>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 leading-none">Jami narx</p>
                          <h4 className="text-4xl font-black text-primary">{formatPrice(field.price_per_hour * selectedSlots.length)}</h4>
                       </div>
                    </div>
                    
                    <Button 
                      className="w-full h-16 mt-10 rounded-[28px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 group overflow-hidden relative" 
                      size="lg"
                      onClick={handleBookSlot}
                    >
                      <span className="relative z-10">Tasdiqlash va to'lash</span>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit space-y-8">
            {/* Price Card */}
            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl shadow-black/5 overflow-hidden group">
              <div className="absolute -top-1 left-0 right-0 h-4 bg-gradient-to-r from-primary to-purple-600 rounded-t-[48px]" />
              
              <div className="text-center mb-10">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white/20 mb-2">Soatlik narx</div>
                <div className="text-5xl font-black text-primary drop-shadow-sm">
                  {formatPrice(field.price_per_hour)}
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { icon: MapPinIcon, label: "Manzil", value: field.address, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: ClockIcon, label: "Ish vaqti", value: "08:00 - 22:00", color: "text-purple-500", bg: "bg-purple-500/10" },
                  { icon: PhoneIcon, label: "Bog'lanish", value: "+998 71 123 45 67", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[28px] transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/[0.02]", item.bg)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">{item.label}</p>
                      <p className="font-bold dark:text-white text-sm truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-10 h-16 rounded-[28px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20" size="lg" onClick={handleBookSlot}>
                Hoziroq bron qilish
              </Button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20 dark:border-primary/10 rounded-[40px] p-8 backdrop-blur-xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Maydon egasimisiz?</h3>
                <p className="text-sm font-bold text-slate-600 dark:text-white/50 mb-6">
                  Sizning maydoningiz hali ro'yxatda yo'qmi? Uni qo'shing va mijozlarni qabul qiling.
                </p>
                <AddFieldDialog 
                  trigger={
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/20 dark:border-white/10 font-bold uppercase tracking-widest text-[10px] bg-white/50 dark:bg-white/5 shadow-sm hover:border-primary/50 transition-all">
                      Maydon qo'shish
                    </Button>
                  }
                />
            </div>
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
