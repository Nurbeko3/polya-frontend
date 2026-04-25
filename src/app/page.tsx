"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Field, FieldType } from "@/types";
import { FieldCard } from "@/components/field-card";
import { SearchFilters } from "@/components/search-filters";
import { Logo } from "@/components/logo";
import { AddFieldDialog } from "@/components/add-field-dialog";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { api } from "@/lib/api";
import { Typography, Card, Row, Col, Button, Spin, Empty, Badge, Space, Divider } from "antd";
import { Trophy, Calendar, ChevronRight, Search, Plus, ShieldCheck, CheckCircle2, Zap, Clock, MapPin, Star } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Sahifa birinchi ochilganda tepaga scroll qilish (hash bo'lmasa)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    fetchFields();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchFields = async (filters?: {
    city?: string;
    field_type?: FieldType;
    min_price?: string;
    max_price?: string;
  }) => {
    setIsLoading(true);
    try {
      const data = await api.getFields(filters);
      setFields(data.fields || []);
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === "dark";
  const colors = {
    bg: isDark ? "#0a0a0a" : "#ffffff",
    bgSecondary: isDark ? "#171717" : "#f9fafb",
    textPrimary: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#a1a1aa" : "#6b7280",
    border: isDark ? "#262626" : "#e5e7eb",
    cardBg: isDark ? "#171717" : "#ffffff",
    accent: isDark ? "#60a5fa" : "#2563eb",
  };

  const sportTypes = [
    { type: "football" as FieldType, label: "Futbol", emoji: "⚽", count: fields.filter(f => f.field_type === "football").length },
    { type: "tennis" as FieldType, label: "Tennis", emoji: "🎾", count: fields.filter(f => f.field_type === "tennis").length },
    { type: "basketball" as FieldType, label: "Basketbol", emoji: "🏀", count: fields.filter(f => f.field_type === "basketball").length },
    { type: "volleyball" as FieldType, label: "Voleybol", emoji: "🏐", count: fields.filter(f => f.field_type === "volleyball").length },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Maydonni tanlang",
      desc: "O'zingizga qulay sport turi va joylashuvni filtrlar orqali tezda toping.",
      icon: <Search size={24} strokeWidth={2} />,
      color: "#3b82f6"
    },
    {
      step: "02",
      title: "Vaqtni belgilang",
      desc: "Kalendar orqali bo'sh vaqtni tanlang va ma'lumotlaringizni kiriting.",
      icon: <Calendar size={24} strokeWidth={2} />,
      color: "#8b5cf6"
    },
    {
      step: "03",
      title: "To'lov va O'yin",
      desc: "Click yoki Payme orqali to'lovni amalga oshiring va o'yinga tayyorlaning!",
      icon: <CheckCircle2 size={24} strokeWidth={2} />,
      color: "#10b981"
    },
  ];

  // Scroll reveal observer — global, monitors all .reveal elements on the page
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const items = el.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const formatValue = (val: any) => {
    if (val === undefined || val === null) return "0";
    if (typeof val === "number") {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + "M+";
      if (val >= 1000) return (val / 1000).toFixed(1) + "K+";
      return val.toString();
    }
    return val;
  };

  return (
    <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative pt-24 pb-14 md:pt-32 md:pb-24 overflow-hidden"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, #0a0a0a 70%)"
            : "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.08) 0%, #f9fafb 70%)",
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none hero-bg-fade" aria-hidden>
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: isDark
                ? "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)"
                : "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse 50% 70% at 50% 30%, black, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse 50% 70% at 50% 30%, black, transparent)",
            }}
          />

          {/* Orbiting sport emojis — desktop only */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 0, height: 0 }}>
            {["⚽", "🎾", "🏀", "🏐"].map((emoji, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  ["--orbit-r" as string]: `${180 + i * 50}px`,
                  animation: `orbit ${18 + i * 4}s linear infinite`,
                  animationDelay: `${i * -4}s`,
                  fontSize: 22,
                  opacity: isDark ? 0.15 : 0.12,
                  filter: "blur(0.5px)",
                }}
              >
                {emoji}
              </div>
            ))}
          </div>

          {/* Glow spots */}
          <div
            className="absolute -top-32 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%)" }}
          />
          <div
            className="absolute -bottom-20 right-1/4 w-48 md:w-80 h-48 md:h-80 rounded-full float-pulse float-pulse-delay"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)" }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="hero-anim-1">
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-5 md:mb-8"
                style={{
                  background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.06)",
                  color: "#3b82f6",
                  border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.12)"}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                  }}
                />
                <span className="hidden sm:inline">O'zbekistonning #1 bron platformasi</span>
                <span className="sm:hidden">#1 bron platformasi</span>
              </div>
            </div>

            {/* Heading */}
            <div className="hero-anim-2">
              <h1
                className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] sm:leading-[1.1] tracking-tight mb-4 md:mb-7 px-2 sm:px-0"
                style={{ color: colors.textPrimary }}
              >
                Sport maydonlarini
                <br />
                <span className="text-gradient-animated">
                  oson bron qiling
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="hero-anim-3">
              <p
                className="text-sm sm:text-base md:text-lg mb-7 md:mb-10 max-w-xl mx-auto leading-relaxed px-2 sm:px-0"
                style={{ color: colors.textSecondary }}
              >
                Futbol, tennis, basketbol va boshqa sport maydonlarini{" "}
                <span style={{ color: colors.textPrimary, fontWeight: 600 }}>bir necha soniyada</span>{" "}
                bron qiling. Bepul va oson.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="hero-anim-4 flex flex-col sm:flex-row items-center justify-center gap-3 px-2 sm:px-0">
              <a href="#fields" className="w-full sm:w-auto">
                <Button
                  type="primary"
                  size="large"
                  icon={<Search size={16} />}
                  block
                  style={{
                    height: 48,
                    borderRadius: 13,
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                  }}
                >
                  Maydonlarni ko'rish
                </Button>
              </a>
              <AddFieldDialog
                onSuccess={() => {
                  fetchFields();
                  fetchStats();
                }}
                trigger={
                  <Button
                    size="large"
                    icon={<Plus size={16} />}
                    block
                    style={{
                      height: 48,
                      borderRadius: 13,
                      fontWeight: 600,
                      fontSize: 14,
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                      borderColor: isDark ? "#333" : "#e0e0e0",
                      color: colors.textPrimary,
                    }}
                  >
                    Maydon qo'shish
                  </Button>
                }
              />
            </div>
          </div>

          {/* Stats — animated stagger */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5 mt-10 md:mt-20 max-w-3xl mx-auto">
            {[
              { label: "Aktiv maydonlar", value: stats?.active_fields, icon: "🏟️", accent: "#3b82f6" },
              { label: "Shaharlar", value: stats?.cities, icon: "🌆", accent: "#8b5cf6" },
              { label: "Bron qilingan", value: stats?.bookings, icon: "📅", accent: "#10b981" },
              { label: "Foydalanuvchilar", value: stats?.users, icon: "👤", accent: "#f59e0b" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`hero-stat-${i + 1} group text-center py-4 sm:py-5 px-2 sm:px-3 rounded-xl sm:rounded-2xl cursor-default`}
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  backdropFilter: "blur(12px)",
                  transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${stat.accent}15`;
                  e.currentTarget.style.borderColor = `${stat.accent}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
                }}
              >
                <div className="text-lg sm:text-xl mb-1">{stat.icon}</div>
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold"
                  style={{ color: stat.accent, fontVariantNumeric: "tabular-nums" }}
                >
                  {formatValue(stat.value)}
                </div>
                <div
                  className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider sm:tracking-widest mt-1 font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 md:h-20"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, transparent, #0a0a0a)"
              : "linear-gradient(to bottom, transparent, #ffffff)",
          }}
        />
      </section>

      {/* Sport Types */}
      <section className="py-10 sm:py-14 md:py-20 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
        {/* Subtle background accent */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
            style={{ background: isDark ? "radial-gradient(ellipse, rgba(99,102,241,0.04) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(99,102,241,0.03) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Section header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-14 reveal">
            <Title level={2} className="!mb-2 !text-xl sm:!text-2xl md:!text-3xl font-extrabold" style={{ color: colors.textPrimary }}>
              O'zingizga mos sportni tanlang
            </Title>
            <Paragraph style={{ color: colors.textSecondary }} className="max-w-md mx-auto !mb-0 !text-sm sm:!text-base">
              4 xil sport turi — bir platformada
            </Paragraph>
          </div>

          {/* Sport cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-4xl mx-auto">
            {(() => {
              const sportConfigs: Record<string, { gradient: string; glow: string; shadow: string; ring: string }> = {
                football:   { gradient: "linear-gradient(135deg, #16a34a, #22c55e)", glow: "rgba(34,197,94,0.15)", shadow: "rgba(34,197,94,0.25)", ring: "rgba(34,197,94,0.2)" },
                tennis:     { gradient: "linear-gradient(135deg, #0891b2, #06b6d4)", glow: "rgba(6,182,212,0.15)", shadow: "rgba(6,182,212,0.25)", ring: "rgba(6,182,212,0.2)" },
                basketball: { gradient: "linear-gradient(135deg, #d97706, #f59e0b)", glow: "rgba(245,158,11,0.15)", shadow: "rgba(245,158,11,0.25)", ring: "rgba(245,158,11,0.2)" },
                volleyball: { gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)", glow: "rgba(139,92,246,0.15)", shadow: "rgba(139,92,246,0.25)", ring: "rgba(139,92,246,0.2)" },
              };
              const totalFields = fields.length || 1;

              return sportTypes.map(({ type, label, emoji, count }, i) => {
                const cfg = sportConfigs[type];
                const barPercent = Math.max(15, Math.min(100, (count / totalFields) * 100));
                return (
                  <div
                    key={type}
                    className={`reveal reveal-delay-${i < 3 ? i + 1 : 3} sport-card rounded-2xl sm:rounded-[20px] text-center`}
                    style={{
                      ["--sport-glow" as string]: cfg.glow,
                      backgroundColor: isDark ? "#141418" : "#ffffff",
                      border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
                      padding: "18px 10px 16px",
                      boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.04)",
                    } as React.CSSProperties}
                    onClick={() => fetchFields({ field_type: type })}
                  >
                    {/* Emoji with glow ring */}
                    <div className="relative mx-auto mb-3 sm:mb-4" style={{ width: 64, height: 64 }}>
                      {/* Glow ring */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: cfg.gradient,
                          opacity: 0.12,
                          filter: "blur(8px)",
                          transform: "scale(1.3)",
                        }}
                      />
                      {/* Ring border */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `2px solid ${cfg.ring}`,
                          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
                        }}
                      />
                      {/* Emoji */}
                      <div className="sport-emoji absolute inset-0 flex items-center justify-center text-[30px] sm:text-[34px]">
                        {emoji}
                      </div>
                    </div>

                    {/* Label */}
                    <div
                      className="text-sm sm:text-base font-bold mb-1"
                      style={{ color: colors.textPrimary }}
                    >
                      {label}
                    </div>

                    {/* Count + bar */}
                    <div className="text-[11px] sm:text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
                      {count} ta maydon
                    </div>
                    <div
                      className="mx-auto rounded-full overflow-hidden"
                      style={{
                        width: "60%",
                        height: 3,
                        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        className="sport-count-bar h-full rounded-full"
                        style={{
                          ["--bar-width" as string]: `${barPercent}%`,
                          background: cfg.gradient,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* Animated Advantages Section */}
      <section
        className="py-12 sm:py-16 md:py-28 relative overflow-hidden"
        style={{ backgroundColor: isDark ? "#0d1117" : "#f8fafc" }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-20 -left-20 w-48 sm:w-72 h-48 sm:h-72 rounded-full float-pulse"
            style={{ background: isDark ? "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-10 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full float-pulse float-pulse-delay"
            style={{ background: isDark ? "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" : "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }}
          />
          <div
            className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full float-pulse float-pulse-delay-2"
            style={{ background: isDark ? "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)" : "radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Section header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-20 reveal">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-5"
              style={{
                background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.08)",
                color: "#3b82f6",
                border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)"}`,
              }}
            >
              <Zap size={14} />
              Bizning afzalliklarimiz
            </div>
            <Title
              level={2}
              className="!mb-2 sm:!mb-3 !text-xl sm:!text-2xl md:!text-4xl font-extrabold !leading-tight"
              style={{ color: colors.textPrimary }}
            >
              Sport bron qilish —{" "}
              <span className="number-shine" style={{ color: "#3b82f6" }}>
                yangi darajada
              </span>
            </Title>
            <Paragraph style={{ color: colors.textSecondary }} className="max-w-lg mx-auto !mb-0 px-2 !text-sm sm:!text-base">
              Har bir detal sizning qulayligingiz uchun o'ylangan
            </Paragraph>
          </div>

          {/* Feature cards — staggered reveal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: <Clock size={24} strokeWidth={1.8} />,
                title: "5 soniyada bron",
                desc: "Maydonni tanlang, vaqtni belgilang — tayyor. Uzun formalar va kutish yo'q.",
                accent: "#3b82f6",
                stat: "~5s",
                statLabel: "o'rtacha bron vaqti",
              },
              {
                icon: <ShieldCheck size={24} strokeWidth={1.8} />,
                title: "Xavfsiz to'lov",
                desc: "Click va Payme integratsiyasi. Pulingiz kafolatda — to'lov faqat tasdiqlangandan keyin.",
                accent: "#10b981",
                stat: "100%",
                statLabel: "xavfsiz tranzaksiyalar",
              },
              {
                icon: <MapPin size={24} strokeWidth={1.8} />,
                title: "Yaqin maydonlar",
                desc: "Xarita orqali eng yaqin maydonlarni toping. Shahar va sport turi bo'yicha filtr.",
                accent: "#8b5cf6",
                stat: `${stats?.cities || 0}+`,
                statLabel: "shahar qamrovi",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} feature-card-glow ${i === 2 ? "sm:col-span-2 md:col-span-1" : ""}`}
                style={
                  {
                    "--card-accent": feature.accent,
                    backgroundColor: isDark ? "#161b22" : "#ffffff",
                    border: `1px solid ${isDark ? "#30363d" : "#e5e7eb"}`,
                    borderRadius: 16,
                    padding: "20px 18px",
                    cursor: "default",
                    boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.04)",
                  } as React.CSSProperties
                }
              >
                {/* Icon */}
                <div className="icon-pop" style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${feature.accent}12`,
                      border: `1px solid ${feature.accent}25`,
                      color: feature.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <Title level={4} className="!mb-1.5 !text-base sm:!text-lg font-bold" style={{ color: colors.textPrimary }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ color: colors.textSecondary, lineHeight: 1.7 }} className="!mb-4 !text-[13px] sm:!text-sm">
                  {feature.desc}
                </Paragraph>

                {/* Stat pill */}
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isDark ? "#30363d" : "#f0f0f0"}`,
                  }}
                >
                  <span
                    className="text-lg sm:text-xl font-extrabold"
                    style={{ color: feature.accent, fontVariantNumeric: "tabular-nums" }}
                  >
                    {feature.stat}
                  </span>
                  <span className="text-[11px] sm:text-xs" style={{ color: colors.textSecondary, fontWeight: 500 }}>
                    {feature.statLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust bar */}
          <div className="reveal mt-8 sm:mt-12 md:mt-16">
            <div
              className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-10 py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                border: `1px solid ${isDark ? "#1e2530" : "#f0f0f0"}`,
              }}
            >
              {[
                { icon: <Star size={14} />, text: "4.9 reyting" },
                { icon: <CheckCircle2 size={14} />, text: `${stats?.bookings || 0}+ bron` },
                { icon: <Trophy size={14} />, text: `${stats?.active_fields || 0}+ maydon` },
                { icon: <Zap size={14} />, text: "24/7 qo'llab-quvvatlash" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 justify-center" style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 500 }}>
                  <span className="flex-shrink-0" style={{ color: "#3b82f6" }}>{item.icon}</span>
                  <span className="text-[11px] sm:text-[13px] whitespace-nowrap">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fields Section */}
      <section id="fields" className="py-12 md:py-16 scroll-mt-16" style={{ backgroundColor: colors.bg }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 md:mb-8">
            <Title level={2} className="!mb-1 !text-xl md:!text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Mashhur maydonlar
            </Title>
            <Text style={{ color: colors.textSecondary }}>Eng ko'p bron qilingan maydonlar</Text>
          </div>

          <SearchFilters onSearch={fetchFields} isLoading={isLoading} />

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spin size="large" />
            </div>
          ) : fields.length > 0 ? (
            <Row gutter={[16, 16]}>
              {fields.map((field) => (
                <Col xs={24} sm={12} lg={8} key={field.id}>
                  <FieldCard field={field} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="Maydonlar topilmadi" className="py-16" />
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 md:py-20" style={{ backgroundColor: colors.bgSecondary }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <Title level={2} className="!mb-2 !text-xl md:!text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Qanday ishlaydi?
            </Title>
            <Paragraph style={{ color: colors.textSecondary }} className="max-w-xl mx-auto !mb-0 px-2 !text-sm sm:!text-base">
              Ushbu 3 ta oddiy qadam orqali maydoningizni band qiling
            </Paragraph>
          </div>
          <Row gutter={[12, 12]}>
            {howItWorks.map((item, i) => (
              <Col xs={24} sm={8} key={i}>
                <Card
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                    borderRadius: 16,
                  }}
                  className="h-full"
                  styles={{ body: { padding: "16px" } }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      style={{ backgroundColor: `${item.color}15`, color: item.color, minWidth: 46, height: 46 }}
                      className="rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      <div className="text-center">
                        <div className="text-[10px] font-bold mb-0.5">{item.step}</div>
                        {item.icon}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <Title level={5} className="!mb-0.5 !text-sm sm:!text-base" style={{ color: colors.textPrimary }}>
                        {item.title}
                      </Title>
                      <Paragraph style={{ color: colors.textSecondary }} className="!mb-0 !text-[13px] sm:!text-sm">
                        {item.desc}
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-6 sm:mt-8 md:mt-12">
            <a href="#fields">
              <Button type="primary" size="large" icon={<ChevronRight size={16} />}>
                Boshlash
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="pt-10 pb-24 md:pb-12"
        style={{ backgroundColor: colors.bg, borderTop: `1px solid ${colors.border}` }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <Row gutter={[24, 32]}>
            <Col xs={24} md={6}>
              <Logo />
              <Paragraph style={{ color: colors.textSecondary }} className="mt-3 !text-sm">
                O'zbekistonning eng yaxshi sport maydonlarini bron qilish platformasi
              </Paragraph>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Title level={5} className="!mb-3" style={{ color: colors.textPrimary }}>
                To'lov tizimlari
              </Title>
              <Space size={12}>
                <div className="bg-white dark:bg-slate-200 p-2 rounded border overflow-hidden w-20 h-10 flex items-center justify-center">
                  <img src="/assets/images/click.jpg" alt="Click" className="w-full h-auto object-contain" />
                </div>
                <div className="bg-white dark:bg-slate-200 p-2 rounded border overflow-hidden w-20 h-10 flex items-center justify-center">
                  <img src="/assets/images/payme.jpg" alt="Payme" className="w-full h-auto object-contain" />
                </div>
              </Space>
              <Text style={{ color: colors.textSecondary, display: "block" }} className="mt-2 text-xs">
                Xavfsiz va tezkor to'lovlar
              </Text>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Title level={5} className="!mb-3" style={{ color: colors.textPrimary }}>
                Havolalar
              </Title>
              <Space direction="vertical" size={8} className="w-full">
                <a href="#" style={{ color: colors.textSecondary, fontSize: 14 }}>Bosh sahifa</a>
                <a href="#fields" style={{ color: colors.textSecondary, fontSize: 14 }}>Maydonlar</a>
                <Link href="/bookings" style={{ color: colors.textSecondary, fontSize: 14 }}>Bronlarim</Link>
              </Space>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Title level={5} className="!mb-3" style={{ color: colors.textPrimary }}>
                Aloqa
              </Title>
              <Space direction="vertical" size={8} className="w-full">
                <a href="https://t.me/Makkalik_yigit" target="_blank" rel="noopener noreferrer" style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Telegram: Admin
                </a>
                <a href="mailto:nurkn177@gmail.com" style={{ color: colors.textSecondary, fontSize: 14 }}>
                  nurkn177@gmail.com
                </a>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Toshkent, O'zbekiston</Text>
              </Space>
            </Col>
          </Row>
          <Divider style={{ borderColor: colors.border }} />
          <div className="text-center text-sm" style={{ color: colors.textSecondary }}>
            © {new Date().getFullYear()} Polya. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
