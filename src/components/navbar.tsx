"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "@/components/theme/theme-provider";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  MapIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Form, Input, Button as AntButton, message } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";

/* ─── Liquid Glass helpers ──────────────────────────────────── */
const glass = {
  light: {
    bg: "bg-white/70",
    border: "border-white/60",
    shadow: "shadow-[0_8px_32px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_0.5px_rgba(0,0,0,0.04)]",
  },
  dark: {
    bg: "bg-white/[0.07]",
    border: "border-white/[0.12]",
    shadow: "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_0.5px_rgba(255,255,255,0.04)]",
  },
};

function useGlass() {
  const { theme } = useTheme();
  return theme === "dark" ? glass.dark : glass.light;
}

/* ─── Auth Modal ────────────────────────────────────────────── */
function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login, signup, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const g = useGlass();
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    name?: string;
    phone: string;
    password: string;
  }) => {
    try {
      if (mode === "login") {
        await login(values.phone, values.password);
      } else {
        await signup(values.name!, values.phone, values.password);
      }
      form.resetFields();
      onClose();
    } catch (err: any) {
      message.error(err.message || "Xatolik yuz berdi");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />

      {/* Sheet */}
      <div
        className={cn(
          "relative w-full max-w-sm rounded-[32px] p-8 border backdrop-blur-3xl",
          g.bg, g.border, g.shadow,
          isDark ? "text-white" : "text-slate-900"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        <div className="mb-7">
          <h2 className="text-2xl font-black tracking-tight mb-1">
            {mode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish"}
          </h2>
          <p className="text-sm opacity-50 font-medium">
            {mode === "login"
              ? "Akkauntingizga kiring"
              : "Yangi akkaunt yarating"}
          </p>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
          {mode === "signup" && (
            <Form.Item name="name" rules={[{ required: true, message: "Ismingizni kiriting" }]}>
              <Input
                prefix={<UserOutlined className="opacity-30" />}
                placeholder="To'liq ismingiz"
                size="large"
                className="!rounded-2xl"
                style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") }}
              />
            </Form.Item>
          )}
          <Form.Item name="phone" rules={[{ required: true, message: "Telefon raqamingizni kiriting" }]}>
            <Input
              prefix={<PhoneOutlined className="opacity-30" />}
              placeholder="+998 90 123 45 67"
              size="large"
              className="!rounded-2xl"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Parolingizni kiriting" }]}>
            <Input.Password
              prefix={<LockOutlined className="opacity-30" />}
              placeholder="Parol"
              size="large"
              className="!rounded-2xl"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") }}
            />
          </Form.Item>

          <AntButton
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            className="!rounded-2xl !h-12 !font-black !uppercase !tracking-wider !text-[11px] !mt-2"
          >
            {mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
          </AntButton>
        </Form>

        <p className="text-center text-sm mt-5 opacity-50">
          {mode === "login" ? "Akkauntingiz yo'qmi? " : "Akkauntingiz bormi? "}
          <button
            className="font-black text-primary opacity-100"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Ro'yxatdan o'ting" : "Kirish"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── User Dropdown ─────────────────────────────────────────── */
function UserDropdown({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const g = useGlass();

  const items = [
    { label: "Mening bronlarim", icon: CalendarDaysIcon, href: "/bookings/history" },
    ...(user?.is_admin ? [{ label: "Admin panel", icon: ShieldCheckIcon, href: "/admin" }] : []),
    { label: "Sozlamalar", icon: Cog6ToothIcon, href: "/settings" },
  ];

  return (
    <div
      className={cn(
        "absolute right-0 top-full mt-3 w-52 rounded-[24px] border backdrop-blur-3xl overflow-hidden",
        g.bg, g.border, g.shadow
      )}
    >
      {/* User info */}
      <div className={cn("px-4 py-3 border-b", isDark ? "border-white/8" : "border-black/6")}>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Akkaunt</p>
        <p className="font-black text-sm mt-0.5 truncate">{user?.name}</p>
        <p className="text-[10px] opacity-40 font-medium truncate">{user?.phone}</p>
      </div>

      {/* Links */}
      <div className="py-1.5">
        {items.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors",
              isDark ? "hover:bg-white/8" : "hover:bg-black/5"
            )}
          >
            <Icon className="w-4 h-4 opacity-50" />
            {label}
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className={cn("border-t py-1.5", isDark ? "border-white/8" : "border-black/6")}>
        <button
          onClick={() => { logout(); router.push("/"); onClose(); }}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 w-full hover:bg-red-500/10 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  );
}

/* ─── Main Navbar ───────────────────────────────────────────── */
export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();
  const isDark = theme === "dark";
  const g = useGlass();

  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { label: "Maydonlar", href: "/#fields" },
    { label: "Xarita", href: "/map" },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  if (!mounted) return null;

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] hidden md:flex justify-center transition-all duration-500",
          scrolled ? "pt-3" : "pt-5"
        )}
      >
        <nav
          className={cn(
            "flex items-center gap-1 px-2 h-14 rounded-full border backdrop-blur-3xl transition-all duration-500",
            g.bg, g.border, g.shadow,
            scrolled ? "scale-[0.98]" : "scale-100"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 pl-3 pr-4 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white" />
              </svg>
            </div>
            <span className="font-black text-[15px] tracking-tight">Polya</span>
          </Link>

          {/* Divider */}
          <div className={cn("w-px h-5 mx-1", isDark ? "bg-white/10" : "bg-black/10")} />

          {/* Nav Links */}
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 h-10 rounded-full flex items-center text-[13px] font-bold transition-all",
                isDark
                  ? "text-white/60 hover:text-white hover:bg-white/8"
                  : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
              )}
            >
              {label}
            </Link>
          ))}

          {/* Divider */}
          <div className={cn("w-px h-5 mx-1", isDark ? "bg-white/10" : "bg-black/10")} />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              isDark
                ? "text-white/60 hover:text-white hover:bg-white/8"
                : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
            )}
            aria-label="Toggle theme"
          >
            {isDark
              ? <SunIcon className="w-4 h-4" />
              : <MoonIcon className="w-4 h-4" />
            }
          </button>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="relative ml-1 mr-1" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 pl-2 pr-3 h-10 rounded-full transition-all",
                  isDark ? "hover:bg-white/8" : "hover:bg-black/5",
                  dropdownOpen && (isDark ? "bg-white/8" : "bg-black/5")
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-[11px] font-black shadow-md">
                  {initials}
                </div>
                <span className={cn("text-[13px] font-bold max-w-[80px] truncate", isDark ? "text-white/80" : "text-slate-700")}>
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDownIcon className={cn("w-3.5 h-3.5 transition-transform opacity-40", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} />}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="ml-1 mr-1 h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-white text-[12px] font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95"
            >
              Kirish
            </button>
          )}
        </nav>
      </header>

      {/* ── Mobile Top Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden flex items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white" />
            </svg>
          </div>
          <span className="font-black text-[16px] tracking-tight">Polya</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-xl transition-colors",
              g.bg, g.border,
              isDark ? "text-white/60" : "text-slate-500"
            )}
          >
            {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-[11px] font-black shadow-md"
              >
                {initials}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2">
                  <UserDropdown onClose={() => setDropdownOpen(false)} />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="h-9 px-4 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary/25"
            >
              Kirish
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-safe",
        )}
      >
        <div className="mx-3 mb-3">
          <div
            className={cn(
              "flex items-center justify-around h-16 rounded-[28px] border backdrop-blur-3xl",
              g.bg, g.border, g.shadow
            )}
          >
            {[
              { href: "/", icon: HomeIcon, label: "Bosh" },
              { href: "/#fields", icon: () => <span className="text-lg">⚽</span>, label: "Maydon" },
              { href: "/map", icon: MapIcon, label: "Xarita" },
              ...(isAuthenticated
                ? [{ href: "/bookings/history", icon: CalendarDaysIcon, label: "Bronlar" }]
                : []),
            ].map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href.split("#")[0]));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-[24px] transition-all",
                    isActive
                      ? isDark ? "text-white" : "text-primary"
                      : isDark ? "text-white/35" : "text-slate-400"
                  )}
                >
                  <div className={cn(
                    "w-9 h-6 rounded-2xl flex items-center justify-center transition-all",
                    isActive && (isDark ? "bg-white/12" : "bg-primary/10")
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-[10px] font-black tracking-wide", isActive ? "opacity-100" : "opacity-60")}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
