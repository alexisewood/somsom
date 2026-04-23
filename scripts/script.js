async function init() {
  try {
    const rows = await fetchBaserowRows();

    console.log("Baserow rows:", rows);

    rows.forEach(async function (row, index) {
      const geojson = await fetchGeojsonFromBaserowFile(row);

      if (geojson) {
        addMovementGeojsonToMap(geojson, row, index);
      }
    });
  } catch (error) {
    console.error("Something went wrong loading the map:", error);
  }
}

map.on("load", init);
