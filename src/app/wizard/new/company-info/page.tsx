import { notFound, redirect } from "next/navigation";

import { CompanyInfoForm } from "@/components/wizard/company-info-form";
import { requireAuth } from "@/lib/auth";
import { PROVINCES } from "@/config/provinces";
import { getRegistration } from "@/server/services/registration-service";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function CompanyInfoPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await searchParams;
  if (!id) redirect("/wizard/new/entity-type");

  const reg = await getRegistration(id, session.user.id);
  if (!reg) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Thông tin công ty</h1>
        <p className="mt-2 text-muted-foreground">
          Tên dự kiến, vốn điều lệ, và trụ sở chính. AI có thể gợi ý tên hợp lệ nếu bạn cần.
        </p>
      </div>
      <CompanyInfoForm
        registrationId={reg.id}
        entityType={reg.entityType}
        defaultValues={{
          proposedName: reg.proposedName ?? "",
          proposedNameEn: reg.proposedNameEn ?? "",
          proposedNameAbbr: reg.proposedNameAbbr ?? "",
          charterCapitalVnd: reg.charterCapitalVnd ?? 0,
          headquartersAddress: reg.headquartersAddress ?? {
            streetAddress: "",
            ward: "",
            district: "",
            province: "",
            provinceCode: "",
          },
        }}
        provinces={PROVINCES}
      />
    </div>
  );
}
