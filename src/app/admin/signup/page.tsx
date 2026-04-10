"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";

/**
 * Admin signup is disabled for security.
 * New admin accounts can only be created by an existing super-admin
 * via the Users management page (/admin/users).
 */
export default function AdminSignupPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/admin/login"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        maxWidth: 420, width: "100%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 20, padding: 40,
        backdropFilter: "blur(20px)", textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <LockOutlined style={{ fontSize: 28, color: "#f87171" }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
          Admin yaratish taqiqlangan
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
          Yangi admin hisob faqat mavjud super-admin tomonidan
          <strong style={{ color: "rgba(255,255,255,0.8)" }}> Foydalanuvchilar</strong> bo'limidan yaratiladi.
          <br /><br />
          5 soniyadan keyin avtomatik yo'naltirilasiz...
        </div>
        <Link href="/admin/login">
          <Button
            type="primary" icon={<ArrowLeftOutlined />}
            style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 10, fontWeight: 700, height: 44, width: "100%" }}
          >
            Kirish sahifasiga o'tish
          </Button>
        </Link>
      </div>
    </div>
  );
}
