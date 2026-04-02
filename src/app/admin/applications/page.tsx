"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Banknote,
  CalendarCheck,
  FileText,
  Search,
  Filter,
  Eye,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

interface Application {
  id: number;
  field_name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  phone_number: string;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

const fieldTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  football: { label: "Futbol", emoji: "⚽", color: "bg-green-500" },
  tennis: { label: "Tennis", emoji: "🎾", color: "bg-teal-500" },
  basketball: { label: "Basketbol", emoji: "🏀", color: "bg-orange-500" },
  volleyball: { label: "Voleybol", emoji: "🏐", color: "bg-pink-500" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: {
    label: "Kutilmoqda",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    icon: Clock,
  },
  approved: {
    label: "Tasdiqlangan",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rad etilgan",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    icon: XCircle,
  },
};

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const statusParam = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const response = await fetch(`${API_URL}/admin/applications${statusParam}`);
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/admin/applications/${id}/${action}`, {
        method: "POST",
      });
      if (response.ok) {
        setApplications((apps) => apps.filter((app) => app.id !== id));
        setExpandedApp(null);
      } else {
        const data = await response.json();
        alert(data.detail || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      alert("Xatolik yuz berdi.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone_number.includes(searchQuery) ||
      app.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusFilters: { key: FilterStatus; label: string; icon: any }[] = [
    { key: "pending", label: "Kutilmoqda", icon: Clock },
    { key: "approved", label: "Tasdiqlangan", icon: CheckCircle2 },
    { key: "rejected", label: "Rad etilgan", icon: XCircle },
    { key: "all", label: "Barchasi", icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Maydon Arizalari
          </h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2 font-medium">
            Maydon egalaridan kelgan arizalarni ko'rib chiqing, tasdiqlang yoki rad eting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-full px-4 py-2 text-sm font-bold bg-primary/10 text-primary border-none">
            <FileText className="w-4 h-4 mr-2" />
            {filteredApplications.length} ta ariza
          </Badge>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border dark:border-slate-800 p-5 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Maydon nomi, shahar, manzil yoki telefon bo'yicha qidirish..."
            className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                filterStatus === key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-slate-50 dark:bg-slate-800/50 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-slate-900 rounded-[28px] border dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const isExpanded = expandedApp === app.id;
            const typeInfo = fieldTypeLabels[app.field_type] || {
              label: app.field_type,
              emoji: "🏟️",
              color: "bg-slate-500",
            };
            const status = statusConfig[app.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={app.id}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-[28px] border dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300",
                  isExpanded && "shadow-xl ring-2 ring-primary/20"
                )}
              >
                {/* Main Row */}
                <div
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                >
                  <div className="flex items-center gap-5">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative group">
                      {app.image_url ? (
                        <img
                          src={app.image_url}
                          alt={app.field_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                          {typeInfo.emoji}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          {app.field_name}
                        </h4>
                        <span
                          className={cn(
                            "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest text-white",
                            typeInfo.color
                          )}
                        >
                          {typeInfo.emoji} {typeInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {app.city}, {app.address}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-primary">
                          <Banknote className="w-3.5 h-3.5" />
                          {app.price_per_hour.toLocaleString()} UZS/soat
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-3 lg:flex-shrink-0">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold",
                        status.bg,
                        status.color
                      )}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-slate-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 space-y-6">
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                            Telefon
                          </p>
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <Phone className="w-4 h-4 text-primary" />
                            {app.phone_number}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                            Shahar
                          </p>
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <MapPin className="w-4 h-4 text-primary" />
                            {app.city}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                            Narx
                          </p>
                          <div className="flex items-center gap-2 font-bold text-primary">
                            <Banknote className="w-4 h-4" />
                            {app.price_per_hour.toLocaleString()} UZS
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                            Ariza sanasi
                          </p>
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <CalendarCheck className="w-4 h-4 text-primary" />
                            {new Date(app.created_at).toLocaleDateString("uz-UZ", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {app.description && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                            Tavsif
                          </p>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {app.description}
                          </p>
                        </div>
                      )}

                      {/* Image Preview */}
                      {app.image_url && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                            Maydon rasmi
                          </p>
                          <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64">
                            <img
                              src={app.image_url}
                              alt={app.field_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Address Detail */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                          To'liq manzil
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{app.address}</p>
                      </div>

                      {/* Actions */}
                      {app.status === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(app.id, "approve");
                            }}
                            disabled={actionLoading === app.id}
                            className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 font-bold text-base gap-2 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            {actionLoading === app.id ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5" />
                            )}
                            Tasdiqlash va maydon yaratish
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(app.id, "reject");
                            }}
                            disabled={actionLoading === app.id}
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-rose-200 dark:border-rose-500/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 font-bold text-base gap-2 transition-all"
                          >
                            <XCircle className="w-5 h-5" />
                            Rad etish
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 shadow-sm">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              {filterStatus === "pending" ? (
                <Sparkles className="h-10 w-10 text-emerald-500/30" />
              ) : (
                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              {filterStatus === "pending"
                ? "Hammasi ko'rib chiqilgan! ✨"
                : searchQuery
                ? "Qidiruv bo'yicha natija topilmadi"
                : "Arizalar mavjud emas"}
            </h4>
            <p className="text-muted-foreground dark:text-slate-500 mt-2 max-w-sm mx-auto">
              {filterStatus === "pending"
                ? "Hozircha kutilayotgan yangi arizalar mavjud emas. Yangi ariza kelganda siz bildirishnoma olasiz."
                : searchQuery
                ? "Qidiruv parametrlarini o'zgartirib ko'ring."
                : "Bu kategoriyada hech qanday ariza yo'q."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() => setSearchQuery("")}
              >
                Qidiruvni tozalash
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
