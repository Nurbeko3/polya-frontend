"use client";

import { ConfigProvider, theme as antTheme } from "antd";
import { useTheme } from "@/components/theme/theme-provider";

export function DynamicConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
