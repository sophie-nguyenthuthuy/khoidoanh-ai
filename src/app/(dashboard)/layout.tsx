import { FileText, Home, Receipt, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireAuth, signOut } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Tổng quan", icon: Home },
  { href: "/registrations", label: "Hồ sơ đăng ký", icon: ShieldCheck },
  { href: "/documents", label: "Tài liệu", icon: FileText },
  { href: "/billing", label: "Thanh toán", icon: Receipt },
  { href: "/settings", label: "Cài đặt", icon: SettingsIcon },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-r bg-muted/30 p-4 md:block">
        <Link href="/" className="block px-2 py-3 font-display font-bold">
          Khởi Doanh<span className="text-primary">AI</span>
        </Link>
        <nav className="mt-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <div className="rounded-md border p-3 text-xs">
            <p className="truncate font-medium">{session.user.email}</p>
            <form action={logout} className="mt-2">
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-xs">
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="container max-w-5xl py-8">{children}</div>
      </main>
    </div>
  );
}
