"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${id}/toggle-status`, {
        method: "POST",
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Foydalanuvchilar Boshqaruvi</h2>
        <p className="text-muted-foreground dark:text-slate-400 mt-2">Platformadagi barcha foydalanuvchilar ro'yxati va ularning statusi.</p>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Ism yoki telefon bo'yicha qidirish..." 
            className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Foydalanuvchi</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Aloqa</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Sana</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right leading-none">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                           {user.is_admin && <ShieldCheck className="w-4 h-4 text-primary" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">ID: {user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary/40" /> {user.phone}
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Mail className="w-3.5 h-3.5 text-primary/40" /> {user.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="outline" className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                      user.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {user.is_active ? "Aktiv" : "Bloklangan"}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Calendar className="w-3.5 h-3.5 text-primary/40" /> {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                         variant="outline" 
                         size="icon" 
                         className={cn(
                           "rounded-xl h-9 w-9",
                           user.is_active ? "text-rose-500 border-rose-100 hover:bg-rose-50" : "text-emerald-500 border-emerald-100 hover:bg-emerald-50"
                         )}
                         onClick={() => toggleStatus(user.id)}
                         disabled={user.is_admin}
                       >
                         {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                       </Button>
                       <Button variant="outline" size="icon" className="rounded-xl h-9 w-9">
                          <MoreVertical className="w-4 h-4" />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center bg-slate-50/30 dark:bg-slate-800/20">
               <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h4 className="text-lg font-bold dark:text-white">Foydalanuvchilar topilmadi</h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
