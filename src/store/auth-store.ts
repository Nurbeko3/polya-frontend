"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, normalizePhone } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_admin: boolean;
  is_super_admin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; password?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw new Error("Email yoki parol noto'g'ri");

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          set({
            user: {
              id: data.user.id,
              name: profile?.name || data.user.user_metadata?.name || "",
              phone: profile?.phone || "",
              email: data.user.email || email,
              is_admin: profile?.is_admin || false,
              is_super_admin: profile?.is_super_admin || false,
            },
            token: data.session?.access_token || null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, phone: string, password: string) => {
        set({ isLoading: true });
        try {
          const normalizedPhone = normalizePhone(phone);

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, phone: normalizedPhone },
              emailRedirectTo: undefined,
            },
          });

          if (error) {
            if (error.message.includes("already registered") || error.message.includes("User already registered")) {
              throw new Error("Bu email allaqachon ro'yxatdan o'tgan");
            }
            throw new Error(error.message);
          }

          if (!data.user) throw new Error("Ro'yxatdan o'tishda xatolik");

          set({
            user: {
              id: data.user.id,
              name,
              phone: normalizedPhone,
              email,
              is_admin: false,
              is_super_admin: false,
            },
            token: data.session?.access_token || null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data: { name?: string; password?: string }) => {
        const { user } = get();
        if (!user) throw new Error("Tizimga kirish kerak");

        set({ isLoading: true });
        try {
          if (data.password) {
            const { error } = await supabase.auth.updateUser({ password: data.password });
            if (error) throw new Error(error.message);
          }

          if (data.name) {
            const { error } = await supabase
              .from("profiles")
              .update({ name: data.name })
              .eq("id", user.id);
            if (error) throw new Error(error.message);
          }

          set({
            user: { ...user, ...(data.name ? { name: data.name } : {}) },
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshUser: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          set({
            user: {
              id: authUser.id,
              name: profile.name,
              phone: profile.phone,
              email: authUser.email || "",
              is_admin: profile.is_admin,
              is_super_admin: profile.is_super_admin,
            },
            isAuthenticated: true,
          });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "polya-auth-v2",
    }
  )
);
