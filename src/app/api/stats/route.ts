import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  const [fieldsRes, usersRes, bookingsRes, citiesRes] = await Promise.all([
    svc.from("fields").select("id", { count: "exact", head: true }).eq("is_active", true),
    svc.from("profiles").select("id", { count: "exact", head: true }),
    svc.from("booking_slots").select("id", { count: "exact", head: true }).in("status", ["pending", "booked"]),
    svc.from("fields").select("city").eq("is_active", true),
  ]);

  const cities = new Set((citiesRes.data || []).map((f: any) => f.city)).size;

  return NextResponse.json({
    active_fields: fieldsRes.count ?? 0,
    users:         usersRes.count ?? 0,
    bookings:      bookingsRes.count ?? 0,
    cities,
  });
}
