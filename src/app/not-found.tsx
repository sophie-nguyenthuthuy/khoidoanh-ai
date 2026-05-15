import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-6xl font-bold">404</p>
      <p className="text-muted-foreground">Không tìm thấy trang bạn yêu cầu.</p>
      <Button asChild><Link href="/">Về trang chủ</Link></Button>
    </div>
  );
}
