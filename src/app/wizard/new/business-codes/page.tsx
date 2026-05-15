import { notFound, redirect } from "next/navigation";

import { BusinessCodesForm } from "@/components/wizard/business-codes-form";
import { requireAuth } from "@/lib/auth";
import { getRegistration } from "@/server/services/registration-service";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BusinessCodesPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await searchParams;
  if (!id) redirect("/wizard/new/entity-type");

  const reg = await getRegistration(id, session.user.id);
  if (!reg) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Mã ngành kinh doanh</h1>
        <p className="mt-2 text-muted-foreground">
          Mô tả hoạt động kinh doanh bằng ngôn ngữ tự nhiên. AI sẽ chọn mã ngành VSIC phù hợp nhất.
        </p>
      </div>
      <BusinessCodesForm
        registrationId={reg.id}
        entityType={reg.entityType}
        initialPrimary={reg.primaryBusinessCode ?? undefined}
        initialCodes={reg.businessCodes ?? []}
      />
    </div>
  );
}
