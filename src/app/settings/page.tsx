"use client";

export const dynamic = 'force-dynamic';

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
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        password: "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setStatus(null);
    try {
      const updateData: { name?: string; password?: string } = {
        name: formData.name
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateProfile(updateData);
      setStatus({ type: 'success', message: "Ma'lumotlar muvaffaqiyatli saqlandi!" });
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || "Saqlashda xatolik yuz berdi" });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="space-y-4">
          <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 hover:text-primary transition-colors">
            <ChevronLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Bosh sahifa
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">Sozlamalar</h1>
          <p className="text-slate-400 dark:text-white/40 font-bold uppercase tracking-[0.1em] text-[10px]">Profil va akkaunt xavfsizligi</p>
        </div>

        {status && (
          <div className={cn(
            "p-6 rounded-[24px] border font-bold text-sm animate-in fade-in slide-in-from-top-4",
            status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          )}>
            {status.message}
          </div>
        )}

        <div className="space-y-10">
          {/* Profile Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-4">
                <UserIcon className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">Shaxsiy Ma'lumotlar</h3>
             </div>
             <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[32px] p-8 space-y-6 backdrop-blur-3xl shadow-sm">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/30 ml-1">To'liq ismingiz</Label>
                   <Input 
                     className="rounded-2xl h-14 bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/40 font-bold text-lg text-slate-900 dark:text-white"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/30 ml-1">Telefon raqam</Label>
                   <Input 
                     readOnly
                     className="rounded-2xl h-14 bg-slate-100 dark:bg-white/5 border-none text-slate-400 dark:text-white/40 cursor-not-allowed font-bold text-lg"
                     value={formData.phone}
                   />
                   <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest pl-1 mt-1">Telefon raqamni tahrirlash mumkin emas</p>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/30 ml-1">Yangi parol (ixtiyoriy)</Label>
                   <Input 
                     type="password"
                     placeholder="••••••••"
                     className="rounded-2xl h-14 bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/40 font-bold text-lg text-slate-900 dark:text-white px-6"
                     value={formData.password}
                     onChange={(e) => setFormData({...formData, password: e.target.value})}
                   />
                </div>

                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
                >
                  {isLoading ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
             </div>
          </section>

          {/* Grouped Settings */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-4">
                <Cog6ToothIcon className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">Sayt Sozlamalari</h3>
             </div>
             <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden backdrop-blur-3xl divide-y divide-slate-100 dark:divide-white/5 shadow-sm">
                <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group text-left">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                         <BellIcon className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900 dark:text-white">Xabarnomalar</div>
                         <div className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Push xabarlarni yoqish</div>
                      </div>
                   </div>
                   <div className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/60 transition-colors">
                      <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                   </div>
                </button>

                <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group text-left">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                         <ComputerDesktopIcon className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900 dark:text-white">Interfeys mavzusi</div>
                         <div className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Tizim holatida</div>
                      </div>
                   </div>
                   <div className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/60 transition-colors">
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
             <div className="bg-rose-500/5 border border-rose-500/10 rounded-[32px] overflow-hidden backdrop-blur-3xl shadow-sm">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-6 hover:bg-rose-500/10 transition-colors group text-left"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                         <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-rose-500">Tizimdan chiqish</div>
                         <div className="text-[10px] font-bold text-rose-500/40 uppercase tracking-widest">Boshqa qurilmalardan ham</div>
                      </div>
                   </div>
                </button>
             </div>
          </section>
        </div>

        <div className="pt-12 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-white/20">Polya v1.0.4 - 2026</p>
        </div>
      </div>
    </div>
  );
}
