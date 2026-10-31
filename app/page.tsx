import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Atlas } from "@/components/atlas";
import { CountUp } from "@/components/count-up";
import { HorizontalScroll } from "@/components/horizontal-scroll";
import { SplitWords } from "@/components/reveal";
import { facets, filterHref, lastUpdated, stats } from "@/lib/cases";

const sections = [
  { id: "top", label: "Intro" },
  { id: "record", label: "The record" },
  { id: "themes", label: "Patterns" },
  { id: "atlas", label: "Atlas" },
  { id: "index", label: "Index" },
];

/** One screen of the horizontal homepage; stacks normally below 1024px. */
function Panel({
  id,
  n,
  className = "",
  numeral,
  children,
}: {
  id: string;
  /** Position in the row, for the parallax offset. */
  n: number;
  className?: string;
  numeral?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-panel
      style={{ "--n": n } as React.CSSProperties}
      className={`relative isolate shrink-0 border-rule px-4 py-16 sm:px-8 lg:flex lg:h-full lg:w-screen lg:flex-col lg:justify-center-safe lg:overflow-hidden lg:border-l lg:px-14 lg:pt-10 lg:pb-[4.75rem] ${className}`}
    >
      {numeral && (
        <span
          aria-hidden
          data-parallax
          className="pointer-events-none absolute right-6 bottom-6 -z-10 hidden font-serif text-[clamp(14rem,30vh,24rem)] leading-none font-bold text-ink/[0.045] select-none lg:block"
        >
          {numeral}
        </span>
      )}
      {children}
    </section>
  );
}

function Kicker({ children, d = 0 }: { children: React.ReactNode; d?: number }) {
  return (
    <p data-reveal="fade" className="kicker" style={{ "--d": d } as React.CSSProperties}>
      {children}
    </p>
  );
}

export default function Home() {
  const lastingPct = Math.round((stats.lasting / stats.total) * 100);

  return (
    <HorizontalScroll sections={sections}>
      {/* I. Hero */}
      <Panel id="top" n={0} className="lg:border-l-0">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Kicker>An atlas of peace · Updated {lastUpdated}</Kicker>
            <h1 className="mt-4 font-serif text-(length:--text-hero) font-bold leading-[0.9] text-ink">
              <SplitWords text="How We Stopped" delay={100} />{" "}
              <em className="font-medium text-accent">
                <SplitWords text="War" delay={400} />
              </em>
            </h1>
            <p data-reveal className="mt-6 max-w-xl text-(length:--text-body) leading-relaxed" style={{ "--d": 600 } as React.CSSProperties}>
              A record of how armed conflicts have been ended, reduced, and prevented — {stats.total} documented cases,
              mapped and sourced so the mechanics of peace can be studied as seriously as war itself.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap gap-3" style={{ "--d": 750 } as React.CSSProperties}>
              <Link href="#atlas" className="bg-button px-5 py-3 text-(length:--text-body-sm) text-paper transition-colors hover:bg-ink">
                Open the atlas
              </Link>
              <Link
                href="/cases"
                className="border border-ink px-5 py-3 text-(length:--text-body-sm) text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Browse all {stats.total} cases
              </Link>
            </div>
          </div>
          <div data-parallax="soft">
            <Image
              src="/images/home-page-illustration.png"
              alt="Collage of a white dove in flight over newspaper headlines about war"
              width={1070}
              height={1254}
              priority
              sizes="(max-width: 1024px) 80vw, 40vw"
              data-reveal="fade"
              style={{ "--d": 300 } as React.CSSProperties}
              className="mx-auto w-full max-w-md mix-blend-multiply lg:max-h-[calc(100svh-12rem)] lg:w-auto lg:max-w-none"
            />
          </div>
        </div>
        <p data-reveal="fade" style={{ "--d": 1200 } as React.CSSProperties} className="kicker mt-10 hidden items-center gap-3 lg:absolute lg:bottom-8 lg:left-14 lg:mt-0 lg:flex">
          Scroll to explore <span className="nudge text-base text-accent">→</span>
        </p>
      </Panel>

      {/* II. The record */}
      <Panel id="record" n={1} numeral="I">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Kicker>I. The record</Kicker>
            <h2 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
              <SplitWords text="Peace, on the record" />
            </h2>
            <div data-reveal="rule" className="rule-double mt-8" />
            <dl className="grid grid-cols-2 border-b border-ink">
              {[
                [<CountUp key="t" value={stats.total} />, "documented cases"],
                [<CountUp key="c" value={stats.countries} />, "countries"],
                [`${stats.firstYear}–now`, "years covered"],
                [<CountUp key="l" value={lastingPct} suffix="%" />, "with lasting impact"],
              ].map(([value, label], i) => (
                <div
                  key={label as string}
                  data-reveal
                  style={{ "--d": 200 + i * 120 } as React.CSSProperties}
                  className={`px-2 py-6 text-center ${i % 2 ? "border-l border-rule" : ""} ${i > 1 ? "border-t border-rule" : ""}`}
                >
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-none text-ink">{value}</dd>
                  <dd className="kicker mt-2">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-5 text-(length:--text-body) leading-relaxed">
            <p
              data-reveal
              style={{ "--d": 300 } as React.CSSProperties}
              className="first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:font-bold first-letter:text-accent"
            >
              Wars end. That plain fact is easy to lose sight of amid the news of wars beginning, but the historical
              record is full of armed conflicts that were negotiated to a close, contained before they spread, or
              prevented from starting at all. This collection gathers {stats.total} such cases; each one a real
              episode, documented so that the mechanics of ending war can be studied as seriously as war itself.
            </p>
            <p data-reveal style={{ "--d": 450 } as React.CSSProperties}>
              The cases span every inhabited region and the years from {stats.firstYear} to the present. They include
              mediated peace agreements, peacekeeping and observer missions, quiet diplomacy, local action, border
              stabilisation, and the patient work of building peace infrastructure. Some produced a lasting peace;
              others bought limited, imperfect calm. Both outcomes are recorded honestly, because both carry lessons.
            </p>
          </div>
        </div>
      </Panel>

      {/* III. Patterns and methods */}
      <Panel id="themes" n={2} numeral="II" className="bg-card/60">
        <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-2">
          <div>
            <BarSection
              kicker="II. Patterns"
              title="What had to be resolved"
              blurb="The same peacebuilding tools appear across very different kinds of conflict. Browse the collection through the recurring themes behind each one."
              rows={facets.theme}
              facet="theme"
            />
          </div>
          <div id="methods">
            <BarSection
              kicker="III. Methods"
              title="How peace was made"
              blurb="The initiatives that ended, reduced or prevented each conflict. Many cases relied on more than one."
              rows={facets.initiative}
              facet="initiative"
            />
          </div>
        </div>
      </Panel>

      {/* V. Atlas */}
      <Panel id="atlas" n={3} className="lg:pb-18">
        <div className="mx-auto flex w-full max-w-[110rem] flex-col lg:min-h-0 lg:flex-1">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>IV. The atlas</Kicker>
              <h2 className="mt-2 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
                <SplitWords text="Across the globe" />
              </h2>
            </div>
            <p
              data-reveal
              style={{ "--d": 300 } as React.CSSProperties}
              className="max-w-md text-(length:--text-body-sm) leading-relaxed lg:[@media(max-height:820px)]:hidden"
            >
              Filter by region, theme or method, or pick a decade on the timeline. Click a marker to open the case;
              hold Ctrl (⌘ on Mac) and scroll to zoom the map.
            </p>
          </div>
          <Suspense fallback={<div className="paper mt-6 h-[60vh] border border-rule lg:h-auto lg:flex-1" />}>
            <Atlas />
          </Suspense>
        </div>
      </Panel>

      {/* V. Coda */}
      <Panel id="index" n={4} numeral="V">
        <div className="mx-auto w-full max-w-5xl">
          <Kicker>V. The index</Kicker>
          <p className="mt-4 font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-bold text-ink">
            <SplitWords text="Every case is a lesson in how." />
          </p>
          <p data-reveal style={{ "--d": 400 } as React.CSSProperties} className="mt-6 max-w-xl text-(length:--text-body) leading-relaxed">
            Read the full index: {stats.total} cases you can search, filter by region, theme and method, and sort by
            date or country.
          </p>
          <div data-reveal style={{ "--d": 550 } as React.CSSProperties} className="mt-8">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-3 bg-accent px-6 py-4 text-(length:--text-body) text-paper transition-colors hover:bg-ink"
            >
              Browse the index
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
        {/* Stands in for the site footer, which the horizontal layout hides. */}
        <p className="kicker absolute bottom-20 left-14 hidden items-center gap-3 lg:flex">
          <Image src="/images/bird-black.svg" alt="" width={36} height={23} />
          How We Stopped War · {stats.total} cases since {stats.firstYear} · Map data © Natural Earth
        </p>
      </Panel>
    </HorizontalScroll>
  );
}

function BarSection({
  kicker,
  title,
  blurb,
  rows,
  facet,
}: {
  kicker: string;
  title: string;
  blurb: string;
  rows: [string, number][];
  facet: "theme" | "initiative";
}) {
  const max = rows[0][1];
  return (
    <>
      <Kicker>{kicker}</Kicker>
      <h2 className="mt-3 font-serif text-(length:--text-heading) font-bold leading-tight text-ink">
        <SplitWords text={title} />
      </h2>
      <p
        data-reveal
        style={{ "--d": 250 } as React.CSSProperties}
        className="mt-3 max-w-lg text-(length:--text-body-sm) leading-relaxed lg:[@media(max-height:820px)]:hidden"
      >
        {blurb}
      </p>
      <ul data-reveal="bars" className="mt-6 border-t border-rule">
        {rows.map(([label, n], i) => (
          <li key={label}>
            <Link
              href={filterHref(facet, label)}
              className="group relative grid grid-cols-[1fr_auto] items-baseline gap-x-4 pt-2.5 pb-3 lg:pt-[clamp(0.2rem,0.7vh,0.6rem)] lg:pb-[clamp(0.35rem,1vh,0.75rem)]"
            >
              <span className="text-(length:--text-body-sm) text-ink transition-colors group-hover:text-accent">{label}</span>
              <span className="font-serif text-xl font-bold leading-none text-ink">{n}</span>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-rule">
                <span
                  className="bar block h-full bg-ink/70 transition-colors group-hover:bg-accent"
                  style={{ width: `${(n / max) * 100}%`, "--i": i } as React.CSSProperties}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
