import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@/components/antd-registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polya - Maydon bron qilish",
  description: "O'zbekistondagi futbol va tennis maydonlarini bron qilish platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#2563eb",
                borderRadius: 8,
                fontFamily: inter.style.fontFamily,
              },
            }}
          >
            <ThemeProvider defaultTheme="light" storageKey="polya-theme">
              {children}
              <Toaster position="top-right" richColors closeButton />
            </ThemeProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
