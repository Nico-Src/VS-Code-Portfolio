console.log('%cCurve Fever V0.1', 'background: #000; color: #ccc ; padding: 5px;');

var canvas = undefined;
var speed = 1;
var angle = 2;
var dimension = document.querySelector('#gameArea').clientWidth;
var started = false;
var players = [];
var keys =['LEFT_ARROW','RIGHT_ARROW','A','D','V','B'];
var keyCodes = [[37,39],[65,68],[86,66]];
var playerColors = ["red","blue","green"];
var lineWidth = 15;
var parentContainerId = 'gameArea';

$(document).ready(function(){
    var speedInput = document.querySelector("#speed-input");
    var angleInput = document.querySelector("#angle-input");
    var lineWidthInput = document.querySelector("#line-width-input");

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
});

function setup(){
    // create canvas
    canvas=createCanvas(dimension, dimension);
    colorMode(HSB);
    background('black');
    canvas.parent(parentContainerId);
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
        for (var i=0;i<players.length;i++)
        {
            // check for key presses
            if (keyIsDown(keyCodes[i][0])) players[i].move(-angle* Math.PI / 180);
            else if (keyIsDown(keyCodes[i][1])) players[i].move(angle* Math.PI / 180);
            else players[i].move(0);
        }
        
        // get looser id
        var looser_id=Line.is_ended(players);
        // if there is a looser
        if (looser_id!=-1)
        {
            started=false;
        }
        Line.display_lines(players);
    }
}