console.log('%cCurve Fever V0.1', 'background: #000; color: #ccc ; padding: 5px;');

var canvas = undefined;
var speed = 1;
var angle = 2;
var bloom = false;
var dimension = document.querySelector('#gameArea').clientWidth;
var started = false;
var players = [];
var keys =['LEFT_ARROW','RIGHT_ARROW','A','D','V','B'];
var keyCodes = [[37,39],[65,68],[86,66]];
var playerColors = [["#000","fff"],"blue","green"];
var lineWidth = 15;
var parentContainerId = 'gameArea';
var currentFromColor = undefined;
var currentToColor = undefined;

p5.disableFriendlyErrors = false;

$(document).ready(function(){

    var speedInput = document.querySelector("#speed-input");
    var angleInput = document.querySelector("#angle-input");
    var lineWidthInput = document.querySelector("#line-width-input");
    var bloomInput = document.querySelector("#bloom-input");

    // add listeners to settings
    speedInput.addEventListener('input',(e)=>{
        speed = parseInt(speedInput.value);
    });
    angleInput.addEventListener('input',(e)=>{
        angle = parseInt(angleInput.value);
    });
    lineWidthInput.addEventListener('input',(e)=>{
        lineWidth = parseInt(lineWidthInput.value);
    });
    bloomInput.addEventListener('change',(e)=>{
        bloom = bloomInput.checked;
    });
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function setup(){
    currentFromColor = color(242, 64, 64);
    currentToColor = color(86, 157, 252);

    var gradientStartInput = document.querySelector("#gradient-start-input");
    var gradientEndInput = document.querySelector("#gradient-end-input");

    gradientStartInput.addEventListener('input',(e)=>{
        var val = hexToRgb(gradientStartInput.value);
        currentFromColor = color(val.r,val.g,val.b);
        console.log(hexToRgb(gradientStartInput.value));
    });
    gradientEndInput.addEventListener('input',(e)=>{
        var val = hexToRgb(gradientEndInput.value);
        currentToColor = color(val.r,val.g,val.b);
        console.log(hexToRgb(gradientEndInput.value));
    });
    // create canvas
    canvas=createCanvas(dimension, dimension);
    colorMode(RGB);
    background('black');
    canvas.parent(parentContainerId);
}

function preload(){
    
}

function start(playerNumber){
    // dont start again before game is finished
    if (started == false)
    {
        background('black');
        // clear players
        players=[];

        for (var i=0;i<playerNumber;i++)
        {
            // random start position
            x = Math.floor(Math.random() * 0.8*dimension) + 1;
            line_tmp=new Line(x,x);
            line_tmp.add_position(x+speed,x+speed);
            line_tmp.currentColor = color(Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255));
            players.push(line_tmp);
        }
        // set started bool
        started=true;
    }
}

function draw(){
    // only draw if game is started
    if (started)
    {
        //clear();
        //background(0);
        for (var i=0;i<players.length;i++)
        {
            players[i].resetHeadEnvironment();
            // check for key presses
            if (keyIsDown(keyCodes[i][0])) players[i].move(-angle* Math.PI / 180);
            else if (keyIsDown(keyCodes[i][1])) players[i].move(angle* Math.PI / 180);
            else players[i].move(0);

            players[i].resetHeadEnvironment();
            players[i].display_lines(players[i]);
        }
        
        // get looser id
        var looser_id=Line.is_ended(players);
        // if there is a looser
        if (looser_id!=-1)
        {
            started=false;
        }
    }

    $(".fps").html("FPS: " + Math.floor(frameRate()));
}