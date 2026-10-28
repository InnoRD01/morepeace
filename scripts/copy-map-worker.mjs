// MapLibre resolves its worker relative to its own bundle URL, which breaks once
// bundled. Serve the worker from /public and point MapLibre at it instead.
import { copyFileSync } from "node:fs";

copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre-gl-worker.mjs");
