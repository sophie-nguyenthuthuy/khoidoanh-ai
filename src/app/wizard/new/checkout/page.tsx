import { notFound, redirect } from "next/navigation";

import { CheckoutButton } from "@/components/wizard/checkout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { PRODUCTS, type ProductCode } from "@/lib/stripe/products";
import { formatVnd } from "@/lib/utils";
import { getRegistration } from "@/server/services/registration-service";

const PRODUCT_BY_ENTITY: Record<string, ProductCode> = {
  LLC_SINGLE: "REGISTRATION_LLC",
  LLC_MULTI: "REGISTRATION_LLC",
  JSC: "REGISTRATION_JSC",
  HOUSEHOLD: "REGISTRATION_HOUSEHOLD",
  PARTNERSHIP: "REGISTRATION_LLC",
  PRIVATE: "REGISTRATION_LLC",
};

interface PageProps {
  searchParams: Promise<{ id?: string; cancelled?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { id, cancelled } = await searchParams;
  if (!id) redirect("/wizard/new/entity-type");

  const reg = await getRegistration(id, session.user.id);
  if (!reg) notFound();

  const productCode = PRODUCT_BY_ENTITY[reg.entityType] ?? "REGISTRATION_LLC";
  const product = PRODUCTS[productCode];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Thanh toán</h1>
        <p className="mt-2 text-muted-foreground">
          Hoàn tất thanh toán để Khởi Doanh nộp hồ sơ lên Cổng DKKD trong ngày.
        </p>
      </div>

      {cancelled && (
        <div className="mb-4 rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
          Bạn đã huỷ thanh toán. Có thể thử lại bất cứ lúc nào.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">{product.label}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold">{formatVnd(product.priceVnd)}</p>
            <span className="text-sm text-muted-foreground">trọn gói</span>
          </div>
          <ul className="space-y-1 text-sm">
            <li>✓ Sinh điều lệ bằng AI (đã hoàn thành)</li>
            <li>✓ Chuẩn bị toàn bộ hồ sơ</li>
            <li>✓ Nộp lên Cổng DKKD Quốc gia</li>
            <li>✓ Đăng ký thuế & con dấu</li>
            <li>✓ Hoàn tiền 100% nếu không được cấp phép</li>
          </ul>
          <CheckoutButton registrationId={id} productCode={productCode} />
        </CardContent>
      </Card>
    </div>
  );
}
