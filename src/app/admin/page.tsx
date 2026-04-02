"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

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

interface Stats {
  active_fields: number;
  cities: number;
  bookings: number;
  users: number;
}

const fieldTypeLabels: Record<string, string> = {
  football: "⚽ Futbol",
  tennis: "🎾 Tennis",
  basketball: "🏀 Basketbol",
  volleyball: "🏐 Voleybol",
};

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/applications?status=pending`),
        fetch(`${API_URL}/stats/`),
      ]);

      const appsData = await appsRes.json();
      const statsData = await statsRes.json();

      setApplications(Array.isArray(appsData) ? appsData : []);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      name: "Aktiv Maydonlar",
      value: stats?.active_fields ?? "—",
      icon: MapPin,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-500/20",
    },
    {
      name: "Kutilayotgan Arizalar",
      value: applications.length,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-500/20",
    },
    {
      name: "Jami Foydalanuvchilar",
      value: stats?.users ?? "—",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-100 dark:border-purple-500/20",
    },
    {
      name: "Jami Bronlar",
      value: stats?.bookings ?? "—",
      icon: CalendarCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Xush kelibsiz{user?.name ? `, ${user.name}` : ""} 👋
          </h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2 font-medium">
            Polya platformasining umumiy holati va statistikasi
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/applications">
            <Button className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 font-bold">
              <FileText className="w-4 h-4" />
              Arizalar
              {applications.length > 0 && (
                <span className="ml-1 bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {applications.length}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className={cn(
              "bg-white dark:bg-slate-900 p-6 rounded-[28px] border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group",
              stat.border
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <Activity className="w-4 h-4 text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground dark:text-slate-500">
              {stat.name}
            </p>
            <p className="text-3xl font-black mt-1 text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Applications Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">So'nggi arizalar</h3>
              <p className="text-xs text-muted-foreground">Kutilayotgan maydon qo'shish arizalari</p>
            </div>
          </div>
          <Link href="/admin/applications">
            <Button variant="outline" className="rounded-xl gap-2 text-xs font-bold uppercase tracking-wider">
              Barchasini ko'rish
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    {app.image_url ? (
                      <img
                        src={app.image_url}
                        alt={app.field_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        {app.field_type === "football"
                          ? "⚽"
                          : app.field_type === "tennis"
                          ? "🎾"
                          : app.field_type === "basketball"
                          ? "🏀"
                          : "🏐"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{app.field_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {app.city} • {fieldTypeLabels[app.field_type] || app.field_type} • {app.price_per_hour.toLocaleString()} UZS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Kutilmoqda
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Hammasi ko'rib chiqilgan ✨</h4>
            <p className="text-muted-foreground dark:text-slate-500 mt-1 max-w-xs mx-auto text-sm">
              Hozircha kutilayotgan yangi arizalar mavjud emas.
            </p>
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: "Maydonlar",
            desc: "Barcha maydonlarni boshqarish",
            href: "/admin/fields",
            icon: MapPin,
            color: "from-emerald-500 to-teal-600",
          },
          {
            title: "Bronlar",
            desc: "Bronlar registri va statistikasi",
            href: "/admin/bookings",
            icon: CalendarCheck,
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "Foydalanuvchilar",
            desc: "Foydalanuvchilarni boshqarish",
            href: "/admin/users",
            icon: Users,
            color: "from-purple-500 to-pink-600",
          },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group bg-white dark:bg-slate-900 rounded-[28px] border dark:border-slate-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform",
                  item.color
                )}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
