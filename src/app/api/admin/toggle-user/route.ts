import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { user_id, is_active } = await req.json();
  if (!user_id || is_active === undefined) {
    return NextResponse.json({ error: "user_id and is_active required" }, { status: 400 });
  }

  // profiles jadvalini yangilash
  const { error: profileErr } = await svc
    .from("profiles")
    .update({ is_active })
    .eq("id", user_id);

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  // Supabase Auth ban/unban (login qila olmasligi uchun)
  const { error: authErr } = await svc.auth.admin.updateUserById(user_id, {
    ban_duration: is_active ? "none" : "876600h", // 100 yil = amalda doimiy ban
  });

  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, is_active });
}
