"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  {
    name: "Jami Daromad",
    value: "2,450,000 UZS",
    change: "+12.5%",
    trend: "up",
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    name: "Faol Bronlar",
    value: "42",
    change: "+18%",
    trend: "up",
    icon: CalendarCheck,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    name: "Yangi Mijozlar",
    value: "156",
    change: "+3.2%",
    trend: "up",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  {
    name: "Bandlik Ko'rsatkichi",
    value: "84%",
    change: "+5.4%",
    trend: "up",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
];

export default function AdminDashboard() {
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
        <Link href="/admin/fields">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Yangi maydon qo'shish
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-2xl`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                {stat.change}
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">
                {stat.name}
              </p>
              <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
            {/* Background Accent Gradient */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
             So'nggi Bronlar
          </h3>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
              <CalendarCheck className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-muted-foreground dark:text-slate-500">
              Hozircha hech qanday yangi bronlar mavjud emas.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            Eng Ommabop Maydonlar
          </h3>
          <div className="space-y-6">
             {/* Simple Top Fields Placeholder */}
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-4 group cursor-pointer">
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
