import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import React from "react";

import { db, documents, registrations } from "@/lib/db";

import { CharterPdf } from "./charter-pdf";

export async function renderCharterPdfAndStore(registrationId: string) {
  const [reg] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);
  if (!reg) throw new Error("Registration not found");
  if (!reg.charterContent) throw new Error("Charter not generated");

  const charter = JSON.parse(reg.charterContent);

  // `@react-pdf/renderer`'s `renderToBuffer` signature expects a Document
  // ReactElement, but the CharterPdf component returns a `Document` at
  // runtime — the structural-type mismatch is from `@react-pdf/types` being
  // stricter than the runtime contract. Cast to satisfy the compiler.
  const charterElement = React.createElement(CharterPdf, {
    charter,
    promptVersion: reg.charterPromptVersion ?? "unknown",
    generatedAt: reg.charterDraftedAt ?? new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
  const buffer = await renderToBuffer(charterElement);

  const checksum = createHash("sha256").update(buffer).digest("hex");
  const fileName = `dieu-le-${reg.referenceCode}.pdf`;

  const { url } = await put(`charters/${registrationId}/${fileName}`, buffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });

  await db
    .insert(documents)
    .values({
      registrationId,
      type: "CHARTER",
      fileName,
      mimeType: "application/pdf",
      sizeBytes: buffer.length,
      storageUrl: url,
      checksum,
      generatedBy: "ai",
      metadata: { promptVersion: reg.charterPromptVersion, model: reg.charterModel },
    })
    .onConflictDoNothing();

  return { url, fileName, sizeBytes: buffer.length };
}
