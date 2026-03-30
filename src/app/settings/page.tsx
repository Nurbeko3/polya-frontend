"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { 
  UserIcon, 
  KeyIcon, 
  BellIcon, 
  ShieldCheckIcon,
  ChevronLeftIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [formData, setFormData] = useState({
     name: "",
     phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone
      });
    }
  }, [user]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="space-y-4">
          <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">
            <ChevronLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Bosh sahifa
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tight leading-none text-white">Sozlamalar</h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.1em] text-[10px]">Profil va akkaunt xavfsizligi</p>
        </div>

        <div className="space-y-10">
          {/* Profile Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-4">
                <UserIcon className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Shaxsiy Ma'lumotlar</h3>
             </div>
             <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8 space-y-6 backdrop-blur-3xl">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-wider text-white/30 ml-1">To'liq ismingiz</Label>
                   <Input 
                     className="rounded-2xl h-14 bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/40 font-bold text-lg"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-wider text-white/30 ml-1">Telefon raqam</Label>
                   <Input 
                     readOnly
                     className="rounded-2xl h-14 bg-white/5 border-none text-white/40 cursor-not-allowed font-bold text-lg"
                     value={formData.phone}
                   />
                   <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest pl-1 mt-1">Telefon raqamni tahrirlash mumkin emas</p>
                </div>
                <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20">Saqlash</Button>
             </div>
          </section>

          {/* Grouped Settings */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-4">
                <Cog6ToothIcon className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tizim va Xavfsizlik</h3>
             </div>
             <div className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-3xl divide-y divide-white/5">
                <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                         <KeyIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-bold text-white">Parolni o'zgartirish</div>
                         <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Oxirgi marta 2 oy avval</div>
                      </div>
                   </div>
                   <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                   </div>
                </button>

                <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                         <BellIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-bold text-white">Xabarnomalar</div>
                         <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Push xabarlarni yoqish</div>
                      </div>
                   </div>
                   <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                   </div>
                </button>

                <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                         <LanguageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-bold text-white">Til sozlamalari</div>
                         <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Hozirgi til: O'zbekcha</div>
                      </div>
                   </div>
                   <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                   </div>
                </button>
             </div>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-4">
                <ShieldCheckIcon className="w-4 h-4 text-rose-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60">Xavfli Hudud</h3>
             </div>
             <div className="bg-rose-500/5 border border-rose-500/10 rounded-[32px] overflow-hidden backdrop-blur-3xl">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-between p-6 hover:bg-rose-500/10 transition-colors group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                         <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                         <div className="text-sm font-bold text-rose-500">Tizimdan chiqish</div>
                         <div className="text-[10px] font-bold text-rose-500/40 uppercase tracking-widest">Boshqa qurilmalardan ham</div>
                      </div>
                   </div>
                </button>
             </div>
          </section>
        </div>

        <div className="pt-12 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Polya v1.0.4 - 2026</p>
        </div>
      </div>
    </div>
  );
}
