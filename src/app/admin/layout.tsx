"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuthStore } from "@/store/auth-store";

import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push("/admin/login");
    } else if (isAuthenticated && !isAuthPage && !user?.is_admin) {
      router.push("/");
    }
  }, [isAuthenticated, isAuthPage, user, router]);

  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  if (isAuthenticated && !isAuthPage && !user?.is_admin) {
    return null;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="pl-64 min-h-screen">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}