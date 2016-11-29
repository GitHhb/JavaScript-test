/*function ConstructApple(c, w, h) {

    console.log (this);

    this.color  = c;
    this.width  = w;
    this.height = h;
    
    console.log (this);
}*/

ConstructApple.prototype = {
    eat:    function(){return 'eat the apple';},
    throw:  function(){return 'THROW IT';},
    nibble: function(){return 'nibble something';}
}

//var apple   = new ConstructApple("red", 300, 200);
//var apple1  = new ConstructApple("green", 1300, 1200);
//var apple2  = new ConstructApple("blue", 2300, 2200);
var apple3  = new ConstructApple();