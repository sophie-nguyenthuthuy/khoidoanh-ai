import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { formatDateVi } from "@/lib/utils";
import { listUserRegistrations } from "@/server/services/registration-service";

const STATUS_VARIANT = {
  DRAFT: "secondary",
  READY_FOR_REVIEW: "default",
  PAYMENT_PENDING: "warning",
  SUBMITTING: "default",
  SUBMITTED: "default",
  GRANTED: "success",
  REJECTED: "destructive",
  CANCELLED: "outline",
} as const;

const STATUS_LABEL = {
  DRAFT: "Bản nháp",
  READY_FOR_REVIEW: "Sẵn sàng review",
  PAYMENT_PENDING: "Chờ thanh toán",
  SUBMITTING: "Đang nộp",
  SUBMITTED: "Đã nộp",
  GRANTED: "Đã cấp phép",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã huỷ",
} as const;

export default async function DashboardPage() {
  const session = await requireAuth();
  const registrations = await listUserRegistrations(session.user.id);

  const granted = registrations.filter((r) => r.status === "GRANTED");
  const inProgress = registrations.filter((r) =>
    ["DRAFT", "READY_FOR_REVIEW", "PAYMENT_PENDING", "SUBMITTING", "SUBMITTED"].includes(r.status),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Chào, {session.user.name?.split(" ").pop() ?? "founder"} 👋</h1>
          <p className="mt-1 text-muted-foreground">Quản lý hồ sơ đăng ký và dịch vụ định kỳ</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/wizard/new"><Plus className="size-4" /> Hồ sơ mới</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Đang xử lý" value={inProgress.length} />
        <Stat label="Đã cấp phép" value={granted.length} />
        <Stat label="Tổng hồ sơ" value={registrations.length} />
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Hồ sơ đang xử lý</h2>
        {inProgress.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Chưa có hồ sơ nào. Bắt đầu hồ sơ đầu tiên ngay.</p>
              <Button asChild className="mt-4"><Link href="/wizard/new">Tạo hồ sơ</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {inProgress.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{r.referenceCode}</code>
                      <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    </div>
                    <p className="mt-1 font-medium">{r.proposedName ?? "(chưa có tên)"}</p>
                    <p className="text-xs text-muted-foreground">Cập nhật {formatDateVi(r.updatedAt)}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={`/wizard/new/entity-type?id=${r.id}`}>
                      Tiếp tục <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Dịch vụ định kỳ</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <UpsellCard title="Kế toán thuế" description="500k/tháng" href="/services/tax" />
          <UpsellCard title="Hóa đơn điện tử" description="200k/tháng" href="/services/einvoice" />
          <UpsellCard title="BHXH" description="300k/lao động/tháng" href="/services/bhxh" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-display text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function UpsellCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={href}>Tìm hiểu →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
