"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Section = { id: string; label: string };

const DESKTOP = "(min-width: 1024px)";
/** Slide duration; keep in sync with the transition on the track. */
const SLIDE_MS = 1000;

/**
 * Full-screen horizontal pager for wide screens. Each panel is one viewport wide; one wheel
 * flick, swipe, arrow key or rail click slides the whole row to the next panel. The page
 * itself doesn't scroll. Below 1024px the panels simply stack and scroll normally.
 *
 * Children are panels: elements with `data-panel` and an `id` listed in `sections`.
 * Inside a panel, `data-parallax` elements drift with the slide (see globals.css).
 */
export function HorizontalScroll({ sections, children }: { sections: Section[]; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const indexRef = useRef(0);
  const last = sections.length - 1;

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(last, i));
      indexRef.current = next;
      setIndex(next);
      const id = sections[next].id;
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, "", next === 0 ? `${window.location.pathname}${window.location.search}` : `#${id}`);
      }
    },
    [last, sections],
  );

  // Track the breakpoint and lock page scrolling while the pager is active.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => {
      setDesktop(mq.matches);
      document.documentElement.classList.toggle("pager", mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      document.documentElement.classList.remove("pager");
    };
  }, []);

  // Open at the panel named in the URL, and follow #hash links to panels.
  useEffect(() => {
    const byHash = (smooth: boolean) => {
      const i = sections.findIndex((s) => s.id === window.location.hash.slice(1));
      if (i < 0) return;
      if (!window.matchMedia(DESKTOP).matches) {
        document.getElementById(sections[i].id)?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
        return;
      }
      if (!smooth) track.current?.classList.add("no-transition");
      go(i);
      requestAnimationFrame(() => requestAnimationFrame(() => track.current?.classList.remove("no-transition")));
    };
    byHash(false);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, window.location.href);
      const i = sections.findIndex((s) => s.id === url.hash.slice(1));
      if (url.pathname !== window.location.pathname || i < 0) return;
      e.preventDefault();
      if (window.matchMedia(DESKTOP).matches) go(i);
      else document.getElementById(sections[i].id)?.scrollIntoView({ behavior: "smooth" });
    };
    const onHash = () => byHash(true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
    };
  }, [go, sections]);

  // Wheel, keys, swipes and focus move between panels on wide screens.
  useEffect(() => {
    if (!desktop) return;
    let locked = false;
    let lastWheel = 0;
    let acc = 0;
    let unlockTimer = 0;

    const step = (dir: number) => {
      const next = indexRef.current + dir;
      if (next < 0 || next > last) return;
      go(next);
      locked = true;
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => (locked = false), SLIDE_MS);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return; // pinch / Ctrl+wheel zooms the map
      e.preventDefault();
      const now = performance.now();
      const quiet = now - lastWheel > 220;
      lastWheel = now;
      // Trackpads keep firing momentum events after a flick: only a fresh gesture can move again.
      if (locked) return;
      if (quiet) acc = 0;
      acc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(acc) < 30) return;
      const dir = Math.sign(acc);
      acc = 0;
      step(dir);
      // Hold the lock until the wheel goes quiet, so one flick moves one panel.
      const waitQuiet = () => {
        if (performance.now() - lastWheel < 220) unlockTimer = window.setTimeout(waitQuiet, 80);
        else locked = false;
      };
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(waitQuiet, SLIDE_MS);
    };

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, select, textarea, .maplibregl-map")) return;
      const next = ["ArrowRight", "ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const prev = ["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if (next || prev) {
        e.preventDefault();
        if (!e.repeat || !locked) step(next ? 1 : -1);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        go(e.key === "Home" ? 0 : last);
      }
    };

    let start: { x: number; y: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      start = (e.target as Element).closest(".maplibregl-map") ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      start = null;
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 50) step(d < 0 ? 1 : -1);
    };

    // Tabbing into a panel that's off screen brings it into view.
    const onFocus = (e: FocusEvent) => {
      const panel = (e.target as Element).closest?.("[data-panel]");
      const i = sections.findIndex((s) => s.id === panel?.id);
      if (i >= 0 && i !== indexRef.current) go(i);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      window.clearTimeout(unlockTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("focusin", onFocus);
    };
  }, [desktop, go, last, sections]);

  return (
    <div
      className="relative lg:h-[calc(100svh-var(--header-h))] lg:overflow-clip"
      style={{ "--index": index } as React.CSSProperties}
    >
      <div ref={track} className="pager-track flex flex-col lg:h-full lg:w-max lg:flex-row">
        {children}
      </div>

      {/* Section rail, wide screens only */}
      <nav aria-label="Sections" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden px-8 pb-4 lg:block">
        <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-4 bg-paper/85 px-4 py-2 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous section"
            className="text-ink transition-opacity disabled:opacity-25"
          >
            ←
          </button>
          <ol className="flex gap-5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`kicker transition-colors hover:text-ink ${i === index ? "text-ink!" : ""}`}
                >
                  <span className="mr-1.5 text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
          <span className="relative h-px flex-1 bg-rule">
            <span
              className="pager-progress absolute inset-y-0 left-0 w-full origin-left bg-ink"
              style={{ transform: `scaleX(${last ? index / last : 1})` }}
            />
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === last}
            aria-label="Next section"
            className="text-ink transition-opacity disabled:opacity-25"
          >
            →
          </button>
        </div>
      </nav>
    </div>
  );
}
