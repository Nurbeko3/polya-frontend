import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
  LayoutDashboardIcon,
  MapIcon,
  CalendarCheckIcon,
  UsersIcon,
  SettingsIcon,
  ArrowLeftIcon,
  LogOutIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
  { name: "Maydonlar", href: "/admin/fields", icon: MapIcon },
  { name: "Bronlar", href: "/admin/bookings", icon: CalendarCheckIcon },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: UsersIcon },
  { name: "Sozlamalar", href: "/admin/settings", icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white border-r border-slate-800 fixed left-0 top-0 z-50">
      <div className="p-6">
        <Logo className="text-white" showText whiteText />
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-white")} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Saytga qaytish</span>
        </Link>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all w-full text-left font-medium text-sm group">
          <LogOutIcon className="w-5 h-5" />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}
