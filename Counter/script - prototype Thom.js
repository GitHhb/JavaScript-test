function Counter(screenObj, min, sec, speed){
	this.screenObj = screenObj;
	this.min = min || 10;
	this.sec = sec || 0;
	this.speed = speed || 1000;
    this.countInterval;
    this.minCnt = min;
    this.secCnt = sec; 
}
Counter.prototype = {
	countDown: function () {
        if (this.minCnt == 0 && this.secCnt == 0) {
            clearInterval(this.countInterval);
        } else if (this.secCnt > 0) {
            this.secCnt--;
        } else { // secCnt == 0 && minCnt > 0
            this.secCnt = 59;
            this.minCnt--;
        }
		this.display();
    },
	start: function () {
        if (!this.countInterval) {
            this.countInterval = setInterval(this.countDown, this.speed);
        }
		this.display();
    },
    reset: function () {
        this.stop();
        this.minCnt = min;
        this.secCnt = sec;
        this.start();
    },
    stop: function () {
        clearInterval(this.countInterval);
    }
};
/*
	Deze display functie moet buiten de Counter 'class' gehaald worden omdat er referencies in zitten die niet van Counter zijn.
	Om dit anders te doen kun je een getvalues maken op de Counter 'class' waarmee je de waardes minCnt & secCnt teruggeeft.
	Bij de implementatie kun je deze waardes formatteren en weergeven op het scherm.
*/
Counter.prototype.display = function () {
	var formatter = new Intl.NumberFormat('en-EN', { minimumIntegerDigits: '2'}).format;
	this.screenObj.innerText = formatter(this.minCnt) + ":" + formatter(this.secCnt);
};
/*
 Pas ook op met timers die een afhankelijkheid hebben op setInterval omdat het maar afhangt of de thread echt precies 1 seconde vooruit gaat.
 Ik snap dat je nu snellere timers kan maken maar dit heeft ook weer een nadeel omdat setInterval blocking kan zijn.
 Het beste is een constructie waar je telkens een nieuwe setTimeout aanroept, die vervolgens op basis van een constante de secondes van een Date object af haalt :).
*/


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

