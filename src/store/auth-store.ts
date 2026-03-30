import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  phone: string;
  role: "user" | "owner" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://polya-backend.onrender.com/api/v1";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, code: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, code }),
          });

          if (!response.ok) {
            throw new Error("Verification failed");
          }

          const data = await response.json();
          const userData: User = {
            id: data.user_id || data.id,
            name: data.name || "Foydalanuvchi",
            phone,
            role: data.role || "user",
          };

          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "polya-auth",
    }
  )
);
