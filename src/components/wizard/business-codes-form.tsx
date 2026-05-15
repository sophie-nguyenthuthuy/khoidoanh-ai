"use client";

import { AlertTriangle, Loader2, Sparkles, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveBusinessCodesAction } from "@/server/actions/registration-actions";

interface Recommendation {
  code: string;
  name: string;
  detail: string;
  isPrimary: boolean;
  confidence: number;
  warnings: string[];
}

interface Warning {
  severity: "info" | "warning" | "error";
  message: string;
}

interface Props {
  registrationId: string;
  entityType: string;
  initialPrimary?: string;
  initialCodes: Array<{ code: string; detail?: string; isPrimary: boolean }>;
}

export function BusinessCodesForm({ registrationId, entityType, initialCodes, initialPrimary }: Props) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [selected, setSelected] = useState<Recommendation[]>(
    initialCodes.map((c) => ({
      code: c.code,
      name: "",
      detail: c.detail ?? "",
      isPrimary: c.isPrimary,
      confidence: 1,
      warnings: [],
    })),
  );
  const [primary, setPrimary] = useState<string | undefined>(initialPrimary);
  const [pending, startTransition] = useTransition();

  async function recommend() {
    if (description.trim().length < 20) {
      toast.error("Mô tả tối thiểu 20 ký tự");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/business-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, entityType, registrationId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecs(data.recommendations);
      setWarnings(data.warnings ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gọi AI thất bại");
    } finally {
      setLoading(false);
    }
  }

  function toggle(r: Recommendation) {
    setSelected((prev) =>
      prev.find((s) => s.code === r.code)
        ? prev.filter((s) => s.code !== r.code)
        : [...prev, r],
    );
    if (r.isPrimary && !primary) setPrimary(r.code);
  }

  function remove(code: string) {
    setSelected((prev) => prev.filter((s) => s.code !== code));
    if (primary === code) setPrimary(selected.find((s) => s.code !== code)?.code);
  }

  function save() {
    if (selected.length === 0) return toast.error("Chọn ít nhất 1 mã ngành");
    if (!primary) return toast.error("Chọn ngành chính");
    startTransition(async () => {
      try {
        await saveBusinessCodesAction({
          id: registrationId,
          primary,
          codes: selected.map((s) => ({
            code: s.code,
            detail: s.detail,
            isPrimary: s.code === primary,
          })),
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lưu thất bại");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mô tả hoạt động kinh doanh</CardTitle>
          <CardDescription>
            Càng cụ thể càng tốt. AI sẽ đề xuất 3-7 mã ngành phù hợp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={5}
            placeholder="Ví dụ: Công ty làm SaaS B2B cho ngành F&B. Cung cấp phần mềm quản lý quán cafe, nhà hàng. Tính phí thuê bao hàng tháng…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={recommend} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "AI đang phân tích…" : "Đề xuất mã ngành"}
          </Button>
        </CardContent>
      </Card>

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex gap-2 rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-sm"
            >
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <p>{w.message}</p>
            </div>
          ))}
        </div>
      )}

      {recs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Đề xuất từ AI</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recs.map((r) => {
              const isSelected = selected.some((s) => s.code === r.code);
              return (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => toggle(r)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-bold">{r.code}</code>
                    <span className="font-medium">{r.name}</span>
                    {r.isPrimary && <Badge variant="default">Đề xuất chính</Badge>}
                    {r.warnings.length > 0 && <Badge variant="warning">Có điều kiện</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {selected.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đã chọn ({selected.length})</CardTitle>
            <CardDescription>Chọn 1 mã làm ngành chính (primary).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {selected.map((s) => (
              <div key={s.code} className="flex items-center gap-3 rounded-md border p-3">
                <input
                  type="radio"
                  name="primary"
                  checked={primary === s.code}
                  onChange={() => setPrimary(s.code)}
                />
                <code className="font-mono font-bold">{s.code}</code>
                <span className="flex-1 truncate">{s.name || s.detail}</span>
                <button type="button" onClick={() => remove(s.code)}>
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending || selected.length === 0}>
          {pending ? "Đang lưu…" : "Tiếp tục → Thành viên"}
        </Button>
      </div>
    </div>
  );
}
