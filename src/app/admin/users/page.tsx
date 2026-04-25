"use client";

import { useEffect, useState } from "react";
import {
  Table, Card, Input, Tag, Space, Typography, Row, Col,
  Button, Avatar, Dropdown, Modal, Form, Switch, message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined, PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined,
  MoreOutlined, LockOutlined, ReloadOutlined, TeamOutlined, SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/auth-store";
import { useIsMobile } from "@/hooks/use-mobile";

const { Text } = Typography;
const { Search } = Input;

interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

const AVATAR_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ef4444",
  "#8b5cf6", "#06b6d4", "#84cc16",
];

function getAvatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user: currentUser } = useAuthStore();
  const isMobile = useIsMobile();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Server xatolik");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      message.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = !target.is_active;
    try {
      const res = await fetch("/api/admin/toggle-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id, is_active: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Xatolik");
      }
      message.success(newStatus ? "Foydalanuvchi faollashtirildi" : "Foydalanuvchi bloklandi");
      await fetchUsers();
    } catch (e: any) {
      message.error(e.message || "Xatolik yuz berdi");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({ name: user.name, phone: user.phone, email: user.email, is_admin: user.is_admin });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ is_admin: false });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Foydalanuvchini o'chirish",
      content: "Bu foydalanuvchi va uning barcha ma'lumotlari butunlay o'chiriladi. Davom etasizmi?",
      okText: "Ha, o'chirish",
      cancelText: "Bekor",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await fetch("/api/admin/delete-user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: id }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Xatolik");
          }
          message.success("Foydalanuvchi o'chirildi");
          await fetchUsers();
        } catch (e: any) {
          message.error(e.message || "O'chirishda xatolik");
          await fetchUsers();
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const res = await fetch("/api/admin/update-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: editingUser.id,
            name: values.name,
            phone: values.phone,
            email: values.email,
            is_admin: values.is_admin || false,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Yangilashda xatolik");
        }
        message.success("Foydalanuvchi yangilandi");
        await fetchUsers();
      } else {
        const res = await fetch("/api/admin/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            password: values.password,
            is_admin: values.is_admin || false,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Yaratishda xatolik");
        }
        message.success("Foydalanuvchi muvaffaqiyatli qo'shildi");
        await fetchUsers();
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error: any) {
      message.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const match =
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(searchQuery) ||
      (u.email?.toLowerCase().includes(q) ?? false);
    if (filterRole === "admin") return match && u.is_admin;
    if (filterRole === "user") return match && !u.is_admin;
    if (filterRole === "active") return match && u.is_active;
    if (filterRole === "inactive") return match && !u.is_active;
    return match;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.is_admin).length,
    user: users.filter((u) => !u.is_admin).length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
  };

  const filterButtons = [
    { key: "all",      label: "Barchasi",        count: counts.all,      color: "#6366f1", bg: "#f5f3ff" },
    { key: "admin",    label: "Adminlar",         count: counts.admin,    color: "#3b82f6", bg: "#eff6ff" },
    { key: "user",     label: "Foydalanuvchilar", count: counts.user,     color: "#059669", bg: "#f0fdf4" },
    { key: "inactive", label: "Bloklangan",       count: counts.inactive, color: "#ef4444", bg: "#fef2f2" },
  ];

  const columns: ColumnsType<User> = [
    {
      title: "Foydalanuvchi",
      key: "user",
      render: (_, record) => {
        const color = getAvatarColor(record.name);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar size={40} style={{ background: color, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
              {record.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{record.name}</span>
                {record.is_admin && (
                  <span style={{
                    background: "#eff6ff", color: "#3b82f6", fontSize: 10, fontWeight: 700,
                    padding: "1px 7px", borderRadius: 20, letterSpacing: "0.02em",
                  }}>
                    ADMIN
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>ID #{record.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Aloqa",
      key: "contact",
      render: (_, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <PhoneOutlined style={{ color: "#6366f1", fontSize: 12 }} />
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{record.phone}</span>
          </div>
          {record.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MailOutlined style={{ color: "#94a3b8", fontSize: 12 }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{record.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Holat",
      key: "status",
      render: (_, record) => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: record.is_active ? "#f0fdf4" : "#fef2f2",
          color: record.is_active ? "#059669" : "#dc2626",
          fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          border: `1px solid ${record.is_active ? "#bbf7d0" : "#fecaca"}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: record.is_active ? "#059669" : "#dc2626", display: "inline-block" }} />
          {record.is_active ? "Faol" : "Bloklangan"}
        </span>
      ),
      filters: [
        { text: "Faol", value: "active" },
        { text: "Bloklangan", value: "inactive" },
      ],
      onFilter: (value, record) => value === "active" ? record.is_active : !record.is_active,
    },
    {
      title: "Qo'shilgan",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          {new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
        </span>
      ),
    },
    {
      title: "Amallar",
      key: "actions",
      width: 90,
      render: (_, record) => {
        const isSelf = record.id === currentUser?.id;
        const menuItems = [
          { key: "edit", icon: <EditOutlined />, label: "Tahrirlash", onClick: () => handleEdit(record) },
          {
            key: "toggle",
            icon: record.is_active ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.is_active ? "Bloklash" : "Faollashtirish",
            onClick: () => handleToggleStatus(record.id),
            disabled: isSelf,
          },
          { type: "divider" as const },
          {
            key: "delete", icon: <DeleteOutlined />, label: "O'chirish", danger: true,
            onClick: () => handleDelete(record.id), disabled: isSelf,
          },
        ];

        return (
          <Space size={4}>
            <Button
              type="text" size="small"
              icon={record.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => !isSelf && handleToggleStatus(record.id)}
              disabled={isSelf}
              style={{
                color: record.is_active ? "#f59e0b" : "#10b981",
                background: record.is_active ? "#fffbeb" : "#f0fdf4",
                borderRadius: 8, width: 32, height: 32,
              }}
            />
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button
                type="text" size="small"
                icon={<MoreOutlined />}
                style={{ color: "#64748b", background: "#f8fafc", borderRadius: 8, width: 32, height: 32 }}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%", display: "flex" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        borderRadius: 16, padding: isMobile ? "16px" : "24px 28px",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between", gap: 12,
        boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
      }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Foydalanuvchilar</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Jami {users.length} ta · {counts.admin} admin · {counts.active} faol
          </div>
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
            loading={isLoading}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }}
          />
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 10, fontWeight: 600 }}
          >
            Yangi foydalanuvchi
          </Button>
        </Space>
      </div>

      {/* Search & Filter */}
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }} styles={{ body: { padding: "16px 20px" } }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Ism, telefon yoki email..."
              allowClear size="large"
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: 10 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space wrap>
              {filterButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setFilterRole(btn.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: filterRole === btn.key ? `1.5px solid ${btn.color}` : "1.5px solid #e2e8f0",
                    background: filterRole === btn.key ? btn.bg : "#fff",
                    color: filterRole === btn.key ? btn.color : "#64748b",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  {btn.label}
                  <span style={{
                    background: filterRole === btn.key ? btn.color : "#f1f5f9",
                    color: filterRole === btn.key ? "#fff" : "#64748b",
                    fontSize: 11, fontWeight: 700, padding: "0 6px", borderRadius: 10,
                  }}>
                    {btn.count}
                  </span>
                </button>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 600 }}
          style={{ borderRadius: 14, overflow: "hidden" }}
          pagination={{
            pageSize: 12,
            showSizeChanger: !isMobile,
            showTotal: (total) => `Jami ${total} ta`,
            style: { padding: "12px 16px" },
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: editingUser ? "linear-gradient(135deg, #6366f1, #818cf8)" : "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>
              {editingUser ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>
                {editingUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>
                {editingUser ? editingUser.name : "Ma'lumotlarni kiriting"}
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setEditingUser(null); }}
        footer={null}
        destroyOnClose
        styles={{ header: { borderBottom: "1px solid #f1f5f9", paddingBottom: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          <Form.Item name="name" label="Ism" rules={[{ required: true, message: "Ismni kiriting" }]}>
            <Input size="large" prefix={<UserOutlined style={{ color: "#d1d5db" }} />} placeholder="Ism Familiya" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: "Telefonni kiriting" }]}>
            <Input size="large" prefix={<PhoneOutlined style={{ color: "#d1d5db" }} />} placeholder="+998901234567" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="email" label="Email (ixtiyoriy)">
            <Input size="large" prefix={<MailOutlined style={{ color: "#d1d5db" }} />} placeholder="email@example.com" style={{ borderRadius: 10 }} />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Parol" rules={[{ required: true, message: "Parolni kiriting" }, { min: 6, message: "Kamida 6 belgi" }]}>
              <Input.Password size="large" prefix={<LockOutlined style={{ color: "#d1d5db" }} />} placeholder="Kamida 6 belgi" style={{ borderRadius: 10 }} />
            </Form.Item>
          )}
          <Form.Item name="is_admin" label="Rol" valuePropName="checked">
            <Switch checkedChildren={<><SafetyCertificateOutlined /> Admin</>} unCheckedChildren={<><UserOutlined /> Foydalanuvchi</>} />
          </Form.Item>
          <Row justify="end" style={{ marginTop: 8 }}>
            <Space>
              <Button onClick={() => { setIsModalOpen(false); form.resetFields(); setEditingUser(null); }} style={{ borderRadius: 10 }}>
                Bekor qilish
              </Button>
              <Button
                type="primary" htmlType="submit" loading={isSubmitting}
                style={{
                  background: editingUser ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                  border: "none", borderRadius: 10, fontWeight: 600,
                }}
              >
                {editingUser ? "Saqlash" : "Yaratish"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
