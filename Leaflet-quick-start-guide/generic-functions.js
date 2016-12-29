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