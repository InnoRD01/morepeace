import raw from "@/data/cases.json";

export type Impact = "Lasting" | "Limited";
export type Year = number | "present" | null;

export type Case = {
  slug: string;
  title: string;
  country: string;
  location: string;
  lat: number;
  lng: number;
  startYear: Year;
  endYear: Year;
  impact: Impact | null;
  region: string | null;
  themes: string[];
  conflictTypes: string[];
  initiatives: string[];
  summary: string | null;
};

export const cases = raw as Case[];

/** Date of the source data snapshot. */
export const lastUpdated = "27 August 2026";

export function getCase(slug: string) {
  return cases.find((c) => c.slug === slug);
}

export function formatYear(y: Year) {
  if (y === "present") return "present";
  return y == null ? "" : String(y);
}

export function formatPeriod(c: Pick<Case, "startYear" | "endYear">) {
  const start = formatYear(c.startYear);
  const end = formatYear(c.endYear);
  if (!start && !end) return "Dates unknown";
  if (!start) return end === "present" ? "Ongoing" : `Until ${end}`;
  if (!end || start === end) return start;
  return `${start}–${end}`;
}

/** Decade the effort ended in ("1990s"), "Ongoing" for open-ended cases, null if unknown. */
export function periodOf(c: Case): string | null {
  if (c.endYear === "present") return "Ongoing";
  if (typeof c.endYear === "number") return `${Math.floor(c.endYear / 10) * 10}s`;
  return null;
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const facets = {
  region: countBy(cases.flatMap((c) => (c.region ? [c.region] : []))),
  theme: countBy(cases.flatMap((c) => c.themes)),
  type: countBy(cases.flatMap((c) => c.conflictTypes)),
  initiative: countBy(cases.flatMap((c) => c.initiatives)),
  impact: countBy(cases.flatMap((c) => (c.impact ? [c.impact] : []))),
};

export const periods = [
  ...[...new Set(cases.map(periodOf).filter((p): p is string => !!p && p !== "Ongoing"))].sort(),
  "Ongoing",
];

const numericYears = cases.flatMap((c) => [c.startYear, c.endYear]).filter((y): y is number => typeof y === "number");

export const stats = {
  total: cases.length,
  countries: new Set(cases.map((c) => c.country)).size,
  regions: facets.region.length,
  firstYear: Math.min(...numericYears),
  lasting: cases.filter((c) => c.impact === "Lasting").length,
};

// ---- Filtering -------------------------------------------------------------

export type Filters = {
  q: string;
  region: string;
  theme: string;
  type: string;
  initiative: string;
  impact: string;
  period: string;
};

export const filterKeys = ["region", "theme", "type", "initiative", "impact", "period"] as const;
export type FacetKey = (typeof filterKeys)[number];

export const filterLabels: Record<FacetKey, string> = {
  region: "Region",
  theme: "Theme",
  type: "Conflict type",
  initiative: "Initiative",
  impact: "Impact",
  period: "Ended",
};

export const emptyFilters: Filters = { q: "", region: "", theme: "", type: "", initiative: "", impact: "", period: "" };

export function matches(c: Case, f: Filters, ignore?: FacetKey) {
  if (f.region && ignore !== "region" && c.region !== f.region) return false;
  if (f.theme && ignore !== "theme" && !c.themes.includes(f.theme)) return false;
  if (f.type && ignore !== "type" && !c.conflictTypes.includes(f.type)) return false;
  if (f.initiative && ignore !== "initiative" && !c.initiatives.includes(f.initiative)) return false;
  if (f.impact && ignore !== "impact" && c.impact !== f.impact) return false;
  if (f.period && ignore !== "period" && periodOf(c) !== f.period) return false;
  if (f.q) {
    const hay = [c.title, c.country, c.location, c.summary ?? "", ...c.themes, ...c.initiatives].join(" ").toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

export function filterHref(key: FacetKey, value: string) {
  return `/cases?${new URLSearchParams({ [key]: value })}`;
}

/** Cases sharing the most themes/initiatives with `c`, nearest first. */
export function relatedCases(c: Case, n = 4) {
  return cases
    .filter((o) => o.slug !== c.slug)
    .map((o) => ({
      o,
      score:
        o.themes.filter((t) => c.themes.includes(t)).length * 2 +
        o.initiatives.filter((t) => c.initiatives.includes(t)).length +
        (o.region === c.region ? 1 : 0) +
        (o.country === c.country ? 2 : 0),
    }))
    .filter((r) => r.score > 1)
    .sort((a, b) => b.score - a.score || a.o.title.localeCompare(b.o.title))
    .slice(0, n)
    .map((r) => r.o);
}
