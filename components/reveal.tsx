"use client";

import { usePathname } from "next/navigation";
import { Fragment, useEffect } from "react";

/**
 * Adds `is-in` to every `[data-reveal]` element once it scrolls into view; CSS in
 * globals.css does the animating. Mounted once in the root layout.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.15 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    // Catch anything rendered just after navigation.
    const t = window.setTimeout(scan, 300);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}

/** Heading text that rises in word by word when revealed. */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span data-reveal="words" style={{ "--d": delay } as React.CSSProperties}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span aria-hidden className="w" style={{ "--i": i } as React.CSSProperties}>
            <span>{word}</span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}
