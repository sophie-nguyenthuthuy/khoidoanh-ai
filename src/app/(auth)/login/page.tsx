import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn } from "@/lib/auth";

interface PageProps {
  searchParams: Promise<{ from?: string; verify?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { from, verify } = await searchParams;

  async function loginWithEmail(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    await signIn("resend", { email, redirectTo: from ?? "/dashboard" });
  }

  async function loginWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: from ?? "/dashboard" });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Quản lý hồ sơ đăng ký và các dịch vụ định kỳ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verify === "1" && (
            <div className="rounded-md border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm">
              Vui lòng kiểm tra email để hoàn tất đăng nhập.
            </div>
          )}

          <form action={loginWithGoogle}>
            <Button type="submit" variant="outline" className="w-full">
              Tiếp tục với Google
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <Separator className="flex-1" />
          </div>

          <form action={loginWithEmail} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required />
            </div>
            <Button type="submit" className="w-full">Gửi link đăng nhập</Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Chưa có tài khoản? Hệ thống tự động tạo khi bạn đăng nhập lần đầu.
          </p>
          <p className="text-center text-xs">
            <Link href="/" className="text-muted-foreground hover:text-foreground">← Quay lại trang chủ</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
