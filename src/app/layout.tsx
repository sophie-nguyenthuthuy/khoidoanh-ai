import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Khởi Doanh AI — Đăng ký kinh doanh trong 15 phút",
    template: "%s · Khởi Doanh AI",
  },
  description:
    "Thành lập công ty TNHH, Cổ phần, hoặc hộ kinh doanh tại Việt Nam trong 15 phút. AI sinh điều lệ, chọn mã ngành, nộp hồ sơ online.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://khoidoanh.ai"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Khởi Doanh AI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={cn("min-h-dvh bg-background font-sans", sans.variable, display.variable)}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
