"use client";

import Link from "next/link";
import { Field } from "@/types";
import { Card, Tag, Rate, Row, Col, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";

const { Text, Title } = Typography;

interface FieldCardProps {
  field: Field;
}

const fieldIcons: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
};

const fieldColors: Record<string, { bg: string; text: string }> = {
  football: { bg: "#dcfce7", text: "#16a34a" },
  tennis: { bg: "#d1fae5", text: "#059669" },
  basketball: { bg: "#ffedd5", text: "#ea580c" },
  volleyball: { bg: "#fce7f3", text: "#db2777" },
};

export function FieldCard({ field }: FieldCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const color = fieldColors[field.field_type] || { bg: "#f3f4f6", text: "#6b7280" };
  const borderColor = isDark ? "#262626" : "#e5e7eb";
  const cardBg = isDark ? "#171717" : "#ffffff";

  return (
    <Link href={`/fields/${field.id}`} className="block">
      <Card
        hoverable
        className="h-full"
        style={{ backgroundColor: cardBg, borderColor }}
        cover={
          <div className="relative h-44 md:h-48 overflow-hidden" style={{ background: isDark ? "linear-gradient(to bottom right, #262626, #171717)" : "linear-gradient(to bottom right, #e5e7eb, #f3f4f6)" }}>
            {field.image_url ? (
              <img
                src={field.image_url}
                alt={field.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {fieldIcons[field.field_type] || "🏟️"}
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Tag icon={<EnvironmentOutlined />} style={{ backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)" }}>
                {field.city}
              </Tag>
            </div>
            <div className="absolute bottom-3 left-3">
              <Tag style={{ backgroundColor: color.bg, color: color.text, border: 'none' }}>
                {fieldIcons[field.field_type]} {field.field_type}
              </Tag>
            </div>
          </div>
        }
      >
        <Title level={5} className="!mb-1 !text-base truncate" style={{ color: isDark ? "#fff" : "#111827" }}>{field.name}</Title>
        <Text type="secondary" className="block mb-2 truncate text-sm">{field.address}</Text>
        <Row justify="space-between" align="middle">
          <Col>
            <span className="text-xl font-bold" style={{ color: "#2563eb" }}>
              {formatPrice(field.price_per_hour)}
            </span>
            <Text type="secondary" className="text-xs">/soat</Text>
          </Col>
          {field.rating > 0 && (
            <Col>
              <Rate disabled value={field.rating} className="!text-xs" />
            </Col>
          )}
        </Row>
      </Card>
    </Link>
  );
}
