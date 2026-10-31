"use client";

import { useEffect, useRef, useState } from "react";

type Section = { id: string; label: string };

const DESKTOP = "(min-width: 1024px)";

/**
 * Turns vertical scrolling into horizontal travel through its panels on wide screens.
 * The outer box is as tall as the track is wide; the inner box sticks to the viewport
 * while the track slides left. Native scrolling, scrollbars and keyboard keep working.
 * Below 1024px the panels simply stack.
 *
 * Children are panels: elements with `data-panel` and an `id` listed in `sections`.
 * Elements with `data-parallax="<factor>"` drift sideways relative to their panel.
 */
export function HorizontalScroll({ sections, children }: { sections: Section[]; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const go = useRef<(id: string, smooth?: boolean) => void>(() => {});

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const o = outer.current!;
    const t = track.current!;
    let distance = 0;
    let raf = 0;

    const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) * 16 || 64;
    const top = () => o.getBoundingClientRect().top + window.scrollY - headerH();
    const panels = () => [...t.querySelectorAll<HTMLElement>("[data-panel]")];

    const update = () => {
      raf = 0;
      if (!mq.matches) return;
      const x = Math.min(distance, Math.max(0, window.scrollY - top()));
      t.style.transform = `translate3d(${-x}px,0,0)`;
      o.style.setProperty("--progress", String(distance ? x / distance : 0));
      const mid = x + window.innerWidth / 2;
      const ps = panels();
      let idx = 0;
      ps.forEach((p, i) => {
        if (p.offsetLeft <= mid) idx = i;
      });
      setActive(idx);
      if (reduced) return;
      for (const el of t.querySelectorAll<HTMLElement>("[data-parallax]")) {
        const panel = el.closest<HTMLElement>("[data-panel]");
        if (!panel) continue;
        const offset = panel.offsetLeft - x;
        el.style.transform = `translate3d(${offset * Number(el.dataset.parallax)}px,0,0)`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const measure = () => {
      if (!mq.matches) {
        o.style.height = "";
        t.style.transform = "";
        for (const el of t.querySelectorAll<HTMLElement>("[data-parallax]")) el.style.transform = "";
        distance = 0;
        return;
      }
      distance = Math.max(0, t.scrollWidth - window.innerWidth);
      o.style.height = `${distance + window.innerHeight - headerH()}px`;
      update();
    };

    go.current = (id, smooth = true) => {
      const panel = document.getElementById(id);
      if (!panel) return;
      if (!mq.matches) {
        panel.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
        return;
      }
      window.scrollTo({ top: top() + Math.min(distance, panel.offsetLeft), behavior: smooth && !reduced ? "smooth" : "instant" });
    };

    // Same-page links to a panel (#atlas) scroll to it instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, window.location.href);
      const id = url.hash.slice(1);
      if (url.pathname !== window.location.pathname || !sections.some((s) => s.id === id)) return;
      e.preventDefault();
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
      go.current(id);
    };

    // Sideways trackpad swipes move through the panels too.
    const onWheel = (e: WheelEvent) => {
      if (!mq.matches || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if ((e.target as Element).closest?.(".maplibregl-map, [data-scroll-x]")) return;
      window.scrollBy(0, e.deltaX);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!mq.matches || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, select, textarea, .maplibregl-map")) return;
      const x = window.scrollY - top();
      if (x < -2 || x > distance + 2) return;
      const ps = panels();
      const target =
        e.key === "ArrowRight"
          ? ps.find((p) => p.offsetLeft > x + 4)
          : [...ps].reverse().find((p) => p.offsetLeft < x - 4);
      if (target) {
        e.preventDefault();
        go.current(target.id);
      }
    };

    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (sections.some((s) => s.id === id)) go.current(id, false);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick, true);
    mq.addEventListener("change", measure);
    measure();

    const hash = window.location.hash.slice(1);
    if (sections.some((s) => s.id === hash)) requestAnimationFrame(() => go.current(hash, false));

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick, true);
      mq.removeEventListener("change", measure);
    };
  }, [sections]);

  return (
    <div ref={outer} className="relative" style={{ "--progress": 0 } as React.CSSProperties}>
      <div className="lg:sticky lg:top-(--header-h) lg:h-[calc(100svh-var(--header-h))] lg:overflow-clip">
        <div ref={track} className="flex flex-col will-change-transform lg:h-full lg:w-max lg:flex-row">
          {children}
        </div>

        {/* Section rail with progress, desktop only */}
        <nav
          aria-label="Sections"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden px-8 pb-4 lg:block"
        >
          <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-5 bg-paper/85 px-4 py-2 backdrop-blur-sm">
            <ol className="flex gap-5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={i === active ? "true" : undefined}
                    className={`kicker transition-colors hover:text-ink ${i === active ? "text-ink!" : ""}`}
                  >
                    <span className="mr-1.5 text-accent">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
            <span className="relative h-px flex-1 bg-rule">
              <span className="absolute inset-y-0 left-0 w-full origin-left scale-x-(--progress) bg-ink" />
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
}
