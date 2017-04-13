let elmtime1 = document.getElementById("id-time1");
let elmtime2 = document.getElementById("id-time2");
let elmresult = document.getElementById("id-result");

// elmtime1 = Date.now();

function computeDiff() {
    let time1 = elmtime1.value;
    let epochtime1 = Date.parse("1-1-1970 " + elmtime1.value);
    let epochtime2 = Date.parse("1-1-1970 " + elmtime2.value);
    elmresult.innerHTML = new Date(epochtime2 - epochtime1).toUTCString(); 
}