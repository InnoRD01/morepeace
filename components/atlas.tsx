"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AtlasMap } from "@/components/atlas-map";
import { FilterBar, ImpactDot } from "@/components/filter-bar";
import { Timeline } from "@/components/timeline";
import { cases, formatPeriod, matches, type Case } from "@/lib/cases";
import { useFilters } from "@/lib/use-filters";

export function Atlas() {
  const { filters, setFilters, clear } = useFilters();
  const results = useMemo(() => cases.filter((c) => matches(c, filters)), [filters]);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-3 lg:mt-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-3 lg:space-y-0">
      <FilterBar filters={filters} setFilters={setFilters} clear={clear} count={results.length} hide={["period"]} />

      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_24rem]">
        <div className="relative h-[clamp(22rem,60vh,40rem)] overflow-hidden border border-rule lg:h-full">
          <AtlasMap cases={results} activeSlug={active} onActivate={setActive} />
          <div className="pointer-events-none absolute inset-0 z-10 bg-(image:--noise) bg-size-[180px] opacity-25 mix-blend-multiply" />
          <div className="paper absolute bottom-3 left-3 z-10 space-y-1 border border-rule px-3 py-2 text-(length:--text-caption) text-body">
            <p className="flex items-center gap-2"><ImpactDot impact="Lasting" /> Lasting impact</p>
            <p className="flex items-center gap-2"><ImpactDot impact="Limited" /> Limited impact</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-h-0">
          <CaseList cases={results} active={active} setActive={setActive} clear={clear} />
          <Timeline filters={filters} setFilters={setFilters} />
        </div>
      </div>
    </div>
  );
}

/** Fixed row height, so we can work out how many rows fit without scrolling. */
const ROW_PX = 64;

/** Results shown a page at a time, sized to the space available, so the list never scrolls. */
function CaseList({
  cases: list,
  active,
  setActive,
  clear,
}: {
  cases: Case[];
  active: string | null;
  setActive: (slug: string | null) => void;
  clear: () => void;
}) {
  const box = useRef<HTMLOListElement>(null);
  const [perPage, setPerPage] = useState(6);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setPerPage(Math.max(3, Math.floor((el.clientHeight + 2) / ROW_PX))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Back to the first page whenever the results change.
  useEffect(() => setPage(0), [list]);

  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const current = Math.min(page, pages - 1);
  const shown = list.slice(current * perPage, (current + 1) * perPage);

  return (
    <div className="paper flex h-[30rem] flex-col border border-rule lg:h-auto lg:min-h-0 lg:flex-1">
      <ol ref={box} aria-label="Matching cases" className="min-h-0 flex-1 overflow-hidden">
        {list.length === 0 && (
          <li className="p-6 text-(length:--text-body-sm)">
            No cases match these filters.{" "}
            <button type="button" onClick={clear} className="text-accent underline">
              Clear filters
            </button>
          </li>
        )}
        {shown.map((c) => (
          <li key={c.slug} className="border-b border-rule" style={{ height: ROW_PX }}>
            <Link
              href={`/cases/${c.slug}`}
              onMouseEnter={() => setActive(c.slug)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(c.slug)}
              onBlur={() => setActive(null)}
              className={`flex h-full flex-col justify-center px-4 py-1 transition-colors hover:bg-sea/60 ${active === c.slug ? "bg-sea/60" : ""}`}
            >
              <span className="line-clamp-2 font-serif text-base leading-tight font-bold text-ink">{c.title}</span>
              <span className="mt-1 flex items-center gap-2 text-(length:--text-caption) text-muted">
                <ImpactDot impact={c.impact} />
                {formatPeriod(c)} · {c.country}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {list.length > 0 && (
        <div className="flex items-center justify-between border-t border-rule px-4 py-2 text-(length:--text-caption) text-muted">
          <span className="tracking-wide uppercase">
            {current * perPage + 1}–{Math.min(list.length, (current + 1) * perPage)} of {list.length}
          </span>
          <span className="flex gap-1">
            <button
              type="button"
              aria-label="Previous cases"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              className="grid size-7 place-items-center border border-rule text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-rule"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next cases"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
              className="grid size-7 place-items-center border border-rule text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-rule"
            >
              ›
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
