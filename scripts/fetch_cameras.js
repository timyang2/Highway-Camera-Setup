import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import path from 'path';

// Helper to fetch CKAN resources for a given portal
async function fetchCkanResources(baseUrl) {
  const pkgListUrl = `${baseUrl}/action/package_search?rows=1000`;
  const resp = await fetch(pkgListUrl);
  const data = await resp.json();
  if (!data.success) {
    console.error('CKAN request failed', data);
    return [];
  }
  return data.result.results;
}

// Extract camera records from a CKAN package list. This is highly generic – you may need to adjust field names.
function extractCameras(packages) {
  const cameras = [];
  for (const pkg of packages) {
    // Look for resources that look like "camera" and contain lat/lng fields.
    for (const res of pkg.resources) {
      if (res.name && /camera/i.test(res.name) && res.format && /json|geojson/i.test(res.format)) {
        // Assume the resource URL returns a GeoJSON FeatureCollection of cameras.
        cameras.push(res.url);
      }
    }
  }
  return cameras;
}

async function downloadGeojson(url) {
  const resp = await fetch(url);
  return await resp.json();
}

async function main() {
  // List of CKAN portals (Selangor + other states if available). Add more as needed.
  const portals = [
    "https://opendata.selangor.gov.my/api/3",
    // "https://opendata.johor.gov.my/api/3", // example for other states
  ];

  const allFeatures = [];
  for (const portal of portals) {
    console.log(`Fetching packages from ${portal}`);
    const packages = await fetchCkanResources(portal);
    const cameraUrls = extractCameras(packages);
    for (const camUrl of cameraUrls) {
      console.log(`Downloading camera GeoJSON from ${camUrl}`);
      try {
        const geo = await downloadGeojson(camUrl);
        if (geo.type === 'FeatureCollection' && Array.isArray(geo.features)) {
          allFeatures.push(...geo.features);
        } else if (geo.type === 'Feature') {
          allFeatures.push(geo);
        }
      } catch (e) {
        console.error('Failed to download', camUrl, e);
      }
    }
  }

  const merged = {
    type: 'FeatureCollection',
    features: allFeatures,
  };

  const outPath = path.resolve('public', 'cameras.geojson');
  writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`✅ Wrote ${merged.features.length} camera features to ${outPath}`);
}

main().catch((e) => {
  console.error('Unexpected error', e);
  process.exit(1);
});
