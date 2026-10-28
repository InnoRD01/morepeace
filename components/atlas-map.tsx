"use client";

import { useEffect, useRef, useState } from "react";
import Supercluster, { type ClusterProperties } from "supercluster";
import type { Map as MlMap, Marker, Popup } from "maplibre-gl";
import { formatPeriod, type Case } from "@/lib/cases";
import { flatCountries, graticule } from "@/lib/world";

const MAX_ZOOM = 8;
const colors = { lasting: "#216c31", limited: "#bc1000", none: "#929292" };

type PointProps = { slug: string };
type ClusterProps = { lasting: number; limited: number };

type Props = {
  cases: Case[];
  activeSlug: string | null;
  onActivate: (slug: string | null) => void;
};

export function AtlasMap({ cases, activeSlug, onActivate }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markers = useRef<Marker[]>([]);
  const popup = useRef<Popup | null>(null);
  const [ready, setReady] = useState(false);
  const bySlug = useRef(new Map<string, Case>());
  bySlug.current = new Map(cases.map((c) => [c.slug, c]));
  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;

  // Create the map once.
  useEffect(() => {
    let map: MlMap | undefined;
    let cancelled = false;
    import("maplibre-gl").then((ml) => {
      if (cancelled || !container.current) return;
      ml.setWorkerUrl("/maplibre-gl-worker.mjs");
      libRef.current = ml;
      map = new ml.Map({
        container: container.current,
        center: [20, 15],
        zoom: 1.1,
        minZoom: 0.6,
        maxZoom: MAX_ZOOM,
        renderWorldCopies: false,
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: { compact: true, customAttribution: "Boundaries © Natural Earth" },
        style: {
          version: 8,
          sources: {
            countries: { type: "geojson", data: flatCountries },
            graticule: { type: "geojson", data: { type: "Feature", properties: {}, geometry: graticule } },
          },
          layers: [
            { id: "sea", type: "background", paint: { "background-color": "#efe8da" } },
            {
              id: "graticule",
              type: "line",
              source: "graticule",
              paint: { "line-color": "#d8cdb9", "line-width": 0.6, "line-dasharray": [3, 3] },
            },
            { id: "land", type: "fill", source: "countries", paint: { "fill-color": "#fffcf6" } },
            {
              id: "borders",
              type: "line",
              source: "countries",
              paint: { "line-color": "#b9ad99", "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1.1] },
            },
          ],
        },
      });
      map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      map.scrollZoom.setWheelZoomRate(1 / 300);
      map.on("load", () => setReady(true));
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-cluster and redraw markers whenever the data or the view changes.
  useEffect(() => {
    const map = mapRef.current;
    const ml = libRef.current;
    if (!ready || !map || !ml) return;

    const index = new Supercluster<PointProps, ClusterProps>({
      radius: 42,
      maxZoom: MAX_ZOOM,
      map: (p) => {
        const c = bySlug.current.get(p.slug);
        return { lasting: c?.impact === "Lasting" ? 1 : 0, limited: c?.impact === "Limited" ? 1 : 0 };
      },
      reduce: (acc, p) => {
        acc.lasting += p.lasting;
        acc.limited += p.limited;
      },
    });
    index.load(
      cases.map((c) => ({
        type: "Feature",
        properties: { slug: c.slug },
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      })),
    );

    const showPopup = (lngLat: [number, number], html: HTMLElement) => {
      popup.current?.remove();
      popup.current = new ml.Popup({ offset: 14, maxWidth: "18rem", focusAfterOpen: false }).setLngLat(lngLat).setDOMContent(html).addTo(map);
    };

    const draw = () => {
      for (const m of markers.current) m.remove();
      markers.current = [];
      const zoom = Math.floor(map.getZoom());
      for (const f of index.getClusters([-180, -85, 180, 85], zoom)) {
        const [lng, lat] = f.geometry.coordinates as [number, number];
        const el = document.createElement("button");
        el.type = "button";

        if ("cluster" in f.properties && f.properties.cluster) {
          const { point_count: n, cluster_id: id, lasting, limited } = f.properties as ClusterProperties & ClusterProps;
          const size = Math.round(26 + Math.min(n, 30) * 0.9);
          const a = (lasting / n) * 360;
          const b = a + (limited / n) * 360;
          el.className = "map-cluster";
          el.style.cssText = `width:${size}px;height:${size}px;background:conic-gradient(${colors.lasting} 0 ${a}deg,${colors.limited} ${a}deg ${b}deg,${colors.none} ${b}deg)`;
          el.innerHTML = `<span>${n}</span>`;
          el.setAttribute("aria-label", `${n} cases here. Zoom in.`);
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            const expansion = index.getClusterExpansionZoom(id);
            if (expansion <= MAX_ZOOM) {
              map.easeTo({ center: [lng, lat], zoom: expansion + 0.2 });
            } else {
              // Cases at the same spot never split apart: list them instead.
              const leaves = index.getLeaves(id, Infinity).map((l) => bySlug.current.get(l.properties.slug)!);
              showPopup([lng, lat], popupList(leaves));
            }
          });
        } else {
          const c = bySlug.current.get((f.properties as PointProps).slug)!;
          el.className = "map-pin";
          el.dataset.impact = c.impact ?? "";
          el.dataset.slug = c.slug;
          el.setAttribute("aria-label", c.title);
          el.addEventListener("mouseenter", () => onActivateRef.current(c.slug));
          el.addEventListener("mouseleave", () => onActivateRef.current(null));
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            showPopup([lng, lat], popupList([c]));
          });
        }
        markers.current.push(new ml.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
      }
    };

    draw();
    map.on("zoomend", draw);
    return () => {
      map.off("zoomend", draw);
    };
  }, [cases, ready]);

  // Frame the current results.
  useEffect(() => {
    const map = mapRef.current;
    const ml = libRef.current;
    if (!ready || !map || !ml) return;
    popup.current?.remove();
    if (cases.length === 0) return;
    const bounds = new ml.LngLatBounds();
    for (const c of cases) bounds.extend([c.lng, c.lat]);
    map.fitBounds(bounds, { padding: 60, maxZoom: 4, duration: 700 });
  }, [cases, ready]);

  // Highlight the marker for the case hovered in the list.
  useEffect(() => {
    for (const m of markers.current) {
      const el = m.getElement();
      if (el.dataset.slug) el.dataset.active = String(el.dataset.slug === activeSlug);
    }
  }, [activeSlug, cases, ready]);

  return <div ref={container} className="h-full w-full" aria-label="Map of cases" role="region" />;
}

function popupList(list: Case[]) {
  const root = document.createElement("div");
  root.className = list.length > 1 ? "max-h-64 overflow-y-auto" : "";
  if (list.length > 1) {
    const head = document.createElement("p");
    head.className = "kicker mb-2";
    head.textContent = `${list.length} cases at this location`;
    root.append(head);
  }
  for (const c of list) {
    const a = document.createElement("a");
    a.href = `/cases/${c.slug}`;
    a.className = "group block py-1.5 [&+a]:border-t [&+a]:border-rule";
    const title = document.createElement("span");
    title.className = "block font-serif text-lg font-bold leading-tight text-ink group-hover:text-accent";
    title.textContent = c.title;
    const meta = document.createElement("span");
    meta.className = "mt-1 block text-[11px] text-muted";
    meta.textContent = `${formatPeriod(c)} · ${c.location}${c.impact ? ` · ${c.impact} impact` : ""}`;
    a.append(title, meta);
    root.append(a);
  }
  return root;
}
