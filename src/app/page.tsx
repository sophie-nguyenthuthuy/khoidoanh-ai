import { ArrowRight, Clock, FileCheck, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold">
            Khởi Doanh<span className="text-primary">AI</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/pricing" className="text-sm hover:text-primary">Bảng giá</Link>
            <Link href="/services/tax" className="text-sm hover:text-primary">Kế toán thuế</Link>
            <Link href="/services/einvoice" className="text-sm hover:text-primary">Hóa đơn điện tử</Link>
            <Link href="/services/bhxh" className="text-sm hover:text-primary">BHXH</Link>
            <Link href="/about" className="text-sm hover:text-primary">Về chúng tôi</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link href="/login">Đăng nhập</Link></Button>
            <Button asChild><Link href="/wizard/new">Bắt đầu miễn phí</Link></Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs">
              <Sparkles className="size-3" /> Stripe Atlas cho Việt Nam
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Đăng ký kinh doanh<br />trong <span className="text-primary">15 phút</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              AI tự sinh điều lệ công ty, chọn mã ngành VSIC chuẩn xác, chuẩn bị hồ sơ và nộp online qua Cổng Đăng ký Doanh nghiệp Quốc gia.
              Tập trung vào sản phẩm — phần pháp lý để chúng tôi lo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/wizard/new">Thành lập công ty <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">Xem bảng giá</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Trọn gói từ 800.000đ · Hoàn tiền 100% nếu không được cấp phép
            </p>
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="container py-16">
            <div className="grid gap-8 md:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="size-5" />
                    </div>
                    <CardTitle className="text-xl">{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold">Quy trình 6 bước</h2>
            <p className="mt-3 text-muted-foreground">Mỗi bước được AI hỗ trợ — bạn chỉ cần điền thông tin cơ bản.</p>
          </div>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-lg border p-5">
                <div className="font-display text-3xl font-bold text-muted-foreground/40">0{i + 1}</div>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t bg-muted/40">
          <div className="container py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-bold">Sau khi có giấy phép</h2>
              <p className="mt-3 text-muted-foreground">
                Khởi Doanh đồng hành cùng bạn các nghiệp vụ định kỳ — tất cả trong một dashboard.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
              {UPSELLS.map((u) => (
                <Card key={u.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{u.title}</CardTitle>
                    <CardDescription>{u.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-2xl font-bold">{u.price}</p>
                    <p className="text-sm text-muted-foreground">{u.unit}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-20 text-center">
          <h2 className="font-display text-4xl font-bold">Sẵn sàng khởi doanh?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Hơn 5.000 founder Việt đã thành lập công ty cùng Khởi Doanh AI.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link href="/wizard/new">Bắt đầu ngay <ArrowRight className="size-4" /></Link>
          </Button>
        </section>
      </main>

      <footer className="border-t">
        <div className="container py-10 text-sm text-muted-foreground">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="font-display font-bold text-foreground">Khởi Doanh AI</p>
              <p className="mt-2">Stripe Atlas cho Việt Nam.</p>
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">Sản phẩm</p>
              <ul className="space-y-1">
                <li><Link href="/wizard/new">Thành lập DN</Link></li>
                <li><Link href="/services/tax">Kế toán thuế</Link></li>
                <li><Link href="/services/einvoice">Hóa đơn điện tử</Link></li>
                <li><Link href="/services/bhxh">BHXH</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">Công ty</p>
              <ul className="space-y-1">
                <li><Link href="/about">Về chúng tôi</Link></li>
                <li><Link href="/pricing">Bảng giá</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-medium text-foreground">Pháp lý</p>
              <ul className="space-y-1">
                <li><Link href="/legal/terms">Điều khoản</Link></li>
                <li><Link href="/legal/privacy">Bảo mật</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6">© 2026 Khởi Doanh AI JSC</div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Clock,
    title: "15 phút thay vì 15 ngày",
    description: "Wizard 6 bước hỏi đúng những gì cần thiết. Phần còn lại AI tự sinh.",
  },
  {
    icon: Sparkles,
    title: "AI sinh điều lệ chuyên nghiệp",
    description: "Mỗi điều khoản đều dẫn chiếu Luật DN 2020 và các văn bản hiện hành.",
  },
  {
    icon: ShieldCheck,
    title: "Cập nhật pháp lý liên tục",
    description: "Mỗi khi luật thay đổi, hệ thống được bump version — bạn luôn dùng template mới nhất.",
  },
];

const STEPS = [
  { title: "Loại hình DN", description: "TNHH 1TV, 2TV, Cổ phần, hộ kinh doanh — chọn loại phù hợp." },
  { title: "Thông tin công ty", description: "Tên, vốn điều lệ, trụ sở. AI gợi ý tên hợp lệ." },
  { title: "Mã ngành", description: "Mô tả hoạt động bằng ngôn ngữ tự nhiên, AI chọn mã VSIC." },
  { title: "Thành viên", description: "Cổ đông / thành viên góp vốn, người đại diện PL." },
  { title: "Sinh điều lệ", description: "Claude soạn điều lệ đầy đủ, sẵn sàng in." },
  { title: "Review & nộp", description: "Bạn review, ký số, chúng tôi nộp lên Cổng DKKD." },
];

const UPSELLS = [
  { title: "Kế toán thuế", description: "Báo cáo thuế hàng quý, quyết toán năm.", price: "500k", unit: "/tháng" },
  { title: "Hóa đơn điện tử", description: "Đăng ký + quản lý HDDT kết nối CQT.", price: "200k", unit: "/tháng" },
  { title: "BHXH/BHYT/BHTN", description: "Đăng ký bảo hiểm cho người lao động.", price: "300k", unit: "/lao động/tháng" },
];
