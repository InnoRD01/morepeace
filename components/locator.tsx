import { geoOrthographic, geoPath } from "d3-geo";
import { graticule, land } from "@/lib/world";

/** Small globe turned to face the case location. Rendered on the server as plain SVG. */
export function Locator({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const size = 240;
  const projection = geoOrthographic()
    .scale(size / 2 - 4)
    .translate([size / 2, size / 2])
    .rotate([-lng, -lat * 0.6])
    .clipAngle(90);
  const path = geoPath(projection);
  const [x, y] = projection([lng, lat]) ?? [size / 2, size / 2];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Globe showing ${label}`} className="w-full max-w-60">
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="#efe8da" stroke="#1a1a1a" strokeWidth={1} />
      <path d={path(graticule) ?? ""} fill="none" stroke="#d8cdb9" strokeWidth={0.6} strokeDasharray="2 2" />
      <path d={path(land) ?? ""} fill="#fffcf6" stroke="#b9ad99" strokeWidth={0.6} />
      <circle cx={x} cy={y} r={14} fill="#bc1000" opacity={0.15} />
      <circle cx={x} cy={y} r={5} fill="#bc1000" stroke="#fffdf9" strokeWidth={2} />
    </svg>
  );
}
