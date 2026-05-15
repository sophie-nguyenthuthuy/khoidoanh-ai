"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProductCode } from "@/lib/stripe/products";

export function CheckoutButton({
  registrationId,
  productCode,
}: {
  registrationId: string;
  productCode: ProductCode;
}) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, productCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Không tạo được checkout");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi không xác định");
      setLoading(false);
    }
  }

  return (
    <Button onClick={go} size="lg" className="w-full gap-2" disabled={loading}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? "Đang chuyển hướng…" : "Thanh toán qua Stripe"}
    </Button>
  );
}
