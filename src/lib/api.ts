import { supabase } from "./supabase";
import type { FieldType } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Field {
  id: number;
  name: string;
  field_type: FieldType;
  description: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  price_per_hour: number;
  image_url: string | null;
  phone_number: string | null;
  rating: number;
  is_active: boolean;
}

export interface BookingSlot {
  id: number;
  field_id: number;
  user_id?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "locked" | "pending" | "booked" | "rejected";
  locked_until: string | null;
  rejection_reason?: string | null;
}

export interface BookingLockResponse {
  slot_id: number;
  lock_token: string;
  expires_in_seconds: number;
  message: string;
}

export interface BookingConfirmResponse {
  booking_id: number;
  field_id: number;
  date: string;
  start_time: string;
  end_time: string;
  payment_id: number;
  amount: number;
  payment_url: string | null;
  status: string;
}

export interface FieldListResponse {
  fields: Field[];
  total: number;
  page: number;
  per_page: number;
}

export interface SlotListResponse {
  slots: BookingSlot[];
  field_id: number;
  date: string;
}

export interface UserBookingsResponse {
  bookings: BookingSlot[];
  total: number;
  page: number;
  per_page: number;
}

// ── Slot generation (08:00–22:00, 1-soatlik) ─────────────────────────────

function generateTimeSlots(fieldId: number, date: string): BookingSlot[] {
  const slots: BookingSlot[] = [];
  for (let h = 8; h < 22; h++) {
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + 1).padStart(2, "0")}:00`;
    slots.push({
      id: -(h - 7), // virtual id (manfiy)
      field_id: fieldId,
      date,
      start_time: start,
      end_time: end,
      status: "available",
      locked_until: null,
    });
  }
  return slots;
}

// ── API class ──────────────────────────────────────────────────────────────

class ApiClient {
  // ── Fields ──────────────────────────────────────────────────────────────

  async getFields(filters?: {
    city?: string;
    field_type?: string;
    min_price?: string;
    max_price?: string;
  }): Promise<FieldListResponse> {
    let query = supabase
      .from("fields")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
    if (filters?.field_type) query = query.eq("field_type", filters.field_type);
    if (filters?.min_price) query = query.gte("price_per_hour", Number(filters.min_price));
    if (filters?.max_price) query = query.lte("price_per_hour", Number(filters.max_price));

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { fields: data || [], total: data?.length || 0, page: 1, per_page: 100 };
  }

  async getField(id: number | string): Promise<Field> {
    const { data, error } = await supabase
      .from("fields")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getAdminFields(): Promise<FieldListResponse> {
    const { data, error } = await supabase
      .from("fields")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { fields: data || [], total: data?.length || 0, page: 1, per_page: 1000 };
  }

  async createField(payload: Partial<Field>): Promise<Field> {
    const { data, error } = await supabase
      .from("fields")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateField(id: number, payload: Partial<Field>): Promise<Field> {
    const { data, error } = await supabase
      .from("fields")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteField(id: number): Promise<void> {
    const { error } = await supabase.from("fields").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async uploadFieldImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const fileName = `fields/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("polya-images")
      .upload(fileName, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("polya-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  // ── Booking Slots ────────────────────────────────────────────────────────

  async getSlots(fieldId: number | string, date: string): Promise<SlotListResponse> {
    // Expired lock'larni tozalaymiz
    await supabase.rpc("cleanup_expired_locks");

    const { data: existing, error } = await supabase
      .from("booking_slots")
      .select("*")
      .eq("field_id", fieldId)
      .eq("date", date);

    if (error) throw new Error(error.message);

    // Barcha 14 ta slotni generatsiya qilamiz
    const generated = generateTimeSlots(Number(fieldId), date);

    // DB dagi ma'lumotlar bilan birlashtirамiz
    const merged = generated.map((gen) => {
      const found = (existing || []).find((e) => e.start_time === gen.start_time);
      return found ? { ...found } : gen;
    });

    return { slots: merged, field_id: Number(fieldId), date };
  }

  async lockSlot(slotId: number): Promise<BookingLockResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Tizimga kirish kerak");

    const lockToken = crypto.randomUUID();
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Agar slot DB da bo'lmasa - yangi yaratamiz
    const { data: existing } = await supabase
      .from("booking_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (existing) {
      // Slot DB da bor
      if (existing.status !== "available") {
        throw new Error("Bu vaqt allaqachon band");
      }
      const { error } = await supabase
        .from("booking_slots")
        .update({ status: "locked", lock_token: lockToken, locked_until: lockedUntil, user_id: user.id })
        .eq("id", slotId)
        .eq("status", "available");
      if (error) throw new Error("Band qilishda xatolik");
    } else {
      throw new Error("Slot topilmadi");
    }

    return {
      slot_id: slotId,
      lock_token: lockToken,
      expires_in_seconds: 300,
      message: "Slot 5 daqiqaga band qilindi",
    };
  }

  async lockVirtualSlot(fieldId: number, date: string, startTime: string, endTime: string): Promise<BookingLockResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Tizimga kirish kerak");

    const lockToken = crypto.randomUUID();
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Upsert - mavjud bo'lmagan slotni yaratamiz
    const { data, error } = await supabase
      .from("booking_slots")
      .upsert(
        {
          field_id: fieldId,
          date,
          start_time: startTime,
          end_time: endTime,
          status: "locked",
          lock_token: lockToken,
          locked_until: lockedUntil,
          user_id: user.id,
        },
        {
          onConflict: "field_id,date,start_time",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw new Error("Bu vaqt allaqachon band");

    return {
      slot_id: data.id,
      lock_token: lockToken,
      expires_in_seconds: 300,
      message: "Slot 5 daqiqaga band qilindi",
    };
  }

  async confirmBooking(
    slotId: number,
    lockToken: string,
    paymentMethod: string
  ): Promise<BookingConfirmResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Tizimga kirish kerak");

    // Slotni tekshiramiz
    const { data: slot, error: slotErr } = await supabase
      .from("booking_slots")
      .select("*, fields(price_per_hour)")
      .eq("id", slotId)
      .eq("lock_token", lockToken)
      .eq("user_id", user.id)
      .single();

    if (slotErr || !slot) throw new Error("Slot yoki token noto'g'ri");
    if (new Date(slot.locked_until) < new Date()) throw new Error("Vaqt tugadi, qaytadan urinib ko'ring");

    // Slotni tasdiqlаymiz
    const { error: updateErr } = await supabase
      .from("booking_slots")
      .update({ status: "pending", lock_token: null, locked_until: null })
      .eq("id", slotId);
    if (updateErr) throw new Error(updateErr.message);

    // To'lov yozuvini yaratamiz
    const amount = slot.fields?.price_per_hour || 0;
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        booking_slot_id: slotId,
        amount,
        payment_method: paymentMethod,
        status: "pending",
      })
      .select()
      .single();

    if (payErr) throw new Error(payErr.message);

    return {
      booking_id: slotId,
      field_id: slot.field_id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      payment_id: payment.id,
      amount,
      payment_url: null,
      status: "pending",
    };
  }

  async getMyBookings(): Promise<UserBookingsResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { bookings: [], total: 0, page: 1, per_page: 20 };

    const { data, error } = await supabase
      .from("booking_slots")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "booked", "rejected"])
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { bookings: data || [], total: data?.length || 0, page: 1, per_page: 100 };
  }

  async cancelBooking(slotId: number): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from("booking_slots")
      .update({ status: "available", user_id: null, lock_token: null, locked_until: null })
      .eq("id", slotId);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  async getStats(): Promise<any> {
    const { data, error } = await supabase.from("admin_stats").select("*").single();
    if (error) return { active_fields: 0, cities: 0, bookings: 0, users: 0 };
    return data;
  }

  async getAdminStats(): Promise<any> {
    const { data, error } = await supabase.from("admin_stats").select("*").single();
    if (error) throw new Error(error.message);
    return {
      total_fields: data.active_fields,
      total_users: data.users,
      total_bookings: data.total_bookings,
      pending_applications: data.pending_applications,
      total_revenue: data.total_revenue,
      monthly_revenue: data.monthly_revenue,
      prev_month_revenue: data.prev_month_revenue,
      monthly_bookings: data.monthly_bookings,
    };
  }

  // ── Admin Bookings ────────────────────────────────────────────────────────

  async getAdminBookings(): Promise<any[]> {
    const { data, error } = await supabase
      .from("booking_slots")
      .select("*, fields(name, city), profiles(name, phone)")
      .in("status", ["pending", "booked", "rejected"])
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async clearOldBookings(): Promise<{ deleted_count: number; message: string }> {
    const { data, error } = await supabase
      .from("booking_slots")
      .delete()
      .in("status", ["booked", "rejected"])
      .lt("date", new Date().toISOString().split("T")[0])
      .select();
    if (error) throw new Error(error.message);
    return { deleted_count: data?.length || 0, message: `${data?.length || 0} ta bron o'chirildi` };
  }

  // ── Admin Users ───────────────────────────────────────────────────────────

  async getAdminUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async updateUserRole(userId: string, isAdmin: boolean): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: isAdmin })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  }

  // ── Applications ──────────────────────────────────────────────────────────

  async getApplications(status?: string): Promise<any[]> {
    let query = supabase
      .from("field_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async submitApplication(payload: any): Promise<any> {
    const { data, error } = await supabase
      .from("field_applications")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async approveApplication(id: number): Promise<void> {
    // Arizani olish
    const { data: app, error: appErr } = await supabase
      .from("field_applications")
      .select("*")
      .eq("id", id)
      .single();
    if (appErr) throw new Error(appErr.message);

    // Maydon yaratish
    const { error: fieldErr } = await supabase.from("fields").insert({
      name: app.field_name,
      field_type: app.field_type,
      address: app.address,
      city: app.city,
      price_per_hour: app.price_per_hour,
      phone_number: app.phone_number,
      description: app.description,
      image_url: app.image_url,
      latitude: app.latitude,
      longitude: app.longitude,
      is_active: true,
    });
    if (fieldErr) throw new Error(fieldErr.message);

    // Arizani tasdiqlash
    const { error } = await supabase
      .from("field_applications")
      .update({ status: "approved" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async rejectApplication(id: number): Promise<void> {
    const { error } = await supabase
      .from("field_applications")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  async deleteApplication(id: number): Promise<void> {
    const { error } = await supabase
      .from("field_applications")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  // ── Generic helpers (for backward compat) ────────────────────────────────

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Fields
    if (endpoint === "/admin/fields") return this.getAdminFields() as any;
    if (endpoint === "/admin/stats") return this.getAdminStats() as any;
    if (endpoint === "/admin/bookings") return this.getAdminBookings() as any;
    if (endpoint === "/admin/users") return this.getAdminUsers() as any;
    if (endpoint.startsWith("/admin/applications")) {
      const url = new URL("http://x" + endpoint);
      const status = url.searchParams.get("status") || undefined;
      return this.getApplications(status) as any;
    }
    if (endpoint.startsWith("/fields/") && !endpoint.includes("/slots")) {
      const id = endpoint.split("/")[2];
      return this.getField(Number(id)) as any;
    }
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    if (endpoint === "/fields/") return this.createField(body) as any;
    if (endpoint.startsWith("/admin/applications/") && endpoint.endsWith("/approve")) {
      const id = Number(endpoint.split("/")[3]);
      await this.approveApplication(id);
      return {} as any;
    }
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    if (endpoint.startsWith("/fields/")) {
      const id = Number(endpoint.split("/")[2]);
      return this.updateField(id, body) as any;
    }
    if (endpoint.startsWith("/admin/fields/")) {
      const id = Number(endpoint.split("/")[3]);
      return this.updateField(id, body) as any;
    }
    if (endpoint.startsWith("/admin/applications/") && endpoint.endsWith("/reject")) {
      const id = Number(endpoint.split("/")[3]);
      await this.rejectApplication(id);
      return {} as any;
    }
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  async delete<T>(endpoint: string): Promise<T> {
    if (endpoint.startsWith("/fields/")) {
      const id = Number(endpoint.split("/")[2]);
      await this.deleteField(id);
      return {} as any;
    }
    if (endpoint === "/admin/bookings/clear-old") {
      return this.clearOldBookings() as any;
    }
    if (endpoint.startsWith("/admin/applications/")) {
      const id = Number(endpoint.split("/")[3]);
      await this.deleteApplication(id);
      return {} as any;
    }
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  async uploadFile<T>(endpoint: string, file: File, fieldName?: string): Promise<T> {
    const url = await this.uploadFieldImage(file);
    return { url } as any;
  }

  lockSlotById(slotId: number): Promise<BookingLockResponse> {
    return this.lockSlot(slotId);
  }
}

export const api = new ApiClient();

// Backward compat export
export const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
