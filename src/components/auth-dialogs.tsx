"use client";

import { useState } from "react";
import { Button, Input, Form, Typography, Space, message, Modal } from "antd";
import { LockOutlined, PhoneOutlined, LoginOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/auth-store";
import { isValidUzPhone } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/theme/theme-provider";

const { Title, Text } = Typography;

export function AuthDialogs() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login, signup, isLoading, isAuthenticated, user, logout } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    name?: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    try {
      if (mode === "login") {
        await login(values.email, values.password);
      } else {
        await signup(values.name!, values.email, values.phone!, values.password);
      }
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || "Xatolik yuz berdi");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleClose = () => {
    setModalOpen(false);
    form.resetFields();
    form.setFieldValue("phone", "+998");
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    form.resetFields();
    form.setFieldValue("phone", "+998");
  };

  const textColor = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#a1a1aa" : "#6b7280";
  const inputBg = isDark ? "#0a0a0a" : "#f9fafb";

  const phoneValidator = (_: any, value: string) => {
    if (!value) return Promise.reject("Telefon raqamni kiriting");
    if (!isValidUzPhone(value)) return Promise.reject("O'zbek telefon raqami kiriting (+998XXXXXXXXX)");
    return Promise.resolve();
  };

  if (isAuthenticated && user) {
    return (
      <Space>
        <Link href="/bookings/history">
          <Button type="link" style={{ color: textSecondary }}>Mening bronlarim</Button>
        </Link>
        {user.is_admin && (
          <Link href="/admin">
            <Button type="link" style={{ color: textSecondary }}>Admin Panel</Button>
          </Link>
        )}
        <Link href="/settings">
          <Button type="link" style={{ color: textSecondary }}>Sozlamalar</Button>
        </Link>
        <Button onClick={handleLogout} danger>Chiqish</Button>
      </Space>
    );
  }

  return (
    <>
      <Button
        type="primary"
        icon={<LoginOutlined />}
        onClick={() => {
          setModalOpen(true);
          setTimeout(() => form.setFieldValue("phone", "+998"), 0);
        }}
      >
        Kirish
      </Button>

      <Modal
        open={modalOpen}
        onCancel={handleClose}
        footer={null}
        centered
        width={400}
        title={null}
      >
        <div style={{ padding: "8px 0" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>P</span>
            </div>
            <Title level={3} style={{ color: textColor, margin: 0, marginBottom: 6 }}>
              {mode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish"}
            </Title>
            <Text style={{ color: textSecondary, fontSize: 13 }}>
              {mode === "login"
                ? "Akkauntingizga email va parol bilan kiring"
                : "Platforma uchun yangi akkaunt yarating"}
            </Text>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
            initialValues={{ phone: "+998" }}
          >
            {/* Ism — faqat signup da */}
            {mode === "signup" && (
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Ismingizni kiriting" },
                  { min: 2, message: "Ism kamida 2 ta harf bo'lishi kerak" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="To'liq ismingiz"
                  size="large"
                  style={{ backgroundColor: inputBg, borderRadius: 10, height: 48 }}
                />
              </Form.Item>
            )}

            {/* Email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Emailni kiriting" },
                { type: "email", message: "To'g'ri email kiriting" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                placeholder="email@example.com"
                size="large"
                style={{ backgroundColor: inputBg, borderRadius: 10, height: 48 }}
              />
            </Form.Item>

            {/* Telefon raqam — faqat signup da */}
            {mode === "signup" && (
              <Form.Item
                name="phone"
                rules={[{ validator: phoneValidator }]}
                normalize={(val) => val?.replace(/\s/g, "")}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="+998901234567"
                  size="large"
                  style={{ backgroundColor: inputBg, borderRadius: 10, height: 48 }}
                  maxLength={13}
                />
              </Form.Item>
            )}

            {/* Parol */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Parolni kiriting" },
                { min: 6, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                placeholder={mode === "signup" ? "Kamida 6 ta belgi" : "Parolingiz"}
                size="large"
                style={{ backgroundColor: inputBg, borderRadius: 10, height: 48 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                size="large"
                style={{
                  height: 48, borderRadius: 10,
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  border: "none", fontWeight: 700, fontSize: 15,
                }}
              >
                {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", borderTop: `1px solid ${isDark ? "#262626" : "#f0f0f0"}`, paddingTop: 16 }}>
            <Text style={{ color: textSecondary, fontSize: 13 }}>
              {mode === "login" ? "Akkauntingiz yo'qmi? " : "Akkauntingiz bormi? "}
              <a onClick={switchMode} style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>
                {mode === "login" ? "Ro'yxatdan o'ting" : "Tizimga kiring"}
              </a>
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
}
