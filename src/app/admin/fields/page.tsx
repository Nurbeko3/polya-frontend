"use client";

import { useEffect, useState } from "react";
import { 
  MapPin, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Search,
  Plus,
  Banknote,
  Navigation,
  MoreVertical,
  Activity,
  PlusCircle,
  Map as MapIcon,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Field {
  id: number;
  name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  image_url: string;
  is_active: boolean;
  phone_number?: string;
}

const fieldTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  football: { label: "Futbol", emoji: "⚽", color: "bg-green-500" },
  tennis: { label: "Tennis", emoji: "🎾", color: "bg-teal-500" },
  basketball: { label: "Basketbol", emoji: "🏀", color: "bg-orange-500" },
  volleyball: { label: "Voleybol", emoji: "🏐", color: "bg-pink-500" },
};

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    price_per_hour: 0,
    field_type: "football",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/fields/`);
      const data = await response.json();
      setFields(data.fields || []);
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (field: Field) => {
    try {
      const response = await fetch(`${API_URL}/fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !field.is_active }),
      });
      if (response.ok) {
        setFields(fields.map(f => f.id === field.id ? { ...f, is_active: !f.is_active } : f));
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const deleteField = async (id: number) => {
    if (!confirm("Haqiqatdan ham ushbu maydonni o'chirmoqchimisiz?")) return;
    
    try {
      const response = await fetch(`${API_URL}/fields/${id}`, {
        method: "DELETE",
      });
      if (response.status === 204) {
        setFields(fields.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const handleEditClick = (field: Field) => {
    setEditingField(field);
    setEditFormData({
      name: field.name,
      address: field.address,
      city: field.city,
      price_per_hour: field.price_per_hour,
      field_type: field.field_type,
      description: (field as any).description || "",
      image_url: field.image_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/fields/${editingField.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setFields(fields.map(f => f.id === editingField.id ? { ...f, ...editFormData } : f));
        setIsEditDialogOpen(false);
        setEditingField(null);
      } else {
        const error = await response.json();
        alert(error.detail || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error updating field:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredFields = fields.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "active") return matchesSearch && f.is_active;
    if (activeTab === "inactive") return matchesSearch && !f.is_active;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Maydonlar Boshqaruvi</h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2 font-medium">Platformadagi barcha mavjud maydonlarni tahrirlang va holatini boshqaring.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/admin/applications">
              <Button variant="outline" className="rounded-2xl h-12 px-6 gap-2 border-primary/20 text-primary hover:bg-primary/5">
                <PlusCircle className="w-4 h-4" />
                Yangi ariza
              </Button>
           </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 p-5 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Maydon nomi, shahar yoki manzil bo'yicha qidirish..." 
              className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[20px] w-full lg:w-auto">
            {[
              { id: "all", label: "Barchasi" },
              { id: "active", label: "Faol" },
              { id: "inactive", label: "Noaktiv" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 lg:flex-none px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                    : "text-muted-foreground hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Activity className="w-3.5 h-3.5" />
                Umumiy: <span className="text-slate-900 dark:text-white">{fields.length} ta</span>
             </div>
             <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground hidden sm:flex">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Faol: <span className="text-slate-900 dark:text-white">{fields.filter(f => f.is_active).length} ta</span>
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             Natijalar: {filteredFields.length} ta
          </p>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 h-96 animate-pulse p-6">
                <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4" />
                <div className="space-y-3">
                   <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
                   <div className="h-4 bg-slate-50 dark:bg-slate-800/50 rounded-full w-1/2" />
                </div>
             </div>
          ))}
        </div>
      ) : filteredFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => {
            const typeInfo = fieldTypeLabels[field.field_type] || { label: field.field_type, emoji: "🏟️", color: "bg-slate-500" };
            
            return (
              <div 
                key={field.id} 
                className="group bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={field.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop"} 
                    alt={field.name} 
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700 group-hover:scale-110", 
                      !field.is_active && "grayscale opacity-50"
                    )} 
                  />
                  
                  {/* Overlays */}
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                     <div className="flex items-center justify-between">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20",
                          typeInfo.color
                        )}>
                          {typeInfo.emoji} {typeInfo.label}
                        </div>
                        <Badge className={cn(
                          "rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none text-white",
                          field.is_active ? "bg-emerald-500" : "bg-slate-500"
                        )}>
                          {field.is_active ? "Aktiv" : "Noaktiv"}
                        </Badge>
                     </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-7 flex-1 flex flex-col space-y-5">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {field.name}
                    </h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{field.city}, {field.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Narx / soat</span>
                      <div className="flex items-center gap-1.5 font-black text-lg text-primary">
                        <Banknote className="w-4 h-4" />
                        {field.price_per_hour.toLocaleString()} <span className="text-[10px] uppercase">uzs</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <Button 
                         variant="outline" 
                         size="icon" 
                         className="rounded-2xl h-10 w-10 border-slate-200 dark:border-slate-800"
                         onClick={() => toggleStatus(field)}
                         title={field.is_active ? "O'chirish" : "Yoqish"}
                       >
                         {field.is_active ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-emerald-500" />}
                       </Button>
                       <Button 
                         variant="outline" 
                         size="icon" 
                         className="rounded-2xl h-10 w-10 text-rose-500 border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                         onClick={() => deleteField(field.id)}
                         title="O'chirish"
                       >
                         <Trash2 className="w-5 h-5" />
                       </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleEditClick(field)}
                    className="w-full rounded-2xl h-12 font-black uppercase tracking-[0.15em] text-xs gap-2 shadow-lg shadow-primary/20 shadow-none hover:shadow-xl transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Tahrirlash
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[40px] border dark:border-slate-800 shadow-sm">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Navigation className="w-10 h-10 text-slate-300" />
           </div>
           <h4 className="text-xl font-bold text-slate-900 dark:text-white">Maydonlar topilmadi</h4>
           <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
             Qidiruv natijasida hech qanday maydon topilmadi. Qidiruv so'zini o'zgartirib ko'ring yoki yangi maydon qo'shing.
           </p>
           <Button 
             variant="outline" 
             className="mt-6 rounded-2xl"
             onClick={() => setSearchQuery("")}
           >
             Qidiruvni tozalash
           </Button>
        </div>
      )}

      {/* Edit Field Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[40px] sm:max-w-[600px] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-10 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight">Maydonni Tahrirlash</DialogTitle>
              <DialogDescription className="text-white/80 font-medium pt-2 text-base">
                Maydon ma'lumotlarini qulay tarzda o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <form onSubmit={handleUpdateField} className="p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maydon Nomi</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold text-base"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Turi</Label>
                <Select
                  value={editFormData.field_type}
                  onValueChange={(val) => setEditFormData({ ...editFormData, field_type: val })}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-primary/20 font-bold text-base">
                    <SelectValue placeholder="Turini tanlang" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[24px] border-slate-100 bg-white dark:bg-slate-900 shadow-2xl p-2 z-[100]">
                    <SelectItem value="football" className="rounded-xl py-3">⚽ Futbol</SelectItem>
                    <SelectItem value="tennis" className="rounded-xl py-3">🎾 Tennis</SelectItem>
                    <SelectItem value="basketball" className="rounded-xl py-3">🏀 Basketbol</SelectItem>
                    <SelectItem value="volleyball" className="rounded-xl py-3">🏐 Voleybol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Shahar</Label>
                <Input
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold text-base"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Narx (soatiga)</Label>
                <div className="relative">
                  <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="number"
                    value={editFormData.price_per_hour}
                    onChange={(e) => setEditFormData({ ...editFormData, price_per_hour: parseInt(e.target.value) })}
                    className="h-14 pl-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold text-lg text-primary"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">To'liq Manzil</Label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="h-14 pl-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Rasm URL</Label>
                <Input
                  value={editFormData.image_url}
                  onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20 font-medium text-xs break-all px-4"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-2xl h-14 font-bold text-slate-400"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1 rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              >
                {isUpdating ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
