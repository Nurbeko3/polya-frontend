"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, message } from "antd";
import { useAuthStore } from "@/store/auth-store";
import { UserOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.phone, values.password);
      message.success("Tizimga muvaffaqiyatli kirdingiz!");
      router.push("/admin");
    } catch (err: any) {
      message.error(typeof err.message === "string" ? err.message : "Telefon raqami yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decorations */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.15)" }} />
      <div style={{ position: "absolute", bottom: -100, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(99,102,241,0.1)" }} />
      <div style={{ position: "absolute", top: "30%", left: "10%", width: 80, height: 80, borderRadius: "50%", background: "rgba(129,140,248,0.08)" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex",
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
            marginBottom: 20,
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 28 }}>P</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Admin Panel</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>
            Polya boshqaruv tizimiga kirish
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: 32,
          backdropFilter: "blur(20px)",
        }}>
          <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false} size="large">
            <Form.Item
              name="phone"
              label={<span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Telefon raqam</span>}
              rules={[{ required: true, message: "Telefon raqamingizni kiriting" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.4)" }} />}
                placeholder="+998901234567"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  height: 48,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Parol</span>}
              rules={[{ required: true, message: "Parolingizni kiriting" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.4)" }} />}
                placeholder="••••••••"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  height: 48,
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  height: 50,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                }}
              >
                Tizimga kirish
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}>
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>

      <style>{`
        .ant-input { color: #fff !important; }
        .ant-input::placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-input-password .ant-input { color: #fff !important; }
        .ant-input-affix-wrapper { background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.15) !important; }
        .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within { border-color: rgba(99,102,241,0.6) !important; }
        .ant-input-password-icon { color: rgba(255,255,255,0.4) !important; }
      `}</style>
    </div>
  );
}
