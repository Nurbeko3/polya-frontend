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
  MoreVertical,
  Activity,
  PlusCircle,
  ChevronDown,
  UserCheck2,
  AlertCircle,
  Edit,
  Trash2,
  Lock,
  User as UserIcon,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserData {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "admin" | "active" | "inactive">("all");
  
  // Edit State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    is_admin: false,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Create State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    is_admin: true,
  });

  // Delete State
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/admin/users/${userToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userToDelete));
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      is_admin: user.is_admin,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editFormData } : u));
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        const data = await response.json();
        // Since we don't get the full user back, just refetch
        fetchUsers();
        setIsCreateDialogOpen(false);
        setCreateFormData({
          name: "",
          phone: "",
          email: "",
          password: "",
          is_admin: true,
        });
      } else {
        const error = await response.json();
        alert(error.detail || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.phone.includes(searchQuery) ||
                         (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === "admin") return matchesSearch && u.is_admin;
    if (activeFilter === "active") return matchesSearch && u.is_active;
    if (activeFilter === "inactive") return matchesSearch && !u.is_active;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Foydalanuvchilar Boshqaruvi</h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-2 font-medium">Barcha foydalanuvchilar ro'yxati, ruxsatlari va faollik holati.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-2xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
          >
            <PlusCircle className="w-4 h-4" />
            Admin qo'shish
          </Button>
          <Badge variant="outline" className="hidden sm:flex rounded-full px-4 py-2 border-primary/20 text-primary gap-2 bg-primary/5">
            <Users className="w-4 h-4" />
            <span>{users.length} ta foydalanuvchi</span>
          </Badge>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border dark:border-slate-800 p-5 shadow-sm space-y-5 flex flex-col lg:flex-row lg:items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Ism, telefon raqam yoki email bo'yicha qidirish..." 
              className="pl-12 rounded-2xl h-12 bg-slate-50 dark:bg-slate-800/50 border-none text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         
         <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] overflow-x-auto min-w-[320px]">
           {[
             { id: "all", label: "Barchasi" },
             { id: "admin", label: "Adminlar" },
             { id: "active", label: "Faol" },
             { id: "inactive", label: "Bloklangan" }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveFilter(tab.id as any)}
               className={cn(
                 "flex-1 px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                 activeFilter === tab.id 
                   ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                   : "text-muted-foreground hover:text-slate-600 dark:hover:text-slate-300"
               )}
             >
               {tab.label}
             </button>
           ))}
         </div>
      </div>

      {/* Content Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {isLoading ? (
          <div className="p-8 space-y-4">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
             ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Foydalanuvchi</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Aloqa ma'lumotlari</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Holat / Rol</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Sana</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right leading-none">Boshqaruv</th>
                  </tr>
               </thead>
               <tbody className="divide-y dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all group">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/5">
                                {user.name.charAt(0).toUpperCase()}
                             </div>
                             <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                   <span className="font-bold text-slate-900 dark:text-white text-base">{user.name}</span>
                                   {user.is_admin && <ShieldCheck className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground opacity-60">ID: #{user.id}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="space-y-1.5 font-medium">
                             <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <Phone className="w-3.5 h-3.5 text-primary/50" /> {user.phone}
                             </div>
                             {user.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                   <Mail className="w-3.5 h-3.5 text-primary/50" /> {user.email}
                                </div>
                             )}
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex flex-col gap-2">
                             <Badge className={cn(
                               "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none w-fit",
                               user.is_active ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                             )}>
                                {user.is_active ? "Aktiv" : "Bloklangan"}
                             </Badge>
                             {user.is_admin ? (
                                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary w-fit bg-primary/5">
                                   Administrator
                                </Badge>
                             ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Foydalanuvchi</span>
                             )}
                          </div>
                       </td>
                       <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                          {new Date(user.created_at).toLocaleDateString()}
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                             <Button 
                               variant="outline" 
                               size="icon" 
                               className={cn(
                                 "rounded-2xl h-11 w-11 shadow-sm transition-all",
                                 user.is_active ? "text-rose-500 border-rose-100 hover:bg-rose-50" : "text-emerald-500 border-emerald-100 hover:bg-emerald-50"
                               )}
                               onClick={() => toggleStatus(user.id)}
                               disabled={user.is_admin}
                               title={user.is_active ? "Foydalanuvchini bloklash" : "Blokdan chiqarish"}
                             >
                                {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                             </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="rounded-2xl h-11 w-11 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:text-primary transition-all"
                                  >
                                     <MoreVertical className="w-5 h-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  className="w-56 rounded-[24px] p-2 border-slate-100 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                                >
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 py-3">
                                    Amallar
                                  </DropdownMenuLabel>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleEditClick(user)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors"
                                  >
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center transition-colors">
                                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Tahrirlash</span>
                                      <span className="text-[10px] text-slate-400 font-medium">Ma'lumotlarni o'zgartirish</span>
                                    </div>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 my-1.5 mx-2" />
                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(user.id)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 transition-colors"
                                  >
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm">O'chirish</span>
                                      <span className="text-[10px] text-rose-400/70 font-medium">Platformadan to'liq o'chirish</span>
                                    </div>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-slate-300" />
             </div>
             <h4 className="text-xl font-bold text-slate-900 dark:text-white">Foydalanuvchilar topilmadi</h4>
             <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
               Hech qanday foydalanuvchilar topilmadi. Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.
             </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      {!isLoading && filteredUsers.length > 0 && (
         <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-3xl p-5 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
               <strong>Maslahat:</strong> Foydalanuvchilarni bloklash ularning platformaga kirishini butunlay to'xtatadi. Admin foydalanuvchilar o'z-o'zini bloklay olmaydi.
            </p>
         </div>
      )}
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[32px] sm:max-w-[425px] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-primary to-purple-600 p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Foydalanuvchini Tahrirlash</DialogTitle>
              <DialogDescription className="text-white/70 font-medium pt-1">
                Foydalanuvchi ma'lumotlarini o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </div>

          <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ism</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    editFormData.is_admin ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
                  )}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">Administrator</p>
                    <p className="text-[10px] text-slate-400 font-medium">To'liq boshqaruv huquqi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, is_admin: !editFormData.is_admin })}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                    editFormData.is_admin ? "bg-primary" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                    editFormData.is_admin && "translate-x-6"
                  )} />
                </button>
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-xl h-12 font-bold"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              >
                {isUpdating ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-[32px] sm:max-w-[400px] border-none p-0 overflow-hidden shadow-2xl">
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Trash2 className="w-10 h-10 text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Foydalanuvchini o'chirish?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Siz haqiqatdan ham ushbu foydalanuvchini platformadan butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20"
              >
                {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirib tashlash"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="w-full h-12 rounded-2xl font-bold text-slate-400"
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User/Admin Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="rounded-[32px] sm:max-w-[425px] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Yangi Admin Qo'shish</DialogTitle>
              <DialogDescription className="text-white/70 font-medium pt-1">
                Tizim uchun yangi administrator yoki foydalanuvchi yarating.
              </DialogDescription>
            </DialogHeader>
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </div>

          <form onSubmit={handleCreateUser} className="p-8 space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">To'liq ism</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    placeholder="Ism Sharif"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/20 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Telefon raqam</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    placeholder="+998 90 123 45 67"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/20 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Parol</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/20 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    createFormData.is_admin ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-200 text-slate-400"
                  )}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 leading-none">Admin huquqi</p>
                    <p className="text-[10px] text-slate-400 font-medium">Boshqaruv roli</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, is_admin: !createFormData.is_admin })}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                    createFormData.is_admin ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                    createFormData.is_admin && "translate-x-6"
                  )} />
                </button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                {isCreating ? "Yaratilmoqda..." : "Tasdiqlash va Yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
