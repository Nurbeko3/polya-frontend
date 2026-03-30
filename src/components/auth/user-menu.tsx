"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";
import Link from "next/link";
import { 
  UserCircleIcon, 
  CalendarIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, 
  ChevronDownIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1.5 pl-3 rounded-full transition-all duration-300",
          "bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50",
          "hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-primary/5",
          isOpen && "ring-2 ring-primary/20 bg-white dark:bg-slate-800"
        )}
      >
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-xs font-bold leading-tight dark:text-white uppercase tracking-wider">
            {user.name}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            ID: {user.id}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-inner">
          {user.name.charAt(0)}
        </div>
        <ChevronDownIcon className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* iOS Style Dropdown */}
      {isOpen && (
        <div 
          className={cn(
            "absolute right-0 mt-3 w-64 origin-top-right z-50 overflow-hidden",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
            "border border-white/20 dark:border-slate-700/50 rounded-[24px] shadow-2xl shadow-black/10",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold dark:text-white">{user.name}</span>
                <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                  {user.phone || "Foydalanuvchi"}
                </span>
              </div>
              {user.is_verified && (
                <ShieldCheckIcon className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            <Link 
              href="/bookings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors hover:bg-primary/5 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary group"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarIcon className="w-4 h-4 text-primary" />
              </div>
              Mening bronlarim
            </Link>

            <Link 
              href="/profile/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Cog6ToothIcon className="w-4 h-4 text-slate-500" />
              </div>
              Profil sozlamalari
            </Link>

            <div className="mx-2 my-2 border-t border-slate-100 dark:border-slate-800/50" />

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 group"
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </div>
              Chiqish
            </button>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Polya v1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
