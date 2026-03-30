"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronLeftIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

interface Booking {
  id: number;
  field_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  field_name?: string; // We might need to fetch field details or include it in API
  price?: number;
}

export default function BookingHistoryPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/bookings/my-bookings?user_id=${user.id}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-4">Tizimga kiring</h1>
        <p className="text-white/50 mb-8">Bronlar tarixini ko'rish uchun avval tizimga kirishingiz kerak.</p>
        <Link href="/">
           <Button variant="outline" className="rounded-2xl border-white/10 text-white">Bosh sahifaga qaytish</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">
              <ChevronLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Bosh sahifa
            </Link>
            <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
              Mening <br /> Bronlarim
            </h1>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchHistory}
            className="rounded-2xl h-14 w-14 border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all"
          >
            <ArrowPathIcon className={cn("w-6 h-6", isLoading && "animate-spin")} />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[48px] backdrop-blur-3xl">
             <CalendarIcon className="w-16 h-16 text-white/10 mx-auto mb-6" />
             <h3 className="text-2xl font-bold mb-2">Bronlar topilmadi</h3>
             <p className="text-white/40 max-w-xs mx-auto">Sizda hali hech qanday faol bronlar mavjud emas.</p>
             <Link href="/">
               <Button className="mt-8 rounded-2xl h-12 px-8 font-bold uppercase tracking-widest">Hozir bron qilish</Button>
             </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-[36px] p-8 transition-all duration-500 backdrop-blur-3xl"
              >
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                       <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                          <MapPinIcon className="w-8 h-8" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <h4 className="text-xl font-black uppercase tracking-tight">Maydon #{booking.field_id}</h4>
                             <Badge variant="outline" className={cn(
                               "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                               booking.status === 'booked' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/40"
                             )}>
                               {booking.status === 'booked' ? 'Tasdiqlangan' : booking.status}
                             </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-bold text-white/40 text-xs uppercase tracking-widest">
                             <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-primary/40" /> {booking.date}
                             </div>
                             <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-primary/40" /> {booking.start_time} - {booking.end_time}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:border-l border-white/5 sm:pl-8">
                       <div className="text-right flex flex-col justify-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">To'lov statusi</span>
                          <span className="text-lg font-black text-emerald-500 uppercase">To'langan</span>
                       </div>
                       <Button variant="outline" className="rounded-2xl h-14 w-14 border-white/5 bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                          <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                       </Button>
                    </div>
                 </div>
                 
                 {/* Glass overlay on hover */}
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
