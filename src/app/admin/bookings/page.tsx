"use client";

import { useEffect, useState } from "react";
import { Table, Card, Input, Tag, Space, Typography, Row, Col, Button, Avatar, Statistic, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Modal, message } from "antd";
import { api } from "@/lib/api";

const { Title, Text } = Typography;
const { Search } = Input;

interface Booking {
  id: number;
  field_name: string;
  field_id: number;
  user_name: string;
  user_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  booked: { label: "Tasdiqlangan", color: "#059669", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
  locked: { label: "Vaqtincha", color: "#d97706", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
  cancelled: { label: "Bekor", color: "#dc2626", bg: "#fef2f2", icon: <CloseCircleOutlined /> },
};

const paymentConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: "To'langan", color: "#059669", bg: "#f0fdf4" },
  pending: { label: "Kutilmoqda", color: "#d97706", bg: "#fffbeb" },
  failed: { label: "Muvaffaqiyatsiz", color: "#dc2626", bg: "#fef2f2" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleClearOld = () => {
    Modal.confirm({
      title: "Barcha bronlarni tozalash",
      content: "Barcha bronlar va vaqtincha band slotlar o'chiriladi. Davom etasizmi?",
      okText: "Ha, tozalash",
      cancelText: "Bekor qilish",
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsClearing(true);
        try {
          const res = await api.delete<{ deleted_count: number; message: string }>("/admin/bookings/clear-old");
          message.success(res.message || `${res.deleted_count} ta bron o'chirildi`);
          await fetchBookings();
        } catch (error) {
          message.error("Tozalashda xatolik yuz berdi");
        } finally {
          setIsClearing(false);
        }
      },
    });
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Booking[]>("/admin/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.field_name.toLowerCase().includes(q) ||
      b.user_name.toLowerCase().includes(q) ||
      b.user_phone.includes(searchQuery);
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && b.status === filterStatus;
  });

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + b.total_price, 0);

  const counts = {
    all: bookings.length,
    booked: bookings.filter((b) => b.status === "booked").length,
    locked: bookings.filter((b) => b.status === "locked").length,
  };

  const busy = isLoading || isClearing;
  const filterButtons = [
    { key: "all", label: `Barchasi`, count: counts.all, color: "#6366f1", bg: "#f5f3ff" },
    { key: "booked", label: "Tasdiqlangan", count: counts.booked, color: "#059669", bg: "#f0fdf4" },
    { key: "locked", label: "Vaqtincha", count: counts.locked, color: "#d97706", bg: "#fffbeb" },
  ];

  const columns: ColumnsType<Booking> = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => (
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: "Maydon",
      key: "field",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, flexShrink: 0,
          }}>
            <EnvironmentOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{record.field_name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {record.booking_date} · {record.start_time}–{record.end_time}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Foydalanuvchi",
      key: "user",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size={32} style={{ background: "#f1f5f9", color: "#6366f1", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {record.user_name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{record.user_name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{record.user_phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Narx",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => (
        <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
          {price > 0 ? `${price.toLocaleString()} UZS` : "—"}
        </span>
      ),
      sorter: (a, b) => a.total_price - b.total_price,
    },
    {
      title: "To'lov",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status, record) => {
        const cfg = paymentConfig[status] || paymentConfig.pending;
        return (
          <div>
            <span style={{
              background: cfg.bg, color: cfg.color,
              fontSize: 12, fontWeight: 600,
              padding: "2px 10px", borderRadius: 20,
              display: "inline-block",
            }}>
              {cfg.label}
            </span>
            {record.payment_method && (
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{record.payment_method}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Holat",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const cfg = statusConfig[status] || statusConfig.locked;
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: cfg.bg, color: cfg.color,
            fontSize: 12, fontWeight: 600,
            padding: "3px 10px", borderRadius: 20,
          }}>
            {cfg.icon} {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          {new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
        </span>
      ),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
  ];

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%", display: "flex" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Bronlar Registri</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            Barcha mavjud bronlar va to'lov holati
          </div>
        </div>
        <Space>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClearOld}
            loading={isClearing}
            style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", color: "#fca5a5", borderRadius: 10, height: 40 }}
          >
            Tozalash
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchBookings}
            loading={isLoading}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10, height: 40 }}
          >
            Yangilash
          </Button>
        </Space>
      </div>

      {/* Stats Row */}
      {(() => {
        const busy = isLoading || isClearing;
        return (
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0", textAlign: "center" }} styles={{ body: { padding: 16 } }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{busy ? "—" : bookings.length}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Jami bronlar</div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0", textAlign: "center" }} styles={{ body: { padding: 16 } }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#059669" }}>{busy ? "—" : counts.booked}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Tasdiqlangan</div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0", textAlign: "center" }} styles={{ body: { padding: 16 } }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#d97706" }}>{busy ? "—" : counts.locked}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Vaqtincha</div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0", textAlign: "center" }} styles={{ body: { padding: 16 } }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#3b82f6" }}>
                  {busy ? "—" : `${(totalRevenue / 1000).toFixed(0)}K`}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>UZS Daromad</div>
              </Card>
            </Col>
          </Row>
        );
      })()}

      {/* Search & Filter */}
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }} styles={{ body: { padding: "16px 20px" } }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Maydon nomi yoki foydalanuvchi bo'yicha..."
              allowClear
              size="large"
              style={{ borderRadius: 10 }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space wrap>
              {filterButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setFilterStatus(btn.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: filterStatus === btn.key ? `1.5px solid ${btn.color}` : "1.5px solid #e2e8f0",
                    background: filterStatus === btn.key ? btn.bg : "#fff",
                    color: filterStatus === btn.key ? btn.color : "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {btn.label}
                  <span style={{
                    background: filterStatus === btn.key ? btn.color : "#f1f5f9",
                    color: filterStatus === btn.key ? "#fff" : "#64748b",
                    fontSize: 11, fontWeight: 700,
                    padding: "0 6px", borderRadius: 10,
                  }}>
                    {busy ? "…" : btn.count}
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
          dataSource={filteredBookings}
          rowKey="id"
          loading={isLoading}
          style={{ borderRadius: 14, overflow: "hidden" }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} ta bron`,
            style: { padding: "12px 20px" },
          }}
          rowClassName={() => "booking-row"}
        />
      </Card>
    </Space>
  );
}
