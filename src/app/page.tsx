"use client";

import { useState, useEffect } from "react";
import { Field, FieldType } from "@/types";
import { FieldCard } from "@/components/field-card";
import { SearchFilters } from "@/components/search-filters";
import { Logo } from "@/components/logo";
import { AddFieldDialog } from "@/components/add-field-dialog";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { Typography, Card, Row, Col, Button, Spin, Empty, Badge, Space, Divider } from "antd";
import { EnvironmentOutlined, TrophyOutlined, CalendarOutlined, UserOutlined, RightOutlined, SearchOutlined, PlusOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useTheme } from "@/components/theme/theme-provider";

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchFields();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats/`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchFields = async (filters?: {
    city?: string;
    field_type?: FieldType;
    min_price?: string;
    max_price?: string;
  }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.city) params.append("city", filters.city);
      if (filters?.field_type) params.append("field_type", filters.field_type);
      if (filters?.min_price) params.append("min_price", filters.min_price);
      if (filters?.max_price) params.append("max_price", filters.max_price);

      const response = await fetch(`${API_URL}/fields/${params.toString() ? `?${params.toString()}` : ""}`);
      const data = await response.json();
      setFields(data.fields || []);
    } catch (error) {
      console.error("Error fetching fields:", error);
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === "dark";
  const colors = {
    bg: isDark ? "#0a0a0a" : "#ffffff",
    bgSecondary: isDark ? "#171717" : "#f9fafb",
    textPrimary: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#a1a1aa" : "#6b7280",
    border: isDark ? "#262626" : "#e5e7eb",
    cardBg: isDark ? "#171717" : "#ffffff",
  };

  const sportTypes = [
    { type: "football" as FieldType, label: "Futbol", emoji: "⚽", count: fields.filter(f => f.field_type === "football").length },
    { type: "tennis" as FieldType, label: "Tennis", emoji: "🎾", count: fields.filter(f => f.field_type === "tennis").length },
    { type: "basketball" as FieldType, label: "Basketbol", emoji: "🏀", count: fields.filter(f => f.field_type === "basketball").length },
    { type: "volleyball" as FieldType, label: "Voleybol", emoji: "🏐", count: fields.filter(f => f.field_type === "volleyball").length },
  ];

  const features = [
    {
      icon: <CalendarOutlined style={{ fontSize: 28 }} />,
      title: "Tez bron qilish",
      description: "Bir necha soniyada maydon bron qiling va vaqtingizni tejang",
      color: "#3b82f6"
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: 28 }} />,
      title: "Xavfsiz to'lov",
      description: "Click va Payme orqali xavfsiz va ishonchli to'lovlar",
      color: "#10b981"
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 28 }} />,
      title: "Keng tanlov",
      description: "Turli sport turlari va shaharlar bo'yicha eng yaxshi maydonlar",
      color: "#f59e0b"
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Maydonni tanlang",
      desc: "O'zingizga qulay sport turi va joylashuvni filtrlar orqali tezda toping.",
      icon: <SearchOutlined style={{ fontSize: 32 }} />,
      color: "#3b82f6"
    },
    {
      step: "02",
      title: "Vaqtni belgilang",
      desc: "Kalendar orqali bo'sh vaqtni tanlang va ma'lumotlaringizni kiriting.",
      icon: <CalendarOutlined style={{ fontSize: 32 }} />,
      color: "#8b5cf6"
    },
    {
      step: "03",
      title: "To'lov va O'yin",
      desc: "Click yoki Payme orqali to'lovni amalga oshiring va o'yinga tayyorlaning!",
      icon: <CheckCircleOutlined style={{ fontSize: 32 }} />,
      color: "#10b981"
    },
  ];

  const formatValue = (val: any) => {
    if (val === undefined || val === null) return "0";
    if (typeof val === "number") {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + "M+";
      if (val >= 1000) return (val / 1000).toFixed(1) + "K+";
      return val.toString();
    }
    return val;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20" style={{ background: isDark ? "linear-gradient(to bottom, #171717, #0a0a0a)" : "linear-gradient(to bottom, #f9fafb, #ffffff)" }}>
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge style={{ backgroundColor: isDark ? "#1e3a5f" : "#eff6ff", color: "#2563eb" }} className="mb-6">
              O'zbekistonning eng yaxshi bron platformasi
            </Badge>
            <Title level={1} className="!mb-6 !text-4xl md:!text-5xl font-bold" style={{ color: colors.textPrimary }}>
              Sport maydonlarini <span style={{ color: "#2563eb" }}>oson bron qiling</span>
            </Title>
            <Paragraph className="!text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
              Futbol, tennis, basketbol va boshqa sport maydonlarini bir necha soniyada bron qiling.
            </Paragraph>
            <Space size="middle">
              <a href="#fields">
                <Button type="primary" size="large" icon={<SearchOutlined />}>
                  Maydonlarni ko'rish
                </Button>
              </a>
              <AddFieldDialog 
                onSuccess={() => {
                  fetchFields();
                  fetchStats();
                }}
              />
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={24} justify="center" className="mt-16">
            {[
              { label: "Aktiv maydonlar", value: stats?.active_fields },
              { label: "Shaharlar", value: stats?.cities },
              { label: "Bron qilingan", value: stats?.bookings },
              { label: "Foydalanuvchilar", value: stats?.users },
            ].map((stat, i) => (
              <Col key={i} xs={12} md={6}>
                <Card className="text-center" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                  <div className="text-3xl font-bold" style={{ color: "#2563eb" }}>{formatValue(stat.value)}</div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: colors.textSecondary }}>{stat.label}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Sport Types */}
      <section className="py-16" style={{ backgroundColor: colors.bg }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Title level={2} className="!mb-1 !text-2xl font-bold" style={{ color: colors.textPrimary }}>Sport turlari</Title>
              <Text type="secondary" style={{ color: colors.textSecondary }}>O'zingizga mos sport turini tanlang</Text>
            </div>
          </div>
          <Row gutter={[24, 24]}>
            {sportTypes.map(({ type, label, emoji, count }) => (
              <Col xs={12} md={6} key={type}>
                <Card 
                  hoverable
                  className="text-center"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: 12 }}
                >
                  <div style={{ fontSize: 48 }} className="mb-4">{emoji}</div>
                  <Title level={4} className="!mb-1 !text-lg font-semibold" style={{ color: colors.textPrimary }}>{label}</Title>
                  <Text type="secondary" style={{ color: colors.textSecondary }}>{count} ta maydon</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" style={{ backgroundColor: colors.bgSecondary }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Title level={2} className="!mb-3 !text-2xl font-bold" style={{ color: colors.textPrimary }}>Nima uchun Polya?</Title>
            <Paragraph style={{ color: colors.textSecondary }} className="max-w-xl mx-auto">
              Bizning platforma orqali siz eng yaxshi maydonlarni topishingiz va bir necha soniyada bron qilishingiz mumkin
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            {features.map((feature, i) => (
              <Col xs={24} md={8} key={i}>
                <Card style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: 12 }} className="h-full hover:shadow-lg transition-shadow">
                  <div 
                    style={{ backgroundColor: `${feature.color}15`, color: feature.color }} 
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                  >
                    {feature.icon}
                  </div>
                  <Title level={4} className="!mb-2 !text-lg" style={{ color: colors.textPrimary }}>{feature.title}</Title>
                  <Paragraph style={{ color: colors.textSecondary }} className="!mb-0">{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Fields Section */}
      <section id="fields" className="py-16 scroll-mt-20" style={{ backgroundColor: colors.bg }}>
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <Title level={2} className="!mb-1 !text-2xl font-bold" style={{ color: colors.textPrimary }}>Mashhur maydonlar</Title>
            <Text type="secondary" style={{ color: colors.textSecondary }}>Eng ko'p bron qilingan maydonlar</Text>
          </div>

          <SearchFilters onSearch={fetchFields} isLoading={isLoading} />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : fields.length > 0 ? (
            <Row gutter={[24, 24]}>
              {fields.map((field) => (
                <Col xs={24} sm={12} lg={8} key={field.id}>
                  <FieldCard field={field} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="Maydonlar topilmadi" 
              className="py-16"
            />
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20" style={{ backgroundColor: colors.bgSecondary }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Title level={2} className="!mb-3 !text-2xl font-bold" style={{ color: colors.textPrimary }}>Qanday ishlaydi?</Title>
            <Paragraph style={{ color: colors.textSecondary }} className="max-w-xl mx-auto">
              Ushbu 3 ta oddiy qadam orqali maydoningizni band qiling
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            {howItWorks.map((item, i) => (
              <Col xs={24} md={8} key={i}>
                <Card 
                  style={{ 
                    backgroundColor: colors.cardBg, 
                    borderColor: colors.border, 
                    borderRadius: 16
                  }}
                  className="h-full"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      style={{ backgroundColor: `${item.color}15`, color: item.color }} 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    >
                      {item.icon}
                    </div>
                    <div>
                      <Title level={4} className="!mb-2 !text-lg" style={{ color: colors.textPrimary }}>{item.title}</Title>
                      <Paragraph style={{ color: colors.textSecondary }} className="!mb-0">{item.desc}</Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-12">
            <a href="#fields">
              <Button type="primary" size="large" icon={<RightOutlined />}>
                Boshlash
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: colors.bg, borderTop: `1px solid ${colors.border}` }}>
        <div className="container mx-auto px-6">
          <Row gutter={[48, 32]}>
            <Col xs={24} md={6}>
              <Logo />
              <Paragraph style={{ color: colors.textSecondary }} className="mt-4">
                O'zbekistonning eng yaxshi sport maydonlarini bron qilish platformasi
              </Paragraph>
            </Col>
            <Col xs={12} md={6}>
              <Title level={5} className="!mb-4" style={{ color: colors.textPrimary }}>To'lov tizimlari</Title>
              <Space size={12}>
                <div className="bg-white p-2 rounded border overflow-hidden w-20 h-10 flex items-center justify-center">
                  <img src="/assets/images/click.jpg" alt="Click" className="w-full h-auto object-contain" />
                </div>
                <div className="bg-white p-2 rounded border overflow-hidden w-20 h-10 flex items-center justify-center">
                  <img src="/assets/images/payme.jpg" alt="Payme" className="w-full h-auto object-contain" />
                </div>
              </Space>
              <Text type="secondary" className="block mt-3 text-xs">Xavfsiz va tezkor to'lovlar</Text>
            </Col>
            <Col xs={12} md={6}>
              <Title level={5} className="!mb-4" style={{ color: colors.textPrimary }}>Havolalar</Title>
              <Space direction="vertical" className="w-full">
                <a href="#" style={{ color: colors.textSecondary }}>Bosh sahifa</a>
                <a href="#" style={{ color: colors.textSecondary }}>Maydonlar</a>
                <a href="#" style={{ color: colors.textSecondary }}>Bronlarim</a>
              </Space>
            </Col>
            <Col xs={12} md={6}>
              <Title level={5} className="!mb-4" style={{ color: colors.textPrimary }}>Aloqa</Title>
              <Space direction="vertical" className="w-full">
                <Text type="secondary">+998 71 123 45 67</Text>
                <Text type="secondary">info@polya.uz</Text>
                <Text type="secondary">Toshkent, O'zbekiston</Text>
              </Space>
            </Col>
          </Row>
          <Divider />
          <div className="text-center text-sm" style={{ color: colors.textSecondary }}>
            © {new Date().getFullYear()} Polya. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
