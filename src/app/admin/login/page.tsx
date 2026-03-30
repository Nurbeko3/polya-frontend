"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(phone, code);
      router.push("/admin");
    } catch {
      setError("Telefon raqami yoki kod xato");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Kirish</CardTitle>
          <CardDescription>
            Admin panelga kirish uchun telefon raqamingizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefon raqam</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kod</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="1234"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kuting..." : "Kirish"}
            </Button>
          </form>
          <p className="text-center text-sm mt-4">
            Akkauntingiz yo'qmi?{" "}
            <Link href="/admin/signup" className="text-primary hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
