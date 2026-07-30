// scripts/fetch_cameras.js
// -----------------------------------------------------------------
// This version never calls the external CKAN API.
// It simply copies the static fallback file we added earlier
// (src/data/fallback_cameras.geojson) into the public folder
// so that the app can load /cameras.geojson at runtime.
// -----------------------------------------------------------------

import { readFileSync, writeFileSync } from "fs";
import path from "path";

// Path of the fallback GeoJSON we committed earlier
const fallbackPath = path.resolve("src", "data", "fallback_cameras.geojson");

// Destination where the app expects the file
const outPath = path.resolve("public", "cameras.geojson");

try {
  const data = readFileSync(fallbackPath, "utf-8");
  writeFileSync(outPath, data);
  console.log(`✅  Copied fallback data → ${outPath}`);
} catch (err) {
  console.error("❌  Failed to copy fallback GeoJSON:", err);
  // Exit with a non‑zero code so Netlify knows the build failed
  process.exit(1);
}
