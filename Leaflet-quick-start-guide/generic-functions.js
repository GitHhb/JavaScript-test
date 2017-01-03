// Return last element of an Array
if (! Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length-1];
    }
    Object.defineProperty(Array.prototype, 'last', {enumerable: false});
}

// Return first element of an Array
if (! Array.prototype.first) {
    Array.prototype.first = function () {
        return this[0];
    }
    Object.defineProperty(Array.prototype, 'first', {enumerable: false});
}

// Compare coordinates
// Args: c1, c2 of type L.latLng
// return: true | false
function compareCoord(c1, c2) {
    // return (c1.lat === c2.lat && c1.lng === c2.lng);
    var dist = c1.distanceTo(c2);
    console.log("DISTANCE: ", dist);
    return dist < 50;
}

function toonMijnRoute (tag) {
    // console.log(myFietsrouteLayer.getLayers());
    console.log(myFietsroute);
    var html = `<table>
        <tr>
            <th class="td-fietsroute-type">Type</th>
            <th>Knooppunt nummer</th>
            <th>Fietsroute Id</th>
        </tr>`;
    for (var i = 0; i < myFietsroute.fietsroute.length; i++) {
        html += "<tr>";
        if (myFietsroute.fietsroute[i].type == "knooppunt") {
            html += '<td class="td-fietsroute-type">' + '<img src="Image/marker-icon-orange.png" alt="Knooppunt">' + "</td>"
                 + "<td>" + "Knooppunt " + knooppunten[myFietsroute.fietsroute[i].index].nr + "</td>"
                 + "<td>" + knooppunten[myFietsroute.fietsroute[i].index].name + "</td>";
        } else { // (myFietsroute[i] == "netwerken")
            html += '<td class="td-fietsroute-type">' + '<img src="Image/route-element.png" alt="Wegdeel">' + "</td>"
                 + "<td>" + "wegdeel" + "</td>"
                 + "<td>" + netwerken[myFietsroute.fietsroute[i].index].name + "</td>";
        }
        html += "</tr>";
    }
    html += "</table>";
    // write html to tag
    tag.innerHTML = html;
}
