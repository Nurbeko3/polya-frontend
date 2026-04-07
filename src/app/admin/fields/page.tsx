"use client";

import { useEffect, useState, useRef } from "react";
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
  ChevronRight,
  ImagePlus,
  Upload,
  X as XIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { API_URL, api } from "@/lib/api";
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
    click_service_id: "",
    click_merchant_id: "",
    click_merchant_user_id: "",
    click_p2p_link: "",
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>("/fields/");
      setFields(data.fields || []);
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (field: Field) => {
    try {
      await api.put(`/fields/${field.id}`, { is_active: !field.is_active });
      setFields(fields.map(f => f.id === field.id ? { ...f, is_active: !f.is_active } : f));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const deleteField = async (id: number) => {
    if (!confirm("Haqiqatdan ham ushbu maydonni o'chirmoqchimisiz?")) return;
    
    try {
      await api.delete(`/fields/${id}`);
      setFields(fields.filter(f => f.id !== id));
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
      click_service_id: (field as any).click_service_id || "",
      click_merchant_id: (field as any).click_merchant_id || "",
      click_merchant_user_id: (field as any).click_merchant_user_id || "",
      click_p2p_link: (field as any).click_p2p_link || "",
    });
    setImageFile(null);
    setImagePreview(field.image_url || null);
    setIsEditDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Faqat rasm fayllarini tanlang (JPG, PNG, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5MB dan katta bo'lmasligi kerak");
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(editingField?.image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;
 
    setIsUpdating(true);
    try {
      let finalImageUrl = editFormData.image_url;

      // If a new image file was selected, upload it first
      if (imageFile) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await api.uploadFile<{ url: string }>("/fields/upload", imageFile);
          finalImageUrl = uploadResult.url;
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          alert("Rasm yuklashda xatolik: " + (uploadError.message || "Noma'lum xatolik"));
          setIsUploadingImage(false);
          setIsUpdating(false);
          return;
        }
        setIsUploadingImage(false);
      }

      const updateData = { ...editFormData, image_url: finalImageUrl };
      await api.put(`/fields/${editingField.id}`, updateData);
      setFields(fields.map(f => f.id === editingField.id ? { ...f, ...updateData } : f));
      setIsEditDialogOpen(false);
      setEditingField(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Error updating field:", error);
      alert(error.message || "Xatolik yuz berdi");
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
        <DialogContent className="rounded-[40px] sm:max-w-[600px] border-none p-0 overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-10 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase tracking-tight">Maydonni Tahrirlash</DialogTitle>
              <DialogDescription className="text-white/80 font-medium pt-2 text-base">
                Maydon ma'lumotlarini qulay tarzda o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <form onSubmit={handleUpdateField} className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maydon Nomi</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-primary/20 font-bold text-base text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Turi</Label>
                <Select
                  value={editFormData.field_type}
                  onValueChange={(val) => setEditFormData({ ...editFormData, field_type: val })}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-primary/20 font-bold text-base text-slate-900 dark:text-white">
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
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-primary/20 font-bold text-base text-slate-900 dark:text-white"
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
                    className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-primary/20 font-bold text-lg text-primary dark:text-blue-400"
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
                    className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-primary/20 font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maydon Rasmi</Label>
                
                {/* Image Preview */}
                <div className="relative group/img">
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <img
                        src={imagePreview}
                        alt="Maydon rasmi"
                        className="w-full h-48 object-cover rounded-2xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop";
                        }}
                      />
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover/img:opacity-100">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 bg-white/90 backdrop-blur-sm text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-lg"
                        >
                          <Upload className="w-4 h-4" />
                          Rasmni o'zgartirish
                        </button>
                      </div>
                      {/* File name badge if new file selected */}
                      {imageFile && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-lg text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
                            <ImagePlus className="w-3 h-3" />
                            Yangi rasm tanlandi: {imageFile.name.length > 20 ? imageFile.name.substring(0, 20) + '...' : imageFile.name}
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="w-7 h-7 bg-red-500/90 backdrop-blur-sm rounded-lg text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group/btn"
                    >
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center group-hover/btn:bg-primary/10 group-hover/btn:scale-110 transition-all">
                        <ImagePlus className="w-7 h-7 text-slate-400 group-hover/btn:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-500 group-hover/btn:text-primary transition-colors">Rasm tanlash</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP · Max 5MB</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* URL input as fallback */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">yoki URL kiriting</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <Input
                  value={editFormData.image_url}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, image_url: e.target.value });
                    setImagePreview(e.target.value || null);
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-primary/20 font-medium text-xs break-all px-4 text-slate-900 dark:text-white"
                />
              </div>

              {/* Click Payment Section */}
              <div className="sm:col-span-2 pt-4 border-t dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-blue-500" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Click To'lov Tizimi</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">Stadion egasining Click hisob ma'lumotlarini kiriting.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Merchant ID</Label>
                    <Input
                      value={editFormData.click_merchant_id}
                      onChange={(e) => setEditFormData({ ...editFormData, click_merchant_id: e.target.value })}
                      placeholder="Masalan: 12345"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none px-4 text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Service ID</Label>
                    <Input
                      value={editFormData.click_service_id}
                      onChange={(e) => setEditFormData({ ...editFormData, click_service_id: e.target.value })}
                      placeholder="Masalan: 54321"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none px-4 text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Merchant User ID</Label>
                    <Input
                      value={editFormData.click_merchant_user_id}
                      onChange={(e) => setEditFormData({ ...editFormData, click_merchant_user_id: e.target.value })}
                      placeholder="Masalan: 67890"
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none px-4 text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">P2P To'lov Linki</Label>
                    <Input
                      value={editFormData.click_p2p_link}
                      onChange={(e) => setEditFormData({ ...editFormData, click_p2p_link: e.target.value })}
                      placeholder="https://my.click.uz/clickp2p/..."
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none px-4 text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <DialogFooter className="gap-3 sm:gap-0 pt-4 p-8 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
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
              disabled={isUpdating || isUploadingImage}
              className="flex-1 rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            >
              {isUploadingImage ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rasm yuklanmoqda...</>
              ) : isUpdating ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
  );
}
