import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUCTS } from "@/lib/stripe/products";
import { formatVnd } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">Bảng giá minh bạch</h1>
        <p className="mt-3 text-muted-foreground">
          Trả 1 lần để có giấy phép. Sau đó dùng các dịch vụ định kỳ theo nhu cầu — huỷ bất cứ lúc nào.
        </p>
      </div>

      <h2 className="mb-4 mt-12 font-display text-2xl font-bold">Đăng ký kinh doanh (trả 1 lần)</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[PRODUCTS.REGISTRATION_HOUSEHOLD, PRODUCTS.REGISTRATION_LLC, PRODUCTS.REGISTRATION_JSC].map((p) => (
          <Card key={p.code}>
            <CardHeader>
              <CardTitle className="text-lg">{p.label}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-display text-3xl font-bold">{formatVnd(p.priceVnd)}</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><Check className="size-4 text-emerald-500" /> AI sinh điều lệ</li>
                <li className="flex gap-2"><Check className="size-4 text-emerald-500" /> Chuẩn bị hồ sơ đầy đủ</li>
                <li className="flex gap-2"><Check className="size-4 text-emerald-500" /> Nộp Cổng DKKD</li>
                <li className="flex gap-2"><Check className="size-4 text-emerald-500" /> Đăng ký thuế + con dấu</li>
              </ul>
              <Button asChild className="w-full"><Link href="/wizard/new">Bắt đầu</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 mt-12 font-display text-2xl font-bold">Dịch vụ định kỳ</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[PRODUCTS.TAX_BASIC, PRODUCTS.TAX_PRO, PRODUCTS.EINVOICE, PRODUCTS.BHXH].map((p) => (
          <Card key={p.code}>
            <CardHeader>
              <CardTitle className="text-base">{p.label}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold">{formatVnd(p.priceVnd)}</p>
              <p className="text-sm text-muted-foreground">
                /tháng{"perUnit" in p && p.perUnit ? `/${p.perUnit}` : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-lg border bg-muted/40 p-6 text-center">
        <p className="text-sm">
          Cần báo giá doanh nghiệp lớn? <Link href="/about" className="font-medium underline">Liên hệ chúng tôi</Link>
        </p>
      </div>
    </div>
  );
}
