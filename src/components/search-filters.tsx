"use client";

import { useState } from "react";
import { Button, Input, Select, Row, Col } from "antd";
import { Search, Eraser } from "lucide-react";
import { FieldType } from "@/types";
import { useTheme } from "@/components/theme/theme-provider";

interface SearchFiltersProps {
  onSearch: (filters: {
    city?: string;
    field_type?: FieldType;
    min_price?: string;
    max_price?: string;
  }) => void;
  isLoading?: boolean;
}

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [city, setCity] = useState("");
  const [fieldType, setFieldType] = useState<FieldType | "all">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bgColor = isDark ? "#171717" : "#f9fafb";
  const borderColor = isDark ? "#262626" : "#e5e7eb";

  const handleSearch = () => {
    onSearch({
      city: city || undefined,
      field_type: fieldType === "all" ? undefined : (fieldType as FieldType),
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
    });
  };

  const handleClear = () => {
    setCity("");
    setFieldType("all");
    setMinPrice("");
    setMaxPrice("");
    onSearch({});
  };

  return (
    <div className="mb-8 md:mb-10">
      <div className="p-4 md:p-6 rounded-lg" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={7}>
            <Input
              placeholder="Shahar yoki tuman..."
              prefix={<Search size={16} style={{ color: '#9ca3af' }} />}
              size="large"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onPressEnter={handleSearch}
              style={{ backgroundColor: isDark ? "#0a0a0a" : "#ffffff", borderColor }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Sport turi"
              size="large"
              style={{ width: '100%' }}
              value={fieldType}
              onChange={(v) => {
                const newType = v as FieldType | "all";
                setFieldType(newType);
                onSearch({
                  city: city || undefined,
                  field_type: newType === "all" ? undefined : (newType as FieldType),
                  min_price: minPrice || undefined,
                  max_price: maxPrice || undefined,
                });
              }}
            >
              <Select.Option value="all">Barcha turlar</Select.Option>
              <Select.Option value="football">⚽ Futbol</Select.Option>
              <Select.Option value="tennis">🎾 Tennis</Select.Option>
              <Select.Option value="basketball">🏀 Basketbol</Select.Option>
              <Select.Option value="volleyball">🏐 Voleybol</Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Input
              type="number"
              placeholder="Narx dan"
              size="large"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ backgroundColor: isDark ? "#0a0a0a" : "#ffffff", borderColor }}
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Input
              type="number"
              placeholder="Narx gacha"
              size="large"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ backgroundColor: isDark ? "#0a0a0a" : "#ffffff", borderColor }}
            />
          </Col>
          <Col xs={12} md={3}>
            <Button
              type="primary"
              icon={<Search size={16} />}
              onClick={handleSearch}
              loading={isLoading}
              size="large"
              block
            >
              Qidirish
            </Button>
          </Col>
          <Col xs={12} md={2}>
            <Button
              icon={<Eraser size={16} />}
              onClick={handleClear}
              size="large"
              block
            >
              Tozalash
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}
