import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

function esc(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

function fmtPrice(amount: number) {
  return amount.toLocaleString("uz-UZ") + " UZS";
}

function fmtDate(dateStr: string) {
  const months = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"];
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)}-${months[parseInt(m) - 1]} ${y}`;
}

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "TG_BOT_TOKEN not set" }, { status: 500 });
  }

  const body = await req.json();
  const {
    owner_chat_id,
    field_name,
    date,
    start_time,
    end_time,
    amount,
    payment_method,
    user_name,
    user_phone,
    slot_id,
  } = body;

  if (!owner_chat_id || !slot_id) {
    return NextResponse.json({ ok: false, error: "owner_chat_id and slot_id required" }, { status: 400 });
  }

  const payLabel = payment_method === "click" ? "Click" : payment_method === "payme" ? "Payme" : payment_method;

  const text =
    `🔔 *Yangi bron so'rovi\\!*\n\n` +
    `🏟 *${esc(field_name || "")}*\n` +
    `📅 ${esc(fmtDate(date || ""))}\n` +
    `⏰ ${esc(start_time || "")} – ${esc(end_time || "")}\n` +
    `💰 ${esc(fmtPrice(amount || 0))}\n\n` +
    `👤 Mijoz: *${esc(user_name || "Noma'lum")}*\n` +
    `📱 Tel: \`${esc(user_phone || "")}\`\n` +
    `💳 To'lov: ${esc(payLabel)}\n\n` +
    `Bronni tasdiqlaysizmi?`;

  const reply_markup = JSON.stringify({
    inline_keyboard: [[
      { text: "✅ Tasdiqlash", callback_data: `owner_confirm_${slot_id}` },
      { text: "❌ Rad etish",  callback_data: `owner_reject_${slot_id}`  },
    ]],
  });

  const tgRes = await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: owner_chat_id,
      text,
      parse_mode: "MarkdownV2",
      reply_markup,
    }),
  });

  const tgData = await tgRes.json();
  if (!tgData.ok) {
    return NextResponse.json({ ok: false, error: tgData.description }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
