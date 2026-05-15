import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { formatDateVi } from "@/lib/utils";
import { listUserRegistrations } from "@/server/services/registration-service";

export default async function RegistrationsPage() {
  const session = await requireAuth();
  const rows = await listUserRegistrations(session.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Hồ sơ đăng ký</h1>
        <Button asChild><Link href="/wizard/new">+ Hồ sơ mới</Link></Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Chưa có hồ sơ nào.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link key={r.id} href={`/wizard/new/review?id=${r.id}`}>
              <Card className="hover:border-primary">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{r.referenceCode}</code>
                      <Badge>{r.status}</Badge>
                    </div>
                    <p className="mt-1 font-medium">{r.proposedName ?? "(chưa có tên)"}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.entityType} · {formatDateVi(r.createdAt)}
                    </p>
                  </div>
                  {r.licenseNumber && (
                    <Badge variant="success">MST: {r.taxCode ?? r.licenseNumber}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
