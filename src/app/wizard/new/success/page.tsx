import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  await searchParams;
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
      <h1 className="mt-4 font-display text-3xl font-bold">Thanh toán thành công!</h1>
      <p className="mt-2 text-muted-foreground">
        Khởi Doanh sẽ nộp hồ sơ trong vòng 1 ngày làm việc và gửi email cập nhật trạng thái.
      </p>

      <Card className="mt-6 text-left">
        <CardHeader><CardTitle className="text-base">Bước tiếp theo</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Kiểm tra email xác nhận thanh toán</p>
          <p>• Theo dõi tiến độ trong Dashboard</p>
          <p>• Đăng ký các dịch vụ sau cấp phép: kế toán, hoá đơn, BHXH</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-center gap-3">
        <Button asChild><Link href="/dashboard">Đi tới Dashboard</Link></Button>
        <Button asChild variant="outline"><Link href="/services/tax">Kế toán thuế</Link></Button>
      </div>
    </div>
  );
}
