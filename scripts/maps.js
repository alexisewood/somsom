mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  style: CONFIG.MAPBOX_STYLE,
  center: [-98.35, 39.5],
  zoom: 3.5
});

map.addControl(new mapboxgl.NavigationControl());

function addMovementGeojsonToMap(geojson, row, index) {
  const fields = CONFIG.FIELD_NAMES;

  const sourceId = `movement-source-${index}`;
  const fillLayerId = `movement-fill-${index}`;
  const lineLayerId = `movement-line-${index}`;

  map.addSource(sourceId, {
    type: "geojson",
    data: geojson
  });

  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-opacity": 0.25
    }
  });

  map.addLayer({
    id: lineLayerId,
    type: "line",
    source: sourceId,
    paint: {
      "line-width": 2
    }
  });

  map.on("click", fillLayerId, function (event) {
    const movementName = row[fields.name] || "Unnamed movement";
    const description = row[fields.description] || "";
    const startYear = row[fields.startYear] || "Unknown";
    const states = row[fields.states] || "";
    const archives = row[fields.archives] || "";

    new mapboxgl.Popup()
      .setLngLat(event.lngLat)
      .setHTML(`
        <div class="popup-title">${movementName}</div>

        <div class="popup-meta">
          <b>Start year:</b> ${startYear}<br>
          <b>States involved:</b> ${states}
        </div>

        <div>${description}</div>

        ${
          archives
            ? `<p><b>Related archives:</b><br>${archives}</p>`
            : ""
        }
      `)
      .addTo(map);
  });

  map.on("mouseenter", fillLayerId, function () {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", fillLayerId, function () {
    map.getCanvas().style.cursor = "";
  });
}
