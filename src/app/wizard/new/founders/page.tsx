import { notFound, redirect } from "next/navigation";

import { FoundersForm } from "@/components/wizard/founders-form";
import { requireAuth } from "@/lib/auth";
import { getRegistrationWithMembers } from "@/server/services/registration-service";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function FoundersPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await searchParams;
  if (!id) redirect("/wizard/new/entity-type");

  const reg = await getRegistrationWithMembers(id, session.user.id);
  if (!reg) notFound();

  const needsMembers = reg.entityType === "LLC_MULTI" || reg.entityType === "JSC";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Người đại diện & thành viên</h1>
        <p className="mt-2 text-muted-foreground">
          Thông tin người đại diện theo pháp luật{needsMembers ? " và các thành viên góp vốn" : ""}.
        </p>
      </div>
      <FoundersForm
        registrationId={reg.id}
        entityType={reg.entityType}
        needsMembers={needsMembers}
        defaultLegalRep={reg.legalRepresentative ?? undefined}
        defaultMembers={reg.members}
      />
    </div>
  );
}
