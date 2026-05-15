"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-3xl font-bold">Có lỗi xảy ra</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Hệ thống gặp sự cố tạm thời. Vui lòng thử lại hoặc liên hệ support.
      </p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
