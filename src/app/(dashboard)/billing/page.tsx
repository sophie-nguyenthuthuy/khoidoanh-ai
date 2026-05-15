import { desc, eq } from "drizzle-orm";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { db, payments, subscriptions } from "@/lib/db";
import { formatDateVi, formatVnd } from "@/lib/utils";

export default async function BillingPage() {
  const session = await requireAuth();

  const [paymentRows, subRows] = await Promise.all([
    db
      .select()
      .from(payments)
      .where(eq(payments.userId, session.user.id))
      .orderBy(desc(payments.createdAt))
      .limit(50),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .orderBy(desc(subscriptions.createdAt)),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Thanh toán</h1>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Đăng ký định kỳ</h2>
        {subRows.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Chưa có dịch vụ định kỳ</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {subRows.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{s.plan}</CardTitle>
                    <Badge variant={s.status === "ACTIVE" ? "success" : "secondary"}>{s.status}</Badge>
                  </div>
                  <CardDescription>
                    Chu kỳ hiện tại: {s.currentPeriodStart ? formatDateVi(s.currentPeriodStart) : "—"} →{" "}
                    {s.currentPeriodEnd ? formatDateVi(s.currentPeriodEnd) : "—"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">Lịch sử thanh toán</h2>
        {paymentRows.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Chưa có giao dịch</CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-2 text-left">Thời gian</th>
                    <th className="px-4 py-2 text-left">Mô tả</th>
                    <th className="px-4 py-2 text-right">Số tiền</th>
                    <th className="px-4 py-2 text-left">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{formatDateVi(p.createdAt)}</td>
                      <td className="px-4 py-2">{p.description ?? "—"}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatVnd(p.amountVnd)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={p.status === "succeeded" ? "success" : "secondary"}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
