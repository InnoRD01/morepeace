import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Atlas } from "@/components/atlas";
import { facets, filterHref, lastUpdated, stats } from "@/lib/cases";

export default function Home() {
  const lastingPct = Math.round((stats.lasting / stats.total) * 100);
  const maxTheme = facets.theme[0][1];
  const maxInitiative = facets.initiative[0][1];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-10 pb-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div>
          <p className="kicker">An atlas of peace · Updated {lastUpdated}</p>
          <h1 className="mt-4 font-serif text-(length:--text-hero) font-bold leading-[0.88] text-ink">
            How We
            <br />
            Stopped <em className="font-medium text-accent">War</em>
          </h1>
          <p className="mt-6 max-w-xl text-(length:--text-body) leading-relaxed">
            A record of how armed conflicts have been ended, reduced, and prevented — {stats.total} documented cases,
            mapped and sourced so the mechanics of peace can be studied as seriously as war itself.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#atlas" className="bg-button px-5 py-3 text-(length:--text-body-sm) text-paper hover:bg-ink">
              Open the atlas
            </Link>
            <Link
              href="/cases"
              className="border border-ink px-5 py-3 text-(length:--text-body-sm) text-ink hover:bg-ink hover:text-paper"
            >
              Browse all {stats.total} cases
            </Link>
          </div>
        </div>
        <Image
          src="/images/home-page-illustration.png"
          alt="Collage of a white dove in flight over newspaper headlines about war"
          width={1070}
          height={1254}
          priority
          sizes="(max-width: 1024px) 80vw, 40vw"
          className="mx-auto w-full max-w-md mix-blend-multiply lg:max-w-none"
        />
      </section>

      {/* Ledger of key figures */}
      <section aria-label="The collection in numbers" className="mx-auto max-w-7xl px-4 sm:px-8">
        <dl className="rule-double grid grid-cols-2 border-b border-ink md:grid-cols-4">
          {[
            [stats.total, "documented cases"],
            [stats.countries, "countries"],
            [`${stats.firstYear}–now`, "years covered"],
            [`${lastingPct}%`, "with lasting impact"],
          ].map(([value, label], i) => (
            <div key={label} className={`px-2 py-6 text-center ${i % 2 ? "border-l" : ""} ${i === 2 ? "md:border-l" : ""} border-rule`}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-none text-ink">{value}</dd>
              <dd className="kicker mt-2">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="kicker">I. The record</p>
            <h2 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
              Peace, on the record
            </h2>
          </div>
          <div className="space-y-5 text-(length:--text-body) leading-relaxed md:columns-2 md:gap-10 md:space-y-0 [&>p+p]:md:mt-5">
            <p className="first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:font-bold first-letter:text-accent">
              Wars end. That plain fact is easy to lose sight of amid the news of wars beginning, but the historical
              record is full of armed conflicts that were negotiated to a close, contained before they spread, or
              prevented from starting at all. This collection gathers {stats.total} such cases; each one a real
              episode, documented so that the mechanics of ending war can be studied as seriously as war itself.
            </p>
            <p>
              The cases span every inhabited region and the years from {stats.firstYear} to the present. They include
              mediated peace agreements, peacekeeping and observer missions, quiet diplomacy, local action, border
              stabilisation, and the patient work of building peace infrastructure. Some produced a lasting peace;
              others bought limited, imperfect calm. Both outcomes are recorded honestly, because both carry lessons.
            </p>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section id="themes" className="border-y border-rule bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="kicker">II. Patterns</p>
              <h2 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
                What had to be resolved
              </h2>
              <p className="mt-4 max-w-lg text-(length:--text-body-sm) leading-relaxed">
                The same peacebuilding tools appear across very different kinds of conflict. Browse the collection
                through the recurring themes behind each one.
              </p>
              <ul className="mt-8 divide-y divide-rule border-y border-rule">
                {facets.theme.map(([theme, n]) => (
                  <BarRow key={theme} href={filterHref("theme", theme)} label={theme} n={n} max={maxTheme} />
                ))}
              </ul>
            </div>
            <div>
              <p className="kicker">III. Methods</p>
              <h2 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
                How peace was made
              </h2>
              <p className="mt-4 max-w-lg text-(length:--text-body-sm) leading-relaxed">
                The initiatives that ended, reduced or prevented each conflict. Many cases relied on more than one.
              </p>
              <ul className="mt-8 divide-y divide-rule border-y border-rule">
                {facets.initiative.map(([initiative, n]) => (
                  <BarRow
                    key={initiative}
                    href={filterHref("initiative", initiative)}
                    label={initiative}
                    n={n}
                    max={maxInitiative}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Atlas */}
      <section id="atlas" className="mx-auto max-w-7xl px-4 pt-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">IV. The atlas</p>
            <h2 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
              Across the globe
            </h2>
          </div>
          <p className="max-w-md text-(length:--text-body-sm) leading-relaxed">
            Filter by region, theme or method, or pick a decade on the timeline. Click a marker to open the case.
          </p>
        </div>
        <Suspense fallback={<div className="mt-8 h-[70vh] paper border border-rule" />}>
          <Atlas />
        </Suspense>
      </section>
    </>
  );
}

function BarRow({ href, label, n, max }: { href: string; label: string; n: number; max: number }) {
  return (
    <li>
      <Link href={href} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3">
        <span className="text-(length:--text-body-sm) text-ink group-hover:text-accent">{label}</span>
        <span className="font-serif text-xl font-bold leading-none text-ink">{n}</span>
        <span className="col-span-2 h-1 bg-rule">
          <span className="block h-full bg-ink/70 group-hover:bg-accent" style={{ width: `${(n / max) * 100}%` }} />
        </span>
      </Link>
    </li>
  );
}
