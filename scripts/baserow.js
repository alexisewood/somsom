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
  const geojsonField = CONFIG.FIELD_NAMES.geojson;
  const files = row[geojsonField];

  if (!files || files.length === 0) {
    console.warn("No GeoJSON file attached for row:", row);
    return null;
  }

  const geojsonUrl = files[0].url;

  const response = await fetch(geojsonUrl);

  if (!response.ok) {
    throw new Error(`Could not fetch GeoJSON file: ${geojsonUrl}`);
  }

  return await response.json();
}
