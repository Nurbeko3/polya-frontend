import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { name, phone, password, is_admin } = await req.json();

  if (!name || !phone || !password) {
    return NextResponse.json({ error: "Ism, telefon va parol majburiy" }, { status: 400 });
  }

  const digits = phone.replace(/\D/g, "");
  const email = `${digits}@polya.app`;

  // 1. Telefon raqam allaqachon mavjudmi?
  const { data: existing } = await svc
    .from("profiles")
    .select("id")
    .eq("phone", digits)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Bu telefon raqam allaqachon ro'yxatda bor" }, { status: 409 });
  }

  // 2. Auth da foydalanuvchi yaratish (trigger profiles ga ham yozadi)
  const { data: authData, error: authErr } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone: digits },
  });

  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  const user_id = authData.user.id;

  // 3. is_admin ni yangilash (trigger faqat false qo'yadi)
  if (is_admin) {
    await svc.from("profiles").update({ is_admin: true }).eq("id", user_id);
  }

  return NextResponse.json({ ok: true, user_id });
}
