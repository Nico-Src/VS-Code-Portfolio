console.log('%cCanvas Experiment V1.0', 'background: #000; color: #ccc ; padding: 5px;');

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var currentH = 10;
var currentS = 10;
var currentStrokeColor = "#000";
var currentSpeedX = 0.01;
var currentSpeedXMinus = 0.005;
var currentSpeedY = 0.01;
var currentSizeIncrementMin = 0.05;
var currentSizeIncrementMax = 0.2;
var currentMinSize = 5;
var currentMaxSize = 2;
var currentSpeedYMinus = 0.005;
var drawing = false;
ctx.globalCompositeOperation = "lighten";
// lighten = cool!
// destination-over = auch cool! (reverse growth)
// color-dodge = auch cool! (neon)
// difference = auch cool! (steel wool)
// exclusion = auch cool! (no as cool as neon, because its a darker neon)
// hue = auch cool! (tree - reverse)
// saturation = auch cool! (less cooler hue [a little bit opaque])
// luminosity = auch cool! (tree)
//ctx.shadowBlur = 10;

class Root{
    constructor(x,y,colorH,colorS,strokeColor,speedX,speedXMinus,speedY,speedYMinus,minSize,maxSize,sizeIncrementMin,sizeIncrementMax){
        this.x = x;
        this.y = y;
        var rndColor = this.getRandomColor(.2);
        this.currentShadowColor = "rgba(0,255,0,.2)";
        this.currentH = colorH;
        this.currentS = colorS;
        this.currentStrokeColor = strokeColor;
        this.speedX = Math.random() * speedX - speedXMinus;
        this.speedY = Math.random() * speedY - speedYMinus;
        this.maxSize = Math.random() * maxSize + minSize;
        this.size = Math.random() * 1 + 2;
        this.vs = Math.random() * sizeIncrementMax + sizeIncrementMin;
        this.angleX = Math.random() * 6.2;
        this.vaX = Math.random() * 0.6 - 0.3;
        this.angleY = Math.random() * 6.2;
        this.vaY = Math.random() * 0.6 - 0.3;
        this.lightness = 10;
    }

    update(){
        this.x += this.speedX + Math.sin(this.angleX);
        this.y += this.speedY + Math.sin(this.angleY);
        this.size += this.vs;
        this.angleX += this.vaX;
        this.angleY += this.vaY;
        this.angle += this.va;
        if(this.lightness < 85) this.lightness += .25;
        if(this.lightness % 50 == 0){
            //var rndColor = this.getRandomColor(.2);
            //this.currentShadowColor = rndColor.opacity;
            //this.currentFillColor = rndColor.full;
        }
        if(this.size < this.maxSize){
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.size,0,Math.PI * 2);
            //ctx.shadowBlur = 10;
            //ctx.shadowColor = this.currentShadowColor;
            ctx.fillStyle=`hsl(${this.currentH},${this.currentS}%,${this.lightness}%)`;
            ctx.fill();
            ctx.strokeStyle=this.currentStrokeColor;
            ctx.stroke();
            requestAnimationFrame(this.update.bind(this));
        }
    }

    getRandomColor(opacity){
        var resultObj = {};
        var rndOpacity = Math.random();
        var randomR = Math.random() * 255;
        var randomG = Math.random() * 255;
        var randomB = Math.random() * 255;
        if(opacity) resultObj.opacity = `rgb(${randomR},${randomG},${randomB},${opacity})`;
        resultObj.full = `rgb(${randomR},${randomG},${randomB},${1})`;
        resultObj.rnd = `rgb(${randomR},${randomG},${randomB},${rndOpacity})`;
        return resultObj;
    }
}

// weird stuff

/*
this.angle = 0;
this.va = Math.random() * 0.2 - 0.05;
ctx.save();
ctx.translate(this.x,this.y);
ctx.rotate(this.angle);
ctx.strokeStyle=this.getRandomColor().rnd;
ctx.strokeRect(this.x,this.y,this.size,this.size);
ctx.restore();*/

window.addEventListener('mousemove',e =>{
    if(drawing === true){
        for(var i = 0; i < 3;i++){
            var root = new Root(e.x,e.y,currentH,currentS,currentStrokeColor,currentSpeedX,currentSpeedXMinus,currentSpeedY,currentSpeedYMinus,currentMinSize,currentMaxSize,currentSizeIncrementMin,currentSizeIncrementMax);
            root.update();
        }
    }
});

window.addEventListener('mousedown',e=>{
    drawing = true;
});

window.addEventListener('mouseup',e=>{
    drawing = false;
})

function clearCanvas(e){
    e.stopPropagation();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeComposite(e,el){
    e.stopPropagation();
    var value = el.value;
    ctx.globalCompositeOperation = value;
}

function changeShadowBlur(e,el){
    e.stopPropagation();
    var value = el.value;
    ctx.shadowBlur = value;
    document.querySelector(".shadow-blur-txt").innerHTML = "Shadow-Blur ("+value+"):";
}

function changeDefaultColor(e,el){
    e.stopPropagation();
    var value = el.value;
    var color = HexToHSL(value);
    currentH = color.h;
    currentS = color.s;
}

function changeStrokeColor(e,el){
    e.stopPropagation();
    currentStrokeColor = el.value;
}

function changeShadowColor(e,el){
    e.stopPropagation();
    var value = el.value;
    ctx.shadowColor = value + (50).toString(16);
}

function HexToHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }

    s = s*100;
    s = Math.round(s);
    l = l*100;
    l = Math.round(l);
    h = Math.round(360*h);

    return {h, s, l};
}

function changeShadowOpacity(e,el){
    e.stopPropagation();
    var value = el.value;
    var colorValue = document.querySelector("#shadow-color-input").value;
    ctx.shadowColor = colorValue + (value).toString(16);
    console.log(ctx.shadowColor);
}

function changeSpeedX(e,el){
    e.stopPropagation();
    currentSpeedX = parseFloat(el.value);
    currentSpeedXMinus = currentSpeedX / 2;
}

function changeSpeedY(e,el){
    e.stopPropagation();
    currentSpeedY= parseFloat(el.value);
    currentSpeedYMinus = currentSpeedY / 2;
}

function changeMaxSize(e,el){
    e.stopPropagation();
    currentMaxSize= el.value;
}

function changeMinSize(e,el){
    e.stopPropagation();
    currentMinSize= el.value;
}

function changeMinSizeIncrement(e,el){
    e.stopPropagation();
    currentSizeIncrementMin= parseFloat(el.value);
    console.log(currentSizeIncrementMin);
}

function changeMaxSizeIncrement(e,el){
    e.stopPropagation();
    currentSizeIncrementMax= parseFloat(el.value);
    console.log(currentSizeIncrementMax);
}