"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateCharter } from "@/lib/ai/charter-generator";
import { requireAuth } from "@/lib/auth";
import { getBusinessCodesByCodes } from "@/lib/business-codes/service";
import { logger } from "@/lib/logger";
import { aiRateLimit } from "@/lib/rate-limit";
import {
  companyInfoSchema,
  entityTypeSchema,
  fullRegistrationSchema,
  legalRepresentativeSchema,
  memberSchema,
} from "@/lib/validations/registration";
import {
  advanceStep,
  createRegistration,
  getRegistration,
  setRegistrationMembers,
  updateRegistration,
} from "@/server/services/registration-service";
import { z } from "zod";

export async function startRegistrationAction(formData: FormData) {
  const session = await requireAuth();
  const entityType = entityTypeSchema.parse(formData.get("entityType"));
  const reg = await createRegistration(session.user.id, entityType);
  redirect(`/wizard/new/company-info?id=${reg.id}`);
}

export async function saveCompanyInfoAction(input: {
  id: string;
  data: z.infer<typeof companyInfoSchema>;
}) {
  const session = await requireAuth();
  const data = companyInfoSchema.parse(input.data);
  await updateRegistration(input.id, session.user.id, {
    proposedName: data.proposedName,
    proposedNameEn: data.proposedNameEn,
    proposedNameAbbr: data.proposedNameAbbr,
    charterCapitalVnd: data.charterCapitalVnd,
    headquartersAddress: data.headquartersAddress,
  });
  await advanceStep(input.id, session.user.id, 3);
  revalidatePath(`/wizard/new`);
  redirect(`/wizard/new/business-codes?id=${input.id}`);
}

export async function saveBusinessCodesAction(input: {
  id: string;
  primary: string;
  codes: Array<{ code: string; detail?: string; isPrimary: boolean }>;
}) {
  const session = await requireAuth();
  await updateRegistration(input.id, session.user.id, {
    primaryBusinessCode: input.primary,
    businessCodes: input.codes,
  });
  await advanceStep(input.id, session.user.id, 4);
  redirect(`/wizard/new/founders?id=${input.id}`);
}

export async function saveFoundersAction(input: {
  id: string;
  legalRepresentative: z.infer<typeof legalRepresentativeSchema>;
  members?: Array<z.infer<typeof memberSchema>>;
}) {
  const session = await requireAuth();
  const lr = legalRepresentativeSchema.parse(input.legalRepresentative);
  const members = input.members?.map((m) => memberSchema.parse(m)) ?? [];

  await updateRegistration(input.id, session.user.id, { legalRepresentative: lr });

  if (members.length > 0) {
    await setRegistrationMembers(
      input.id,
      session.user.id,
      members.map((m) => ({
        role: "MEMBER",
        isOrganization: m.isOrganization,
        fullName: m.fullName,
        idNumber: m.idNumber,
        idType: m.idType,
        nationality: m.nationality,
        address: m.address,
        phone: m.phone,
        email: m.email,
        contributionVnd: m.contributionVnd,
        contributionPct: m.contributionPct,
        shareCount: m.shareCount,
        shareType: m.shareType,
      })),
    );
  }

  await advanceStep(input.id, session.user.id, 5);
  redirect(`/wizard/new/charter?id=${input.id}`);
}

export async function generateCharterAction(id: string) {
  const session = await requireAuth();
  const { success } = await aiRateLimit.limit(`charter:${session.user.id}`);
  if (!success) throw new Error("Đã đạt giới hạn 5 lần/phút. Vui lòng đợi.");

  const reg = await getRegistration(id, session.user.id);
  if (!reg) throw new Error("Không tìm thấy hồ sơ");

  const fullData = fullRegistrationSchema.parse({
    entityType: reg.entityType,
    proposedName: reg.proposedName,
    proposedNameEn: reg.proposedNameEn,
    proposedNameAbbr: reg.proposedNameAbbr,
    charterCapitalVnd: reg.charterCapitalVnd,
    headquartersAddress: reg.headquartersAddress,
    primaryBusinessCode: reg.primaryBusinessCode,
    businessCodes: reg.businessCodes,
    legalRepresentative: reg.legalRepresentative,
  });

  const codes = await getBusinessCodesByCodes(fullData.businessCodes.map((c) => c.code));
  const codeMap = new Map(codes.map((c) => [c.code, c]));

  const primary = codeMap.get(fullData.primaryBusinessCode);
  if (!primary) throw new Error("Mã ngành chính không hợp lệ");

  const headquartersStr = [
    fullData.headquartersAddress.streetAddress,
    fullData.headquartersAddress.ward,
    fullData.headquartersAddress.district,
    fullData.headquartersAddress.province,
  ].join(", ");

  try {
    const { charter, promptVersion, model } = await generateCharter(
      {
        entityType: fullData.entityType,
        companyName: fullData.proposedName,
        companyNameEn: fullData.proposedNameEn,
        companyNameAbbr: fullData.proposedNameAbbr,
        charterCapitalVnd: fullData.charterCapitalVnd,
        headquarters: headquartersStr,
        primaryBusinessCode: { code: primary.code, name: primary.name },
        businessCodes: fullData.businessCodes.map((c) => ({
          code: c.code,
          name: codeMap.get(c.code)?.name ?? "",
          detail: c.detail,
        })),
        legalRepresentative: {
          fullName: fullData.legalRepresentative.fullName,
          title: fullData.legalRepresentative.title,
          idNumber: fullData.legalRepresentative.idNumber,
          idType: fullData.legalRepresentative.idType,
          address: fullData.legalRepresentative.permanentAddress,
        },
      },
      { userId: session.user.id, registrationId: id },
    );

    await updateRegistration(id, session.user.id, {
      charterContent: JSON.stringify(charter),
      charterDraftedAt: new Date(),
      charterModel: model,
      charterPromptVersion: promptVersion,
    });

    return { ok: true };
  } catch (err) {
    logger.error({ err, registrationId: id }, "Charter generation failed");
    throw err;
  }
}

export async function submitForReviewAction(id: string) {
  const session = await requireAuth();
  await updateRegistration(id, session.user.id, {
    status: "READY_FOR_REVIEW",
    currentStep: 6,
  });
  redirect(`/wizard/new/checkout?id=${id}`);
}
