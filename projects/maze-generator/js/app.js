// https://en.wikipedia.org/wiki/Maze_generation_algorithm

var cols, rows;
var w = 15;
var grid = [];
var stack = [];

var current;
var currentColor = '#2b9447';
var pathColor = '#8deba6';

function setup(){
    let cnv = createCanvas(windowWidth * .5,400);
    cnv.parent('canvas-wrapper');
    grid = [];
    stack = [];
    cols = floor(width / w);
    rows = floor(height / w);

    for(var y = 0; y < rows; y++){
        for(var x = 0; x < cols; x++){
            var cell = new Cell(x,y);
            grid.push(cell);
        }
    }

    current = grid[0];
    noLoop();
}

function draw(){
    background(230);

    for(var i = 0; i < grid.length; i++){
        grid[i].show();
    }

    current.visited = true;
    var nextCell = current.checkNeighbors();
    if(nextCell){
        nextCell.visited = true;
        stack.push(current);
        removeWalls(current,nextCell);
        current = nextCell;
    } else if(stack.length > 0){
        current = stack.pop();
    }
}

function generate(){
    grid = [];
    stack = [];
    cols = floor(width / w);
    rows = floor(height / w);

    for(var y = 0; y < rows; y++){
        for(var x = 0; x < cols; x++){
            var cell = new Cell(x,y);
            grid.push(cell);
        }
    }

    current = grid[0];
    loop();
}

function gridIndex(x,y){
    if(x < 0 || y < 0 || x > cols-1 || y > rows-1) {
        return -1;
    }

    return x + y * cols;
}

function Cell(x,y){
    this.x = x;
    this.y = y;
    this.walls = [true,true,true,true]; // top, right, bottom, left
    this.visited = false;

    this.checkNeighbors = () => {
        var neightbors = [];
        
        var top = grid[gridIndex(x,y-1)];
        var right = grid[gridIndex(x+1,y)];
        var bottom = grid[gridIndex(x,y+1)];
        var left = grid[gridIndex(x-1,y)];

        [top,right,bottom,left].forEach((cell)=>{
            if(cell && cell.visited === false){
                neightbors.push(cell);
            }
        });

        if(neightbors.length > 0){
            var r = floor(random(0,neightbors.length));
            return neightbors[r];
        } else {
            return undefined;
        }
    };

    this.show = () => {
        var x = this.x * w;
        var y = this.y * w;
        stroke(0);
        if(this.walls[0] == true){
            line(x,y,x+w,y);
        }

        if(this.walls[1] == true){
            line(x+w,y,x+w,y+w);
        }

        if(this.walls[2] == true){
            line(x+w,y+w,x,y+w);
        }

        if(this.walls[3] == true){
            line(x,y+w,x,y);
        }
        
        if(this.visited == true){
            if(this !== current){
                fill(pathColor);
            } else {
                fill(currentColor);
            }
            noStroke();
            rect(x,y,w,w);
        }
    };
}

function removeWalls(a,b){
    var x = a.x - b.x;

    if(x === 1){
        a.walls[3] = false;
        b.walls[1] = false;
    } else if(x === -1){
        a.walls[1] = false;
        b.walls[3] = false;
    }

    var y = a.y - b.y;

    if(y === 1){
        a.walls[0] = false;
        b.walls[2] = false;
    } else if(y === -1){
        a.walls[2] = false;
        b.walls[0] = false;
    }
}