export type FieldType = 'football' | 'tennis' | 'basketball' | 'volleyball';

export interface Field {
  id: number;
  name: string;
  field_type: FieldType;
  description: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  price_per_hour: number;
  image_url: string | null;
  rating: number;
  is_active: boolean;
}

export interface BookingSlot {
  id: number;
  field_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'locked' | 'booked';
  locked_until: string | null;
}

export interface FieldListResponse {
  fields: Field[];
  total: number;
  page: number;
  per_page: number;
}

export interface SlotListResponse {
  slots: BookingSlot[];
  field_id: number;
  date: string;
}

export interface BookingLockResponse {
  slot_id: number;
  lock_token: string;
  expires_in_seconds: number;
  message: string;
}

export interface BookingConfirmResponse {
  booking_id: number;
  field_id: number;
  date: string;
  start_time: string;
  end_time: string;
  payment_id: number;
  amount: number;
  payment_url: string | null;
  status: string;
}
