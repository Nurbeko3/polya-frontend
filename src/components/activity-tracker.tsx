"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { message } from "antd";

const CHECK_INTERVAL_MS = 30 * 1000; // har 30 sekundda tekshirish
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"] as const;

export function ActivityTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const touchActivity = useAuthStore((s) => s.touchActivity);
  const checkTimeout = useAuthStore((s) => s.checkTimeout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const lastTouchRef = useRef(0);

  // Foydalanuvchi faolligini kuzatish (throttled — har 10 sekundda bir marta)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastTouchRef.current > 10_000) {
        lastTouchRef.current = now;
        touchActivity();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [isAuthenticated, touchActivity]);

  // Har 30 sekundda timeout tekshirish
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const timedOut = checkTimeout();
      if (timedOut) {
        message.warning("Sessiya muddati tugadi. Iltimos, qaytadan kiring.");
        if (pathname?.startsWith("/admin")) {
          router.push("/admin/login");
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTimeout, router, pathname]);

  // Sahifa ochilganda ham tekshirish (masalan, tab ga qaytganda)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const timedOut = checkTimeout();
        if (timedOut) {
          message.warning("Sessiya muddati tugadi. Iltimos, qaytadan kiring.");
          if (pathname?.startsWith("/admin")) {
            router.push("/admin/login");
          }
        } else {
          touchActivity();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isAuthenticated, checkTimeout, touchActivity, router, pathname]);

  return null;
}
