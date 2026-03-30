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

export function AuthDialogs() {
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

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</span>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user.phone}</span>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-xl h-10 w-10 border-slate-200 dark:border-slate-800"
          onClick={logout}
          title="Chiqish"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-rose-500" />
        </Button>
      </div>
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
            <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white mb-2">
                {mode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish"}
            </h2>
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
