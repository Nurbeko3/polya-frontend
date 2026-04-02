"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  CreditCard,
  Phone,
  Search,
  Filter,
  Activity,
  ArrowUpRight,
  TrendingDown,
  CalendarCheck,
  ChevronDown,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

interface Booking {
  id: number;
  field_name: string;
  user_name: string;
  user_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  confirmed: {
    label: "Tasdiqlangan",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
    icon: CheckCircle2,
  },
  pending: {
    label: "Kutilmoqda",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
    icon: Clock,
  },
  cancelled: {
    label: "Bekor qilingan",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
    icon: XCircle,
  },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/bookings/`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.field_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.user_phone.includes(searchQuery);
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && b.status === filterType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Bronlar Registri</h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2 font-medium">Barcha mavjud bronlar va to'lov statuslarini ko'rib chiqing va boshqaring.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="rounded-full px-4 py-2 border-primary/20 text-primary gap-2 bg-primary/5">
              <CalendarCheck className="w-4 h-4" />
              <span>{bookings.length} ta umumiy bron</span>
           </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Maydon nomi, foydalanuvchi ismi yoki telefon bo'yicha qidirish..." 
              className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
             {[
               { id: "all", label: "Barchasi" },
               { id: "confirmed", label: "Tasdiqlangan" },
               { id: "pending", label: "Kutilmoqda" },
               { id: "cancelled", label: "Bekor qilingan" }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setFilterType(tab.id as any)}
                 className={cn(
                   "px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   filterType === tab.id 
                     ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg" 
                     : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                 )}
               >
                 {tab.label}
               </button>
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t dark:border-slate-800 pt-4">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 Muvaffaqiyatli: <span className="text-slate-900 dark:text-white">{bookings.filter(b => b.status === "confirmed").length} ta</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                 <div className="w-2 h-2 rounded-full bg-rose-500" />
                 Rad etilgan: <span className="text-slate-900 dark:text-white">{bookings.filter(b => b.status === "cancelled").length} ta</span>
              </div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
              Natija: {filteredBookings.length} ta bron
           </p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
             <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-[28px] border dark:border-slate-800 animate-pulse" />
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            
            return (
              <div 
                key={booking.id} 
                className="group relative bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                       <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Calendar className="w-8 h-8" />
                       </div>
                       
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <h4 className="text-xl font-bold text-slate-900 dark:text-white">{booking.field_name}</h4>
                             <Badge className={cn(
                               "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                               booking.payment_status === 'paid' ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                             )}>
                               {booking.payment_status === 'paid' ? "To'langan" : "To'lov kutilmoqda"}
                             </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-10 gap-y-1.5 pt-1">
                             <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                <User className="w-4 h-4 text-primary" /> 
                                {booking.user_name}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                <Phone className="w-4 h-4 text-primary" /> 
                                {booking.user_phone}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                                <Clock className="w-4 h-4 text-primary" /> 
                                {booking.booking_date} • {booking.start_time} - {booking.end_time}
                             </div>
                             <div className="flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
                                <CreditCard className="w-4 h-4" /> 
                                {booking.total_price.toLocaleString()} UZS
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 lg:gap-1.5 pt-4 lg:pt-0 border-t lg:border-none dark:border-slate-800">
                       <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Holat</span>
                       <div className={cn(
                         "flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold uppercase tracking-tight transition-all",
                         status.bg,
                         status.color
                       )}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                       </div>
                    </div>
                 </div>
                 
                 {/* ID Overlay */}
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="text-[8px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-tighter">
                      ID: {booking.id}
                   </div>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[40px] border dark:border-slate-800 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent" />
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-slate-300" />
             </div>
             <h4 className="text-xl font-bold text-slate-900 dark:text-white">Bronlar topilmadi</h4>
             <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
               Hech qanday bronlar topilmadi. Qidiruv parametrlarini o'zgartirib ko'ring yoki kutib turing.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
