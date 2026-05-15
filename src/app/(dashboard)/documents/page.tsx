import { desc, eq, inArray } from "drizzle-orm";
import { Download } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { db, documents, registrations } from "@/lib/db";
import { formatDateVi } from "@/lib/utils";

export default async function DocumentsPage() {
  const session = await requireAuth();

  const userRegs = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.userId, session.user.id));
  const regIds = userRegs.map((r) => r.id);

  const rows = regIds.length
    ? await db
        .select()
        .from(documents)
        .where(inArray(documents.registrationId, regIds))
        .orderBy(desc(documents.createdAt))
    : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Tài liệu</h1>
      {rows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có tài liệu nào</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{d.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.type} · {(d.sizeBytes / 1024).toFixed(0)} KB · {formatDateVi(d.createdAt)}
                  </p>
                </div>
                <Link href={d.storageUrl} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  <Download className="size-4" /> Tải
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
