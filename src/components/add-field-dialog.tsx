"use client";

import { useState } from "react";
import { Button, Input, Form, Select, message, Modal, Typography, Row, Col } from "antd";
import { PlusOutlined, PhoneOutlined, EnvironmentOutlined, DollarOutlined } from "@ant-design/icons";
import { FieldType } from "@/types";
import { useTheme } from "@/components/theme/theme-provider";

const { TextArea } = Input;
const { Text } = Typography;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface AddFieldDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddFieldDialog({ onSuccess, trigger }: AddFieldDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    name: string;
    field_type: FieldType;
    city: string;
    address: string;
    price_per_hour: number;
    phone_number: string;
    description?: string;
    image_url?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/fields/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field_name: values.name,
          field_type: values.field_type,
          city: values.city,
          address: values.address,
          price_per_hour: values.price_per_hour,
          phone_number: values.phone_number,
          description: values.description,
          image_url: values.image_url,
        }),
      });

      if (response.ok) {
        message.success("Ariza muvaffaqiyatli yuborildi!");
        setOpen(false);
        form.resetFields();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      message.error("Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const textColor = isDark ? "#fff" : "#111827";
  const inputBg = isDark ? "#0a0a0a" : "#f9fafb";

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Maydon qo'shish
        </Button>
      )}
      
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={500}
        title={<Text strong style={{ color: textColor }}>Maydon qo'shishga ariza</Text>}
      >
        <Text type="secondary" className="block mb-6">
          Maydoningiz haqidagi ma'lumotlarni to'ldiring. Adminlar arizani ko'rib chiqib, siz bilan bog'lanishadi.
        </Text>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={<Text style={{ color: textColor }}>Maydon nomi</Text>}
            rules={[{ required: true, message: "Maydon nomini kiriting" }]}
          >
            <Input placeholder="Masalan: Bunyodkor Arena" size="large" style={{ backgroundColor: inputBg }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="field_type"
                label={<Text style={{ color: textColor }}>Sport turi</Text>}
                rules={[{ required: true }]}
              >
                <Select size="large">
                  <Select.Option value="football">⚽ Futbol</Select.Option>
                  <Select.Option value="tennis">🎾 Tennis</Select.Option>
                  <Select.Option value="basketball">🏀 Basketbol</Select.Option>
                  <Select.Option value="volleyball">🏐 Voleybol</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="city"
                label={<Text style={{ color: textColor }}>Shahar</Text>}
                rules={[{ required: true }]}
              >
                <Input placeholder="Toshkent" size="large" style={{ backgroundColor: inputBg }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label={<Text style={{ color: textColor }}>Manzil</Text>}
            rules={[{ required: true, message: "Manzilni kiriting" }]}
          >
            <Input prefix={<EnvironmentOutlined style={{ color: '#9ca3af' }} />} placeholder="Chilonzor, 6-mavze..." size="large" style={{ backgroundColor: inputBg }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price_per_hour"
                label={<Text style={{ color: textColor }}>Soatlik narx</Text>}
                rules={[{ required: true, message: "Narxni kiriting" }]}
              >
                <Input prefix={<DollarOutlined style={{ color: '#9ca3af' }} />} type="number" placeholder="150000" size="large" style={{ backgroundColor: inputBg }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label={<Text style={{ color: textColor }}>Telefon</Text>}
                rules={[{ required: true, message: "Telefonni kiriting" }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />} placeholder="+998 90 123 45 67" size="large" style={{ backgroundColor: inputBg }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="image_url"
            label={<Text style={{ color: textColor }}>Rasm URL (ixtiyoriy)</Text>}
          >
            <Input placeholder="https://..." size="large" style={{ backgroundColor: inputBg }} />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text style={{ color: textColor }}>Tavsif (ixtiyoriy)</Text>}
          >
            <TextArea rows={3} placeholder="Mijozlar uchun qulayliklar haqida..." style={{ backgroundColor: inputBg }} />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
              size="large"
            >
              Ariza yuborish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
