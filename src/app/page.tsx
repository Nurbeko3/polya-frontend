"use client";

import { useState, useEffect } from "react";
import { Field, FieldType } from "@/types";
import { FieldCard } from "@/components/field-card";
import { SearchFilters } from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth/auth-context";
import { UserMenu } from "@/components/auth/user-menu";
import { AddFieldDialog } from "@/components/add-field-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MapIcon,
  PlusCircleIcon,
  SparklesIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const sportIcons: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

export default function HomePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    fetchFields();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats/`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchFields = async (filters?: {
    city?: string;
    field_type?: FieldType;
    min_price?: string;
    max_price?: string;
  }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.city) params.append("city", filters.city);
      if (filters?.field_type) params.append("field_type", filters.field_type);
      if (filters?.min_price) params.append("min_price", filters.min_price);
      if (filters?.max_price) params.append("max_price", filters.max_price);

      const response = await fetch(`${API_URL}/fields/${params.toString() ? `?${params.toString()}` : ""}`);
      const data = await response.json();
      setFields(data.fields || []);
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sportTypes = [
    { 
      type: "football" as FieldType, 
      label: "Futbol", 
      emoji: "⚽", 
      count: fields.filter(f => f.field_type === "football").length,
      gradient: "from-green-500/20 to-emerald-600/20",
      accent: "bg-green-500"
    },
    { 
      type: "tennis" as FieldType, 
      label: "Tennis", 
      emoji: "🎾", 
      count: fields.filter(f => f.field_type === "tennis").length,
      gradient: "from-teal-500/20 to-cyan-600/20",
      accent: "bg-teal-500"
    },
    { 
      type: "basketball" as FieldType, 
      label: "Basketbol", 
      emoji: "🏀", 
      count: fields.filter(f => f.field_type === "basketball").length,
      gradient: "from-orange-500/20 to-amber-600/20",
      accent: "bg-orange-500"
    },
    { 
      type: "volleyball" as FieldType, 
      label: "Voleybol", 
      emoji: "🏐", 
      count: fields.filter(f => f.field_type === "volleyball").length,
      gradient: "from-pink-500/20 to-rose-600/20",
      accent: "bg-pink-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="glass dark:glass sticky top-0 z-50 border-b dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#fields" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Maydonlar
            </a>
            <Link href="/map" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <MapIcon className="w-4 h-4" />
              Xarita
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
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

            <div className="flex items-center gap-2 border-l dark:border-slate-800 md:pl-4 pl-2">
              <ThemeToggle />
              <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 dark:from-primary/10 dark:via-purple-500/10 dark:to-pink-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl dark:bg-primary/20" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl dark:bg-purple-500/20" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-subtle">
              <SparklesIcon className="w-4 h-4" />
              O'zbekistonning eng yaxshi bron platformasi
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight dark:text-white">
              Sport maydonlarini{" "}
              <span className="gradient-text">oson bron qiling</span>
            </h1>
            <p className="text-lg text-muted-foreground dark:text-slate-400 mb-8 max-w-2xl mx-auto flex flex-col items-center gap-4">
              <span>
                Futbol, tennis, basketbol va boshqa sport maydonlarini bir necha 
                soniyada bron qiling.
              </span>
              <span className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <span className="text-sm font-medium">To'lovlar orqali:</span>
                <img src="/assets/images/click.jpg" alt="Click" className="h-5 w-auto rounded border" />
                <img src="/assets/images/payme.jpg" alt="Payme" className="h-5 w-auto rounded border" />
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#fields">
                <Button size="lg" className="shadow-lg shadow-primary/25 rounded-2xl h-14 px-8">
                  Maydonlarni ko'rish
                </Button>
              </a>
              <AddFieldDialog 
                onSuccess={() => {
                  fetchFields();
                  fetchStats();
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { label: "Aktiv maydonlar", value: stats?.active_fields || "500+" },
              { label: "Shaharlar", value: stats?.cities || "12" },
              { label: "Bron qilingan", value: stats?.bookings || "10K+" },
              { label: "Foydalanuvchilar", value: stats?.users || "25K+" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-[28px] p-6 shadow-xl shadow-black/5 border border-white/20 dark:border-slate-700/50 text-center hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sport Types */}
      <section className="py-16 bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Sport turlari</h2>
              <p className="text-sm text-muted-foreground mt-1">O'zingizga mos sport turini tanlang</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sportTypes.map(({ type, label, emoji, count, gradient, accent }) => (
              <div
                key={type}
                className={cn(
                  "group relative overflow-hidden rounded-[32px] p-8 text-left transition-all duration-500",
                  "bg-gradient-to-br border border-white/20 dark:border-slate-700/30",
                  gradient
                )}
              >
                {/* Background Pattern */}
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none grayscale">
                  {emoji}
                </div>

                <div className={cn(
                  "w-16 h-16 rounded-3xl shadow-lg flex items-center justify-center mb-6 bg-white dark:bg-slate-800",
                )}>
                  <span className="text-3xl">{emoji}</span>
                </div>
                
                <div className="relative z-10">
                  <div className="font-black text-xl mb-1 dark:text-white uppercase tracking-tight">{label}</div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", accent)} />
                    <div className="text-sm font-bold text-muted-foreground dark:text-slate-400">{count} ta maydon</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 dark:text-white uppercase tracking-tight">Nima uchun Polya?</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Bizning platforma orqali siz eng yaxshi maydonlarni topishingiz 
              va bir necha soniyada bron qilishingiz mumkin
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClockIcon,
                title: "Tez bron qilish",
                description: "Bir necha soniyada maydon bron qiling va vaqtingizni tejang",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: ShieldCheckIcon,
                title: "Xavfsiz to'lov",
                description: "Click va Payme orqali xavfsiz va ishonchli to'lovlar",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: StarIcon,
                title: "Keng tanlov",
                description: "Turli sport turlari va shaharlar bo'yicha eng yaxshi maydonlar",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
            ].map((feature, i) => (
              <div key={i} className="group bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-[32px] p-10 shadow-xl shadow-black/5 border border-white dark:border-slate-700/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500", feature.bg)}>
                  <feature.icon className={cn("w-8 h-8", feature.color)} />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-muted-foreground dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fields Section */}
      <section id="fields" className="py-16 dark:bg-slate-950 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold dark:text-white">Mashhur maydonlar</h2>
              <p className="text-muted-foreground dark:text-slate-400 mt-1">
                Eng ko'p bron qilingan maydonlar
              </p>
            </div>
          </div>

          <SearchFilters onSearch={fetchFields} isLoading={isLoading} />

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border dark:border-slate-700">
                  <div className="h-48 bg-muted dark:bg-slate-700 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-muted dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted dark:bg-slate-700 rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-muted dark:bg-slate-700 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : fields.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Maydonlar topilmadi</h3>
              <p className="text-muted-foreground dark:text-slate-400">
                Qidiruv parametrlarini o'zgartiring yoki filterlarni tozalang
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Hoziroq bron qiling!
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Eng yaxshi sport maydonlarini bir necha soniyada bron qiling
          </p>
          <Button size="lg" variant="secondary" className="shadow-xl">
            Boshlash
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white dark:bg-slate-950 dark:border-t dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="sm" />
              <p className="text-sm text-slate-400">
                O'zbekistonning eng yaxshi sport maydonlarini bron qilish platformasi
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">To'lov tizimlari</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white p-1 rounded border overflow-hidden w-20 h-10 flex items-center justify-center">
                  <img src="/assets/images/click.jpg" alt="Click" className="w-full h-auto object-contain" />
                </div>
                <div className="bg-white p-1 rounded border overflow-hidden w-20 h-10 flex items-center justify-center">
                  <img src="/assets/images/payme.jpg" alt="Payme" className="w-full h-auto object-contain" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">
                Xavfsiz va tezkor to'lovlar
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Havolalar</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Bosh sahifa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Maydonlar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bronlarim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yordam</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Biz bilan bog'lanish</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Qo'llab quvvatlash</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Aloqa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>+998 71 123 45 67</li>
                <li>info@polya.uz</li>
                <li>Toshkent, O'zbekiston</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Polya. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
