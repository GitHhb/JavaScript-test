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

function FietsrouteElement (type, element, layer, startPoint, endPoint) {
    this.type = type;      // "netwerken" || "knooppunt"
    this.element = element; // type of element is this.type
    this.layer = layer; // Id of leaflet layer object used in myFietsroute, has only valid value if selected
    // for element of type "knooppunt": startPoint and endPoint are the marker locations
    // or null of the marker is at the beginning or end of the route
    // if (type == "knooppunt") {
    //     this.startPoint = this.endPoint = element.point;
    // } else { // element == "netwerken"
    this.startPoint = startPoint || null; // type L.latLng | startpoint of this element
    this.endPoint = endPoint || null; // type L.latLng | endpoint of this element
    // }
}

// Check if "this" FietsrouteElement matches with "matchCoords"
// Used to check if an element fits onto the existing route and compute the new coords to which the next element should fit
// Arg: element: of type FietsrouteElement, new element to be checked
// Return:  canAdd: boolean, indicating whether adding is possible
//          newCoords: L.latlng, if canAdd and element is added then new value for this.matchCoords   
FietsrouteElement.prototype.matches = function (matchCoords) {
    var canAdd = false;
    var newCoords = L.latLng(0, 0);
    // var lastElement = this;
    var routeElement = this;
    if (routeElement.type == "knooppunt") {
        console.log("MATCH" + 1);
        canAdd = compareCoord(matchCoords, routeElement.element.point);
        // matchCoords remains the same, as knooppunt has the same coords as the existing value of this.matchCoords
        newCoords = matchCoords;
    } else { // if (routeElement.type == "netwerken") {
        if ( canAdd = compareCoord(matchCoords, routeElement.element.coordinateArr.first()) ) {
            console.log("MATCH" + 2);
            newCoords = routeElement.element.coordinateArr.last();
        } else if ( canAdd = compareCoord(matchCoords, routeElement.element.coordinateArr.last()) ) {
            console.log("MATCH" + 3);
            newCoords = routeElement.element.coordinateArr.first();
        }
    }
    return {canAdd: canAdd, newCoords: newCoords};
}

function FietsrouteType () {
    this.fietsroute = []   ; // Array of FietsrouteElement
    this.statusMessage = ""; // String with status info of performed operation
    this.matchCoords = null; // type L.Latlng | Coords of last element that not match an element yet, a new element must match these
}

// Check if an element fits onto the existing route and compute the new coords to which the next element should fit
// Arg: element: of type FietsrouteElement, new element to be checked
// Return:  canAdd: boolean, indicating whether adding is possible
//          newCoords: L.latlng, if canAdd and element is added then new value for this.matchCoords   
FietsrouteType.prototype.matches = function (newElement) {
    var canAdd = false;
    var newCoords = L.latLng(0, 0);
    var lastElement = this.fietsroute.last();
    if (newElement.type == "knooppunt") {
        console.log("MATCH" + 1);
        canAdd = compareCoord(this.matchCoords, knooppunten[newElement.index].point);
        // this.matchCoords remains the same, as knooppunt has the same coords as the existing value of this.matchCoords
        newCoords = this.matchCoords;
    } else { // if (newElement.type == "netwerken") {
        if ( canAdd = compareCoord(this.matchCoords, netwerken[newElement.index].coordinateArr.first()) ) {
            console.log("MATCH" + 2);
            newCoords = netwerken[newElement.index].coordinateArr.last();
        } else if ( canAdd = compareCoord(this.matchCoords, netwerken[newElement.index].coordinateArr.last()) ) {
            console.log("MATCH" + 3);
            newCoords = netwerken[newElement.index].coordinateArr.first();
        }
    }
    return {canAdd: canAdd, newCoords: newCoords};
}

// Add a new MyFietsrouteElement element to the fietsroute, only if the coords of the last element match with those of the new element
// Arg: type = "knooppunt" | "netwerken"
//      element = KnooppuntType | NetwerkenType
//      layer = Marker | Polyline element
// Return: if is added "new length of array" else "-1"
FietsrouteType.prototype.add = function (type, element, layer) {
    var returnVal;
    var canAdd = false;
    var newMatchCoords;
    var newFietsrouteElement = new FietsrouteElement(type, element, layer, this.matchCoords);
    this.statusMessage = " ";
    // A fietsroute must start with a "knooppunt"
    if (this.fietsroute.length == 0) {
        if (type == "knooppunt") {
            // A knooppunt as first element is OK
            this.statusMessage = "Start knooppunt toegevoegd."
            newMatchCoords = element.point;
            newFietsrouteElement.endPoint = element.point;
            canAdd = true;
        } else { // first element not a knooppunt
            this.statusMessage = "Selecteer een knooppunt als startpunt van de route.";
            return -1;
        }
    } else { // length > 0 => check if coords of last element of fietsrouteArr match with "this.matchCoords"
        // don't add if new element is same as last route element
        if (this.fietsroute.last().element.name == element.name) {
            this.statusMessage = "<b>Let op</b>: het nieuwe knooppunt of netwerkdeel mag niet gelijk zijn aan het laatste element van de route";
            return -1;
        } 
        // canAdd = this.fietsroute.last().matches(this.fietsroute.last().element);
        returnVal = newFietsrouteElement.matches(this.matchCoords);
        // returnVal = this.matches(newFietsrouteElement);
        canAdd = returnVal.canAdd;
        newMatchCoords = returnVal.newCoords;
        newFietsrouteElement.endPoint = returnVal.newCoords;
    }
    if (canAdd) {
        this.matchCoords = newMatchCoords;
        this.statusMessage = type + " deel toegevoegd";
        myFietsrouteLayer.addLayer(layer);
        return this.fietsroute.push(newFietsrouteElement);
    }
    else {
        this.statusMessage = "Selecteer een knooppunt of netwerkdeel dat aan de bestaande route aansluit";
        return -1;
    }

    // this point should never be reached
    // console.log("ERROR in method MyFietsrouteType.prototype.fitsOn: unknown arguments");
}

// // If the route end matches a marker, then also add the marker to the route
// FietsrouteType.prototype.addWithMarker = function (type, element, layer) {
//     var retval;
//     if ( (retval = this.add(type, element, layer)) < 0) {
//         return retval;
//     }
//     // if last added element is a knooppunt, we won't add another knooppunt
//     if (this.fietsroute.last().element.type == "netwerken") {
//         return retval;
//     }  
//     // Check if a knooppunt matches the last added element 
//     for (let i = 0; i < knooppunten.length; i++) {
//         if (compareCoord(this.matchCoord, knooppunten[i].point)) {
//             this.add("knooppunt", )
//         }
//     }

// }

// Remove all FietsrouteElement-s from the fietsroute array starting from the element with id this.name
// Return value: # of elements deleted
FietsrouteType.prototype.delete = function (name) {
    // update this.matchCoords
    // compute this.matchCoords, now last element of fietsroute is the new element to match
    var routeLength = this.fietsroute.length;
    for (var i = 0; i < routeLength; i++) {
        if ( this.fietsroute[i].element.name == name ) 
            break;
    }
    if (i >= routeLength)
        // element not found
        return 0;
    // element found, delete element and all following elements
    // first update status message before element containing the info we need is deleted
    this.statusMessage = "Route vanaf " + this.fietsroute[i].element.name  + " verwijderd";
    // start at end, so we can keep count of this.matchCoords
    for (var j = routeLength - 1; j >= i; j--) {
        // set this.matchCoords
        if (i > 0) {
            // only compute this.matchCoords if route has more than 1 element
            var returnVal = this.fietsroute.last().matches(this.matchCoords);
            this.matchCoords = returnVal.newCoords;
        }
        // update layer with fietsroute
        myFietsrouteLayer.removeLayer(this.fietsroute.last().layer);
        // remove last element from fietsroute
        this.fietsroute.pop();
    }
    // return nr of deleted elements
    return routeLength - i;
}

FietsrouteType.prototype.deleteAll = function () {
    if (this.fietsroute.length > 0) {
        this.delete(this.fietsroute[0].element.name);
    }
}
