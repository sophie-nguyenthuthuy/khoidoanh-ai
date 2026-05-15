import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold">
            Khởi Doanh<span className="text-primary">AI</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/pricing" className="text-sm hover:text-primary">Bảng giá</Link>
            <Link href="/services/tax" className="text-sm hover:text-primary">Kế toán</Link>
            <Link href="/services/einvoice" className="text-sm hover:text-primary">HDDT</Link>
            <Link href="/services/bhxh" className="text-sm hover:text-primary">BHXH</Link>
            <Link href="/about" className="text-sm hover:text-primary">Về chúng tôi</Link>
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="ghost"><Link href="/login">Đăng nhập</Link></Button>
            <Button asChild><Link href="/wizard/new">Bắt đầu</Link></Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © 2026 Khởi Doanh AI JSC
      </footer>
    </div>
  );
}
