"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { PhoneIcon, UserIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UserCircleIcon, 
  ClockIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import Link from "next/link";

export function AuthDialogs() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login, signup, isLoading, isAuthenticated, user, logout } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (mode === "login") {
        await login(formData.phone, formData.password);
      } else {
        await signup(formData.name, formData.phone, formData.password);
      }
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 p-1.5 pl-4 rounded-3xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all group outline-none">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white/90">{user.name}</span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-white/40">{user.phone}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-2 p-2 rounded-[28px] bg-white dark:bg-slate-900/90 backdrop-blur-3xl border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
          <DropdownMenuLabel className="px-4 py-3">
             <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/50 mb-1">Mening Akkauntim</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
             </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2" />
          
          <div className="p-1 space-y-1">
            <Link href="/bookings/history">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer transition-all border border-transparent focus:border-slate-200 dark:focus:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <ClockIcon className="w-4 h-4" />
                </div>
                <span className="text-[13px] font-bold">Mening bronlarim</span>
              </DropdownMenuItem>
            </Link>

            {user.is_admin && (
              <Link href="/admin">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer transition-all border border-transparent focus:border-slate-200 dark:focus:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <ShieldCheckIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-bold">Admin Panel</span>
                </DropdownMenuItem>
              </Link>
            )}

            <Link href="/settings">
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer transition-all border border-transparent focus:border-slate-200 dark:focus:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                  <Cog6ToothIcon className="w-4 h-4" />
                </div>
                <span className="text-[13px] font-bold">Sozlamalar</span>
              </DropdownMenuItem>
            </Link>
          </div>

          <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 mx-2" />
          
          <div className="p-1">
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 focus:bg-rose-500/10 cursor-pointer transition-all border border-transparent focus:border-rose-500/10"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-bold">Tizimdan chiqish</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          Kirish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl">
        <div className="bg-primary/5 p-8 border-b dark:border-slate-800 text-center">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight dark:text-white mb-2">
                {mode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm font-medium">
                {mode === "login" ? "Akkauntingizga kiring va bron qilishni davom ettiring" : "Polya platformasiga qo'shiling va eng yaxshi maydonlarni toping"}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">To'liq ismingiz</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                  <UserIcon />
                </div>
                <Input 
                  required 
                  placeholder="Azizbek To'lqinov" 
                  className="rounded-2xl h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Telefon raqam</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                <PhoneIcon />
              </div>
              <Input 
                required 
                type="tel"
                placeholder="+998 90 123 45 67" 
                className="rounded-2xl h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Parol</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                <LockClosedIcon />
              </div>
              <Input 
                required 
                type="password"
                placeholder="••••••••" 
                className="rounded-2xl h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>


          {error && <p className="text-rose-500 text-xs font-bold text-center animate-pulse uppercase tracking-wider">{error}</p>}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-16 rounded-[24px] shadow-2xl shadow-primary/30 text-base font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 animate-gradient" />
             <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Kuting...
                    </>
                ) : mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
             </span>
          </Button>

          <div className="text-center pt-2">
            <button 
              type="button"
              className="text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Akkauntingiz yo'qmi? Ro'yxatdan o'ting" : "Akkauntingiz bormi? Tizimga kiring"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
