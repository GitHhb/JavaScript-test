var netwerkK2K = []; // Array of type NetwerkK2K

// Args: type = "knooppunt" | "netwerken"
//       fietsroute: of type FietsrouteType
// Return: updated fietsroute or user message with reason that update is not possible
var addElementToFietsroute = function (type, element, fietsroute) {
    return function (e) {
        fietsroute.addRouteUptoMarker(type, element);
        showMessage(fietsroute.statusMessage);
        toonMijnRoute(htmlMijnRoute);
    }
}

var mouseoverAddElementToFietsroute = function (type, element, fietsroute) {
    return function (e) {
        // if element is in myFietsroute, don't act on mouseover
        if (myFietsroute.contains(element.name)) return;
        fietsroute.copyLastElementFrom(myFietsroute);
        fietsroute.addRouteUptoMarker(type, element);
        showMessage(fietsroute.statusMessage);
        toonMijnRoute(htmlMijnRoute);
    }
}

// Args: id = unique name of element, element.name  
//       fietsroute: of type FietsrouteType
// Return: updated fietsroute or user message with reason that update is not possible
var deleteElementFromFietsroute = function (id, fietsroute) {
    return function (e) {
        fietsroute.delete(id);
        showMessage(fietsroute.statusMessage);
        toonMijnRoute(htmlMijnRoute);
    }
}

var mouseoverDeleteElementFromFietsroute = function (element, fietsroute) {
    return function (e) {
        // if element is in myFietsroute, don't act on mouseover
        if (myFietsroute.contains(element.name)) return;
        fietsroute.deleteAll();
        showMessage(fietsroute.statusMessage);
        toonMijnRoute(htmlMijnRoute);
    }
}

// Create layergroup of knooppunten
// Arg: knooppunten = array of type Knooppunt
function addToKnooppuntenLayerGroup (knooppunten, knptLayerGroup) {
    // create array with knooppunt markers
    var knptMarkers = [];
    for (k in knooppunten) {
        i = knooppunten[k];
        // Create default knooppunt marker
        knptMarkers.push(
            L.marker(i.point, {riseOnHover: true}) //.bindPopup(i.nr + "<br>(" + i.point.lat + ", " + i.point.lng + ")")
        );
        // Create select/deselect button for knooppunt
        knptMarkers.push(
            // L.marker(i.point).bindPopup(i.nr + "<br>(" + i.point.lat + ", " + i.point.lng + ")")
            L.marker(i.point, {icon: L.divIcon({
                iconSize: [12, 12],
                iconAnchor: [14, 65],
                    html: "<b>" + i.nr + "</b>",
                    className: 'markerDivIcon',
                    riseOnHover: true,
                    title: "I'm the title"
            })})
            .bindTooltip(i.nr + " " + i.name + "<br>(" + i.point.lat + ", " + i.point.lng + ")", {
                riseOnHover: true,
                direction: 'top',
                opacity: 0.8,
                offset: [-14, -55],
                className: 'markerTooltip'
            })
            .on('click', addElementToFietsroute("knooppunt", i, myFietsroute))
            .on('contextmenu', deleteElementFromFietsroute(i.name, myFietsroute))
            .on('mouseover', mouseoverAddElementToFietsroute("knooppunt", i, myMouseoverFietsroute))
            .on('mouseout', mouseoverDeleteElementFromFietsroute(i, myMouseoverFietsroute))
        );
    }
    knptLayerGroup.addLayer(L.layerGroup(knptMarkers));
    // return L.layerGroup(knptMarkers);
}

// Arg: netwerken = array of type NetwerkenType
function addToNetwerkenLayerGroup (netwerken, networkLayerGroup) {
    // var networkLayerGroup = L.layerGroup();
    // create array with knooppunt markers
    var netwerkMarkers = [];
    for (n in netwerken) {
        i = netwerken[n];
        networkLayerGroup.addLayer(L.marker(i.point, {icon: L.divIcon({
                    // html: "<i>" + i.name.split('.')[1] + "</i>",
                    className: 'netwerkDivIcon',
                    iconAnchor: [10, 10],
                    riseOnHover: true,
                    title: "I'm the title",
                    offset: [-5, -5]
                })})
            .bindTooltip(
                i.name + "<br>(End1: " + i.coordinateArr[0].lat + ", " + i.coordinateArr[0].lng + ")<br>End2: "
                + i.coordinateArr[i.coordinateArr.length-1].lat + ", " + i.coordinateArr[i.coordinateArr.length-1].lng + ")", {
                    direction: 'top',
                    opacity: 0.8,
                    offset: [5, -5]
                }
            )
            .on('click', addElementToFietsroute("netwerken", i, myFietsroute))
            .on('contextmenu', deleteElementFromFietsroute(i.name, myFietsroute))
            .on('mouseover', mouseoverAddElementToFietsroute("netwerken", i, myMouseoverFietsroute))
            .on('mouseout', mouseoverDeleteElementFromFietsroute(i, myMouseoverFietsroute))
        );
    }
    // return networkLayerGroup;
}


function matchEndPoints () {
    var netwerkMarkers = [];
    var epAll = [];
    var ep = [];
    epAll[0] = []; epAll[1] = []; epAll[2] = []; // all endpoints
    for (var n = 0; n < netwerken.length; n++) {
        var ep = [];
        for (var i = 0; i < knooppunten.length; i++) {
            // look for match at first coord of line
            if ( compareCoord(knooppunten[i].point, netwerken[n].coordinateArr[0]) )  {
                // Input sanity check, we shouldn't already have a first endpoint
                if (netwerken[n].first) console.log("WARNING: double 'first' linepoint found for network: ", netwerken[n].name);
                // console.log("match for ", i.nr);
                ep.push(i);
                netwerken[n].first = i;
            } 
            // look for match at last coord of line
            if ( compareCoord(knooppunten[i].point, netwerken[n].coordinateArr[netwerken[n].coordinateArr.length-1]) )  {
                // Input sanity check, we shouldn't already have a last endpoint 
                if (netwerken[n].last) console.log("WARNING: double 'last' linepoint found for network: ", netwerken[n].name);
                ep.push(i);
                netwerken[n].last = i;
            }
        }
        // console.log("==1> ", "epAll[" + ep.length + "]", "epAll.length: " + epAll.length);
        epAll[ep.length].push(n);
        // console.log("==2> n: ", n);
        // console.log("==3> 0: " + epAll[0].length + " |1:" + epAll[1].length + " |2:" + epAll[2].length + " - " + ep.length);
        if (ep.length == 0) {
            netwerkMarkers.push(L.polyline(netwerken[n].coordinateArr, {color: 'red'})
                .on('click', function () {
                    var myn = netwerken[n];
                    var myk = knooppunten;
                    return function(e){console.log(e, myn.name, myk[myn.first], myk[myn.last]);
                } }()));
            // console.log("#0 Endpoints found: ", n);
        } else if (ep.length == 1) {
            // console.log("#1 Endpoints found: ", n);
            netwerkMarkers.push(L.polyline(netwerken[n].coordinateArr, {color: 'black'})
                .on('click', function () {
                    var myn = netwerken[n];
                    var myk = knooppunten;
                    return function(e){console.log(e, myn.name, myk[myn.first], myk[myn.last]);
                } }()));
                // .on('click', function(e){console.log(netwerken[n].name, netwerken[n].first, netwerken[n].last);}));
        } else if (ep.length == 2) {
            // console.log("#2 Endpoints found: ", n);
            // console.log("==4> MATCH found: ", netwerken[n]);
            netwerkMarkers.push(L.polyline(netwerken[n].coordinateArr, {color: 'blue'})
                .on('click', function () {
                    var myn = netwerken[n];
                    var myk = knooppunten;
                    return function(e){console.log(e, myn.name, myk[myn.first], myk[myn.last]);
                } }()));
                // .on('click', function(e){console.log(netwerken[n].name, netwerken[n].first, netwerken[n].last);}));
        } else {
            console.log("WARNING: More than 2 Endpoints found, this is unexpected, not processing this data.", n);
            // netwerkMarkers.push(L.polyline(n.coordinateArr, {color: 'yellow'}).on('click', function(e){console.log(n.name);}));
        }
    }
    // console.log("Processed all endpoints", "2 endpoints: " + epAll[2].length, "1 endpoint: " + epAll[1].length, "0 endpoint: " + epAll[0].length);
    console.log("==3> 0: " + epAll[0].length + " |1:" + epAll[1].length + " |2:" + epAll[2].length + " - " + ep.length);
    // console.log("==3> 0: " + epAll[0] + " |1:" + epAll[1] + " |2:" + epAll[2] + " - " + ep.length);

    // Construct neterkK2K
    // Try to construct complete netwerk parts fromt knooppunt to knooppunt

    // Add all netwerken with 2 endpoints
    netwerkK2K = epAll[2].slice();
    
    // Try to connect netwerken with 1 endpoint
    for (var i = 0; i < epAll[1].length; i++) {

    }

    console.log(netwerkK2K, epAll[2]);
    // check if open endpoints can be matched
    // for (n of epAll[0]) {
    //     for (i of epAll[1]) {
    //          // look for match
    //         if ( (i.coordinateArr[0].lat == n.coordinateArr[0].lat) && (i.coordinateArr[0].lng == n.coordinateArr[0].lng) )  {
    //             // console.log("match for ", i.nr);
    //             ep.push(i);
    //         } 
    //     }
    // }
    return L.layerGroup(netwerkMarkers);
}

