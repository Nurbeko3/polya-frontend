import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// O'zbek telefon raqamini normallashtirish: har qanday formatni +998XXXXXXXXX ga o'tkazadi
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, ""); // faqat raqamlar
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (digits.startsWith("8") && digits.length === 10) return `+998${digits.slice(1)}`;
  // Agar +998 bilan kiritilgan bo'lsa
  if (raw.startsWith("+998") && digits.length === 12) return `+${digits}`;
  return `+998${digits.slice(-9)}`; // oxirgi 9 raqam
}

// O'zbek telefon raqamini validatsiya qilish
export function isValidUzPhone(raw: string): boolean {
  const phone = normalizePhone(raw);
  return /^\+998[0-9]{9}$/.test(phone);
}

// Phone ni fake email ga aylantiramiz (Supabase Auth email talab qiladi)
export function phoneToEmail(phone: string): string {
  const normalized = normalizePhone(phone).replace("+", "");
  return `${normalized}@polya.app`;
}
