    // Knooppunten
    // Data obtained from layer "knooppunten" 
	// Knooppunt type delcaration
	function KnooppuntType (name, nr, point) {
        this.name = name; // official knooppunt name according to Placemark id attribute
		this.nr = nr;
        this.point = point; // type L.latLng
	}

    // ___________________________________________________________________________________________
    // Netwerk onderdelen
    // Data obtained from layer "netwerken"
	// Netwerken type declaration
	function NetwerkenType (name, point, coordinateArr) {
		this.name = name;   // network name, | from kml file
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

    function FietsrouteElement (type, index, layer) {
        this.type = type;      // "netwerken" || "knooppunt"
        // index points to a part of the fietsroute:
        //   if this.type = "netwerken" => netwerken[this.index]
        //   if this.type = "knooppunt" => knooppunten[this.index] 
        this.index = index;
        this.layer = layer; // Leaflet layer element corresponding with thiw netwerken or knooppunt element 
    }

    // FietsrouteElement.prototype.matches = function (newElement) {
    //     var canAdd = false;
    //     var lastElement = this;
    //     if (lastElement.type == "knooppunt" && newElement.type == "knooppunt") {
    //         console.log("MATCH" + 1);
    //         canAdd = compareCoord(knooppunten[lastElement.index].point, knooppunten[newElement.index].point);
    //     } else if (lastElement.type == "netwerken" && newElement.type == "netwerken") {
    //         console.log("MATCH" + 2);
    //         canAdd = netwerken[lastElement.index].matchCoord(netwerken[newElement.index].coordinateArr.first())
    //         || netwerken[lastElement.index].matchCoord(netwerken[newElement.index].coordinateArr.last());
    //     } else if (lastElement.type == "knooppunt" && newElement.type == "netwerken") {
    //         console.log("MATCH" + 3);
    //         canAdd = netwerken[newElement.index].matchCoord(knooppunten[lastElement.index].point);
    //     } else { //if (lastElement.type == "netwerken" && newElement.type == "knooppunt") {
    //         console.log("MATCH" + 4);
    //         canAdd = netwerken[lastElement.index].matchCoord(knooppunten[newElement.index].point);
    //     }
    //     return canAdd;
    // }
    
    // Check if "this" FietsrouteElement matches with "matchCoords"
    // Used to check if an element fits onto the existing route and compute the new coords to which the next element should fit
    // Arg: element: of type FietsrouteElement, new element to be checked
    // Return:  canAdd: boolean, indicating whether adding is possible
    //          newCoords: L.latlng, if canAdd and element is added then new value for this.matchCoords   
    FietsrouteElement.prototype.matches = function (matchCoords) {
        var canAdd = false;
        var newCoords = L.latLng(0, 0);
        // var lastElement = this;
        var element = this;
        if (element.type == "knooppunt") {
            console.log("MATCH" + 1);
            canAdd = compareCoord(matchCoords, knooppunten[element.index].point);
            // matchCoords remains the same, as knooppunt has the same coords as the existing value of this.matchCoords
            newCoords = matchCoords;
        } else { // if (element.type == "netwerken") {
            if ( canAdd = compareCoord(matchCoords, netwerken[element.index].coordinateArr.first()) ) {
                console.log("MATCH" + 2);
                newCoords = netwerken[element.index].coordinateArr.last();
            } else if ( canAdd = compareCoord(matchCoords, netwerken[element.index].coordinateArr.last()) ) {
                console.log("MATCH" + 3);
                newCoords = netwerken[element.index].coordinateArr.first();
            }
        }
        return {canAdd: canAdd, newCoords: newCoords};
    }

    function FietsrouteType () {
        this.fietsroute = []; // Array of MyFietsrouteElement
        this.statusMessage; // String with status info of performed operation
        this.matchCoords; // type L.Latlng | Coords of last element that not match an element yet, a new element must match these
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
    // Arg: part : of type KnooppuntType | NetwerkenType
    // Return: if is added "new length of array" else "-1"
    FietsrouteType.prototype.add = function (type, index, layer) {
        var returnVal;
        var canAdd = false;
        var newMatchCoords;
        var newElement = new FietsrouteElement(type, index, layer);
        this.statusMessage = " ";
        // A fietsroute must start with a "knooppunt"
        if (this.fietsroute.length == 0) {
            if (type == "knooppunt") {
                // A knooppunt as first element is OK
                this.statusMessage = "Start knooppunt toegevoegd."
                newMatchCoords = knooppunten[index].point;
                canAdd = true;
            } else { // first element not a knooppunt
                this.statusMessage = "Selecteer een knooppunt als startpunt van de route.";
                return -1;
            }
        } else { // length > 0 => check if coords of last element of fietsrouteArr match with "this.matchCoords"
            // canAdd = this.fietsroute.last().matches(this.fietsroute.last(). newElement);
            returnVal = newElement.matches(this.matchCoords);
            // returnVal = this.matches(newElement);
            canAdd = returnVal.canAdd;
            newMatchCoords = returnVal.newCoords;
        }
        if (canAdd) {
            this.matchCoords = newMatchCoords;
            return this.fietsroute.push(newElement);
        }
        else {
            this.statusMessage = "Selecteer een knooppunt of netwerkdeel dat aan de bestaande route aansluit";
            return -1;
        }

        // this point should never be reached
        // console.log("ERROR in method MyFietsrouteType.prototype.fitsOn: unknown arguments");
    }

    // Remove last FietsrouteElement from the fietsroute array
    FietsrouteType.prototype.delete = function () {
        // update this.matchCoords
        // compute this.matchCoords, now last element of fietsroute is the new element to match
        var returnVal = this.fietsroute.last().matches(this.matchCoords);
        this.matchCoords = returnVal.newCoords;
        // remove last element from fietsroute
        this.fietsroute.pop();
    }
  