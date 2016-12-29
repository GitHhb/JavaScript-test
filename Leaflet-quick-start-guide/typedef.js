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
    function MyFietsrouteType (type, index) {
        this.type = type;      // "netwerken" || "knooppunt"
        // index points to a part of the fietsroute:
        //   if this.type = "netwerken" => netwerken[this.index]
        //   if this.type = "knooppunt" => knooppunten[this.index] 
        this.index = index;
    }
    function FietsrouteElement (type, index, layer) {
        this.type = type;      // "netwerken" || "knooppunt"
        // index points to a part of the fietsroute:
        //   if this.type = "netwerken" => netwerken[this.index]
        //   if this.type = "knooppunt" => knooppunten[this.index] 
        this.index = index;
        this.layer = layer; // Leaflet layer element corresponding with thiw netwerken or knooppunt element 
    }

    FietsrouteElement.prototype.matches = function (newElement) {
        var canAdd = false;
        var lastElement = this;
        if (lastElement.type == "knooppunt" && newElement.type == "knooppunt") {
            console.log("MATCH" + 1);
            canAdd = compareCoord(knooppunten[lastElement.index].point, knooppunten[newElement.index].point);
        } else if (lastElement.type == "netwerken" && newElement.type == "netwerken") {
            console.log("MATCH" + 2);
            canAdd = netwerken[lastElement.index].matchCoord(netwerken[newElement.index].coordinateArr.first())
            || netwerken[lastElement.index].matchCoord(netwerken[newElement.index].coordinateArr.last());
        } else if (lastElement.type == "knooppunt" && newElement.type == "netwerken") {
            console.log("MATCH" + 3);
            canAdd = netwerken[newElement.index].matchCoord(knooppunten[lastElement.index].point);
        } else { //if (lastElement.type == "netwerken" && newElement.type == "knooppunt") {
            console.log("MATCH" + 4);
            canAdd = netwerken[lastElement.index].matchCoord(knooppunten[newElement.index].point);
        }
        return canAdd;
    }

    function FietsrouteType () {
        this.fietsroute = []; // Array of MyFietsrouteElement
        this.statusMessage; // String with status info of performed operation
        this.matchCoords; // type L.Latlng | Coords of last element that not match an element yet, a new element must match these
    }

    FietsrouteType.prototype.matches = function (newElement) {
        var canAdd = false;
        var lastElement = this.fietsroute.last();
        if (newElement.type == "knooppunt") {
            console.log("MATCH" + 1);
            canAdd = compareCoord(this.matchCoords, knooppunten[newElement.index].point);
            // this.matchCoords remains the same, as knooppunt has the same coords as the existing value of this.matchCoords
        } else { // if (newElement.type == "netwerken") {
            if ( canAdd = compareCoord(this.matchCoords, netwerken[newElement.index].coordinateArr.first()) ) {
                console.log("MATCH" + 2);
                this.matchCoords = netwerken[newElement.index].coordinateArr.last();
            } else if ( canAdd = compareCoord(this.matchCoords, netwerken[newElement.index].coordinateArr.last()) ) {
                console.log("MATCH" + 3);
                this.matchCoords = netwerken[newElement.index].coordinateArr.first();
            }
        }
        return canAdd;
    }

    // Add a new MyFietsrouteType element to the fietsroute, only if the coords of the last element match with those of the new element
    // Arg: part : of type KnooppuntType | NetwerkenType
    // Return: if is added "new length of array" else "-1"
    FietsrouteType.prototype.add = function (type, index, layer) {
        var canAdd = false;
        var newElement = new FietsrouteElement(type, index, layer);
        // A fietsroute must start with a "knooppunt"
        if (this.fietsroute.length == 0) {
            if (type == "knooppunt") {
                // A knooppunt as first element is OK
                this.statusMessage = "Start knooppunt toegevoegd."
                this.matchCoords = knooppunten[index].point;
                canAdd = true;
            } else {
                this.statusMessage = "Ongeldige selectie. Selecteer een knooppunt als eerste element van de route.";
                return -1;
            }
        } else { // length > 0 => check if coords of last element of fietsrouteArr match with "this"
            // canAdd = this.fietsroute.last().matches(newElement);
            canAdd = this.matches(newElement);
          
            // if (this.fietsroute.last().type == "knooppunt" && type == "knooppunt") {
            //     console.log("MATCH" + 1);
            //     canAdd = compareCoord(knooppunten[this.fietsroute.last().index].point, knooppunten[index].point);
            // } else if (this.type == "netwerken" && fietsrouteArr.last().type == "netwerken") {
            //     console.log("MATCH" + 2);
            //     canAdd = netwerken[this.index].matchCoord(netwerken[fietsrouteArr.last().index].coordinateArr.first())
            //     || netwerken[this.index].matchCoord(netwerken[fietsrouteArr.last().index].coordinateArr.last());
            // } else if (this.type == "knooppunt" && fietsrouteArr.last().type == "netwerken") {
            //     console.log("MATCH" + 3);
            //     canAdd = netwerken[fietsrouteArr.last().index].matchCoord(knooppunten[this.index].point);
            // } else { //if (this.type == "netwerken" && element.type == "knooppunt") {
            //     console.log("MATCH" + 4);
            //     canAdd = netwerken[this.index].matchCoord(knooppunten[fietsrouteArr.last().index].point);
            // }
        }
        if (canAdd) return this.fietsroute.push(newElement);
        else return -1;

        // this point should never be reached
        // console.log("ERROR in method MyFietsrouteType.prototype.fitsOn: unknown arguments");
    }

    FietsrouteType.prototype.delete = function (fietsrouteArr) {
    }
  
  
    // // Add a new MyFietsrouteType element to the fietsroute, only if the coords of the last element match with those of the new element
    // // Arg: part : of type KnooppuntType | NetwerkenType
    // // Return: if is added "new length of array" else "-1"
    // MyFietsrouteType.prototype.add = function (fietsrouteArr) {
    //     var canAdd = false;
    //     // A fietsroute must start with a "knooppunt"
    //     if (fietsrouteArr.length == 0) {
    //         if (this.type != "knooppunt") {
    //             //return "Ongeldige selectie. Selecteer een knooppunt als eerste element van de route.";
    //             return -1;
    //         } else { // A knooppunt as first element is OK
    //             canAdd = true;
    //         }
    //     } else { // length > 0 => check if coords of last element of fietsrouteArr match with "this"
    //         if (this.type == "knooppunt" && fietsrouteArr.last().type == "knooppunt") {
    //             console.log("MATCH" + 1);
    //             canAdd = compareCoord(knooppunten[this.index].point, knooppunten[fietsrouteArr.last().index].point);
    //         } else if (this.type == "netwerken" && fietsrouteArr.last().type == "netwerken") {
    //             console.log("MATCH" + 2);
    //             canAdd = netwerken[this.index].matchCoord(netwerken[fietsrouteArr.last().index].coordinateArr.first())
    //             || netwerken[this.index].matchCoord(netwerken[fietsrouteArr.last().index].coordinateArr.last());
    //         } else if (this.type == "knooppunt" && fietsrouteArr.last().type == "netwerken") {
    //             console.log("MATCH" + 3);
    //             canAdd = netwerken[fietsrouteArr.last().index].matchCoord(knooppunten[this.index].point);
    //         } else { //if (this.type == "netwerken" && element.type == "knooppunt") {
    //             console.log("MATCH" + 4);
    //             canAdd = netwerken[this.index].matchCoord(knooppunten[fietsrouteArr.last().index].point);
    //         }
    //     }
    //     if (canAdd) return fietsrouteArr.push(this);
    //     else return -1;

    //     // this point should never be reached
    //     // console.log("ERROR in method MyFietsrouteType.prototype.fitsOn: unknown arguments");
    // }
