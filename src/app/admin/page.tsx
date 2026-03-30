"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

interface Application {
  id: number;
  field_name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  phone_number: string;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/applications?status=pending`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${API_URL}/admin/applications/${id}/${action}`, {
        method: "POST",
      });
      if (response.ok) {
        setApplications(apps => apps.filter(app => app.id !== id));
        alert(action === 'approve' ? "Maydon muvaffaqiyatli tasdiqlandi va yaratildi!" : "Ariza rad etildi.");
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      alert("Xatolik yuz berdi.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"> Dashboard </h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2">
            Polya loyihangizning barcha statistikasi va faoliyati.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/fields">
            <Button variant="outline" className="gap-2">
              Maydonlar boshqaruvi
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Jami Daromad", value: "2,450,000 UZS", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { name: "Yangi Arizalar", value: applications.length.toString(), icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { name: "Jami Mijozlar", value: "156", icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
          { name: "Bandlik", value: "84%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-2xl`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">{stat.name}</p>
            <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Field Applications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Maydon qo'shish uchun so'nggi arizalar
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Yangi maydon egalaridan kelib tushgan arizalarni ko'rib chiqing</p>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {applications.length} ta kutilayotgan
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : applications.length > 0 ? (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="group relative bg-slate-50 dark:bg-slate-800/30 rounded-[32px] p-6 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {app.image_url ? (
                        <img src={app.image_url} alt={app.field_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Plus className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{app.field_name}</h4>
                        <span className="bg-slate-200 dark:bg-slate-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{app.field_type}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" /> {app.city}, {app.address}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" /> {app.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-primary">
                          <Banknote className="w-4 h-4" /> {app.price_per_hour.toLocaleString()} UZS / soat
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarCheck className="w-4 h-4" /> {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {app.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 italic mt-2">"{app.description}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => handleAction(app.id, 'reject')}
                      variant="outline" 
                      className="rounded-2xl h-12 px-6 border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Rad etish
                    </Button>
                    <Button 
                      onClick={() => handleAction(app.id, 'approve')}
                      className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Tasdiqlash
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/30" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Hamma arizalar ko'rib chiqilgan</h4>
            <p className="text-muted-foreground dark:text-slate-500 mt-1 max-w-xs mx-auto">
              Hozircha kutilayotgan yangi arizalar mavjud emas.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Recent Bookings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
             So'nggi Bronlar
          </h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarCheck className="h-8 w-8 text-slate-300 mb-4" />
            <p className="text-muted-foreground dark:text-slate-500">Hech qanday yangi bronlar yo'q.</p>
          </div>
        </div>

        {/* Top Fields */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            Eng Ommabop Maydonlar
          </h3>
          <div className="space-y-6">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded-full w-1/3 animate-pulse" />
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
