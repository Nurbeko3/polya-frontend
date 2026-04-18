"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, Row, Col, Skeleton, Typography, Space, Tag, Button, Progress, Empty, Avatar, Modal, message } from "antd";
import {
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface Application {
  id: number;
  field_name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  phone_number: string;
  status: string;
  created_at: string;
  image_url: string | null;
}

interface AdminStats {
  total_fields: number;
  total_users: number;
  total_bookings: number;
  pending_applications: number;
  total_revenue: number;
  monthly_revenue: number;
  prev_month_revenue: number;
  monthly_bookings: number;
}

const { Title, Text } = Typography;

const fieldTypeLabels: Record<string, { label: string; emoji: string }> = {
  football: { label: "Futbol", emoji: "⚽" },
  tennis: { label: "Tennis", emoji: "🎾" },
  basketball: { label: "Basketbol", emoji: "🏀" },
  volleyball: { label: "Voleybol", emoji: "🏐" },
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: number; label: string };
  loading: boolean;
}) {
  const isPositive = (trend?.value ?? 0) >= 0;
  return (
    <Card
      style={{
        background: gradient,
        border: "none",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: 500 }}>{title}</div>
          {loading ? (
            <Skeleton.Input active style={{ width: 80, height: 32, borderRadius: 6 }} />
          ) : (
            <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
              {value}
            </div>
          )}
          {subtitle && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{subtitle}</div>
          )}
          {trend && !loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: isPositive ? "rgba(255,255,255,0.2)" : "rgba(255,80,80,0.3)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 20,
              }}>
                {isPositive ? <RiseOutlined /> : <FallOutlined />}
                {Math.abs(trend.value)}%
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{trend.label}</span>
            </div>
          )}
        </div>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color: "#fff",
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsData, statsData] = await Promise.all([
        api.getApplications("pending"),
        api.getAdminStats(),
      ]);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setStats(statsData as AdminStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStats = () => {
    Modal.confirm({
      title: "Statistikani tozalash",
      content: "Barcha bronlar o'chiriladi va statistika nolga tushadi. Davom etasizmi?",
      okText: "Ha, tozalash",
      cancelText: "Bekor qilish",
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsClearing(true);
        try {
          const res = await api.clearOldBookings();
          message.success(res.message || `${res.deleted_count} ta bron o'chirildi`);
          await fetchData();
        } catch {
          message.error("Tozalashda xatolik yuz berdi");
        } finally {
          setIsClearing(false);
        }
      },
    });
  };

  const revenueGrowth = stats && stats.prev_month_revenue > 0
    ? Math.round(((stats.monthly_revenue - stats.prev_month_revenue) / stats.prev_month_revenue) * 100)
    : 0;

  const formatPrice = (amount: number) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toString();
  };

  const statCards = [
    {
      title: "Aktiv Maydonlar",
      value: stats?.total_fields ?? 0,
      subtitle: "Barcha shaharlarda",
      icon: <EnvironmentOutlined />,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
    {
      title: "Jami Bronlar",
      value: stats?.total_bookings ?? 0,
      subtitle: `Bu oy: ${stats?.monthly_bookings ?? 0} ta`,
      icon: <CalendarOutlined />,
      gradient: "linear-gradient(135deg, #6366f1, #4f46e5)",
    },
    {
      title: "Foydalanuvchilar",
      value: stats?.total_users ?? 0,
      subtitle: "Ro'yxatdan o'tgan",
      icon: <TeamOutlined />,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      title: "Oylik Daromad",
      value: `${formatPrice(stats?.monthly_revenue ?? 0)} UZS`,
      subtitle: "Tasdiqlangan to'lovlar",
      icon: <DollarOutlined />,
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      trend: revenueGrowth !== 0 ? { value: revenueGrowth, label: "o'tgan oyga nisbatan" } : undefined,
    },
  ];

  const greeting = "Xayrli kun";

  return (
    <Space direction="vertical" size={20} style={{ width: "100%", display: "flex" }}>
      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        borderRadius: 16,
        padding: isMobile ? "20px 20px" : "28px 32px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "0 8px 30px rgba(15,23,42,0.2)",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.15)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            {greeting}{user?.name ? `, ${user.name}` : ""} 👋
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
            Polya Admin Paneliga xush kelibsiz.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, position: "relative", flexWrap: "wrap" }}>
          {applications.length > 0 && (
            <Link href="/admin/applications">
              <Button
                type="primary"
                size={isMobile ? "middle" : "large"}
                style={{ background: "rgba(239,68,68,0.9)", border: "none", borderRadius: 10, fontWeight: 600 }}
                icon={<FileTextOutlined />}
              >
                {applications.length} ariza
              </Button>
            </Link>
          )}
          <Link href="/admin/fields">
            <Button
              size={isMobile ? "middle" : "large"}
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, fontWeight: 600 }}
              icon={<EnvironmentOutlined />}
            >
              Maydonlar
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]}>
        {statCards.map((stat, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <StatCard {...stat} loading={isLoading} />
          </Col>
        ))}
      </Row>

      {/* Bottom Section */}
      <Row gutter={[16, 16]}>
        {/* Recent Applications */}
        <Col xs={24} lg={14}>
          <Card
            style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            title={
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14,
                }}>
                  <ClockCircleOutlined />
                </div>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Kutilayotgan Arizalar</span>
                {applications.length > 0 && (
                  <Tag color="orange" style={{ borderRadius: 20, fontWeight: 600 }}>{applications.length}</Tag>
                )}
              </Space>
            }
            extra={
              <Link href="/admin/applications">
                <Button type="link" style={{ color: "#6366f1", fontWeight: 600 }} icon={<ArrowRightOutlined />} iconPosition="end">
                  Barchasini ko'rish
                </Button>
              </Link>
            }
            styles={{ body: { padding: "8px 0" } }}
          >
            {isLoading ? (
              <div style={{ padding: "0 20px" }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: 12 }} />)}
              </div>
            ) : applications.length > 0 ? (
              <div>
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background 0.15s",
                  }}>
                    <Avatar
                      size={44} shape="square"
                      src={app.image_url}
                      style={{ borderRadius: 10, background: "#f1f5f9", fontSize: 20, flexShrink: 0 }}
                    >
                      {fieldTypeLabels[app.field_type]?.emoji || "🏟️"}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{app.field_name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {app.city} · {app.price_per_hour.toLocaleString()} UZS/soat
                      </div>
                    </div>
                    <Tag
                      style={{ borderRadius: 20, fontWeight: 600, fontSize: 11, border: "none", background: "#fef3c7", color: "#92400e" }}
                    >
                      Kutilmoqda
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: "24px 0" }}
                description={
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Hammasi ko'rib chiqilgan ✨</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>Hozircha yangi arizalar yo'q</div>
                  </div>
                }
              />
            )}
          </Card>
        </Col>

        {/* Quick Stats & Links */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={16} style={{ width: "100%", display: "flex" }}>
            {/* Revenue breakdown */}
            <Card
              style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              styles={{ body: { padding: 20 } }}
              title={
                <Space>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 14,
                  }}>
                    <DollarOutlined />
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Daromad Statistikasi</span>
                </Space>
              }
              extra={
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isClearing}
                  onClick={handleClearStats}
                  style={{ borderRadius: 8, fontSize: 12 }}
                >
                  Tozalash
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, color: "#64748b" }}>Bu oylik daromad</Text>
                    <Text strong style={{ color: "#0f172a" }}>
                      {isLoading ? "—" : `${(stats?.monthly_revenue ?? 0).toLocaleString()} UZS`}
                    </Text>
                  </div>
                  <Progress
                    percent={isLoading ? 0 : Math.min(100, stats?.prev_month_revenue ? Math.round((stats.monthly_revenue / stats.prev_month_revenue) * 100) : 100)}
                    strokeColor="linear-gradient(90deg, #3b82f6, #6366f1)"
                    trailColor="#f1f5f9"
                    showInfo={false}
                    strokeLinecap="round"
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Umumiy daromad</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {isLoading ? "—" : `${formatPrice(stats?.total_revenue ?? 0)} UZS`}
                    </div>
                  </div>
                  <div style={{ width: 1, background: "#f1f5f9" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Oylik bronlar</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {isLoading ? "—" : stats?.monthly_bookings ?? 0}
                    </div>
                  </div>
                  <div style={{ width: 1, background: "#f1f5f9" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Maydonlar</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {isLoading ? "—" : stats?.total_fields ?? 0}
                    </div>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Quick Navigation */}
            <Card
              style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              styles={{ body: { padding: 16 } }}
              title={<span style={{ fontWeight: 700, color: "#0f172a" }}>Tezkor havolalar</span>}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                {[
                  { href: "/admin/fields", label: "Maydonlar boshqaruvi", icon: <EnvironmentOutlined />, color: "#10b981", bg: "#f0fdf4" },
                  { href: "/admin/bookings", label: "Bronlar registri", icon: <CalendarOutlined />, color: "#6366f1", bg: "#f5f3ff" },
                  { href: "/admin/users", label: "Foydalanuvchilar", icon: <UserOutlined />, color: "#f59e0b", bg: "#fffbeb" },
                  { href: "/admin/applications", label: "Yangi arizalar", icon: <FileTextOutlined />, color: "#ef4444", bg: "#fef2f2", badge: applications.length },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 10,
                      background: "#f8fafc", border: "1px solid #f1f5f9",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: item.bg, color: item.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, flexShrink: 0,
                      }}>
                        {item.icon}
                      </div>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{item.label}</span>
                      {item.badge ? (
                        <span style={{
                          background: "#ef4444", color: "#fff", fontSize: 10,
                          fontWeight: 700, padding: "1px 7px", borderRadius: 10,
                        }}>
                          {item.badge}
                        </span>
                      ) : (
                        <ArrowRightOutlined style={{ color: "#cbd5e1", fontSize: 12 }} />
                      )}
                    </div>
                  </Link>
                ))}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  );
}
