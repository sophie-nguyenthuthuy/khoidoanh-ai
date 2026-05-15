import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { formatVnd } from "@/lib/utils";
import { getRegistrationWithMembers } from "@/server/services/registration-service";
import { submitForReviewAction } from "@/server/actions/registration-actions";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ReviewPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await searchParams;
  if (!id) redirect("/wizard/new/entity-type");

  const reg = await getRegistrationWithMembers(id, session.user.id);
  if (!reg) notFound();

  async function submit() {
    "use server";
    await submitForReviewAction(id!);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Xem lại hồ sơ</h1>
        <p className="mt-2 text-muted-foreground">
          Vui lòng kiểm tra kỹ. Sau khi thanh toán, đội ngũ Khởi Doanh sẽ nộp hồ sơ trong vòng 1 ngày làm việc.
        </p>
      </div>

      <div className="space-y-4">
        <Section title="Loại hình & tên">
          <Row label="Loại hình" value={reg.entityType} />
          <Row label="Tên đầy đủ" value={reg.proposedName ?? "—"} />
          <Row label="Tên tiếng Anh" value={reg.proposedNameEn ?? "—"} />
          <Row label="Tên viết tắt" value={reg.proposedNameAbbr ?? "—"} />
        </Section>

        <Section title="Tài chính & trụ sở">
          <Row label="Vốn điều lệ" value={reg.charterCapitalVnd ? formatVnd(reg.charterCapitalVnd) : "—"} />
          <Row
            label="Trụ sở"
            value={
              reg.headquartersAddress
                ? `${reg.headquartersAddress.streetAddress}, ${reg.headquartersAddress.ward}, ${reg.headquartersAddress.district}, ${reg.headquartersAddress.province}`
                : "—"
            }
          />
        </Section>

        <Section title="Mã ngành">
          <Row label="Ngành chính" value={reg.primaryBusinessCode ?? "—"} />
          <Row label="Tổng số mã" value={String(reg.businessCodes?.length ?? 0)} />
        </Section>

        <Section title="Người đại diện">
          <Row label="Họ tên" value={reg.legalRepresentative?.fullName ?? "—"} />
          <Row label="Chức danh" value={reg.legalRepresentative?.title ?? "—"} />
        </Section>

        {reg.members.length > 0 && (
          <Section title={`Thành viên (${reg.members.length})`}>
            {reg.members.map((m) => (
              <Row
                key={m.id}
                label={m.fullName}
                value={`${formatVnd(m.contributionVnd ?? 0)} — ${((m.contributionPct ?? 0) / 100).toFixed(2)}%`}
              />
            ))}
          </Section>
        )}

        <Section title="Điều lệ">
          <Row label="Trạng thái" value={reg.charterContent ? "Đã soạn" : "Chưa soạn"} />
          {reg.charterDraftedAt && <Row label="Thời gian" value={new Date(reg.charterDraftedAt).toLocaleString("vi-VN")} />}
        </Section>
      </div>

      <form action={submit} className="mt-6 flex justify-end">
        <Button type="submit" size="lg">Xác nhận và thanh toán</Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
