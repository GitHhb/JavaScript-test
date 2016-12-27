    // Knooppunten
    // Data obtained from layer "knooppunten" 
	// Knooppunt type delcaration
	function KnooppuntType (nr, point) {
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
    var NetwerkenType.prototype.matchCoord = function (latlng) {
        return compareCoord(this.coordinateArr.first, latlng)
            || compareCoord(this.coordinateArr.last, latlng); 
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

    // Check whether a route part fits, that is whether coordinates match
    // Args: type = "knooppunt" | "netwerken"
    //       index = number
    //       this =  MyFietsrouteType
    // Return: "true" | "false"
    function MyFietsrouteType.prototype.fitsOn (newType, newIndex) {
        if (newType === "knooppunt") {
            if (this.type == "knooppunt") {
                // This situation should not occur
                return compareCoord(knooppunten[this.index].point, knooppunten[newIndex].point);
            } else { // this.type == "netwerken")
                return netwerken[this.index].matchCoord(knooppunten[newIndex].point)
            }
        } else { // newType === "netwerken"
            if (this.type == "knooppunt") {
                return netwerken[newIndex].matchCoord(knooppunten[this.index].point);
            } else { // this.type == "netwerken"
                return netwerken[this.index].matchCoord(netwerken[newIndex].first)
                || netwerken[this.index].matchCoord(netwerken[newIndex].last);
            }
        }
        // this point should never be reached
        console.log("ERROR in method MyFietsrouteType.prototype.fitsOn: unknown arguments");

    } 
