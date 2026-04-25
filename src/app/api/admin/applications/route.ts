import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "polyabronuz_bot";

// GET — arizalar ro'yxati
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || undefined;

  let query = svc
    .from("field_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

// POST — approve yoki reject
export async function POST(req: NextRequest) {
  const { id, action } = await req.json();

  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  if (action === "approve") {
    // 1. Arizani olish
    const { data: app, error: appErr } = await svc
      .from("field_applications")
      .select("*")
      .eq("id", id)
      .single();
    if (appErr || !app) {
      return NextResponse.json({ error: appErr?.message || "Ariza topilmadi" }, { status: 404 });
    }

    // 2. Noyob owner_invite_token
    const token = Array.from(
      { length: 24 },
      () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
    ).join("");

    // 3. Maydon yaratish
    const { data: newField, error: fieldErr } = await svc
      .from("fields")
      .insert({
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
        owner_invite_token: token,
      })
      .select("id, name, owner_invite_token")
      .single();

    if (fieldErr) {
      return NextResponse.json({ error: fieldErr.message }, { status: 500 });
    }

    // 4. Ariza statusini yangilash
    await svc
      .from("field_applications")
      .update({ status: "approved" })
      .eq("id", id);

    const link = `https://t.me/${BOT_USERNAME}?start=owner_${newField.id}_${newField.owner_invite_token}`;

    return NextResponse.json({
      ok: true,
      field_id: newField.id,
      field_name: newField.name,
      owner_invite_token: newField.owner_invite_token,
      telegram_link: link,
    });
  }

  if (action === "reject") {
    const { error } = await svc
      .from("field_applications")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE — arizani o'chirish
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await svc
    .from("field_applications")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
