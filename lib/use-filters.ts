"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { emptyFilters, type Filters } from "@/lib/cases";

/** Filter state kept in the URL query so filtered views can be shared and bookmarked. */
export function useFilters() {
  const params = useSearchParams();

  const filters = useMemo<Filters>(() => {
    const f = { ...emptyFilters };
    for (const key of Object.keys(f) as (keyof Filters)[]) f[key] = params.get(key) ?? "";
    return f;
  }, [params]);

  const setFilters = useCallback(
    (patch: Partial<Filters>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      const qs = next.toString();
      // Native history keeps the #hash and avoids a scroll jump; Next syncs useSearchParams.
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
    },
    [params],
  );

  const clear = useCallback(() => setFilters(emptyFilters), [setFilters]);

  return { filters, setFilters, clear };
}
