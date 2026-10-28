"use client";

import { cases, matches, periodOf, periods, type Filters } from "@/lib/cases";

/** Bar per decade the effort ended in, stacked by impact; clicking a bar filters by it. */
export function Timeline({ filters, setFilters }: { filters: Filters; setFilters: (p: Partial<Filters>) => void }) {
  // Counts honour every filter except the period itself, so other bars stay visible.
  const pool = cases.filter((c) => matches(c, filters, "period"));
  const bins = periods.map((p) => {
    const inBin = pool.filter((c) => periodOf(c) === p);
    return { p, lasting: inBin.filter((c) => c.impact === "Lasting").length, total: inBin.length };
  });
  const max = Math.max(1, ...bins.map((b) => b.total));

  return (
    <div className="paper border border-rule px-3 pt-3 pb-2 sm:px-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="kicker">Conflicts ended or contained, by decade</p>
        <p className="flex items-center gap-3 text-(length:--text-caption) text-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-lasting" /> Lasting</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-limited" /> Limited</span>
        </p>
      </div>
      <div className="mt-3 flex h-24 items-end gap-1 sm:gap-2" role="group" aria-label="Filter by decade">
        {bins.map(({ p, lasting, total }) => {
          const selected = filters.period === p;
          const dimmed = filters.period && !selected;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              aria-label={`${p}: ${total} cases`}
              title={`${p}: ${total} cases`}
              onClick={() => setFilters({ period: selected ? "" : p })}
              className={`group flex h-full flex-1 flex-col justify-end ${dimmed ? "opacity-30 hover:opacity-70" : ""}`}
            >
              <span className="mb-1 text-center text-[10px] leading-none text-muted group-hover:text-ink">{total || ""}</span>
              <span
                className={`flex w-full flex-col-reverse overflow-hidden ${selected ? "outline-2 outline-offset-2 outline-ink" : ""}`}
                style={{ height: `${(total / max) * 72}%` }}
              >
                <span className="bg-lasting" style={{ flexGrow: lasting }} />
                <span className="bg-limited" style={{ flexGrow: total - lasting }} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1 border-t border-ink pt-1.5 sm:gap-2">
        {bins.map(({ p }) => (
          <span key={p} className="flex-1 text-center text-[10px] leading-tight text-muted">
            {p === "Ongoing" ? "Now" : `’${p.slice(2, 4)}`}
          </span>
        ))}
      </div>
    </div>
  );
}
