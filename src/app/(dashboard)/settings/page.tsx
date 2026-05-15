import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAuth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Cài đặt</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
          <CardDescription>Email & profile cơ bản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={session.user.email ?? ""} readOnly />
          </div>
          <div>
            <Label>Họ tên</Label>
            <Input defaultValue={session.user.name ?? ""} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
