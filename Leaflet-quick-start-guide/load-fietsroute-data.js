var knooppunten = []; // Array of type KnooppuntType
var knooppuntenLoaded = false;
var netwerken = []; // Array of type NetwerkenType
var netwerkenLoaded = false;


// Args: layerName = "knooppunten" | "netwerken"
//		 map = baseMap handle
//		 layerControl = control handle
function initFietsrouteData (layerName, map, layerControl) {
    var mapURL = '`http://geodata.nationaalgeoregister.nl/fietsknooppuntennetwerk/wms';
    mapURL += '?FORMAT=kml';
    mapURL += '&TRANSPARENT=TRUE';
    mapURL += '&SERVICE=WMS';
    mapURL += '&VERSION=1.1.1';
    mapURL += '&REQUEST=GetMap';
    mapURL += '&STYLES=';
    mapURL += '&WIDTH=1047&HEIGHT=1192';
        // ?LAYERS=knooppunten
        // &SRS=EPSG%3A28992
        // &BBOX=77395.905557391,389014.9,79154.865557391,391018.3
    var crs = "&EPSG%3A4236";
    var bounds = map.getBounds();
    var bbox = "&BBOX=" + bounds._southWest.lng + "," + bounds._southWest.lat + "," + bounds._northEast.lng + "," + bounds._northEast.lat;
    var layers = "&LAYERS=" + layerName;
    mapURL += layers + crs + bbox; 


    console.log(mapURL);
    console.log(bounds._southWest.lng);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlDoc = this.responseXML;
            console.log("LOADING all", Boolean(netwerkenLoaded), Boolean(knooppuntenLoaded));
            if ( layerName == "knooppunten") {
                extractKnooppunten(xmlDoc);
                // layerControl.addOverlay(knooppuntenLayerGroup(knooppunten), "My Knooppunt layer");
                editKnooppuntenLayer.addLayer(knooppuntenLayerGroup(knooppunten));
                knooppuntenLoaded = true;
            } else { // layerName == "netwerken"
                extractNetwerken(xmlDoc);
                // layerControl.addOverlay(netwerkenLayerGroup(netwerken), "My Netwerk layer");
                editNetwerkLayer.addLayer(netwerkenLayerGroup(netwerken));
                netwerkenLoaded = true;
            }
        }
    };
    xhttp.open("GET", mapURL, true);
    xhttp.send();
}

function extractKnooppunten (xmlDoc) {
    // A knooppunt section is marked by the "Placemark" tag
    var x = xmlDoc.getElementsByTagName("Placemark");
    for (var i = 0; i < x.length; i++) {
        var name = x[i].getAttribute("id");
        // Tag "name" marks the knooppuntnr
        var knptNr = x[i].getElementsByTagName("name")[0].innerHTML;
        // Tag "coordinates" marks the coordinates
        var knptArr = x[i].getElementsByTagName("coordinates")[0].innerHTML.split(',');
        var pointCoord = L.latLng(knptArr[1], knptArr[0]);
        knooppunten.push(new KnooppuntType(name, knptNr, pointCoord));
        // console.log(knptCoords[1] + ", " + knptCoords[0]);
    }
    // var mydoc = document.getElementById("mapdata");
}


function extractNetwerken (xmlDoc) {
    // Every "Placemark" tag marks a route part
    var x = xmlDoc.getElementsByTagName("Placemark");
    // Store every route part in the "netwerken" array
    for (var i = 0; i < x.length; i++) {
        var netwerkLineString = []; // LineString of netwerken coords
        // Tag "name" marks the netwerk name
        var netwerkName = x[i].getElementsByTagName("name")[0].innerHTML;
        // Tag "Point > coordinates" marks the Point coordinates
        var pointArr = x[i].getElementsByTagName("Point")[0].getElementsByTagName("coordinates")[0].innerHTML.split(',');
        var pointCoord = L.latLng(pointArr[1], pointArr[0]);
        // Tag "LineString > coordinates" marks the route coordinates
        var lineCoordArr = x[i].getElementsByTagName("LineString")[0].getElementsByTagName("coordinates")[0].innerHTML.split(' ');
        // console.log("NETWERKEN", lineCoordArr);
        for (var j = 0; j < lineCoordArr.length; j++) {
            var s = lineCoordArr[j].split(',');
            netwerkLineString.push(L.latLng(s[1], s[0]));
        }
        netwerken.push(new NetwerkenType(netwerkName, pointCoord, netwerkLineString));
        // console.log(knptCoords[1] + ", " + knptCoords[0]);
    }
    // var mydoc = document.getElementById("mapdata");
}
