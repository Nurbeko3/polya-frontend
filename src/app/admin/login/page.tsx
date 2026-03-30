"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { LockIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(phone, password);
      // Login muvaffaqiyatli bo'lsa, avtomatik Dashboardga o'tadi
      // AuthContext o'zi redirekt qiladi yoki biz bu yerda qilamiz
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-800 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-3xl bg-primary/10 mb-6 border border-primary/20">
              <ShieldCheckIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Admin Panel
            </h1>
            <p className="text-slate-400 font-medium"> Tizimga boshqaruvchi sifatida kiring </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Telefon Raqami</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <PhoneIcon className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Parol</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <LockIcon className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-black rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Kiryapdi..." : "Kirish"}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
            >
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-slate-600 text-sm font-medium italic">
          Polya v1.0 Admin Access
        </p>
      </div>
    </div>
  );
}
