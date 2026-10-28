import { geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, MultiLineString } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

const topo = world as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;

/** Natural Earth 1:110m country outlines. */
export const countries = feature(topo, topo.objects.countries) as FeatureCollection;
export const land = feature(topo, topo.objects.land) as FeatureCollection;

export const graticule: MultiLineString = geoGraticule10();

/**
 * Countries for the flat web map. Rings that cross the antimeridian (Russia, Fiji) are
 * unwrapped east of 180° so they don't smear across the map, and Antarctica is dropped.
 */
export const flatCountries: FeatureCollection = {
  type: "FeatureCollection",
  features: countries.features
    .filter((f) => f.id !== "010")
    .map((f) => {
      if (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") return f;
      const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
      const unwrapped = polygons.map((rings) =>
        rings.map((ring) =>
          ring.some((p, i) => i > 0 && Math.abs(p[0] - ring[i - 1][0]) > 180)
            ? ring.map(([x, y]) => [x < 0 ? x + 360 : x, y])
            : ring,
        ),
      );
      return { ...f, geometry: { type: "MultiPolygon", coordinates: unwrapped } };
    }),
};
