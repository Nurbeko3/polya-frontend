"use client";

import { useState } from "react";
import { Button, Input, Form, Typography, Space, message, Modal } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/auth-store";
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

  const handleSubmit = async (values: { name?: string; phone: string; password: string }) => {
    try {
      if (mode === "login") {
        await login(values.phone, values.password);
      } else {
        await signup(values.name!, values.phone, values.password);
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

  const textColor = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#a1a1aa" : "#6b7280";

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
        <Button onClick={handleLogout} danger>
          Chiqish
        </Button>
      </Space>
    );
  }

  return (
    <>
      <Button type="primary" icon={<LoginOutlined />} onClick={() => setModalOpen(true)}>
        Kirish
      </Button>
      
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        width={400}
        className="auth-modal"
      >
        <div className="text-center mb-6">
          <Title level={3} className="!mb-2" style={{ color: textColor }}>
            {mode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish"}
          </Title>
          <Text type="secondary">
            {mode === "login" 
              ? "Akkauntingizga kiring va bron qilishni davom ettiring" 
              : "Polya platformasiga qo'shiling va eng yaxshi maydonlarni toping"}
          </Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          {mode === "signup" && (
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Ismingizni kiriting" }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#9ca3af' }} />} 
                placeholder="To'liq ismingiz" 
                size="large"
                style={{ backgroundColor: isDark ? "#0a0a0a" : "#f9fafb" }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="phone"
            rules={[{ required: true, message: "Telefon raqamingizni kiriting" }]}
          >
            <Input 
              prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />} 
              placeholder="+998 90 123 45 67" 
              size="large"
              style={{ backgroundColor: isDark ? "#0a0a0a" : "#f9fafb" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Parolingizni kiriting" }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
              placeholder="Parol" 
              size="large"
              style={{ backgroundColor: isDark ? "#0a0a0a" : "#f9fafb" }}
            />
          </Form.Item>

          <Form.Item className="!mb-4">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
              size="large"
            >
              {mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text type="secondary">
            {mode === "login" ? "Akkauntingiz yo'qmi? " : "Akkauntingiz bormi? "}
            <a 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ color: '#2563eb' }}
            >
              {mode === "login" ? "Ro'yxatdan o'ting" : "Tizimga kirish"}
            </a>
          </Text>
        </div>
      </Modal>
    </>
  );
}
