import Link from "next/link";

import { WizardStepper } from "@/components/wizard/wizard-stepper";

export const dynamic = "force-dynamic";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-display font-bold">
            Khởi Doanh<span className="text-primary">AI</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Thoát wizard
          </Link>
        </div>
      </header>
      <div className="container max-w-3xl py-8">
        <WizardStepper />
        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}
