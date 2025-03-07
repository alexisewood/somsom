mapboxgl.accessToken = 'pk.eyJ1IjoiYWV3NzgiLCJhIjoiY201aW9iZnFvMHh6azJ4cTAwN3NhYjR5cSJ9.nvG2EL1MqPy8U847UHV5gQ'; // Replace with your Mapbox access token

var map = L.map('map', {center: [37.8722721, -122.264747], zoom: 5});

// Use the Mapbox GL JS layer with Leaflet
L.mapboxGL({
    accessToken: mapboxgl.accessToken,
    style: 'mapbox://styles/aew78/cm44uelj6008q01rjhjqga8h2' // Replace with your Mapbox style ID
}).addTo(map);

// loop to add multiple files 
var geojsonFiles = [
  'https://raw.githubusercontent.com/alexisewood/somsom/refs/heads/main/styles/data/AlaskanIndependenceParty1984_32.js',
  'https://raw.githubusercontent.com/alexisewood/somsom/refs/heads/main/styles/data/AmericanRedoubt2011_2.js',
  'https://raw.githubusercontent.com/alexisewood/somsom/refs/heads/main/styles/data/BajaArizona2012_17.js'
];

geojsonFiles.forEach(function(url) {
  L.geoJSON.ajax(url).addTo(map);
});
