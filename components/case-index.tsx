"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterBar, ImpactDot } from "@/components/filter-bar";
import { cases, formatPeriod, matches, type Case, type Year } from "@/lib/cases";
import { useFilters } from "@/lib/use-filters";

const yearValue = (y: Year) => (y === "present" ? 9999 : (y ?? -1));

const sorts: Record<string, { label: string; compare: (a: Case, b: Case) => number }> = {
  title: { label: "Title A–Z", compare: (a, b) => a.title.localeCompare(b.title) },
  country: { label: "Country A–Z", compare: (a, b) => a.country.localeCompare(b.country) || a.title.localeCompare(b.title) },
  newest: { label: "Most recent", compare: (a, b) => yearValue(b.startYear) - yearValue(a.startYear) },
  oldest: {
    label: "Oldest first",
    // Unknown dates sort last.
    compare: (a, b) => (a.startYear == null ? 1 : 0) - (b.startYear == null ? 1 : 0) || yearValue(a.startYear) - yearValue(b.startYear),
  },
};

export function CaseIndex() {
  const { filters, setFilters, clear } = useFilters();
  const [sort, setSort] = useState("title");
  const results = useMemo(
    () => cases.filter((c) => matches(c, filters)).sort(sorts[sort].compare),
    [filters, sort],
  );

  return (
    <div className="mt-8">
      <FilterBar filters={filters} setFilters={setFilters} clear={clear} count={results.length} />

      <div className="mt-6 flex items-center justify-end gap-2 text-(length:--text-caption) text-muted uppercase tracking-wide">
        <label htmlFor="sort">Sort</label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-rule bg-paper px-2 py-1 text-ink normal-case tracking-normal"
        >
          {Object.entries(sorts).map(([k, s]) => (
            <option key={k} value={k}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rule-double mt-3">
        <div className="hidden grid-cols-[1fr_10rem_8rem_7rem] gap-6 border-b border-ink py-2 kicker md:grid">
          <span>Case</span>
          <span>Country</span>
          <span>Period</span>
          <span>Impact</span>
        </div>
        {results.length === 0 && (
          <p className="py-10 text-(length:--text-body-sm)">
            No cases match.{" "}
            <button type="button" onClick={clear} className="text-accent underline">
              Clear filters
            </button>
          </p>
        )}
        <ol className="divide-y divide-rule">
          {results.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/cases/${c.slug}`}
                className="group grid gap-x-6 gap-y-1 py-4 md:grid-cols-[1fr_10rem_8rem_7rem] md:items-baseline"
              >
                <span>
                  <span className="block font-serif text-xl font-bold leading-snug text-ink group-hover:text-accent">
                    {c.title}
                  </span>
                  {c.summary && (
                    <span className="mt-1 line-clamp-2 block max-w-3xl text-(length:--text-body-sm) leading-relaxed">
                      {c.summary}
                    </span>
                  )}
                </span>
                <span className="text-(length:--text-body-sm) text-ink">
                  <span className="md:hidden text-muted">{formatPeriod(c)} · </span>
                  {c.country}
                </span>
                <span className="hidden text-(length:--text-body-sm) text-muted md:block">{formatPeriod(c)}</span>
                <span className="flex items-center gap-2 text-(length:--text-caption) text-muted">
                  <ImpactDot impact={c.impact} />
                  {c.impact ?? "Not assessed"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
