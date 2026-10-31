"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AtlasMap } from "@/components/atlas-map";
import { FilterBar, ImpactDot } from "@/components/filter-bar";
import { Timeline } from "@/components/timeline";
import { cases, formatPeriod, matches } from "@/lib/cases";
import { useFilters } from "@/lib/use-filters";

export function Atlas() {
  const { filters, setFilters, clear } = useFilters();
  const results = useMemo(() => cases.filter((c) => matches(c, filters)), [filters]);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-3 lg:mt-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-3 lg:space-y-0">
      <FilterBar filters={filters} setFilters={setFilters} clear={clear} count={results.length} hide={["period"]} />

      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_22rem]">
        <div className="relative h-[clamp(22rem,60vh,40rem)] overflow-hidden border border-rule lg:h-full">
          <AtlasMap cases={results} activeSlug={active} onActivate={setActive} />
          <div className="pointer-events-none absolute inset-0 z-10 bg-(image:--noise) bg-size-[180px] opacity-25 mix-blend-multiply" />
          <div className="paper absolute bottom-3 left-3 z-10 space-y-1 border border-rule px-3 py-2 text-(length:--text-caption) text-body">
            <p className="flex items-center gap-2"><ImpactDot impact="Lasting" /> Lasting impact</p>
            <p className="flex items-center gap-2"><ImpactDot impact="Limited" /> Limited impact</p>
          </div>
        </div>

        <ol
          aria-label="Matching cases"
          className="paper max-h-[28rem] divide-y divide-rule overflow-y-auto border border-rule lg:h-full lg:max-h-none"
        >
          {results.length === 0 && (
            <li className="p-6 text-(length:--text-body-sm)">
              No cases match these filters.{" "}
              <button type="button" onClick={clear} className="text-accent underline">
                Clear filters
              </button>
            </li>
          )}
          {results.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/cases/${c.slug}`}
                onMouseEnter={() => setActive(c.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(c.slug)}
                onBlur={() => setActive(null)}
                className={`block px-4 py-3 transition-colors hover:bg-sea/60 ${active === c.slug ? "bg-sea/60" : ""}`}
              >
                <span className="block font-serif text-lg font-bold leading-snug text-ink">{c.title}</span>
                <span className="mt-1 flex items-center gap-2 text-(length:--text-caption) text-muted">
                  <ImpactDot impact={c.impact} />
                  {formatPeriod(c)} · {c.country}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <Timeline filters={filters} setFilters={setFilters} />
    </div>
  );
}
