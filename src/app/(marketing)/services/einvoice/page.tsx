import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EinvoiceServicePage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">Hóa đơn điện tử (HDDT)</h1>
      <p className="mt-3 text-muted-foreground">
        Bắt buộc theo NĐ 123/2020/NĐ-CP và TT 78/2021/TT-BTC. Khởi Doanh tích hợp sẵn với CQT, không cần lo phần kỹ thuật.
      </p>

      <Card className="mt-8">
        <CardHeader><CardTitle>Setup 1.000.000đ + 200.000đ/tháng</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Đăng ký phát hành HDDT với CQT</li>
            <li>• Thiết kế mẫu hoá đơn theo thương hiệu</li>
            <li>• Phát hành & lưu trữ điện tử 10 năm</li>
            <li>• Kết nối API với phần mềm kế toán/POS của bạn</li>
            <li>• Báo cáo tình hình sử dụng HDDT định kỳ</li>
            <li>• Không giới hạn số lượng hoá đơn</li>
          </ul>
          <Button asChild className="mt-6"><Link href="/wizard/new">Đăng ký dịch vụ</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
