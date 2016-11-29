var Counter = function (screenObj, min = 10, sec = 0, speed = 1000) {
    // Init vars
    var self = this;
    var countInterval;
    var countIntervalSet = false; // bool to indicate whether countInterval is running
    var minCnt = min;
    var secCnt = sec; 
            
    // Define functions
    var set = function () {
        minCnt = min;
        secCnt = sec;
    };

    var display = function () {
        var formatter = new Intl.NumberFormat('en-EN', { minimumIntegerDigits: '2'}).format;
        screenObj.innerText = formatter(minCnt) + ":" + formatter(secCnt);
    };
        
    function countDown () {
        if (minCnt == 0 && secCnt == 0) {
            clearInterval(countInterval);
            display();
        } else if (secCnt > 0) {
            secCnt--;
            display();
            return;
        } else { // secCnt == 0 && minCnt > 0
            secCnt = 59;
            minCnt--;
            display();
            return;
        }
    };
 
    self.start = function () {
        display();
        if (! countIntervalSet) {
            countInterval = setInterval(countDown, speed);
            countIntervalSet = true;
        };
    };

    self.reset = function () {
        clearInterval(countInterval);
        countIntervalSet = false;
        set();
        self.start();
    };
    
    self.stop = function () {
        clearInterval(countInterval);
        countIntervalSet = false;
    }
};

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










