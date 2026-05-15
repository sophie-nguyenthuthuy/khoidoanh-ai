"use client";

import { Check } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const STEPS = [
  { slug: "entity-type", label: "Loại hình" },
  { slug: "company-info", label: "Thông tin" },
  { slug: "business-codes", label: "Mã ngành" },
  { slug: "founders", label: "Thành viên" },
  { slug: "charter", label: "Điều lệ" },
  { slug: "review", label: "Review" },
];

export function WizardStepper() {
  const path = usePathname();
  const current = STEPS.findIndex((s) => path.includes(s.slug));
  const idx = current === -1 ? 0 : current;

  return (
    <ol className="flex w-full items-center justify-between">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s.slug} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-background text-primary",
                  !done && !active && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </div>
              <span className={cn("text-xs", active ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-px flex-1", done ? "bg-primary" : "bg-muted-foreground/20")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
