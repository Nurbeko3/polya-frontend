"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  MapIcon,
  CalendarCheckIcon,
  UsersIcon,
  FileTextIcon,
  ArrowLeftIcon,
  LogOutIcon,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
  { name: "Arizalar", href: "/admin/applications", icon: FileTextIcon },
  { name: "Maydonlar", href: "/admin/fields", icon: MapIcon },
  { name: "Bronlar", href: "/admin/bookings", icon: CalendarCheckIcon },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: UsersIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white border-r border-slate-800 fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-800/50">
        <Logo className="text-white" showText whiteText />
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Asosiy</p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Saytga qaytish</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all w-full text-left font-medium text-sm group"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}
