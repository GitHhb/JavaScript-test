 // Return last element of an Array
    // Convenience function to keep code short
    var Array.prototype.last = function () {
        return this[this.length-1];
    }

    var Array.prototype.first = function () {
        return this[0];
    }

    // Compare coordinates
    // Args: c1, c2 of type L.latLng
    // return: true | false
    function compareCoord(c1, c2) {
        return (c1.lat === c2.lat && c1.lng === c2.lng);
    }