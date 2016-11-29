var selColor = document.getElementById("idColor");
var selDiv = document.getElementById('change');
var selWidth = document.getElementById('idWidth');
var selHeigth = document.getElementById('idHeigth');
function setStyle () {
   /* var attrib='backgroundColor';
    selDiv.style[attrib] = 'magenta';*/
    switch (this.id) {
        case 'idColor':
            selDiv.innerHTML += '-' + this.id;
            selDiv.style.backgroundColor = this.value;
            break;
        case 'idWidth':
            selDiv.style.width = this.value;
            break;
        case 'idHeigth':
            selDiv.style.height = this.value;
    }
}
selColor.addEventListener('input', setStyle);
selWidth.addEventListener('input', setStyle);
selHeigth.addEventListener('input', setStyle);