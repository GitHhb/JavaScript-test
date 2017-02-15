var Counter = (function() {
function Counter(screenObj, min = 10, sec = 0, speed = 1000) {
    // Init vars
    var selfx = this;
    this.timer;
    this.timerSet = false; // bool to indicate whether countInterval is running
    this.min = min;
    this.sec = sec;
    this.minCnt = min;
    this.secCnt = sec; 
    this.screenObj = screenObj;
    this.speed = speed;
    this.x = "test";
};
        
// Define functions
Counter.prototype.set = function () {
    this.minCnt = this.min;
    this.secCnt = this.sec;
};

Counter.prototype.display = function () {
    var formatter = new Intl.NumberFormat('en-EN', { minimumIntegerDigits: '2'}).format;
    this.screenObj.innerText = formatter(this.minCnt) + ":" + formatter(this.secCnt);
};
        
Counter.prototype.countDown = function () {
    if (this.minCnt == 0 && this.secCnt == 0) {
        clearInterval(this.timer);
    } else if (this.secCnt > 0) {
        this.secCnt--;
    } else { // secCnt == 0 && minCnt > 0
        this.secCnt = 59;
        this.minCnt--;
    }
//    console.log(this.secCnt, this.x, this.constructor.name, self.constructor.name);
    this.display();
};

Counter.prototype.start = function () {
        if (! this.timerSet) {
                this.timer = setInterval(this.countDown.bind(this), this.speed);
                this.timerSet = true;
        };
//        console.log("START self/this: ", self.constructor.name, this.constructor.name);
        this.display();
};

Counter.prototype.reset = function () {
    this.stop();
    this.set();
    this.start();
};

Counter.prototype.stop = function () {
    let _this = this;
    clearInterval(_this.timer);
    _this.timerSet = false;
}
return Counter;
}());


// Init counter 1
var counter1Elem = document.getElementById("counter1");
var counter1 = new Counter(counter1Elem, 20, 0);
// setup reset button
var counter1But = document.getElementById("counter1-but");
counter1But.addEventListener("click", counter1.reset.bind(counter1));
// setup stop button
var counter1StopBut = document.getElementById("counter1-stop-but");
counter1StopBut.addEventListener("click", counter1.stop);
// setup start button
var counter1StartBut = document.getElementById("counter1-start-but");
counter1StartBut.addEventListener("click", counter1.start.bind(counter1));
// Start
counter1.start();

// Init counter 2
var counter2Elem = document.getElementById("counter2");
var counter2 = new Counter(counter2Elem, 4, 20, 300);
// setup reset button
var counter2But = document.getElementById("counter2-but");
counter2But.addEventListener("click", counter2.reset.bind(counter2));
// setup stop button
var counter2StopBut = document.getElementById("counter2-stop-but");
counter2StopBut.addEventListener("click", counter2.stop.bind(counter2));
// setup start button
var counter2StartBut = document.getElementById("counter2-start-but");
counter2StartBut.addEventListener("click", counter2.start.bind(counter2));
// Start
counter2.start();










