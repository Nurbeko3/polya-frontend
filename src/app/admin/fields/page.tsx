"use client";

import { useEffect, useState } from "react";
import { 
  MapIcon, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Search,
  Plus,
  MapPin,
  Banknote,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { API_URL } from "@/lib/api";


interface Field {
  id: number;
  name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  image_url: string;
  is_active: boolean;
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredFields = fields.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Maydonlar Boshqaruvi</h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2">Barcha mavjud maydonlarni tahrirlang va boshqaring.</p>
        </div>
        <Link href="/admin">
           <Button variant="outline" className="rounded-xl">Dashboardga qaytish</Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Maydon nomi yoki shahar bo'yicha qidirish..." 
            className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm font-bold text-muted-foreground px-4 hidden sm:block">
          Jami: {filteredFields.length} ta
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-[32px] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <div 
              key={field.id} 
              className="group bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-48">
                <img 
                  src={field.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"} 
                  alt={field.name} 
                  className={cn("w-full h-full object-cover transition-all duration-500", !field.is_active && "grayscale opacity-50")} 
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className={cn(
                    "rounded-full px-3 py-1 font-bold border-none",
                    field.is_active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-500 shadow-lg shadow-slate-500/20"
                  )}>
                    {field.is_active ? "Faol" : "Noaktiv"}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                   <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                      {field.field_type}
                   </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white line-clamp-1">{field.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" /> {field.city}, {field.address}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Banknote className="w-4 h-4" /> {field.price_per_hour.toLocaleString()} UZS
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl h-10 w-10"
                      onClick={() => toggleStatus(field)}
                      title={field.is_active ? "O'chirish" : "Yoqish"}
                    >
                      {field.is_active ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-emerald-500" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl h-10 w-10 text-rose-500 border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      onClick={() => deleteField(field.id)}
                      title="O'chirish"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button className="rounded-xl h-10 px-4 gap-2 text-xs font-bold uppercase tracking-widest">
                    <Edit3 className="w-4 h-4" /> Tahrirlash
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredFields.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed dark:border-slate-800">
               <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h4 className="text-xl font-bold dark:text-white">Maydonlar topilmadi</h4>
               <p className="text-muted-foreground mt-2">Qidiruv bo'yicha hech qanday natija yo'q.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
