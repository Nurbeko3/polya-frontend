export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface User {
  id: number;
  phone: string;
  name: string;
  email: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
}

interface ApiError {
  detail?: string;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("polya_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("polya_token", token);
      } else {
        localStorage.removeItem("polya_token");
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "Noma'lum xatolik yuz berdi",
      }));
      throw new Error(error.detail || error.error || "Request failed");
    }

    return response.json();
  }

  async signup(data: {
    phone: string;
    name: string;
    email?: string;
    password: string;
  }): Promise<TokenResponse> {
    const result = await this.request<TokenResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(result.access_token);
    return result;
  }

  async adminSignup(data: {
    phone: string;
    name: string;
    email?: string;
    password: string;
  }): Promise<TokenResponse> {
    const result = await this.request<TokenResponse>("/auth/admin-signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(result.access_token);
    return result;
  }

  async login(phone: string, password: string): Promise<TokenResponse> {
    const result = await this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    this.setToken(result.access_token);
    return result;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getMyBookings(userId: number): Promise<UserBookingsResponse> {
    return this.request<UserBookingsResponse>(`/bookings/my-bookings?user_id=${userId}`);
  }

  async cancelBooking(slotId: number, userId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/bookings/${slotId}?user_id=${userId}`, {
      method: "DELETE",
    });
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: "POST", 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: "PUT", 
      body: body ? JSON.stringify(body) : undefined 
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
export type { User, TokenResponse };

export interface BookingSlot {
  id: number;
  field_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "locked" | "booked";
  locked_until: string | null;
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

export interface UserBookingsResponse {
  bookings: BookingSlot[];
  total: number;
  page: number;
  per_page: number;
}

export interface Field {
  id: number;
  name: string;
  field_type: string;
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

export interface FieldListResponse {
  fields: Field[];
  total: number;
  page: number;
  per_page: number;
}
