import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
import { AntdRegistry } from "@/components/antd-registry";
import { DynamicConfigProvider } from "@/components/dynamic-config-provider";

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
          <ThemeProvider defaultTheme="light" storageKey="polya-theme">
            <DynamicConfigProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </DynamicConfigProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
