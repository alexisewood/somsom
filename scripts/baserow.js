async function fetchBaserowRows() {
  const url = `${CONFIG.BASEROW_API_BASE}/${CONFIG.BASEROW_TABLE_ID}/?user_field_names=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${CONFIG.BASEROW_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Baserow API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

async function fetchGeojsonFromBaserowFile(row) {
  const filename = row[CONFIG.FIELD_NAMES.geojson];

  if (!filename) {
    return null;
  }

  const response = await fetch(`data/geojson/${filename}`);

  if (!response.ok) {
    console.warn(`Could not fetch GeoJSON: ${filename}`);
    return null;
  }

  return await response.json();
}
