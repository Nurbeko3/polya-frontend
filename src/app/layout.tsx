import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "sonner";
import { AntdRegistry } from "@/components/antd-registry";
import { DynamicConfigProvider } from "@/components/dynamic-config-provider";
import { ActivityTracker } from "@/components/activity-tracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polya - Maydon bron qilish",
  description: "O'zbekistondagi futbol, tennis, basketbol va voleybol maydonlarini tez va oson bron qilish platformasi",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("polya-theme");if(t==="dark"||t==="light"){document.documentElement.classList.add(t)}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark")}else{document.documentElement.classList.add("light")}}catch(e){document.documentElement.classList.add("light")}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <AntdRegistry>
          <ThemeProvider defaultTheme="light" storageKey="polya-theme">
            <DynamicConfigProvider>
              <ActivityTracker />
              {children}
              <Toaster position="top-right" richColors closeButton />
            </DynamicConfigProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
