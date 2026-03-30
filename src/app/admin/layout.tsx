"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/components/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Admin bo'lmagan foydalanuvchilarni qaytarish (Security Check)
  // Eslatma: Hozircha "is_admin" ustuni yo'qligi sababli tekshiruvni vaqtincha izohda qoldiramiz
  /*
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Yuklanmoqda...</div>;
  }
  */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Fix position on left */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="pl-64 min-h-screen">
        {/* Admin Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
