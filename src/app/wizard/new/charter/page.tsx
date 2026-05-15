import { notFound, redirect } from "next/navigation";

import { CharterGenerator } from "@/components/wizard/charter-generator";
import { requireAuth } from "@/lib/auth";
import { getRegistration } from "@/server/services/registration-service";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function CharterPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await searchParams;
  if (!id) redirect("/wizard/new/entity-type");

  const reg = await getRegistration(id, session.user.id);
  if (!reg) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">AI sinh điều lệ công ty</h1>
        <p className="mt-2 text-muted-foreground">
          Claude sẽ soạn điều lệ đầy đủ dựa trên thông tin bạn đã nhập. Mỗi điều khoản dẫn chiếu Luật Doanh nghiệp 2020.
        </p>
      </div>
      <CharterGenerator
        registrationId={reg.id}
        hasCharter={Boolean(reg.charterContent)}
        existingCharter={reg.charterContent}
        draftedAt={reg.charterDraftedAt}
        model={reg.charterModel}
        promptVersion={reg.charterPromptVersion}
      />
    </div>
  );
}
