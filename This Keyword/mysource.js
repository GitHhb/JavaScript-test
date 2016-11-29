/*var mybut = new HTMLButtonElement();

document.appendChild(mybut);*/

"use strict";

/*
var myo = {
    name: 'Piet',
    age: 550,
    test: function() {console.log(this);},
    sub: {
        yes: "ja",
        no: "nee",
        printit: function() {console.log(this);}
    }
};
*/

document.getElementById("newbutton").addEventListener("click", function() {
    console.dir(this);
});