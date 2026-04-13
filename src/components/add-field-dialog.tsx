"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Input, Form, Select, message, Modal, Typography, Row, Col } from "antd";
import { PlusOutlined, PhoneOutlined, DollarOutlined } from "@ant-design/icons";
import { FieldType } from "@/types";
import { useTheme } from "@/components/theme/theme-provider";
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { LocationValue } from "@/components/map/location-picker";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => (
    <div className="w-full rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" style={{ height: 280 }} />
  )}
);

const { TextArea } = Input;
const { Text } = Typography;

import { api } from "@/lib/api";

interface AddFieldDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddFieldDialog({ onSuccess, trigger }: AddFieldDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form] = Form.useForm();

  const processFile = useCallback(async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      message.error("Faqat JPG, PNG yoki WebP formatidagi rasmlar qabul qilinadi");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("Rasm hajmi 10MB dan oshmasligi kerak");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl(null);

    // Upload immediately
    setImageUploading(true);
    try {
      const url = await api.uploadFieldImage(file);
      setUploadedUrl(url);
    } catch (err: any) {
      message.error(err.message || "Rasm yuklashda xatolik yuz berdi");
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setImageUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedUrl(null);
  };

  const handleSubmit = async (values: {
    name: string;
    field_type: FieldType;
    price_per_hour: number;
    phone_number: string;
    description?: string;
  }) => {
    if (!location) {
      message.error("Iltimos, xaritadan maydon lokatsiyasini belgilang");
      return;
    }
    if (imageFile && !uploadedUrl) {
      message.error("Rasm hali yuklanmadi, iltimos kuting");
      return;
    }

    setIsLoading(true);
    try {
      await api.submitApplication({
        field_name: values.name,
        field_type: values.field_type,
        city: location.city || "Toshkent",
        address: location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
        price_per_hour: Number(values.price_per_hour),
        phone_number: values.phone_number,
        description: values.description,
        image_url: uploadedUrl ?? null,
        latitude: location.lat,
        longitude: location.lng,
      });
      message.success("Ariza muvaffaqiyatli yuborildi!");
      setOpen(false);
      form.resetFields();
      removeImage();
      onSuccess?.();
    } catch (err: any) {
      message.error(err.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    removeImage();
    setLocation(null);
  };

  const inputBg = isDark ? "#0a0a0a" : "#f9fafb";
  const textColor = isDark ? "#fff" : "#111827";

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
        onCancel={handleClose}
        footer={null}
        centered
        width={520}
        title={<Text strong style={{ color: textColor }}>Maydon qo'shishga ariza</Text>}
      >
        <Text type="secondary" className="block mb-6">
          Maydoningiz haqidagi ma'lumotlarni to'ldiring. Adminlar ko'rib chiqadi.
        </Text>

        {/* Hidden file input — outside Form so Ant Design doesn't render it */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
          {/* ── Image Upload ── */}
          <Form.Item label={<Text style={{ color: textColor }}>Maydon rasmi (ixtiyoriy)</Text>}>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-48 object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
                {/* Upload status */}
                <div className="absolute bottom-3 right-3">
                  {imageUploading ? (
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Yuklanmoqda...
                    </div>
                  ) : uploadedUrl ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Yuklandi
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : isDark
                      ? "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                      : "border-slate-200 hover:border-primary/40 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  isDark ? "bg-white/8" : "bg-slate-100"
                )}>
                  <PhotoIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className={cn("text-sm font-bold", isDark ? "text-white/60" : "text-slate-600")}>
                    Rasm tanlash uchun bosing
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    yoki bu yerga sudrab tashlang
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    JPG, PNG, WebP • maks 10MB
                  </p>
                </div>
              </div>
            )}
          </Form.Item>

          {/* ── Fields ── */}
          <Form.Item
            name="name"
            label={<Text style={{ color: textColor }}>Maydon nomi</Text>}
            rules={[{ required: true, message: "Maydon nomini kiriting" }]}
          >
            <Input placeholder="Masalan: Bunyodkor Arena" size="large" style={{ backgroundColor: inputBg }} />
          </Form.Item>

          <Form.Item
            name="field_type"
            label={<Text style={{ color: textColor }}>Sport turi</Text>}
            rules={[{ required: true, message: "Sport turini tanlang" }]}
          >
            <Select size="large" placeholder="Tanlang">
              <Select.Option value="football">⚽ Futbol</Select.Option>
              <Select.Option value="tennis">🎾 Tennis</Select.Option>
              <Select.Option value="basketball">🏀 Basketbol</Select.Option>
              <Select.Option value="volleyball">🏐 Voleybol</Select.Option>
            </Select>
          </Form.Item>

          {/* ── Location picker ── */}
          <Form.Item
            label={
              <span style={{ color: textColor }}>
                Maydon lokatsiyasi{" "}
                <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
              </span>
            }
          >
            <LocationPicker value={location} onChange={setLocation} />
            {location && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                  📍 {location.address || "Lokatsiya belgilandi"}{location.city ? `, ${location.city}` : ""}
                </p>
              </div>
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price_per_hour"
                label={<Text style={{ color: textColor }}>Soatlik narx (so'm)</Text>}
                rules={[{ required: true, message: "Narxni kiriting" }]}
              >
                <Input
                  prefix={<DollarOutlined style={{ color: "#9ca3af" }} />}
                  type="number"
                  placeholder="150000"
                  size="large"
                  style={{ backgroundColor: inputBg }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label={<Text style={{ color: textColor }}>Telefon</Text>}
                rules={[{ required: true, message: "Telefonni kiriting" }]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="+998 90 123 45 67"
                  size="large"
                  style={{ backgroundColor: inputBg }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<Text style={{ color: textColor }}>Tavsif (ixtiyoriy)</Text>}
          >
            <TextArea
              rows={3}
              placeholder="Mijozlar uchun qulayliklar haqida..."
              style={{ backgroundColor: inputBg }}
            />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={imageUploading}
              block
              size="large"
            >
              {imageUploading ? "Rasm yuklanmoqda..." : "Ariza yuborish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
