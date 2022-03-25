var rSeed = 0;
var leaveRadius = 14;
var leaveColorDifference = 20;
var branchMultiplier = 0.71;
var branchLength = 150;
var leaveColor = '#507828';
var angle = 0;
var woodColor = '#462814';

function setup(){
    let cnv = createCanvas(windowWidth * .6, windowHeight,WEBGL);
    cnv.parent('canvas-wrapper');
    angleMode(DEGREES);
    rSeed = random(0,100000);
    noLoop();
}

function draw(){
    background(color(219, 215, 219));

    randomSeed(rSeed);

    translate(0,300,0);

    rotateY(angle);

    stroke(120,90,70,50);
    strokeWeight(15);
    line(-100,0,0,100,0,0);

    branch(branchLength,hexToRgb(woodColor));
}

function branch(len,woodC){
    push();
    strokeWeight(map(len,10,100,.5,6));
    let addition = random(-leaveColorDifference,leaveColorDifference);
    stroke(woodC.r + addition,woodC.g + addition,woodC.b + addition);
    line(0,0,0,0,-len-2,0);
    pop();

    translate(0,-len,0);

    if(len > branchLength / 10){
        for(var i = 0; i < 3; i++){
            rotateY(random(100,140));

            push();

            rotateZ(random(20,50));
            branch(len * branchMultiplier, woodC);

            pop();
        }
    } else {
        let leaveCol = hexToRgb(leaveColor);
        var r = leaveCol.r + random(-leaveColorDifference,leaveColorDifference);
        var g = leaveCol.g + random(-leaveColorDifference,leaveColorDifference);
        var b = leaveCol.b + random(-leaveColorDifference,leaveColorDifference);

        fill(r,g,b,200);
        noStroke();

        translate(leaveRadius - 2,0,0);
        rotateZ(90);

        beginShape();
        for(var i = 45; i < 135; i++){
            var rad = leaveRadius;
            var x = rad * cos(i);
            var y = rad * sin(i);
            vertex(x,y);
        }

        for(var i = 135; i < 45; i--){
            var rad = leaveRadius;
            var x = rad * cos(i);
            var y = rad * sin(-i) * 10;
            vertex(x,y);
        }
        endShape();
    }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}