import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaxServicePage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold">Kế toán & thuế trọn gói</h1>
        <p className="mt-3 text-muted-foreground">
          Từ tờ khai thuế GTGT hàng quý đến quyết toán năm. Đội ngũ kế toán viên có chứng chỉ hành nghề, kết hợp AI để giảm chi phí và sai sót.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Cơ bản — 500.000đ/tháng</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Tờ khai thuế GTGT hàng quý</li>
                <li>• Tờ khai thuế TNCN hàng quý</li>
                <li>• Tờ khai TNDN tạm tính</li>
                <li>• Báo cáo tài chính cuối năm</li>
                <li>• Quyết toán thuế năm</li>
                <li>• Phù hợp DN doanh thu &lt; 5 tỷ/năm</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Pro — 3.000.000đ/tháng</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Toàn bộ gói cơ bản</li>
                <li>• Kế toán đầy đủ (chứng từ, sổ sách)</li>
                <li>• Đối soát hàng tháng</li>
                <li>• Hỗ trợ thanh kiểm tra thuế</li>
                <li>• Tư vấn thuế chuyên sâu</li>
                <li>• Phù hợp DN doanh thu &gt; 5 tỷ/năm</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-3">
          <Button asChild><Link href="/wizard/new">Đăng ký dịch vụ</Link></Button>
          <Button asChild variant="outline"><Link href="/pricing">Xem tất cả bảng giá</Link></Button>
        </div>
      </div>
    </div>
  );
}
