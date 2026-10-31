import type { Metadata } from "next";
import { Suspense } from "react";
import { CaseIndex } from "@/components/case-index";
import { SplitWords } from "@/components/reveal";
import { stats } from "@/lib/cases";

export const metadata: Metadata = {
  title: "Index of cases",
  description: `All ${stats.total} documented cases of armed conflicts ended, reduced or prevented.`,
};

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-8">
      <p className="kicker">The index</p>
      <h1 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
        <SplitWords text="Index of cases" />
      </h1>
      <p data-reveal style={{ "--d": 300 } as React.CSSProperties} className="mt-3 max-w-2xl text-(length:--text-body-sm) leading-relaxed">
        Every case in the collection. Search or filter, then sort by title, country or date.
      </p>
      <Suspense>
        <CaseIndex />
      </Suspense>
    </div>
  );
}
