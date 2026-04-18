"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table, Card, Button, Input, Tag, Space, message, Modal, Form,
  Select, InputNumber, Typography, Row, Col, Popconfirm, Avatar, Tooltip, Switch, Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined, UploadOutlined, ReloadOutlined, EnvironmentOutlined,
  SendOutlined, CopyOutlined, LinkOutlined,
} from "@ant-design/icons";
import { api } from "@/lib/api";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "polyabronuz_bot";

interface Field {
  id: number;
  name: string;
  field_type: string;
  address: string;
  city: string;
  price_per_hour: number;
  image_url: string | null;
  is_active: boolean;
  phone_number?: string | null;
  description?: string | null;
  owner_telegram_chat_id?: string | null;
  owner_invite_token?: string | null;
}

const { Title, Text } = Typography;
const { Search } = Input;

const fieldTypeConfig: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  football:   { label: "Futbol",    emoji: "⚽", color: "#059669", bg: "#f0fdf4" },
  tennis:     { label: "Tennis",    emoji: "🎾", color: "#0891b2", bg: "#ecfeff" },
  basketball: { label: "Basketbol", emoji: "🏀", color: "#d97706", bg: "#fffbeb" },
  volleyball: { label: "Voleybol",  emoji: "🏐", color: "#7c3aed", bg: "#f5f3ff" },
};

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [fieldTelegramLink, setFieldTelegramLink] = useState<{ link: string; field_name: string } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminFields();
      setFields(data.fields || []);
    } catch {
      message.error("Maydonlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (field: Field) => {
    try {
      await api.updateField(field.id, { is_active: !field.is_active });
      setFields(fields.map((f) => f.id === field.id ? { ...f, is_active: !f.is_active } : f));
      message.success(field.is_active ? "Maydon o'chirildi" : "Maydon faollashtirildi");
    } catch {
      message.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteField(id);
      setFields(fields.filter((f) => f.id !== id));
      message.success("Maydon o'chirildi");
    } catch {
      message.error("O'chirishda xatolik");
    }
  };


  const handleEdit = (field: Field) => {
    setEditingField(field);
    setImagePreview(field.image_url || null);
    setImageFile(null);
    form.setFieldsValue({
      name: field.name,
      field_type: field.field_type,
      city: field.city,
      address: field.address,
      price_per_hour: field.price_per_hour,
      phone_number: field.phone_number,
      description: field.description,
      owner_telegram_chat_id: field.owner_telegram_chat_id || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingField(null);
    setImagePreview(null);
    setImageFile(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingField(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      let imageUrl = editingField?.image_url || null;

      if (imageFile) {
        imageUrl = await api.uploadFieldImage(imageFile);
      }

      const payload = { ...values, image_url: imageUrl };

      if (editingField) {
        await api.updateField(editingField.id, payload);
        setFields(fields.map((f) => f.id === editingField.id ? { ...f, ...payload } : f));
        message.success("Maydon muvaffaqiyatli yangilandi");
        handleModalClose();
      } else {
        const newField = await api.createField(payload);
        setFields([...fields, newField]);
        message.success("Maydon muvaffaqiyatli yaratildi");
        handleModalClose();
      }
    } catch (error: any) {
      message.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  const filteredFields = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = fields.filter((f) => f.is_active).length;
  const inactiveCount = fields.filter((f) => !f.is_active).length;

  const columns: ColumnsType<Field> = [
    {
      title: "Maydon",
      key: "field",
      render: (_, record) => {
        const cfg = fieldTypeConfig[record.field_type];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={48} shape="square"
              src={record.image_url || undefined}
              style={{ borderRadius: 10, background: cfg?.bg || "#f1f5f9", fontSize: 20, flexShrink: 0 }}
            >
              {cfg?.emoji || "🏟️"}
            </Avatar>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                {record.name}
                {record.owner_telegram_chat_id && (
                  <Tooltip title={`Telegram ID: ${record.owner_telegram_chat_id}`}>
                    <span style={{ fontSize: 13, cursor: "default" }}>✈️</span>
                  </Tooltip>
                )}
              </div>
              <span style={{
                display: "inline-block", marginTop: 2,
                background: cfg?.bg || "#f1f5f9", color: cfg?.color || "#64748b",
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
          <div style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>{record.city}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{record.address}</div>
        </div>
      ),
    },
    {
      title: "Narx / soat",
      dataIndex: "price_per_hour",
      key: "price_per_hour",
      render: (price) => (
        <div>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{price.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>UZS</span>
        </div>
      ),
      sorter: (a, b) => a.price_per_hour - b.price_per_hour,
    },
    {
      title: "Holat",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: isActive ? "#f0fdf4" : "#f8fafc",
          color: isActive ? "#059669" : "#94a3b8",
          fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          border: `1px solid ${isActive ? "#bbf7d0" : "#e2e8f0"}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#059669" : "#cbd5e1", display: "inline-block" }} />
          {isActive ? "Aktiv" : "Noaktiv"}
        </span>
      ),
      filters: [
        { text: "Aktiv", value: true },
        { text: "Noaktiv", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: "Amallar",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          {record.owner_invite_token && (
            <Tooltip title="Telegram link yuborish">
              <Button
                type="text" size="small"
                icon={<SendOutlined />}
                onClick={() => {
                  const link = `https://t.me/${BOT_USERNAME}?start=owner_${record.id}_${record.owner_invite_token}`;
                  setFieldTelegramLink({ link, field_name: record.name });
                }}
                style={{ color: "#0088cc", background: "#e0f2fe", borderRadius: 8, width: 32, height: 32 }}
              />
            </Tooltip>
          )}
          <Tooltip title={record.is_active ? "O'chirish" : "Faollashtirish"}>
            <Button
              type="text" size="small"
              icon={record.is_active ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleStatus(record)}
              style={{
                color: record.is_active ? "#f59e0b" : "#10b981",
                background: record.is_active ? "#fffbeb" : "#f0fdf4",
                borderRadius: 8, width: 32, height: 32,
              }}
            />
          </Tooltip>
          <Tooltip title="Tahrirlash">
            <Button
              type="text" size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#6366f1", background: "#f5f3ff", borderRadius: 8, width: 32, height: 32 }}
            />
          </Tooltip>
          <Popconfirm
            title="Maydonni o'chirish"
            description="Haqiqatdan ham ushbu maydonni o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha, o'chirish"
            cancelText="Bekor"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="O'chirish">
              <Button
                type="text" size="small" danger
                icon={<DeleteOutlined />}
                style={{ background: "#fef2f2", borderRadius: 8, width: 32, height: 32 }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%", display: "flex" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #10b981, #059669)",
        borderRadius: 16, padding: isMobile ? "16px" : "24px 28px",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between", gap: 12,
        boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
      }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Maydonlar Boshqaruvi</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Jami {fields.length} ta · {activeCount} aktiv · {inactiveCount} noaktiv
          </div>
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchFields}
            loading={isLoading}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 10 }}
          />
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 10, fontWeight: 600 }}
          >
            Yangi Maydon
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }} styles={{ body: { padding: "16px 20px" } }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={14}>
            <Search
              placeholder="Maydon nomi, shahar yoki manzil bo'yicha..."
              allowClear size="large"
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: 10 }}
            />
          </Col>
          <Col xs={24} md={10}>
            <Space style={{ marginTop: 8 }}>
              {[
                { label: "Jami", value: fields.length, color: "#6366f1", bg: "#f5f3ff" },
                { label: "Aktiv", value: activeCount, color: "#059669", bg: "#f0fdf4" },
                { label: "Noaktiv", value: inactiveCount, color: "#94a3b8", bg: "#f8fafc" },
              ].map((item) => (
                <span key={item.label} style={{
                  background: item.bg, color: item.color,
                  fontSize: 13, fontWeight: 600,
                  padding: "4px 12px", borderRadius: 20,
                  border: `1px solid ${item.color}25`,
                }}>
                  {item.label}: {item.value}
                </span>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 14, border: "1px solid #e2e8f0" }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredFields}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 700 }}
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
        open={!!fieldTelegramLink}
        onCancel={() => setFieldTelegramLink(null)}
        footer={null}
        width={480}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "linear-gradient(135deg, #0088cc, #006eaa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 16,
            }}>
              <SendOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Telegram Taklif Havolasi</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>
                {fieldTelegramLink?.field_name}
              </div>
            </div>
          </div>
        }
      >
        {fieldTelegramLink && (
          <div style={{ padding: "8px 0" }}>
            <div style={{
              background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12,
              padding: "16px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: "#0369a1", fontWeight: 600, marginBottom: 8 }}>
                <LinkOutlined style={{ marginRight: 4 }} />
                Taklif havolasi:
              </div>
              <div style={{
                fontSize: 13, color: "#0f172a", wordBreak: "break-all",
                background: "#fff", borderRadius: 8, padding: "10px 12px",
                border: "1px solid #e0f2fe", fontFamily: "monospace",
              }}>
                {fieldTelegramLink.link}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>
              Ushbu havolani maydon egasiga yuboring. Havola orqali bot bilan ulanganda, maydon egasi bronlarni boshqara oladi.
            </div>

            <Space style={{ width: "100%", justifyContent: "center" }} size={12}>
              <Button
                size="large" icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(fieldTelegramLink.link);
                  message.success("Havola nusxalandi!");
                }}
                style={{ borderRadius: 10, borderColor: "#0088cc", color: "#0088cc", fontWeight: 600 }}
              >
                Nusxalash
              </Button>
              <Button
                size="large" type="primary" icon={<SendOutlined />}
                href={`https://t.me/share/url?url=${encodeURIComponent(fieldTelegramLink.link)}&text=${encodeURIComponent(`${fieldTelegramLink.field_name} - Polya bot taklifi`)}`}
                target="_blank"
                style={{ borderRadius: 10, background: "linear-gradient(135deg, #0088cc, #006eaa)", border: "none", fontWeight: 600 }}
              >
                Telegram orqali yuborish
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Edit/Create Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: editingField ? "linear-gradient(135deg, #6366f1, #818cf8)" : "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>
              {editingField ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>
                {editingField ? "Maydonni tahrirlash" : "Yangi maydon qo'shish"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>
                {editingField ? editingField.name : "Yangi maydon ma'lumotlarini kiriting"}
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={640}
        styles={{ header: { borderBottom: "1px solid #f1f5f9", paddingBottom: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          {/* Image Upload */}
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <div style={{
              width: "100%", height: 160, borderRadius: 12,
              border: "2px dashed #e2e8f0", background: "#f8fafc",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative", cursor: "pointer",
            }}>
              {imagePreview ? (
                <img src={imagePreview}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8" }}>
                  <UploadOutlined style={{ fontSize: 28, marginBottom: 8 }} />
                  <div style={{ fontSize: 13 }}>Rasm yuklash</div>
                </div>
              )}
              <Upload
                showUploadList={false}
                beforeUpload={handleImageChange}
                accept="image/*"
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              >
                <div style={{ position: "absolute", inset: 0, cursor: "pointer" }} />
              </Upload>
            </div>
            {imagePreview && (
              <Button size="small" onClick={() => { setImagePreview(null); setImageFile(null); }}
                style={{ marginTop: 8, color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12 }}>
                Rasmni o'chirish
              </Button>
            )}
          </div>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="name" label="Maydon nomi" rules={[{ required: true, message: "Kiriting" }]}>
                <Input size="large" placeholder="Maydon nomi" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="field_type" label="Turi" rules={[{ required: true, message: "Tanlang" }]}>
                <Select size="large" placeholder="Turi" style={{ borderRadius: 10 }}>
                  {Object.entries(fieldTypeConfig).map(([key, val]) => (
                    <Select.Option key={key} value={key}>
                      {val.emoji} {val.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="city" label="Shahar" rules={[{ required: true, message: "Kiriting" }]}>
                <Input size="large" placeholder="Toshkent" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item name="address" label="Manzil" rules={[{ required: true, message: "Kiriting" }]}>
                <Input size="large" placeholder="To'liq manzil" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price_per_hour" label="Narx (soatiga, UZS)" rules={[{ required: true, message: "Kiriting" }]}>
                <InputNumber
                  size="large" placeholder="50000"
                  style={{ width: "100%", borderRadius: 10 }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v!.replace(/,/g, "") as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone_number" label="Telefon (ixtiyoriy)">
                <Input size="large" placeholder="+998901234567" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="owner_telegram_chat_id"
            label={
              <span>
                Maydon egasining Telegram ID{" "}
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
                  (ixtiyoriy — bron xabarlari uchun)
                </span>
              </span>
            }
          >
            <Input
              size="large"
              placeholder="123456789"
              prefix={<span style={{ fontSize: 16 }}>✈️</span>}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item name="description" label="Tavsif (ixtiyoriy)">
            <Input.TextArea rows={3} placeholder="Maydon haqida qo'shimcha ma'lumot..." style={{ borderRadius: 10 }} />
          </Form.Item>

          <Row justify="end" style={{ marginTop: 8 }}>
            <Space>
              <Button onClick={handleModalClose} style={{ borderRadius: 10 }}>Bekor qilish</Button>
              <Button
                type="primary" htmlType="submit" loading={isSubmitting}
                style={{
                  background: editingField ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "linear-gradient(135deg, #10b981, #059669)",
                  border: "none", borderRadius: 10, fontWeight: 600,
                }}
              >
                {editingField ? "Saqlash" : "Yaratish"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
