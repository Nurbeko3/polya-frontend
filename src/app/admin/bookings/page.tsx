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
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredBookings = bookings.filter(b => 
    b.field_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user_phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bronlar Registri</h2>
        <p className="text-muted-foreground dark:text-slate-400 mt-2">Barcha mavjud bronlar va to'lov statuslarini ko'rib chiqing.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Maydon, ism yoki telefon bo'yicha qidirish..." 
            className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl h-12">
              <Filter className="w-5 h-5 mr-2" /> Saralash
           </Button>
        </div>
        <div className="text-sm font-bold text-muted-foreground px-4 hidden lg:block border-l dark:border-slate-800">
          Jami: {filteredBookings.length} ta
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Calendar className="w-7 h-7" />
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <h4 className="text-lg font-bold text-slate-900 dark:text-white">{booking.field_name}</h4>
                           <Badge variant="outline" className={cn(
                             "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
                             booking.payment_status === 'paid' ? "border-emerald-500 text-emerald-500" : "border-slate-400"
                           )}>
                             {booking.payment_status === 'paid' ? "To'langan" : "To'lov kutilmoqda"}
                           </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <User className="w-4 h-4" /> {booking.user_name}
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Phone className="w-4 h-4" /> {booking.user_phone}
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" /> {booking.booking_date} | {booking.start_time} - {booking.end_time}
                           </div>
                           <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-500">
                              <CreditCard className="w-4 h-4" /> {booking.total_price.toLocaleString()} UZS
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-none dark:border-slate-800">
                     <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                           {booking.status === 'confirmed' ? (
                             <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="text-sm font-bold uppercase tracking-tight text-emerald-500">Tasdiqlangan</span></>
                           ) : booking.status === 'cancelled' ? (
                             <><XCircle className="w-4 h-4 text-rose-500" /> <span className="text-sm font-bold uppercase tracking-tight text-rose-500">Bekor qilingan</span></>
                           ) : (
                             <><Clock className="w-4 h-4 text-amber-500" /> <span className="text-sm font-bold uppercase tracking-tight text-amber-500">Kutilmoqda</span></>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed dark:border-slate-800">
               <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h4 className="text-xl font-bold dark:text-white">Bronlar topilmadi</h4>
               <p className="text-muted-foreground mt-2">Qidiruv bo'yicha hech qanday natija yo'q.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
