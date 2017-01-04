var mymap;
var mycontrol; // The base layer
var knooppuntLayer; // pdok marker layer
// myFietsroute contains the fietsroute parts
// consecutive array elements must have matching coordinates  
// var myFietsroute = []; // Array of MyFietsrouteType
var myFietsroute = new FietsrouteType; // Array of MyFietsrouteType


var messageTag = document.getElementById("message");
function showMessage(message) {
    messageTag.innerHTML = message;
}

// Define map and layers

var baselayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
});

// If initial value of zoom too low then no kml data will be loaded 
mymap = L.map('mapid', {
    center: [51.497469, 4.271493],
    zoom: 12,
    layers: [baselayer]
});

// L.marker([51.5, 4.19]).addTo(mymap)
// 	.bindPopup("<b>Hello world!</b><br />I am a popup."); //.openPopup();

var emptyLayer = L.tileLayer('');
// knooppuntLayer = L.marker();
// knooppuntLayer = L.layerGroup([L.marker([51.49728786029085, 4.283883498524014]).bindPopup("hoi")]); //.addLayer(knooppuntLayer);
// knooppuntLayer = L.marker([51.49728786029085, 4.283883498524014]);
// knooppuntLayer = L.layerGroup([markerX]);

// officiele knooppunten
var wmsKnooppuntLayer = L.tileLayer.wms('https://geodata.nationaalgeoregister.nl/fietsknooppuntennetwerk/ows?', {
    layers: 'knooppunten',
    format: 'image/png',
    transparent: true,
}).addTo(mymap);

// officieel netwerk
var wmsNetwerkLayer = L.tileLayer.wms('https://geodata.nationaalgeoregister.nl/fietsknooppuntennetwerk/ows?', {
    layers: 'netwerken',
    format: 'image/png',
    transparent: true,
}).addTo(mymap);

var editKnooppuntenLayer = new L.LayerGroup().addTo(mymap); // Layer to edit knooppunten 
var editNetwerkLayer = new L.LayerGroup().addTo(mymap); // Layer to edit netwerk
var myFietsrouteLayer = new L.LayerGroup().addTo(mymap); // Layer with all parts for my own fietsroute
editKnooppuntenLayer.setZIndex(800);

var baseMaps = {
    "Basismap": baselayer,
    "No maps": emptyLayer
}

var overlayMaps = {
    "Officiele Netwerken"   : wmsNetwerkLayer,
    "Officiele Knooppunten" : wmsKnooppuntLayer,
    "Edit knooppunten"      : editKnooppuntenLayer,
    "Edit netwerken"        : editNetwerkLayer,
    "Mijn Fietsroute"       : myFietsrouteLayer
    // "Knooppunten": knooppuntLayer
}

var mycontrol = L.control.layers(baseMaps, overlayMaps).addTo(mymap);
// L.layerGroup([L.marker([51.49728786029085, 4.284883498524014]).bindPopup("nieuw")]).addLayer(knooppuntLayer).addTo(mymap);

// initFietsrouteData("knooppunten", mymap, mycontrol);
initFietsrouteData("knooppunten", mymap, editKnooppuntenLayer);
// initFietsrouteData("netwerken", mymap, mycontrol);
initFietsrouteData("netwerken", mymap, editNetwerkLayer);

// mymap.on('viewreset', function (e) {console.log("View was reset")});
// mymap.on('zoomend', function (e) {console.log("View was zoom ended")});
mymap.on('moveend', function (e) {
    console.log("View was move ended");
    // Don't load map data for large zoom levels as this requires too many data
    if (mymap.getZoom() < 12) return;
    initFietsrouteData("knooppunten", mymap, editKnooppuntenLayer);
    initFietsrouteData("netwerken", mymap, editNetwerkLayer);
    myFietsrouteLayer.setZIndex(800);
});

// console.log(xtd);
// mycontrol.addOverlay(xtd, "2e knooppunten");
// mycontrol.addLayer(initFietsrouteData(), "knoop");

// // Convenience method: show coordinates of map location when map is clicked
// function onMapClick(e) {
// 	L.popup()
// 		.setLatLng(e.latlng)
// 		.setContent("Coordinaten:<br>" + e.latlng.toString())
// 		.openOn(mymap);
// }
// mymap.on('click', onMapClick);

// Implement "Toon route" button
htmlMijnRoute = document.getElementById("mijn-route");
htmlMijnRoute.innerHTML = "Initializing...";


toonMijnRoute(htmlMijnRoute);
