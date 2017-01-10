// Knooppunten
// Data obtained from layer "knooppunten" 
// Knooppunt type delcaration
function KnooppuntType (name, nr, point) {
    this.name = name; // knooppunt name | according to Placemark id attribute
    this.nr = nr;
    this.point = point; // type L.latLng
}

// ___________________________________________________________________________________________
// Netwerk onderdelen
// Data obtained from layer "netwerken"
// Netwerken type declaration
function NetwerkenType (name, point, coordinateArr) {
    this.name = name;   // network name | from kml file
    this.point = point; // type L.latLng, | denotes the network location, from kml file
    this.coordinateArr = coordinateArr; // Array of L.latLng | coordinates for this route part (polyline), from kml file
    this.first = null; // index to knooppunten array | knooppunt corresponding to first route coords, coordinateArr[0], computed
    this.last = null; // index to knooppunten array | knooppunt corresponding to last route coords, coordinateArr[length-1], computed
}

// Arg: latlng of type L.latLng
    NetwerkenType.prototype.matchCoord = function (latlng) {
    return compareCoord(this.coordinateArr.first(), latlng)
        || compareCoord(this.coordinateArr.last(), latlng); 
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

var iconRed = L.icon({
    iconUrl: 'Image/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
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
            this.layer = L.marker(element.point, {icon: iconOrange, zIndexOffset: 1000});
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
        console.log("MATCH" + 1);
        canAdd = compareCoord(matchCoords, routeElement.element.point);
        // new matchCoords are the coords of the new "knooppunt"
        startPoint = routeElement.element.point;
        endPoint   = routeElement.element.point;
    } else { // if (routeElement.type == "netwerken") {
        if ( canAdd = compareCoord(matchCoords, routeElement.element.coordinateArr.first()) ) {
            console.log("MATCH" + 2);
            startPoint = routeElement.element.coordinateArr.first();
            endPoint   = routeElement.element.coordinateArr.last();
        } else if ( canAdd = compareCoord(matchCoords, routeElement.element.coordinateArr.last()) ) {
            console.log("MATCH" + 3);
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

function FietsrouteType () {
    this.fietsroute = []   ; // Array of FietsrouteElement
    this.statusMessage = ""; // String with status info of performed operation
    this.matchCoords = null; // type L.Latlng | Coords of last element that not match an element yet, a new element must match these
}

// // Check if an element fits onto the existing route and compute the new coords to which the next element should fit
// // Arg: element: of type FietsrouteElement, new element to be checked
// // Return:  canAdd: boolean, indicating whether adding is possible
// //          newCoords: L.latlng, if canAdd and element is added then new value for this.matchCoords   
// FietsrouteType.prototype.matches = function (newElement) {
//     var canAdd = false;
//     var newCoords = L.latLng(0, 0);
//     var lastElement = this.fietsroute.last();
//     if (newElement.type == "knooppunt") {
//         console.log("MATCH" + 1);
//         canAdd = compareCoord(this.matchCoords, knooppunten[newElement.index].point);
//         // this.matchCoords remains the same, as knooppunt has the same coords as the existing value of this.matchCoords
//         newCoords = this.matchCoords;
//     } else { // if (newElement.type == "netwerken") {
//         if ( canAdd = compareCoord(this.matchCoords, netwerken[newElement.index].coordinateArr.first()) ) {
//             console.log("MATCH" + 2);
//             newCoords = netwerken[newElement.index].coordinateArr.last();
//         } else if ( canAdd = compareCoord(this.matchCoords, netwerken[newElement.index].coordinateArr.last()) ) {
//             console.log("MATCH" + 3);
//             newCoords = netwerken[newElement.index].coordinateArr.first();
//         }
//     }
//     return {canAdd: canAdd, newCoords: newCoords};
// }

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
    this.statusMessage = " ";
    // Is this a new fietsroute?
    if (this.fietsroute.length == 0) {
        // A fietsroute must start with a "knooppunt"
        if (type == "knooppunt") {
            this.statusMessage = "Start knooppunt toegevoegd."
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
    }
    if (canAdd) {
        this.matchCoords = newMatchCoords;
        this.statusMessage = type + " deel toegevoegd";
        if (! noLayer) {myFietsrouteLayer.addLayer(newFietsrouteElement.layer);}
        return this.fietsroute.push(newFietsrouteElement);
    }
    else {
        this.statusMessage = "Selecteer een knooppunt of netwerkdeel dat aan de bestaande route aansluit";
        return -1;
    }
}

// First try FietsrouteType.prototype.add.
// If no success, try to auto-complete the route as follows:
// if a marker is selected, and one "netwerken" element is in between the knpOrNet element and the last fietsroute element,
// also add the missing "netwerken" element
FietsrouteType.prototype.addRouteUptoMarker = function (type, knpOrNet) {
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
    newroute.add( myFietsroute.fietsroute.last().type, myFietsroute.fietsroute.last().element, true);
    for (let i = 0; i < netwerken.length; i++) {
        // console.log("TRY match netwerken" + i);
        // element is of type "knooppunt", do a dryrun add to check if this "netwerken" element can be added
        if (newroute.add("netwerken", netwerken[i], true) > 0) {
        // console.log("FOUND match netwerken" + i);
            if (newroute.add("knooppunt", knpOrNet, true) > 0) {
        // console.log("FOUND match KNOOPPUNT" + i);
                // Match found, add elements to "this"
                for (let j = 1; j < newroute.fietsroute.length; j++)
                    retval = this.add(newroute.fietsroute[j].type, newroute.fietsroute[j].element);
                return retval;
            } // no match, remove last added element
            newroute.deleteLast();
        }
    }

    // if (this.fietsroute.last().element.type == "netwerken") {
    //     return retval;
    // }  
}

// Remove all FietsrouteElement-s from the fietsroute array starting from the element with id this.name
// Return value: # of elements deleted
FietsrouteType.prototype.delete = function (name) {
    // update this.matchCoords
    // compute this.matchCoords, last element of fietsroute will become the new element to match
    var routeLength = this.fietsroute.length;
    // for (var i = 0; i < routeLength; i++) {
    //     if ( this.fietsroute[i].element.name == name ) 
    //         break;
    // }
    var i = this.findFirstIndex(name);
    if ( i < 0 )
        return; 
    if (i >= routeLength)
        // element not found
        return 0;
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
    // set this.matchCoords if remaining route has minimal 1 element
    if (i > 0)
        this.matchCoords = this.fietsroute.last().endPoint;
    // return nr of deleted elements
    return routeLength - i;
}

FietsrouteType.prototype.removeElementFromLayer = function (element) {
    if (element.layer == null) return;
    myFietsrouteLayer.removeLayer(element.layer);
}

FietsrouteType.prototype.deleteAll = function () {
    if (this.fietsroute.length > 0) {
        this.delete(this.fietsroute[0].element.name);
    }
}

FietsrouteType.prototype.deleteLast = function () {
    if (this.fietsroute.length > 0) {
        this.delete(this.fietsroute.last().element.name);
    }
}

// Create deep clone of last Element
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

// Find index of first occurrence of name in 'this'.
// If name is not found -1 is returned.
FietsrouteType.prototype.findFirstIndex = function (name) {
    return this.fietsroute.findIndex( x => x.element.name == name);
}

// Redraw the layer of 'this'
FietsrouteType.prototype.redrawLayer = function (layer) {
    layer.clearLayers();
    this.fietsroute.forEach( x => layer.addLayer(x.layer));
}

