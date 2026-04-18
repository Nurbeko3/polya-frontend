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
    return NextResponse.json({ error: "name, phone va password majburiy" }, { status: 400 });
  }

  // Telefon raqamni email formatiga o'tkazish (loyiha standarti)
  const digits = phone.replace(/\D/g, "");
  const email = `${digits}@polya.app`;

  // 1. Auth da foydalanuvchi yaratish
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

  // 2. profiles jadvalida yozuv yaratish
  const { error: profErr } = await svc.from("profiles").upsert({
    id: user_id,
    name,
    phone: digits,
    email,
    is_active: true,
    is_admin: is_admin ?? false,
  });

  if (profErr) {
    // Auth yaratildi lekin profile xato — auth ni ham o'chiramiz
    await svc.auth.admin.deleteUser(user_id);
    return NextResponse.json({ error: "profile: " + profErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user_id });
}
