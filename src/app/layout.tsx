import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

// `next/font/google` fetches WOFF2 from fonts.gstatic.com at BUILD time.
// On networks that block Google CDNs (corporate VPN, restrictive proxies,
// CI without egress), `next build` hangs with ETIMEDOUT and ultimately
// "Failed to fetch Be Vietnam Pro from Google Fonts". For dev/CI we fall
// back to system fonts via the same CSS variables so layouts that read
// `var(--font-sans)` / `var(--font-display)` keep working. Production
// deployments that DO have CDN egress should restore the next/font block
// — see git blame on this file for the original import.
const sans = { variable: "--font-sans" };
const display = { variable: "--font-display" };

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
