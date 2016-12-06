var Counter = function (screenObj, min = 10, sec = 0, speed = 1000) {
    // Init vars
    // var self = this;
    var countInterval;
    this.minCnt = min;
    this.secCnt = sec; 
    this.screenObj = screenObj;
    this.speed = speed;
    this.x = "test";
};
        
// Define functions
Counter.prototype.set = function () {
    this.minCnt = min;
    this.secCnt = sec;
};

Counter.prototype.display = function () {
    var formatter = new Intl.NumberFormat('en-EN', { minimumIntegerDigits: '2'}).format;
    this.screenObj.innerText = formatter(this.minCnt) + ":" + formatter(this.secCnt);
    console.log("OK");
};
        
Counter.prototype.countDown = function () {
    if (self.minCnt == 0 && self.secCnt == 0) {
        clearInterval(self.countInterval);
        self.display();
    } else if (this.secCnt > 0) {
        self.secCnt--;
        // console.log(this.secCnt, this.x, this.constructor.name, self.constructor.name);
        self.display();
        
        return;
    } else { // secCnt == 0 && minCnt > 0
        self.secCnt = 59;
        self.minCnt--;
        self.display();
        return;
    }
};

Counter.prototype.start = function () {
    this.display();
    countInterval = setInterval(this.countDown, this.speed);
};

Counter.prototype.reset = function () {
    clearInterval(countInterval);
    this.set();
    this.start();
};

Counter.prototype.stop = function () {
    clearInterval(countInterval);
}


// Init counter 1
var counter1Elem = document.getElementById("counter1");
var counter1 = new Counter(counter1Elem, 20, 0);
var counter1But = document.getElementById("counter1-but");
counter1But.addEventListener("click", counter1.reset);
var counter1StopBut = document.getElementById("counter1-stop-but");
counter1StopBut.addEventListener("click", counter1.stop);
var counter1StartBut = document.getElementById("counter1-start-but");
counter1StartBut.addEventListener("click", counter1.start);
counter1.start();

// Init counter 2
var counter2Elem = document.getElementById("counter2");
var counter2 = new Counter(counter2Elem, 4, 20, 300);
var counter2But = document.getElementById("counter2-but");
counter2But.addEventListener("click", counter2.reset);
var counter2StopBut = document.getElementById("counter2-stop-but");
counter2StopBut.addEventListener("click", counter2.stop);
var counter2StartBut = document.getElementById("counter2-start-but");
counter2StartBut.addEventListener("click", counter2.start);
counter2.start();










