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
import { PlusCircleIcon, PhotoIcon, MapPinIcon } from "@heroicons/react/24/outline";
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

      const response = await fetch(`${API_URL}/fields/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image_url: finalImageUrl,
          price_per_hour: parseInt(formData.price_per_hour),
          latitude: 41.3111,
          longitude: 69.2401
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
          description: "",
          image_url: ""
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error adding field:", error);
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
            Maydon qo'shish
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
        <div className="bg-primary/5 p-8 border-b dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2 dark:text-white uppercase tracking-tight">
              <PlusCircleIcon className="w-8 h-8 text-primary" />
              Yangi maydon qo'shish
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            Maydoningiz haqidagi ma'lumotlarni to'ldiring va mijozlarni jalb qiling.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Maydon nomi</Label>
              <Input 
                required 
                placeholder="Masalan: Bunyodkor Arena" 
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-primary"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sport turi</Label>
              <Select 
                value={formData.field_type} 
                onValueChange={(v: string) => setFormData({...formData, field_type: v as FieldType})}
              >
                <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="football">⚽ Futbol</SelectItem>
                  <SelectItem value="tennis">🎾 Tennis</SelectItem>
                  <SelectItem value="basketball">🏀 Basketbol</SelectItem>
                  <SelectItem value="volleyball">🏐 Voleybol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Soatlik narxi (UZS)</Label>
              <Input 
                required 
                type="number" 
                placeholder="150,000" 
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.price_per_hour}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price_per_hour: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shahar</Label>
              <Input 
                required 
                placeholder="Toshkent" 
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none"
                value={formData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, city: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manzil</Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  required 
                  placeholder="Chilonzor, 6-mavze..." 
                  className="rounded-xl h-12 pl-10 bg-slate-50 dark:bg-slate-800 border-none"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Maydon rasmi</Label>
            <div 
              className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-[24px] p-4 transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center gap-2 overflow-hidden",
                previewUrl ? "border-primary/40 bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[22px]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <PhotoIcon className="w-10 h-10 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <PhotoIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold dark:text-white">Rasm yuklang</div>
                    <div className="text-xs text-muted-foreground">PNG, JPG (Max. 5MB)</div>
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
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tavsif</Label>
            <Textarea 
              placeholder="Maydon haqida qo'shimcha ma'lumotlar..." 
              className="rounded-xl min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none resize-none focus-visible:ring-primary"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 rounded-2xl shadow-xl shadow-primary/25 text-lg font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Qo'shilmoqda...
              </div>
            ) : "Maydonni qo'shish"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>

  );
}
