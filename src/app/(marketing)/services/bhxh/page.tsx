import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BhxhServicePage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">BHXH / BHYT / BHTN cho người lao động</h1>
      <p className="mt-3 text-muted-foreground">
        Bắt buộc với mọi DN có người lao động ký HĐLĐ từ 1 tháng trở lên. Khởi Doanh xử lý toàn bộ thủ tục với cơ quan BHXH.
      </p>

      <Card className="mt-8">
        <CardHeader><CardTitle>300.000đ/lao động/tháng</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Đăng ký BHXH lần đầu cho DN</li>
            <li>• Lập danh sách lao động tham gia BH</li>
            <li>• Báo tăng/giảm lao động hàng tháng</li>
            <li>• Tính & nộp BHXH/BHYT/BHTN/BHTNLĐ-BNN</li>
            <li>• Giải quyết chế độ ốm đau, thai sản, hưu trí</li>
            <li>• Hỗ trợ làm sổ BHXH điện tử</li>
          </ul>
          <Button asChild className="mt-6"><Link href="/wizard/new">Đăng ký dịch vụ</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
