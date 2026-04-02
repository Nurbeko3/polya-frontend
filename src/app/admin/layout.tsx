"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuthStore } from "@/store/auth-store";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const hydrated = useAuthStore.persist.hasHydrated();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  useEffect(() => {
    if (hydrated && !isAuthenticated && !isAuthPage) {
      router.push("/admin/login");
    } else if (hydrated && isAuthenticated && !isAuthPage && !user?.is_admin) {
      router.push("/");
    }
  }, [hydrated, isAuthenticated, isAuthPage, user, router]);

  if (!hydrated) {
    return null; // Don't redirect until we know the auth state
  }

  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  if (isAuthenticated && !isAuthPage && !user?.is_admin) {
    return null;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/applications") return "Arizalar";
    if (pathname === "/admin/fields") return "Maydonlar";
    if (pathname === "/admin/bookings") return "Bronlar";
    if (pathname === "/admin/users") return "Foydalanuvchilar";
    return "Admin Panel";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="pl-64 min-h-screen">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b dark:border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-lg font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}