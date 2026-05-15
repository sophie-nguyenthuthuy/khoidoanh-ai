"use client";

import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  registrationId: string;
  hasCharter: boolean;
  existingCharter: string | null;
  draftedAt: Date | null;
  model: string | null;
  promptVersion: string | null;
}

interface ParsedCharter {
  title: string;
  preamble: string;
  chapters: Array<{ title: string; articles: Array<{ number: number; title: string; content: string }> }>;
  signature_block: string;
  legal_references: string[];
}

export function CharterGenerator({
  registrationId,
  hasCharter: initialHasCharter,
  existingCharter,
  draftedAt: initialDraftedAt,
  model: initialModel,
  promptVersion: initialPromptVersion,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [charter, setCharter] = useState<ParsedCharter | null>(() => {
    if (!existingCharter) return null;
    try {
      return JSON.parse(existingCharter) as ParsedCharter;
    } catch {
      return null;
    }
  });
  const [meta, setMeta] = useState({
    draftedAt: initialDraftedAt,
    model: initialModel,
    promptVersion: initialPromptVersion,
  });
  const hasCharter = charter !== null || initialHasCharter;

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/charter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "AI thất bại");
      }
      const refreshed = await fetch(`/api/registrations/${registrationId}`).then((r) => r.json());
      if (refreshed.charterContent) {
        setCharter(JSON.parse(refreshed.charterContent));
        setMeta({
          draftedAt: refreshed.charterDraftedAt,
          model: refreshed.charterModel,
          promptVersion: refreshed.charterPromptVersion,
        });
      }
      toast.success("Điều lệ đã được sinh thành công");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!hasCharter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sẵn sàng sinh điều lệ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Quá trình mất khoảng 30-60 giây. Điều lệ sẽ tuân thủ Luật DN 2020, NĐ 01/2021 và TT 01/2021.
            </p>
            <Button onClick={generate} disabled={loading} size="lg" className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "AI đang soạn điều lệ…" : "Sinh điều lệ bằng AI"}
            </Button>
          </CardContent>
        </Card>
      )}

      {charter && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{charter.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{meta.model}</Badge>
                  <Badge variant="outline">{meta.promptVersion}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 font-serif">
              <p className="whitespace-pre-line text-sm leading-relaxed">{charter.preamble}</p>
              {charter.chapters.map((ch, ci) => (
                <div key={ci}>
                  <h3 className="font-display text-base font-bold uppercase">{ch.title}</h3>
                  <div className="mt-2 space-y-3">
                    {ch.articles.map((a) => (
                      <div key={a.number}>
                        <p className="font-semibold">
                          Điều {a.number}. {a.title}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{a.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="whitespace-pre-line text-sm">{charter.signature_block}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Cơ sở pháp lý</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {charter.legal_references.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={generate} disabled={loading}>
              {loading ? "Đang sinh lại…" : "Sinh lại với AI"}
            </Button>
            <Button asChild>
              <Link href={`/wizard/new/review?id=${registrationId}`}>Tiếp tục → Review</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
