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
let currentSidebarLayerId = null;
let highlightedSidebarLayerId = null;

function setSidebarHighlight(layerId, active) {
  if (!layerId) return;

  const lineLayerId = layerId.replace("fill", "line");
  if (active) {
    map.setPaintProperty(layerId, "fill-opacity", 1);
    map.setPaintProperty(lineLayerId, "line-width", 5);
  } else {
    map.setPaintProperty(layerId, "fill-opacity", 0.38);
    map.setPaintProperty(lineLayerId, "line-width", 3);
  }
  highlightedSidebarLayerId = active ? layerId : null;
}

function clearSidebarHighlight() {
  if (highlightedSidebarLayerId) {
    setSidebarHighlight(highlightedSidebarLayerId, false);
  }
}

function isImageUrl(url) {
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(url);
}

function renderArchivePhotos(archivesRaw) {
  if (!Array.isArray(archivesRaw) || archivesRaw.length === 0) {
    return `<p>No archive files available.</p>`;
  }

  return archivesRaw.map(function (a, index) {
    const url = typeof a === "string" ? a : a.url || "";
    const name = typeof a === "string" ? a : a.visible_name || a.name || url;
    if (!url) return "";

    const header = `
      <div class="archive-photo-header">
        <span class="archive-photo-drag-handle" title="Drag to move">☰</span>
        <span class="archive-photo-title">${name}</span>
        <button class="archive-photo-collapse" type="button">Collapse</button>
      </div>
    `;

    if (isImageUrl(url)) {
      return `
        <div class="archive-photo" data-archive-index="${index}">
          ${header}
          <div class="archive-photo-body">
            <img src="${url}" alt="${name}" loading="lazy" />
            <p>${name}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="archive-photo archive-file" data-archive-index="${index}">
        ${header}
        <div class="archive-photo-body">
          <a href="${url}" target="_blank">${name}</a>
        </div>
      </div>
    `;
  }).join("");
}

let archiveDragState = null;

function setupArchivePopupInteractions() {
  const cards = document.querySelectorAll(".archive-popup-content .archive-photo");

  cards.forEach(function (card, index) {
    const startLeft = 30 + (index * 40);
    const startTop = 30 + (index * 40);

    card.style.position = "absolute";
    card.style.left = `${startLeft}px`;
    card.style.top = `${startTop}px`;
    card.dataset.translateX = `${startLeft}`;
    card.dataset.translateY = `${startTop}`;
    card.style.transform = "none";
    card.style.maxWidth = "380px";
    card.style.minWidth = "240px";
    card.style.maxHeight = "70vh";

    const dragHandle = card.querySelector(".archive-photo-drag-handle");
    if (dragHandle) {
      dragHandle.style.touchAction = "none";
      dragHandle.addEventListener("pointerdown", function (event) {
        archiveDragState = {
          card: card,
          startX: event.clientX,
          startY: event.clientY,
          originX: parseFloat(card.dataset.translateX) || 0,
          originY: parseFloat(card.dataset.translateY) || 0
        };
        card.classList.add("dragging");
        dragHandle.setPointerCapture(event.pointerId);
      });
    }

    const collapseBtn = card.querySelector(".archive-photo-collapse");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", function () {
        card.classList.toggle("collapsed");
        collapseBtn.textContent = card.classList.contains("collapsed") ? "Expand" : "Collapse";
      });
    }
  });
}

function updateArchiveDrag(event) {
  if (!archiveDragState) return;

  const dx = event.clientX - archiveDragState.startX;
  const dy = event.clientY - archiveDragState.startY;
  const x = archiveDragState.originX + dx;
  const y = archiveDragState.originY + dy;

  archiveDragState.card.style.left = `${Math.max(0, x)}px`;
  archiveDragState.card.style.top = `${Math.max(0, y)}px`;
  archiveDragState.card.dataset.translateX = x;
  archiveDragState.card.dataset.translateY = y;
}

function endArchiveDrag() {
  if (!archiveDragState) return;
  archiveDragState.card.classList.remove("dragging");
  archiveDragState = null;
}

document.addEventListener("pointermove", updateArchiveDrag);
document.addEventListener("pointerup", endArchiveDrag);

function getFillLayerIdForRowId(rowId) {
  return Object.keys(rowByLayerId).find(function (layerId) {
    return rowByLayerId[layerId].id === rowId;
  });
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
    const id = parseInt(btn.getAttribute("data-id"));
    const row = rows.find(function (r) { return r.id === id; });

    btn.addEventListener("click", function () {
      if (row) showSidebar(row);
    });

    btn.addEventListener("mouseenter", function () {
      const layerId = getFillLayerIdForRowId(id);
      if (layerId) {
        setSidebarHighlight(layerId, true);
      }
    });

    btn.addEventListener("mouseleave", function () {
      const layerId = getFillLayerIdForRowId(id);
      if (layerId) {
        setSidebarHighlight(layerId, false);
      }
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
  const hasArchives = Array.isArray(archivesRaw) && archivesRaw.length > 0;

  document.getElementById("sidebar-content").innerHTML = `
    <h2>${name}</h2>
    ${startYear ? `<p><b>Start year:</b> ${startYear}</p>` : ""}
    ${states ? `<p><b>States involved:</b> ${states}</p>` : ""}
    ${description ? `<p>${description}</p>` : ""}
    ${hasArchives ? `<button id="explore-btn" class="explore-btn">Explore</button>` : ""}
  `;

  // Reset any previous sidebar highlight when switching selection
  clearSidebarHighlight();

  currentSidebarLayerId = getFillLayerIdForRowId(row.id);

  const titleEl = document.querySelector("#sidebar-content h2");
  if (titleEl) {
    titleEl.addEventListener("mouseenter", function () {
      if (currentSidebarLayerId) {
        setSidebarHighlight(currentSidebarLayerId, true);
      }
    });
    titleEl.addEventListener("mouseleave", function () {
      if (currentSidebarLayerId) {
        setSidebarHighlight(currentSidebarLayerId, false);
      }
    });
  }

  if (hasArchives) {
    const exploreBtn = document.getElementById("explore-btn");
    exploreBtn.addEventListener("click", function () {
      showArchivePopup(archivesRaw);
    });
  }

  document.getElementById("sidebar").classList.add("active");
}

function showArchivePopup(archivesRaw) {
  const popup = document.getElementById("archive-popup");
  const popupContent = document.getElementById("archive-popup-content");

  popupContent.innerHTML = renderArchivePhotos(archivesRaw);
  popup.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  setupArchivePopupInteractions();
}

function hideArchivePopup() {
  const popup = document.getElementById("archive-popup");
  popup.classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

document.getElementById("sidebar-close").addEventListener("click", function () {
  document.getElementById("sidebar").classList.remove("active");
  clearSidebarHighlight();
});

const archiveCloseButton = document.getElementById("archive-popup-close");
if (archiveCloseButton) {
  archiveCloseButton.addEventListener("click", function () {
    hideArchivePopup();
  });
}

document.getElementById("archive-popup").addEventListener("click", function (e) {
  if (e.target.id === "archive-popup") {
    hideArchivePopup();
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
