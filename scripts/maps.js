mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  style: CONFIG.MAPBOX_STYLE,
  center: [-98.35, 39.5],
  zoom: 3.5
});

map.addControl(new mapboxgl.NavigationControl());

const fillLayerIds = [];
const rowByLayerId = {};
let currentHighlightLayerIds = null;

function updateHighlight(fillLayerId, isHighlight) {
  if (!fillLayerId) return;
  
  const lineLayerId = fillLayerId.replace("fill", "line");
  if (isHighlight) {
    map.setPaintProperty(fillLayerId, "fill-opacity", 1);
    map.setPaintProperty(lineLayerId, "line-width", 5);
  } else {
    map.setPaintProperty(fillLayerId, "fill-opacity", 0.38);
    map.setPaintProperty(lineLayerId, "line-width", 3);
  }
}

map.on("click", function (e) {
  if (fillLayerIds.length === 0) return;

  const features = map.queryRenderedFeatures(e.point, { layers: fillLayerIds });
  if (features.length === 0) return;

  // Deduplicate by layer id (Mapbox can return multiple features per layer)
  const seen = new Set();
  const uniqueRows = [];
  features.forEach(function (f) {
    if (!seen.has(f.layer.id)) {
      seen.add(f.layer.id);
      uniqueRows.push(rowByLayerId[f.layer.id]);
    }
  });

  if (uniqueRows.length === 1) {
    showSidebar(uniqueRows[0]);
  } else {
    showPicker(uniqueRows);
  }
});

map.on("mousemove", function (e) {
  if (fillLayerIds.length === 0) return;
  const features = map.queryRenderedFeatures(e.point, { layers: fillLayerIds });
  map.getCanvas().style.cursor = features.length > 0 ? "pointer" : "";
});

function showPicker(rows) {
  const fields = CONFIG.FIELD_NAMES;
  const items = rows.map(function (row) {
    const name = row[fields.name] || "Unnamed movement";
    return `<li><button class="picker-btn" data-id="${row.id}">${name}</button></li>`;
  }).join("");

  document.getElementById("sidebar-content").innerHTML = `
    <h2>Multiple movements here</h2>
    <p>Select one:</p>
    <ul class="picker-list">${items}</ul>
  `;
  document.getElementById("sidebar").classList.add("active");

  document.querySelectorAll(".picker-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(btn.getAttribute("data-id"));
      const row = rows.find(function (r) { return r.id === id; });
      if (row) showSidebar(row);
    });
  });
}

function showSidebar(row) {
  const fields = CONFIG.FIELD_NAMES;

  const name = row[fields.name] || "Unnamed movement";
  const description = row[fields.description] || "";
  const startYear = row[fields.startYear];

  const statesRaw = row[fields.states];
  const states = Array.isArray(statesRaw)
    ? statesRaw.map(function (s) { return s.value; }).join(", ")
    : "";

  const archivesRaw = row[fields.archives];
  const archives = Array.isArray(archivesRaw) && archivesRaw.length > 0
    ? archivesRaw.map(function (a) {
        return a.url
          ? `<a href="${a.url}" target="_blank">${a.visible_name || a.url}</a>`
          : a;
      }).join("<br>")
    : "";

  document.getElementById("sidebar-content").innerHTML = `
    <h2>${name}</h2>
    ${startYear ? `<p><b>Start year:</b> ${startYear}</p>` : ""}
    ${states ? `<p><b>States involved:</b> ${states}</p>` : ""}
    ${description ? `<p>${description}</p>` : ""}
    ${archives ? `<p><b>Related archives:</b><br>${archives}</p>` : ""}
  `;

  // Find the layer ID for this row
  currentHighlightLayerIds = Object.keys(rowByLayerId).find(function (layerId) {
    return rowByLayerId[layerId].id === row.id;
  });

  document.getElementById("sidebar").classList.add("active");
}

document.getElementById("sidebar-close").addEventListener("click", function () {
  document.getElementById("sidebar").classList.remove("active");
});

// Attach hover highlight listeners to sidebar
document.getElementById("sidebar").addEventListener("mouseenter", function () {
  if (currentHighlightLayerIds) {
    updateHighlight(currentHighlightLayerIds, true);
  }
});

document.getElementById("sidebar").addEventListener("mouseleave", function () {
  if (currentHighlightLayerIds) {
    updateHighlight(currentHighlightLayerIds, false);
  }
});

function addMovementGeojsonToMap(geojson, row, index) {
  const sourceId = `movement-source-${index}`;
  const fillLayerId = `movement-fill-${index}`;
  const lineLayerId = `movement-line-${index}`;

  const vintagePalette = [
    "#d4b8ff",
    "#f8df7c",
    "#a5c9ff",
    "#ffbdbd",
    "#d9a3ff",
    "#f7e18d",
    "#84b0ff",
    "#ff9cb2",
    "#c3b4ff",
    "#ffe18a",
    "#8cb3ff",
    "#ff9e8c"
  ];
  const fillColor = vintagePalette[index % vintagePalette.length];
  const lineColor = "#264e31";

  map.addSource(sourceId, {
    type: "geojson",
    data: geojson
  });

  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": fillColor,
      "fill-opacity": 0.38,
      "fill-outline-color": lineColor
    }
  });

  map.addLayer({
    id: lineLayerId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": lineColor,
      "line-width": 3,
      "line-opacity": 1,
      "line-join": "round",
      "line-cap": "round"
    }
  });

  fillLayerIds.push(fillLayerId);
  rowByLayerId[fillLayerId] = row;
}
