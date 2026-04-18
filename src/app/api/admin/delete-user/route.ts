import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function DELETE(req: NextRequest) {
  const { user_id } = await req.json();
  if (!user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  // 1. payments — NOT NULL, o'chirib tashlaymiz
  await svc.from("payments").delete().eq("user_id", user_id);

  // 2. booking_slots — nullable, NULL qilamiz
  await svc.from("booking_slots").update({ user_id: null }).eq("user_id", user_id);

  // 3. profiles — CASCADE bor, lekin oldin o'chiramiz
  await svc.from("profiles").delete().eq("id", user_id);

  // 4. Auth dan o'chirish — barcha FK tozalandi, xavfsiz
  const { error: authErr } = await svc.auth.admin.deleteUser(user_id);
  if (authErr) {
    // Agar auth.users da yo'q bo'lsa (allaqachon o'chirilgan) — muvaffaqiyat
    if (authErr.message.includes("not found") || authErr.message.includes("User not found")) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
