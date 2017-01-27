// Knooppunten
// Data obtained from layer "knooppunten" 
// Knooppunt type delcaration
function KnooppuntType (name, nr, point, description) {
    this.name = name; // knooppunt name | according to Placemark id attribute
    this.nr = nr;
    this.point = point; // type L.latLng
    this.description = description; // description exactly as in description tag of data file
}

// ___________________________________________________________________________________________
// Netwerk onderdelen
// Data obtained from layer "netwerken"
// Netwerken type declaration
function NetwerkenType (name, point, coordinateArr, description) {
    this.name = name;   // network name | from kml file
    this.point = point; // type L.latLng, | denotes the network location, from kml file
    this.coordinateArr = coordinateArr; // Array of L.latLng | coordinates for this route part (polyline), from kml file
    this.first = null; // index to knooppunten array | knooppunt corresponding to first route coords, coordinateArr[0], computed
    this.last = null; // index to knooppunten array | knooppunt corresponding to last route coords, coordinateArr[length-1], computed
    this.description = description; // description exactly as in description tag of data file
}

// Arg: latlng of type L.latLng
    NetwerkenType.prototype.matchCoord = function (latlng) {
    return compareCoord(this.coordinateArr.first(), latlng)
        || compareCoord(this.coordinateArr.last(), latlng); 
}

// function getHashIndex (toIndex) {
//     return toIndex.toString(20);
// }

// create associative array of netwerken, so we can easily match route coords
createNetwerkenHash = function (netwerken) {
    var netwerkenHash = {};
    for (let i = 0; i < netwerken.length; i++ ) {
        // INIT fields: first and last
        netwerken[i].first = netwerken[i].coordinateArr[0];
        netwerken[i].last = netwerken[i].coordinateArr[netwerken[i].coordinateArr.length-1];
        if (typeof netwerkenHash[netwerken[i].first.toString(20)] == 'undefined' )
            netwerkenHash[netwerken[i].first.toString(20)] = [ netwerken[i] ];
        else
            netwerkenHash[netwerken[i].first.toString(20)].push( netwerken[i] );
        if (typeof netwerkenHash[netwerken[i].last.toString(20)] == 'undefined' )
            netwerkenHash[netwerken[i].last.toString(20)] = [ netwerken[i] ];
        else
            netwerkenHash[netwerken[i].last.toString(20)].push( netwerken[i] );
        // netwerkenH[netwerken[i].last.toString()].push( netwerken[i] );
            // // index element first should be lexicographically < index element last
            // if (netwerken[i].first.toString() > netwerken[i].last.toString()) {
            //     // swap first and last
            //     let tmp =  netwerken[i].first;
            //     netwerken[i].first = netwerken[i].last;
            //     netwerken[i].last = tmp;
            // }
            // // now lexicographically first < last 
            // netwerkenH[netwerken[i].first.toString() + netwerken[i].last.toString()] = netwerken[i];
    }
    return netwerkenHash;
}

// ___________________________________________________________________________________________
// Netwerk parts from knooppunt to knooppunt
// Constructed by us
// NeterkK2K type declaration
function NetwerkK2K () {
    this.first = null; // index to knooppunten array | knooppunt corresponding to first route coords, coordinateArr[0], computed
    this.last = null; // index to knooppunten array | knooppunt corresponding to last route coords, coordinateArr[length-1], computed
    this.netwerkenArr = []; // Array of indexes to array netwerken 
}

    // ___________________________________________________________________________________________
/*    function MyFietsrouteType (type, index) {
        this.type = type;      // "netwerken" || "knooppunt"
        // index points to a part of the fietsroute:
        //   if this.type = "netwerken" => netwerken[this.index]
        //   if this.type = "knooppunt" => knooppunten[this.index] 
        this.index = index;
    }
*/

var iconOrange = L.icon({
    iconUrl: 'Image/marker-icon-orange.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [-3, -76],
    // shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
}); 

var iconFietsrouteStart = L.icon({
    iconUrl: 'Image/marker-icon-start-azure.png',
    // iconSize: [48, 48],
    // iconAnchor: [24, 48],
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    popupAnchor: [-3, -76],
    // shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
}); 

var iconFietsrouteFinish = L.icon({
    iconUrl: 'Image/marker-icon-finish-flag-azure.png',
    iconSize: [48, 48],
    iconAnchor: [48, 48],
    // iconSize: [64, 64],
    // iconAnchor: [32, 64],
    popupAnchor: [-3, -76],
    // shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
}); 

function FietsrouteElement (type, element, layer, startPoint, endPoint, cumLength) {
    this.type = type;      // "netwerken" || "knooppunt"
    this.element = element; // type of element is this.type

    // ========== Init this.layer 
    // Id of leaflet layer object used in myFietsroute
    if (layer != null)
        // layer already defined
        this.layer = layer;
    else {
        if ( type == "knooppunt" ) 
            this.layer = L.marker(element.point, {icon: iconOrange/*, zIndexOffset: 1000*/});
        else // type == "netwerken"
            this.layer = L.polyline( element.coordinateArr, {color: 'orange'} );
    }
    
    // ========== Init this.startPoint & this.endPoint
    // for element of type "knooppunt": startPoint and endPoint are the marker locations
    // or null of the marker is at the beginning or end of the route
    // if (type == "knooppunt") {
    //     this.startPoint = this.endPoint = element.point;
    // } else { // element == "netwerken"
    this.startPoint = startPoint || null; // type L.latLng | startpoint of this element
    this.endPoint = endPoint || null; // type L.latLng | endpoint of this element
    // }

    this.cumLength = cumLength || 0; // length of fietsroute, cumulative to previous elements in route
}

// Create deep clone of 'this' FietsrouteElement
FietsrouteElement.prototype.deepClone = function () {
    var f = new FietsrouteElement(this.type, this.element, this.layer, this.startPoint, this.endPoint, this.cumLength);
    return f;
}

// Check if "this" FietsrouteElement matches with "matchCoords"
// Used to check if an element fits onto the existing route and compute the new coords to which the next element should fit
// Arg: element: of type FietsrouteElement, new element to be checked
// Return:  canAdd: boolean, indicating whether adding is possible
//          if (canAdd and element is added), these elements have valid values:
//          startPoint: L.latlng, startpoint of this routeElement
//          endPoint  : L.latlng, endpoint of this routeElement == new value for this.matchCoords
//          Note: for "knooppunt" => startPoint == endPoint
FietsrouteElement.prototype.matches = function (matchCoords) {
    var canAdd = false;
    var startPoint = L.latLng(0, 0);
    var endPoint   = L.latLng(0, 0);
    // var lastElement = this;
    var routeElement = this;
    if (routeElement.type == "knooppunt") {
        canAdd = compareCoord(matchCoords, routeElement.element.point);
        // new matchCoords are the coords of the new "knooppunt"
        startPoint = routeElement.element.point;
        endPoint   = routeElement.element.point;
    } else { // if (routeElement.type == "netwerken") {
        if ( canAdd = compareCoord(matchCoords, routeElement.element.coordinateArr.first()) ) {
            startPoint = routeElement.element.coordinateArr.first();
            endPoint   = routeElement.element.coordinateArr.last();
        } else if ( canAdd = compareCoord(matchCoords, routeElement.element.coordinateArr.last()) ) {
            startPoint = routeElement.element.coordinateArr.last();
            endPoint   = routeElement.element.coordinateArr.first();
        }
    }
    return {canAdd: canAdd, startPoint: startPoint, endPoint: endPoint};
}

// Compute length of 'this' FietsrouteElement
// Return value: the length (0 for a "knooppunt" per definition)
FietsrouteElement.prototype.computeLength = function () {
    if (this.type == "knooppunt") {
        // length of "knooppunt" = 0
        return 0;
    }
    return this.element.coordinateArr.reduce(
        (len, curVal, curI, arr) => len + (curI === 0 ? 0 : arr[curI-1].distanceTo(curVal)), 0);
}

// myFietsroute contains the fietsroute parts
// consecutive array elements must have matching coordinates  
function FietsrouteType () {
    this.layer = L.layerGroup(); // Leaflet layer containing the fietsroute
    this.fietsroute = []       ; // Array of FietsrouteElement
    this.statusMessage = ""    ; // String with status info of performed operation
    this.matchCoords = null    ; // type L.Latlng | Coords of last element that not match an element yet, a new element must match these
    this.defaultIconProps = {icon: iconOrange/*, zIndexOffset: 1000*/};
    this.startIconProps = {icon: iconFietsrouteStart};
    this.finishIconProps = {icon: iconFietsrouteFinish};
    this.lineColorProps = {color: 'orange'};
}

FietsrouteType.prototype.layerFactoryDISABLED = function (type, element) {
    var knptOrLine = null;
    if (type == "knooppunt") {
        if (this.fietsroute.length == 0) {
            // first element of route => use start icon
            knptOrLine = L.marker(element.point, this.startIconProps);
        } else {
            // this element will be added to the end of the route => use finish icon
            knptOrLine = L.marker(element.point, this.finishIconProps);
        }
    } else if (type == "netwerken") {
        knptOrLine = L.polyline( element.coordinateArr, this.lineColorProps);
    }
    return knptOrLine;
}

// elementType = "knooppunt" | "netwerken"
// for elementType "knooppunt": iconType = "start" | "finish" | "default"
// for elementType "netwerken": iconType is ignored
// element = KnooppuntType | NetwerkenType
FietsrouteType.prototype.layerFactory = function (elementType, element, iconType) {
    var knptOrLine = null;
    if (elementType == "knooppunt") {
        // if (this.fietsroute.length == 0) {
        // } else {
        switch (iconType) {
            case "start":
                knptOrLine = L.marker(element.point, this.startIconProps);
                break;
            case "finish":
                knptOrLine = L.marker(element.point, this.finishIconProps);
                break;
            default:
                knptOrLine = L.marker(element.point, this.defaultIconProps);
        }
    } else if (elementType == "netwerken") {
        knptOrLine = L.polyline( element.coordinateArr, this.lineColorProps);
    }
    return knptOrLine;
}

// Add a new MyFietsrouteElement element to the fietsroute, only if the coords of the last element match with those of the new element
// Arg: type = "knooppunt" | "netwerken"
//      knpOrNet = KnooppuntType | NetwerkenType
//      layer = Marker | Polyline element
//      noLayer = boolean, do not add elements to myFietsrouteLayer, used for testing different routes
// Return: if is added "new length of array" else "-1"
FietsrouteType.prototype.add = function (type, knpOrNet, noLayer) {
    if (typeof noLayer === 'undefined') noLayer = false;
    var returnVal;
    var canAdd = false;
    var newMatchCoords;
    var newFietsrouteElement = new FietsrouteElement(type, knpOrNet, null, this.matchCoords);
    // newFietsrouteElement.layer = this.layerFactory(type, knpOrNet);
    this.statusMessage = " ";
    // Is this a new fietsroute?
    if (this.fietsroute.length == 0) {
        // A fietsroute must start with a "knooppunt"
        if (type == "knooppunt") {
            newFietsrouteElement.layer = this.layerFactory(type, knpOrNet, "start");
            this.statusMessage = "Start knooppunt toegevoegd."
            // newFietsrouteElement.layer = L.marker(knpOrNet.point, {icon: iconFietsrouteStart, zIndexOffset: 1000});
            newMatchCoords = knpOrNet.point;
            newFietsrouteElement.endPoint = knpOrNet.point;
            // newFietsrouteElement.layer = L.marker(knpOrNet.point, {icon: iconRed, zIndexOffset: 1000});
            canAdd = true;
        } else { // first element not a knooppunt
            this.statusMessage = "Selecteer een knooppunt als startpunt van de route.";
            return -1;
        }
    } else { // length > 0 => check if coords of last element of fietsrouteArr match with "this.matchCoords"
        // don't add if new element is same as last route element
        if (this.fietsroute.last().element.name == knpOrNet.name) {
            this.statusMessage = "<b>Let op</b>: het nieuwe knooppunt of netwerkdeel mag niet gelijk zijn aan het laatste element van de route";
            return -1;
        } 
        // canAdd = this.fietsroute.last().matches(this.fietsroute.last().element);
        returnVal = newFietsrouteElement.matches(this.matchCoords);
        // returnVal = this.matches(newFietsrouteElement);
        canAdd = returnVal.canAdd;
        newMatchCoords = returnVal.endPoint;
        newFietsrouteElement.startPoint = returnVal.startPoint;
        newFietsrouteElement.endPoint = returnVal.endPoint;
        newFietsrouteElement.cumLength = this.fietsroute.last().cumLength + newFietsrouteElement.computeLength();
        newFietsrouteElement.layer = this.layerFactory(type, knpOrNet, "finish");
    }
    if (canAdd) {
        this.matchCoords = newMatchCoords;
        this.statusMessage = type + " deel toegevoegd";
        // if (! noLayer) {myFietsrouteLayer.addLayer(newFietsrouteElement.layer);}
        if (! noLayer) {
            // if previous element was knooppunt then update icon
            if (this.fietsroute.length > 1 && this.fietsroute.last().type == "knooppunt") {
                console.log("update layer: move flag");
                // this.layer.removeLayer(this.fietsroute.last().layer);
                this.updateLayer(this.fietsroute.length - 1, "default");
                // this.layer.addLayer(this.layerFactory("knooppunt", this.fietsroute.last().element));
            }
            this.layer.addLayer(newFietsrouteElement.layer);
        }
        return this.fietsroute.push(newFietsrouteElement);
    }
    else {
        this.statusMessage = "Selecteer een knooppunt of netwerkdeel dat aan de bestaande route aansluit";
        return -1;
    }
}

// Try to auto-complete the route as follows:
// First try FietsrouteType.prototype.add.
// If no success, then:
// if a marker is selected, and one "netwerken" element is in between the knpOrNet element and the last fietsroute element,
// also add the missing "netwerken" element
// Arg: type = "knooppunt" | "netwerken"
//      knpOrNet = KnooppuntType | NetwerkenType
FietsrouteType.prototype.addRouteUptoMarkerORG = function (type, knpOrNet) {
    var retval;
    // if the knpOrNet directly fits onto the existing route, we're done
    if ( (retval = this.add(type, knpOrNet)) > 0) {
        return retval;
    }
    // if the knpOrNet we're adding is of type "netwerken", don't try to find a route => stop
    if (type == "netwerken") 
        return retval;
    // the new knpOrNet does not fit directly,
    // so try to find a route that connects this marker with the rest of the route
    // Check if a "netwerken" element matches the last added element 
    // create a fietsroute for testing different routes (do not add to layer)
    var newroute = new FietsrouteType();
    // newroute.add( myFietsroute.fietsroute.last().type, myFietsroute.fietsroute.last().element, true);
    newroute.copyLastElementFrom(this);
    for (let i = 0; i < netwerken.length; i++) {
        // element is of type "knooppunt", do a dryrun add to check if this "netwerken" element can be added
        if (newroute.add("netwerken", netwerken[i], true) > 0) {
            if (newroute.add("knooppunt", knpOrNet, true) > 0) {
                // Match found, add elements to "this"
                for (let j = 1; j < newroute.fietsroute.length; j++)
                    retval = this.add(newroute.fietsroute[j].type, newroute.fietsroute[j].element);
                return retval;
            } // no match, remove last added element
            newroute.deleteLastWithLayer();
        }
    }
    // if (this.fietsroute.last().element.type == "netwerken") {
    //     return retval;
    // }  
}

// Arg: type = "knooppunt" | "netwerken"
//      knpOrNet = KnooppuntType | NetwerkenType
FietsrouteType.prototype.addRouteUptoMarker = function (type, knpOrNet) {
    var tryRoute = new FietsrouteType(); // used to try possible routes
    tryRoute.layer = this.layer;
    tryRoute.lineColorProps = {color: 'red', dashArray: "8, 8", weight: 2};
    var retval;
    var shortestRoute = new FietsrouteType(); // shortest route we found

    
        // var cnt = 0;
        // for (let i in netwerkenH) {
        //     console.log(i + " ==> " + netwerkenH[i].length);
        //     cnt++;
        // }
        // console.log("LENGTH ==> " + cnt)
        // console.log("KNOOPPUNT: ", knpOrNet.nr);
        // console.log("VALUE ", netwerkenH[knpOrNet.point.toString(20)]);
        // for (let i in netwerkenH[knpOrNet.point.toString(20)])
        //     console.log(i);
        // // return;

    // Find shortest route from "route" to "knpOrNet"
    // FietsrouteType route: route found so far
    // Integer maxdistance : maximum for new route we are searching for
    function createRouteTo(route, maxdistance) {
        // // Just show route for debugging
        // if (route.fietsroute.length > 0) {
        //      console.log("==== TRYING => ", route.fietsroute.last().cumLength, maxdistance.len);
        //      let txt = route.fietsroute.reduce( (txt, a) => txt += a.element.name + " - ",  "==== Route  => ");
        //      console.log(txt);
        // }

        // check if we found a route upto "knpOrNet"
        var retval;
        if ( (retval = route.add(type, knpOrNet, false)) > 0) {
            console.log("Route found, distance: " + route.fietsroute.last().cumLength);
            // if route too long skip
            if (route.fietsroute.last().cumLength > maxdistance) {
                route.deleteLast();
                return -1;
            }
            // shortest route to knpOrNet found
            // save route
            shortestRoute.deleteAll();
            copyFietsroute(0, route, shortestRoute);
            // set length of shortest route
            maxdistance.len = route.fietsroute.last().cumLength;
            console.log("FOUND length: " + maxdistance.len, shortestRoute);
            // return length
            return maxdistance.len;
        } else {
            // check all matching "netwerken" parts
            // console.log("TRY branches: ", netwerkenH[route.matchCoords.toString(20)]);
            for (let i = 0; i < netwerkenH[route.matchCoords.toString(20)].length; i++) {
                // if the route already passed this point, stop to prevent looping
                if (route.contains(netwerkenH[route.matchCoords.toString(20)][i].name)) {
                    // skip this element
                    continue;
                }
                if (route.add("netwerken", netwerkenH[route.matchCoords.toString(20)][i], false) < 0) {
                    console.log("Unexpected error in createRouteTo");
                    continue;
                }
                // successfully added route element
                if (route.fietsroute.last().cumLength < maxdistance.len) {
                    let newlen = createRouteTo(route, maxdistance);
                    wait(500);
                    // if (newlen >= 0)
                    //     return retval;
                }
                // route.deleteLast();
                route.deleteLastWithLayer();
            }
            return maxdistance.len;
        }
    }

    // Add elements from array "routeFrom.fietsroute" starting at "fromIndex" to end of "routeTo.fietsroute"
    function copyFietsroute(fromIndex, fromRoute, toRoute) {
        for (let j = fromIndex; j < fromRoute.fietsroute.length; j++)
            toRoute.add(fromRoute.fietsroute[j].type, fromRoute.fietsroute[j].element);
    }

    if (this.fietsroute.length == 0) {
        // no previous route yet, just add the selected element
        return this.add(type, knpOrNet, false);
    }
    // there is an existing route
    // route should not be longer then 5 * direct distance from existing route to knpOrNet
    var maxDist = {len: (this.fietsroute.length == 0
                         ? 10
                         : this.fietsroute.last().element.point.distanceTo(knpOrNet.point) * 4
                        )
                  }

    tryRoute.copyLastElementFrom(this);

    var length = createRouteTo(tryRoute, maxDist);
    if (length == 0 ) {
        // length == 0 ==> no selected route yet, now add first knooppunt to route
        console.log("Route found");
        console.log("=====================================");
        // Match found, add elements to "this"
        copyFietsroute(0, shortestRoute, this);
    } else if (length > 0) {
        // route found
        console.log("Route found");
        console.log("=====================================");
        // Match found, add elements to "this"
        copyFietsroute(1, shortestRoute, this);
    } else {
        console.log("NO route  found");
    } 

    return retval;
    
    
    // the new knpOrNet does not fit directly,
    // so try to find a route that connects this marker with the rest of the route
    // Check if a "netwerken" element matches the last added element 
    // create a fietsroute for testing different routes (do not add to layer)
    var newroute = new FietsrouteType();
    // newroute.add( myFietsroute.fietsroute.last().type, myFietsroute.fietsroute.last().element, true);
    newroute.copyLastElementFrom(this);
    for (let i = 0; i < netwerken.length; i++) {
        // element is of type "knooppunt", do a dryrun add to check if this "netwerken" element can be added
        if (newroute.addRouteUptoMarker("netwerken", netwerken[i], true) > 0) {
            if (newroute.add("knooppunt", knpOrNet, true) > 0) {
                // Match found, add elements to "this"
                for (let j = 1; j < newroute.fietsroute.length; j++)
                    retval = this.add(newroute.fietsroute[j].type, newroute.fietsroute[j].element);
                return retval;
            } // no match, remove last added element
            newroute.deleteLastWithLayer();
        }
    }
    // if (this.fietsroute.last().element.type == "netwerken") {
    //     return retval;
    // }  
}

// Remove all FietsrouteElement-s from the fietsroute array starting from
// the element with id this.name, if multiple matches the last match is taken
// Return value: # of elements deleted
FietsrouteType.prototype.deleteDISABLED = function (name) {
    // update this.matchCoords
    // compute this.matchCoords, last element of fietsroute will become the new element to match
    var routeLength = this.fietsroute.length;
    // for (var i = 0; i < routeLength; i++) {
    //     if ( this.fietsroute[i].element.name == name ) 
    //         break;
    // }
    var i = this.findLastIndex(name);
    // element not found
    if ( i < 0 )
        return i; 
    // if (i >= routeLength)
    //     return 0;
    // element found, delete element and all following elements
    // first update status message before element containing the info we need is deleted
    this.statusMessage = "Route vanaf " +
        (this.fietsroute[i].type == "knooppunt"
            ? "knooppunt " + this.fietsroute[i].element.nr
            : this.fietsroute[i].element.name
        )
        + " verwijderd";
    // start at end, so we can keep count of this.matchCoords
    for (var j = routeLength - 1; j >= i; j--) {
        // update layer with fietsroute
        // myFietsrouteLayer.removeLayer(this.fietsroute.last().layer);
        this.removeElementFromLayer(this.fietsroute.last());
        // remove last element from fietsroute
        this.fietsroute.pop();
    }
    // if remaining route has minimal 1 element perform administrative tasks
    if (i > 0)
        // set this.matchCoords 
        this.matchCoords = this.fietsroute.last().endPoint;
        // update marker icon
        if (this.fietsroute.length > 1 && this.fietsroute.last().type == "knooppunt") {
            console.log("DELETE update layer: move flag");
            // this.layer.removeLayer(this.fietsroute.last().layer);
            // this.removeElementFromLayer(this.fietsroute.last());
            // this.fietsroute.last().layer = this.layerFactory("knooppunt", this.fietsroute.last().element);
            this.layer.addLayer(this.layerFactory("knooppunt", this.fietsroute.last().element, "finish"));
        }

    // return nr of deleted elements
    return routeLength - i;
}

// Delete route from end up to last occurrence of element with name equal to name
FietsrouteType.prototype.delete = function (name) {
    // update this.matchCoords
    // compute this.matchCoords, last element of fietsroute will become the new element to match
    var routeLength = this.fietsroute.length;
    var i = this.findLastIndex(name);
    if ( i < 0 )
    // element not found
        return i; 
    // element found, delete element and all following elements
    // first update status message before element containing the info we need is deleted
    if (typeof this.fietsroute[i].type == 'undefined' ) debugger;
    this.statusMessage = "Route vanaf " +
        (this.fietsroute[i].type == "knooppunt"
            ? "knooppunt " + this.fietsroute[i].element.nr
            : this.fietsroute[i].element.name
        )
        + " verwijderd";
    // start at end, so we can use deleteLastWithLayer
    for (var j = routeLength - 1; j >= i; j--) {
        // update layer with fietsroute
        this.deleteLastWithLayer();
    }

    // return nr of deleted elements
    return routeLength - i;
}

FietsrouteType.prototype.removeElementFromLayer = function (element) {
    if (typeof element == 'undefined' || element.layer == null) return;
    // myFietsrouteLayer.removeLayer(element.layer);
    this.layer.removeLayer(element.layer);
}

FietsrouteType.prototype.deleteAll = function () {
    // if (this.fietsroute.length > 0) {
    //     this.delete(this.fietsroute[0].element.name);
    // }
    this.fietsroute = [];
    this.layer.clearLayers();
    this.statusMessage = "Fietsroute verdwijderd."
}

FietsrouteType.prototype.deleteLastDISABLED = function () {
    if (this.fietsroute.length > 0) {
        this.delete(this.fietsroute.last().element.name);
    }
}

FietsrouteType.prototype.deleteLast = function () {
    if (this.fietsroute.length == 0) return 0;
    // remove last element from fietsroute
    this.fietsroute.pop();
    this.matchCoords = this.fietsroute.last().endPoint;
    return 1;
}

FietsrouteType.prototype.deleteLastWithLayer = function () {
    if (this.fietsroute.length == 0) return 0;
    // the route contains at least one  element
    this.removeElementFromLayer(this.fietsroute.last());
    this.deleteLast();
   
    // if remaining route has minimal 1 element perform administrative tasks
    if (this.fietsroute.length > 0)
        // update marker icon
        if (this.fietsroute.length > 1 && this.fietsroute.last().type == "knooppunt") {
            console.log("DELETE update layer: move flag");
            this.updateLayer(this.fietsroute.length - 1, "finish");
        }

    // return nr of deleted elements
    return 1;
}

FietsrouteType.prototype.updateLayer = function (index, iconType) {
    this.removeElementFromLayer(this.fietsroute[index]);
    var newlayer =  this.layerFactory(
        this.fietsroute[index].type, this.fietsroute[index].element, iconType);
    this.layer.addLayer(newlayer);
    this.fietsroute[index].layer = newlayer;
}

// Create deep clone of last Element of route and add it to end of the fietsroute of 'this'
// Also copy status info, but don't copy layer (as this is closely related to the fietsroute)
FietsrouteType.prototype.copyLastElementFrom = function (route) {
    // if route has no elements, we can't copy anything
    if (route.fietsroute.length == 0) return;
    // do the copy
    this.fietsroute.push(route.fietsroute.last().deepClone());
    this.statusMessage = route.statusMessage;
    this.matchCoords = route.matchCoords;
}

// Check if fietsroute contains element with id name
FietsrouteType.prototype.contains = function (name) {
    return this.fietsroute.some( x => x.element.name == name);
}

// Find index of element containing first occurrence of name in 'this'.
// If name is not found -1 is returned.
FietsrouteType.prototype.findFirstIndex = function (name) {
    return this.fietsroute.findIndex( x => x.element.name == name);
}

// Find index of element containing last occurrence of name in 'this'.
// If name is not found -1 is returned.
FietsrouteType.prototype.findLastIndex = function (name) {
    for (var i = this.fietsroute.length - 1; i >= 0; i--) {
        if ( this.fietsroute[i].element.name == name ) 
            return i;
    }
    return i;
}

// Redraw the layer of 'this'
FietsrouteType.prototype.redrawLayer = function (layer) {
    layer.clearLayers();
    this.fietsroute.forEach( x => layer.addLayer(x.layer));
}

