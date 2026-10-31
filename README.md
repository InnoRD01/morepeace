# How We Stopped War

An atlas of peace: a record of how armed conflicts have been ended, reduced, and prevented.
A redesign and rebuild of [how-we-stopped-war-two.vercel.app](https://how-we-stopped-war-two.vercel.app/).

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript, statically generated: every case gets its own page.
- Tailwind CSS v4. The palette, fonts (Cormorant, Alata) and paper-grain texture come from the original site.
- [MapLibre GL](https://maplibre.org/) with Natural Earth country outlines bundled locally, so the map needs
  **no API key or tile server**. Markers are clustered with `supercluster`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm run typecheck
```

`predev`/`prebuild` copy MapLibre's web worker into `public/`. It's generated, so it's git-ignored.

## Deploy

The site is a static export (`output: "export"`): `npm run build` writes plain HTML, CSS and JS to `out/`,
and any static host can serve it.

**Cloudflare Pages:** under *Settings → Build*, set:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |

`wrangler.toml` also sets the output directory, and `.node-version` pins Node 22 (Next.js needs ≥ 20.9).

## Structure

| Path | What |
| --- | --- |
| `app/page.tsx` | Home: hero, key figures, intro, themes and methods, the atlas |
| `app/cases/page.tsx` | Searchable, filterable, sortable index of every case |
| `app/cases/[slug]/page.tsx` | Case page: summary, facts, classification, locator globe, related cases |
| `components/atlas*.tsx` | Map, filter bar, timeline and result list |
| `lib/cases.ts` | Data access, facets, filtering, stats |
| `data/cases.json` | The case data |
| `scripts/clean-data.py` | Rebuilds `data/cases.json` from the original site's data |

Filters live in the URL query string (`/cases?theme=Civil+wars&impact=Lasting`), so any filtered
view can be shared or bookmarked.

## Data notes

`data/cases.json` was extracted from the original site and cleaned by `scripts/clean-data.py`:

- The headline figures are now computed from the data. The original said 193 cases and 126 with lasting
  impact, but its data has 182 cases and 124 with lasting impact.
- Removed summaries that were copied from other cases: *Nagorno-Karabakh* had the Transnistria text,
  and *Northern Ireland* had the Cambodia text. Both now show "summary not written yet".
- Fixed regions: Solomon Islands was tagged Africa, and DRC had no region.
- Removed stray country prefixes from titles ("(Chad) …") and tidied two titles.

Still missing from the source, to fill in when available:

- 22 cases have no summary.
- 30 have no themes.
- 3 have no dates (Tigray, Libya, DRC).
- DRC has no impact rating.
- The full write-ups behind each case were not part of the source data.
