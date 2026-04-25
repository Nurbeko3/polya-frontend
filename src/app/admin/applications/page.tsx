"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card, Button, Input, Tag, Space, Typography, Row, Col, Table, Avatar,
  message, Modal, Descriptions, Tooltip, Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  EnvironmentOutlined, PhoneOutlined, CalendarOutlined, DollarOutlined,
  DeleteOutlined, ExclamationCircleOutlined, FileTextOutlined, ReloadOutlined,
  EyeOutlined, SendOutlined, CopyOutlined, LinkOutlined,
} from "@ant-design/icons";


const { Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

interface Application {
  id: number;
  field_name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  phone_number: string;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

const fieldTypeConfig: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  football:   { label: "Futbol",    emoji: "⚽", color: "#059669", bg: "#f0fdf4" },
  tennis:     { label: "Tennis",    emoji: "🎾", color: "#0891b2", bg: "#ecfeff" },
  basketball: { label: "Basketbol", emoji: "🏀", color: "#d97706", bg: "#fffbeb" },
  volleyball: { label: "Voleybol",  emoji: "🏐", color: "#7c3aed", bg: "#f5f3ff" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "Kutilmoqda",   color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  approved: { label: "Tasdiqlangan", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  rejected: { label: "Rad etilgan",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [telegramLink, setTelegramLink] = useState<{ link: string; field_name: string } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => { fetchApplications(); }, [filterStatus]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const res = await fetch(`/api/admin/applications${params}`);
      if (!res.ok) throw new Error("Server xatolik");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      message.error("Arizalarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Xatolik");
      }
      const result = await res.json();

      if (action === "approve") {
        setApplications((apps) => apps.filter((a) => a.id !== id));
        setDetailApp(null);
        setTelegramLink({ link: result.telegram_link, field_name: result.field_name });
      } else {
        setApplications((apps) => apps.filter((a) => a.id !== id));
        setDetailApp(null);
        message.success("Ariza rad etildi");
      }
    } catch (error: any) {
      message.error(error.message || "Xatolik yuz berdi");
    } finally {
      setActionLoading(null);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    message.success("Link nusxalandi!");
  };

  const showClearConfirm = () => {
    confirm({
      title: "Arxivni tozalash",
      icon: <AlertCircle size={18} style={{ color: "#ef4444" }} />,
      content: "Ko'rib chiqilgan barcha arizalar o'chiriladi. Bu amalni qaytarib bo'lmaydi.",
      okText: "Ha, tozalash",
      okType: "danger",
      cancelText: "Bekor",
      onOk: async () => {
        try {
          // Barcha arizalarni olish
          const res = await fetch("/api/admin/applications");
          if (!res.ok) throw new Error("Xatolik");
          const all = await res.json();
          const toDelete = all.filter((a: any) => a.status !== "pending");
          await Promise.all(
            toDelete.map((a: any) =>
              fetch("/api/admin/applications", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: a.id }),
              })
            )
          );
          message.success("Arxiv tozalandi");
          fetchApplications();
        } catch (error: any) {
          message.error(error.message || "Xatolik");
        }
      },
    });
  };

  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.field_name.toLowerCase().includes(q) ||
      app.city.toLowerCase().includes(q) ||
      app.phone_number.includes(searchQuery) ||
      app.address.toLowerCase().includes(q)
    );
  });

  const filterButtons = [
    { key: "pending",  label: "Kutilmoqda",   color: "#d97706", bg: "#fffbeb" },
    { key: "approved", label: "Tasdiqlangan", color: "#059669", bg: "#f0fdf4" },
    { key: "rejected", label: "Rad etilgan",  color: "#dc2626", bg: "#fef2f2" },
  ];

  const columns: ColumnsType<Application> = [
    {
      title: "Maydon",
      key: "field",
      render: (_, record) => {
        const cfg = fieldTypeConfig[record.field_type];
        const imgSrc = record.image_url
          ? record.image_url
          : undefined;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={48} shape="square"
              src={imgSrc}
              style={{ borderRadius: 10, background: cfg?.bg || "#f1f5f9", fontSize: 22, flexShrink: 0 }}
            >
              {cfg?.emoji || "🏟️"}
            </Avatar>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{record.field_name}</div>
              <span style={{
                display: "inline-block", marginTop: 2,
                background: cfg?.bg, color: cfg?.color,
                fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 20,
              }}>
                {cfg?.emoji} {cfg?.label}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Manzil",
      key: "location",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>
            <MapPin size={12} style={{ color: "#6366f1", marginRight: 4, verticalAlign: "middle" }} />
            {record.city}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{record.address}</div>
        </div>
      ),
    },
    {
      title: "Narx",
      dataIndex: "price_per_hour",
      key: "price_per_hour",
      render: (price) => (
        <div>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>UZS/soat</span>
        </div>
      ),
      sorter: (a, b) => a.price_per_hour - b.price_per_hour,
    },
    {
      title: "Telefon",
      dataIndex: "phone_number",
      key: "phone",
      render: (phone) => (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Phone size={12} style={{ color: "#6366f1" }} />
          <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{phone}</span>
        </div>
      ),
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
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Batafsil ko'rish">
            <Button
              type="text" size="small"
              icon={<Eye size={14} />}
              onClick={() => setDetailApp(record)}
              style={{ color: "#6366f1", background: "#f5f3ff", borderRadius: 8, width: 32, height: 32 }}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Tasdiqlash">
                <Button
                  type="text" size="small"
                  icon={<CheckCircle2 size={14} />}
                  onClick={() => handleAction(record.id, "approve")}
                  loading={actionLoading === record.id}
                  style={{ color: "#059669", background: "#f0fdf4", borderRadius: 8, width: 32, height: 32 }}
                />
              </Tooltip>
              <Tooltip title="Rad etish">
                <Button
                  type="text" size="small" danger
                  icon={<XCircle size={14} />}
                  onClick={() => handleAction(record.id, "reject")}
                  loading={actionLoading === record.id}
                  style={{ background: "#fef2f2", borderRadius: 8, width: 32, height: 32 }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%", display: "flex" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        borderRadius: 16, padding: isMobile ? "16px" : "24px 28px",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between", gap: 12,
        boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
      }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Maydon Arizalari</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Maydon egalaridan kelgan arizalar
          </div>
        </div>
        <Space wrap>
          <Button
            icon={<RefreshCw size={16} />} onClick={fetchApplications} loading={isLoading}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }}
          />
          <Button
            danger icon={<Trash2 size={16} />} onClick={showClearConfirm}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 10 }}
          >
            Tozalash
          </Button>
        </Space>
      </div>

      {/* Search & Filter */}
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }} styles={{ body: { padding: "16px 20px" } }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Maydon nomi, shahar yoki telefon..."
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
                  onClick={() => setFilterStatus(btn.key)}
                  style={{
                    padding: "6px 16px", borderRadius: 20,
                    border: filterStatus === btn.key ? `1.5px solid ${btn.color}` : "1.5px solid #e2e8f0",
                    background: filterStatus === btn.key ? btn.bg : "#fff",
                    color: filterStatus === btn.key ? btn.color : "#64748b",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  {btn.key === "pending" && <Clock size={14} />}
                  {btn.key === "approved" && <CheckCircle2 size={14} />}
                  {btn.key === "rejected" && <XCircle size={14} />}
                  {btn.label}
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
          dataSource={filteredApplications}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 650 }}
          style={{ borderRadius: 14, overflow: "hidden" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: !isMobile,
            showTotal: (total) => `Jami ${total} ta`,
            style: { padding: "12px 16px" },
          }}
        />
      </Card>

      {/* Telegram Invite Link Modal */}
      <Modal
        open={!!telegramLink}
        onCancel={() => setTelegramLink(null)}
        footer={null}
        centered
        width={480}
        title={null}
      >
        {telegramLink && (
          <div style={{ padding: "8px 0" }}>
            {/* Success header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
                fontSize: 28,
              }}>
                ✅
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                Maydon tasdiqlandi!
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                <strong>{telegramLink.field_name}</strong> uchun Telegram ulash linkini maydon egasiga yuboring
              </div>
            </div>

            {/* Link box */}
            <div style={{
              background: "linear-gradient(135deg, #eff6ff, #f0fdf4)",
              border: "1.5px solid #bfdbfe",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Link2 size={12} style={{ marginRight: 5, verticalAlign: "middle" }} />
                Telegram Bot Linki
              </div>
              <div style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#1e40af",
                wordBreak: "break-all",
                lineHeight: 1.6,
                background: "rgba(255,255,255,0.7)",
                padding: "8px 12px",
                borderRadius: 8,
              }}>
                {telegramLink.link}
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600, marginBottom: 6 }}>
                📋 Ko'rsatma:
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#78350f", lineHeight: 1.8 }}>
                <li>Quyidagi tugmalardan birini bosing</li>
                <li>Linkni maydon egasiga yuboring (SMS, Telegram, WhatsApp)</li>
                <li>Ega link orqali botni ochib, Telegram akkauntini ulaydi</li>
                <li>Shundan keyin yangi bronlar haqida bildirishnoma oladi</li>
              </ol>
            </div>

            {/* Action buttons */}
            <Space style={{ width: "100%" }} direction="vertical" size={8}>
              <Button
                type="primary"
                icon={<Copy size={16} />}
                block
                size="large"
                onClick={() => copyLink(telegramLink.link)}
                style={{ height: 46, borderRadius: 12, fontWeight: 600, fontSize: 14 }}
              >
                Linkni nusxalash
              </Button>
              <Button
                icon={<Send size={16} />}
                block
                size="large"
                href={`https://t.me/share/url?url=${encodeURIComponent(telegramLink.link)}&text=${encodeURIComponent(`Polya botida ${telegramLink.field_name} maydonini boshqarish uchun ushbu linkni bosing`)}`}
                target="_blank"
                style={{ height: 46, borderRadius: 12, fontWeight: 600, fontSize: 14, background: "#0088cc", color: "#fff", border: "none" }}
              >
                Telegram orqali ulashish
              </Button>
              <Button
                block size="large"
                onClick={() => setTelegramLink(null)}
                style={{ height: 42, borderRadius: 12, color: "#64748b" }}
              >
                Yopish
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>
              <FileText size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Ariza tafsilotlari</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>{detailApp?.field_name}</div>
            </div>
          </div>
        }
        open={!!detailApp}
        onCancel={() => setDetailApp(null)}
        footer={
          detailApp?.status === "pending" ? (
            <Space>
              <Button onClick={() => setDetailApp(null)} style={{ borderRadius: 10 }}>Yopish</Button>
              <Button
                danger icon={<XCircle size={16} />}
                onClick={() => detailApp && handleAction(detailApp.id, "reject")}
                loading={actionLoading === detailApp?.id}
                style={{ borderRadius: 10 }}
              >
                Rad etish
              </Button>
              <Button
                type="primary" icon={<CheckCircle2 size={16} />}
                onClick={() => detailApp && handleAction(detailApp.id, "approve")}
                loading={actionLoading === detailApp?.id}
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 10, fontWeight: 600 }}
              >
                Tasdiqlash va maydon yaratish
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailApp(null)} style={{ borderRadius: 10 }}>Yopish</Button>
          )
        }
        width={600}
        styles={{ header: { borderBottom: "1px solid #f1f5f9", paddingBottom: 16 } }}
      >
        {detailApp && (
          <div style={{ marginTop: 16 }}>
            {detailApp.image_url && (
              <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", height: 200 }}>
                <img
                  src={detailApp.image_url}
                  alt="field"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { icon: <MapPin size={12} />, label: "Shahar", value: detailApp.city },
                { icon: <Phone size={12} />, label: "Telefon", value: detailApp.phone_number },
                { icon: <DollarSign size={12} />, label: "Narx", value: `${detailApp.price_per_hour.toLocaleString()} UZS/soat` },
                { icon: <Calendar size={12} />, label: "Yuborilgan", value: new Date(detailApp.created_at).toLocaleDateString("uz-UZ") },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
                  border: "1px solid #f1f5f9",
                }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "#6366f1" }}>{item.icon}</span> {item.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #f1f5f9", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Manzil</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{detailApp.address}</div>
            </div>
            {detailApp.description && (
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Tavsif</div>
                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{detailApp.description}</div>
              </div>
            )}
            {detailApp.status !== "pending" && (
              <div style={{ marginTop: 12 }}>
                <span style={{
                  background: statusConfig[detailApp.status]?.bg,
                  color: statusConfig[detailApp.status]?.color,
                  border: `1px solid ${statusConfig[detailApp.status]?.border}`,
                  fontSize: 13, fontWeight: 600, padding: "5px 16px", borderRadius: 20,
                }}>
                  {statusConfig[detailApp.status]?.label}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Space>
  );
}
