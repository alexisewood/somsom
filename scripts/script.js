mapboxgl.accessToken = 'pk.eyJ1IjoiYWV3NzgiLCJhIjoiY201aW9iZnFvMHh6azJ4cTAwN3NhYjR5cSJ9.nvG2EL1MqPy8U847UHV5gQ'; // Replace with your Mapbox access token

var map = L.map('map', {center: [37.8722721, -122.264747], zoom: 5});

// Use the Mapbox GL JS layer with Leaflet
L.mapboxGL({
    accessToken: mapboxgl.accessToken,
    style: 'mapbox://styles/aew78/cm44uelj6008q01rjhjqga8h2' // Replace with your Mapbox style ID
}).addTo(map);

// Add your markers
var marker = L.marker([37.870778, -122.264747], { title: 'Coastal Redwood', opacity: '0.5' });
marker.addTo(map).bindPopup('I am a <a href="https://www.inaturalist.org/observations/23268282">Coastal Redwood</a>!').openPopup();

var marker2 = L.marker([37.873406, -122.261335], { title: 'Horse-chestnut', opacity: '0.5' });
marker2.addTo(map).bindPopup('I am a <a href="https://www.inaturalist.org/observations/23255961">Horse-chestnut</a>!').openPopup();

var marker3 = L.marker([37.872752, -122.26178], { title: 'Green Ash', opacity: '0.5' });
marker3.addTo(map).bindPopup('I am a <a href="https://www.inaturalist.org/observations/23250509">Green Ash</a>!').openPopup();

var marker4 = L.marker([37.870074, -122.241314], { title: 'Monterey Cypress', opacity: '0.5' });
marker4.addTo(map).bindPopup('I am a <a href="https://www.inaturalist.org/observations/19002343">Monterey Cypress</a>!').openPopup();

var marker5 = L.marker([37.865733, -122.241891], { title: 'Monterey Pine', opacity: '0.5' });
marker5.addTo(map).bindPopup('Welcome to <a href="https://www.inaturalist.org/observations/18095284">Monterey Pine</a>!').openPopup();

var marker6 = L.marker([37.873187, -122.246902], { title: 'Dwarf Popcornflower', opacity: '0.5' });
marker6.addTo(map).bindPopup('I am a <a href="https://www.inaturalist.org/observations/10797526">Drawf Popcornflower</a>!').openPopup();

var marker7 = L.marker([37.874145, -122.252344], { title: 'Oakland Mariposa Lily', opacity: '0.5' });
marker7.addTo(map).bindPopup('I am a <a href="https://www.inaturalist.org/observations/3143988">Oakland Mariposa Lily</a>!').openPopup();
