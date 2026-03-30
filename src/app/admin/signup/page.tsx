"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlusIcon, PhoneIcon, LockIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

export default function AdminSignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Parollar mos kelmadi");
      return;
    }

    if (formData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setIsLoading(true);

    try {
      // Signup funksiyasi (auth-context dagi) chaqiriladi
      await signup({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
      });
      // Signup muvaffaqiyatli bo'lsa, avtomatik Dashboardga o'tadi
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-800 p-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-3xl bg-primary/10 mb-6 border border-primary/20">
              <UserPlusIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Admin Yaratish
            </h1>
            <p className="text-slate-400 font-medium italic"> Yangi admin hisobini registratsiya qiling </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Ism va Familiya</label>
              <Input
                type="text"
                placeholder="Admin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Telefon Raqami</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                  <PhoneIcon className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Parol</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-300 ml-1">Tasdiqlang</label>
                 <Input
                   type="password"
                   placeholder="••••••••"
                   value={formData.confirmPassword}
                   onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                   className="h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all"
                   required
                 />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-black rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Yaratilmoqda..." : "Admin Yaratish"}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
            <p className="text-sm text-slate-600">
               Allaqachon hisob bormi?{" "}
               <Link href="/admin/login" className="text-primary font-bold hover:underline">
                 Kirish
               </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
