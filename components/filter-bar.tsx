"use client";

import { facets, filterKeys, filterLabels, periods, type FacetKey, type Filters } from "@/lib/cases";

const options: Record<FacetKey, string[]> = {
  region: facets.region.map(([v]) => v).sort(),
  theme: facets.theme.map(([v]) => v),
  type: facets.type.map(([v]) => v),
  initiative: facets.initiative.map(([v]) => v),
  impact: ["Lasting", "Limited"],
  period: periods,
};

type Props = {
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  clear: () => void;
  count: number;
  /** Facets to leave out, e.g. the period when a timeline already controls it. */
  hide?: FacetKey[];
};

export function FilterBar({ filters, setFilters, clear, count, hide = [] }: Props) {
  const keys = filterKeys.filter((k) => !hide.includes(k));
  const active = filterKeys.some((k) => filters[k]) || !!filters.q;

  return (
    <div className="paper border border-rule p-3 sm:p-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(var(--n),1fr)]" style={{ "--n": keys.length } as React.CSSProperties}>
        <label className="relative block">
          <span className="sr-only">Search cases</span>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Search cases, countries…"
            className="w-full border border-rule bg-paper px-3 py-2 text-(length:--text-body-sm) text-ink placeholder:text-faint focus:border-ink focus:outline-none"
          />
        </label>
        {keys.map((key) => (
          <label key={key} className="block">
            <span className="sr-only">{filterLabels[key]}</span>
            <select
              value={filters[key]}
              onChange={(e) => setFilters({ [key]: e.target.value })}
              className={`w-full cursor-pointer appearance-none border bg-paper bg-[length:10px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 pr-8 text-(length:--text-body-sm) focus:border-ink focus:outline-none ${
                filters[key] ? "border-ink text-ink" : "border-rule text-muted"
              }`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%231a1a1a' stroke-width='1.4'/%3E%3C/svg%3E\")",
              }}
            >
              <option value="">{key === "period" ? "Any time" : `All ${filterLabels[key].toLowerCase()}s`}</option>
              {options[key].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-(length:--text-caption)">
        <p aria-live="polite" className="tracking-wide text-muted uppercase">
          Showing <strong className="font-normal text-ink">{count}</strong> {count === 1 ? "case" : "cases"}
        </p>
        {active && (
          <button type="button" onClick={clear} className="tracking-wide text-accent uppercase hover:underline">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export function ImpactDot({ impact }: { impact: string | null }) {
  const color = impact === "Lasting" ? "bg-lasting" : impact === "Limited" ? "bg-limited" : "bg-faint";
  return <span aria-hidden className={`inline-block size-2.5 shrink-0 rounded-full ${color}`} />;
}
