var array= ["hello", "world", 200];

for (var i = 0; i < array.length; i++) {
    console.log(array[i]);
}

var obj = {color: "red", width: 200, height: 300};

var arr1 = Object.keys(obj);

for (var i = 0; i < arr1.length; i++) {
    console.log( obj[arr1[i]]);
}