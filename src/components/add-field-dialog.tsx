"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  PlusCircleIcon, 
  PhotoIcon, 
  MapPinIcon, 
  PhoneIcon, 
  BanknotesIcon, 
  InformationCircleIcon 
} from "@heroicons/react/24/outline";
import { FieldType } from "@/types";
import { cn } from "@/lib/utils";

interface AddFieldDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

export function AddFieldDialog({ onSuccess, trigger }: AddFieldDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    field_type: "football" as FieldType,
    city: "Toshkent",
    address: "",
    price_per_hour: "",
    phone_number: "",
    description: "",
    image_url: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let finalImageUrl = formData.image_url;

      // Upload file if selected
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        
        const uploadResponse = await fetch(`${API_URL}/fields/upload`, {
          method: "POST",
          body: uploadData,
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          finalImageUrl = url;
        }
      }

      const response = await fetch(`${API_URL}/fields/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field_name: formData.name,
          field_type: formData.field_type,
          city: formData.city,
          address: formData.address,
          price_per_hour: parseInt(formData.price_per_hour),
          phone_number: formData.phone_number,
          description: formData.description,
          image_url: finalImageUrl,
        }),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          name: "",
          field_type: "football",
          city: "Toshkent",
          address: "",
          price_per_hour: "",
          phone_number: "",
          description: "",
          image_url: ""
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        alert("Ariza muvaffaqiyatli yuborildi! Adminlar tez orada ko'rib chiqishadi.");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" variant="outline" className="shadow-sm rounded-2xl h-14 px-8 border-primary/20 hover:border-primary/50 text-foreground transition-all">
            <PlusCircleIcon className="w-5 h-5 mr-2 text-primary" />
            Maydon qo'shish uchun ariza
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
        <div className="bg-primary/5 p-8 border-b dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 dark:text-white uppercase tracking-tight">
              <PlusCircleIcon className="w-8 h-8 text-primary" />
              Maydon qo'shishga ariza
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            Maydoningiz haqidagi ma'lumotlarni to'ldiring. Adminlar arizani ko'rib chiqib, siz bilan bog'lanishadi.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Maydon nomi</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                  <InformationCircleIcon />
                </div>
                <Input 
                  required 
                  placeholder="Masalan: Bunyodkor Arena" 
                  className="rounded-2xl h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Telefon raqam</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                  <PhoneIcon />
                </div>
                <Input 
                  required 
                  placeholder="+998 90 123 45 67" 
                  className="rounded-2xl h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.phone_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Sport turi</Label>
              <Select 
                value={formData.field_type} 
                onValueChange={(v: string) => setFormData({...formData, field_type: v as FieldType})}
              >
                <SelectTrigger className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                  <SelectItem value="football" className="rounded-xl focus:bg-primary/10">⚽ Futbol</SelectItem>
                  <SelectItem value="tennis" className="rounded-xl focus:bg-primary/10">🎾 Tennis</SelectItem>
                  <SelectItem value="basketball" className="rounded-xl focus:bg-primary/10">🏀 Basketbol</SelectItem>
                  <SelectItem value="volleyball" className="rounded-xl focus:bg-primary/10">🏐 Voleybol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Soatlik narxi</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                  <BanknotesIcon />
                </div>
                <Input 
                  required 
                  type="number" 
                  placeholder="150,000" 
                  className="rounded-2xl h-14 pl-12 pr-14 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold text-primary"
                  value={formData.price_per_hour}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price_per_hour: e.target.value})}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase">UZS</div>
              </div>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Shahar</Label>
              <Input 
                required 
                placeholder="Toshkent" 
                className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                value={formData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, city: e.target.value})}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Manzil</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40">
                  <MapPinIcon />
                </div>
                <Input 
                  required 
                  placeholder="Chilonzor, 6-mavze..." 
                  className="rounded-2xl h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Maydon rasmi</Label>
            <div 
              className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-[32px] p-4 transition-all duration-500 min-h-[160px] flex flex-col items-center justify-center gap-2 overflow-hidden",
                previewUrl ? "border-primary/40 bg-primary/5" : "border-slate-200 dark:border-slate-700/50 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[30px]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <PhotoIcon className="w-10 h-10 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                    <PhotoIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold dark:text-white">Professional rasm yuklang</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">PNG, JPG (Max. 5MB)</div>
                  </div>
                </>
              )}
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Tavsif (Ixtiyoriy)</Label>
            <Textarea 
              placeholder="Mijozlar uchun qulayliklar, sharoitlar haqida yozing..." 
              className="rounded-2xl min-h-[120px] bg-slate-50 dark:bg-slate-800/50 border-none resize-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all p-4"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="group w-full h-16 rounded-[24px] shadow-2xl shadow-primary/30 text-base font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary bg-[length:200%_100%] animate-gradient group-hover:animate-gradient-fast" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  Ariza yuborish
                  <PlusCircleIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </>
              )}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
