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

  // 1. payments — NOT NULL constraint bor, delete qilamiz
  const { error: payErr } = await svc.from("payments").delete().eq("user_id", user_id);
  if (payErr) {
    return NextResponse.json({ error: "payments: " + payErr.message }, { status: 500 });
  }

  // 2. booking_slots.user_id → NULL (nullable column)
  const { error: slotErr } = await svc.from("booking_slots").update({ user_id: null }).eq("user_id", user_id);
  if (slotErr) {
    return NextResponse.json({ error: "booking_slots: " + slotErr.message }, { status: 500 });
  }

  // 3. profiles o'chirish
  const { error: profErr } = await svc.from("profiles").delete().eq("id", user_id);
  if (profErr) {
    return NextResponse.json({ error: "profiles: " + profErr.message }, { status: 500 });
  }

  // 4. Auth dan o'chirish
  const { error: authErr } = await svc.auth.admin.deleteUser(user_id);
  if (authErr) {
    return NextResponse.json({ error: "auth: " + authErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
