import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImpactDot } from "@/components/filter-bar";
import { Locator } from "@/components/locator";
import { SplitWords } from "@/components/reveal";
import { cases, filterHref, formatPeriod, getCase, relatedCases, type FacetKey } from "@/lib/cases";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCase((await params).slug);
  if (!c) return {};
  return { title: c.title, description: c.summary ?? `${c.title} — ${formatPeriod(c)}, ${c.location}.` };
}

export default async function CasePage({ params }: Params) {
  const c = getCase((await params).slug);
  if (!c) notFound();

  const i = cases.indexOf(c);
  const prev = cases[i - 1];
  const next = cases[i + 1];
  const related = relatedCases(c);

  const facts: [string, React.ReactNode][] = [
    ["Period", formatPeriod(c)],
    ["Location", c.location],
    ["Country", c.country],
    ["Region", c.region ? <TagLink k="region" v={c.region} /> : "—"],
    [
      "Impact",
      c.impact ? (
        <Link href={filterHref("impact", c.impact)} className="inline-flex items-center gap-2 hover:text-accent">
          <ImpactDot impact={c.impact} /> {c.impact}
        </Link>
      ) : (
        "Not assessed"
      ),
    ],
  ];

  return (
    <article className="mx-auto max-w-7xl px-4 pt-10 sm:px-8">
      <nav aria-label="Breadcrumb" className="kicker">
        <Link href="/cases" className="hover:text-ink">Index of cases</Link>
        <span className="mx-2">/</span>
        <span>{c.country}</span>
      </nav>

      <header className="mt-6 grid gap-8 border-b border-ink pb-10 lg:grid-cols-[1fr_15rem] lg:items-end">
        <div>
          <h1 className="font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[0.98] text-ink">
            <SplitWords text={c.title} />
          </h1>
          <p data-reveal style={{ "--d": 400 } as React.CSSProperties} className="mt-4 flex items-center gap-2 text-(length:--text-body-sm) text-muted">
            <ImpactDot impact={c.impact} />
            {formatPeriod(c)} · {c.location}
          </p>
        </div>
        <div data-reveal="fade" style={{ "--d": 300 } as React.CSSProperties}>
          <Locator lat={c.lat} lng={c.lng} label={c.location} />
        </div>
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="kicker">Summary</p>
          {c.summary ? (
            <p data-reveal style={{ "--d": 500 } as React.CSSProperties} className="mt-4 max-w-3xl font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] leading-snug text-ink">
              {c.summary}
            </p>
          ) : (
            <p className="mt-4 max-w-2xl text-(length:--text-body) italic text-muted">
              A summary for this case has not been written yet.
            </p>
          )}

          <div data-reveal style={{ "--d": 650 } as React.CSSProperties} className="mt-12 grid gap-8 sm:grid-cols-3">
            <TagGroup title="Themes" k="theme" values={c.themes} />
            <TagGroup title="Type of conflict" k="type" values={c.conflictTypes} />
            <TagGroup title="Initiatives" k="initiative" values={c.initiatives} />
          </div>
        </div>

        <aside data-reveal style={{ "--d": 600 } as React.CSSProperties} className="paper h-fit border border-rule p-5">
          <p className="kicker">At a glance</p>
          <dl className="mt-3 divide-y divide-rule">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 py-2.5 text-(length:--text-body-sm)">
                <dt className="text-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="rule-double pt-6">
          <h2 className="kicker">Related cases</h2>
          <ul data-reveal className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/cases/${r.slug}`} className="paper group block h-full border border-rule p-4 hover:border-ink">
                  <span className="block font-serif text-lg font-bold leading-snug text-ink group-hover:text-accent">
                    {r.title}
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-(length:--text-caption) text-muted">
                    <ImpactDot impact={r.impact} /> {formatPeriod(r)} · {r.country}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="More cases" className="mt-12 grid gap-3 border-t border-ink pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={`/cases/${prev.slug}`} className="group">
            <span className="kicker">← Previous</span>
            <span className="mt-1 block font-serif text-lg font-bold text-ink group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/cases/${next.slug}`} className="group sm:text-right">
            <span className="kicker">Next →</span>
            <span className="mt-1 block font-serif text-lg font-bold text-ink group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

function TagLink({ k, v }: { k: FacetKey; v: string }) {
  return (
    <Link href={filterHref(k, v)} className="underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent">
      {v}
    </Link>
  );
}

function TagGroup({ title, k, values }: { title: string; k: FacetKey; values: string[] }) {
  return (
    <div>
      <h2 className="kicker border-b border-ink pb-2">{title}</h2>
      {values.length ? (
        <ul className="mt-3 space-y-2 text-(length:--text-body-sm)">
          {values.map((v) => (
            <li key={v}>
              <TagLink k={k} v={v} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-(length:--text-body-sm) text-faint">Not classified</p>
      )}
    </div>
  );
}
