/** @const */
const DEFAULT_ROWS = 2;
/** @const */
const DEFAULT_COLUMNS = 2;
/** @const */
const MAX_IMAGE_WIDTH_PERCENTAGE = 50;
/** @const */
const MAX_IMAGE_HEIGHT_PERCENTAGE = 75;
/** @const */
const ANIMATION_DURATION = 250.0;
/** @const */
const MIN_ANIMATION_DURATION = 50.0;
/** @const */
const SOLVE_RANDOM = false;
/** @const */
const HINTS_ENABLED = true;
/** @const */
const SCALE_MULTIPLIER = 2.0;

class Puzzle{
    constructor(obj){
        /** @type {HTMLCanvasElement} */
        this.canvas = obj.canvas;
        /** @type {Number} */
        this.rows = obj.rows || DEFAULT_ROWS;
        /** @type {Number} */
        this.columns = obj.columns || DEFAULT_COLUMNS;

        /** @type {Number} */
        this.maxImageWidth = obj.maxImageWidth || MAX_IMAGE_WIDTH_PERCENTAGE;
        /** @type {Number} */
        this.maxImageHeight = obj.maxImageHeight || MAX_IMAGE_HEIGHT_PERCENTAGE;

        this.animationDuration = obj.animationDuration || ANIMATION_DURATION;
        if(this.animationDuration < MIN_ANIMATION_DURATION) this.animationDuration = MIN_ANIMATION_DURATION;

        /** @type {Number} */
        this.solveRandom = obj.solveRandom || SOLVE_RANDOM;

        /** @type {Boolean} */
        this.hintsEnabled = obj.hintsEnabled && HINTS_ENABLED;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        /** @type {Piece[]} */
        this.pieces = [];

        /** @type {HTMLImageElement} */
        this.img = obj.image;

        this.scaleMultiplier = obj.scaleMultiplier || SCALE_MULTIPLIER;
        this.viewMode = 'all';

        this.zoom = 1.0;
        this.translation = {x: 0, y: 0};
        this.snapTreshold = 20;

        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        };

        this.mouseMap = {
            0: "left",
            1: "middle",
            2: "right"
        };

        // set canvas width and height to image dimensions
        this.canvas.width = window.innerWidth * this.scaleMultiplier;
        this.canvas.height = window.innerHeight * this.scaleMultiplier;

        this.pieceCount = this.rows * this.columns;

        // add event listeners
        this.canvas.addEventListener('mousedown',() => {this.mouseDown(event)});
        this.canvas.addEventListener('mousemove',() => {this.mouseMove(event)});
        this.canvas.addEventListener('mouseup',() => {this.mouseUp(event)});
        this.canvas.addEventListener('mousewheel',this.scroll.bind(this));
        this.canvas.addEventListener('DOMMouseScroll',this.scroll.bind(this));

        // resize canvas on window resize
        window.addEventListener('resize',()=>{
            this.canvas.width = window.innerWidth * this.scaleMultiplier;
            this.canvas.height = window.innerHeight * this.scaleMultiplier;
        });

        requestAnimationFrame(this.draw.bind(this));
    }

    /** mouse move */
    translate(e){ // ANCHOR translate
        this.translation.x += (e.movementX) / (this.zoom / this.scaleMultiplier);
        this.translation.y += e.movementY * this.scaleMultiplier;
    }

    scroll(e){ // ANCHOR scroll
        console.log(e);
        var delta = e.deltaY ? e.deltaY : (e.detail * 10);
        var prevZoom = this.zoom;
    
        this.zoom += delta * -0.0005;
        // max scale 4x min scale 0.125x
        this.zoom = Math.min(Math.max(.125, this.zoom), 4);
    
        // Calculate the ratio between the new and previous zoom levels
        var zoomRatio = this.zoom / prevZoom;
    
        // Adjust translation to zoom around the mouse position
        const mX = this.mouse.x + (this.translation.x / this.zoom);
        const mY = this.mouse.y + (this.translation.y / this.zoom);
        this.translation.x = mX - (mX - this.translation.x) * zoomRatio;
        this.translation.y = mY - (mY - this.translation.y) * zoomRatio;

        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // calculate mouse position in canvas with scale and translation
        this.mouse.x = (this.mouse.x - this.translation.x) / (this.zoom / this.scaleMultiplier);
        this.mouse.y = (this.mouse.y - this.translation.y) / (this.zoom / this.scaleMultiplier);
    }

    mouseMove(e){ // ANCHOR mousemove
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // calculate mouse position in canvas with scale and translation
        this.mouse.x = (this.mouse.x - this.translation.x) / (this.zoom / this.scaleMultiplier);
        this.mouse.y = (this.mouse.y - this.translation.y) / (this.zoom / this.scaleMultiplier);

        const mX = this.mouse.x + (this.translation.x / this.zoom);
        const mY = this.mouse.y + (this.translation.y / this.zoom);

        let lowestDist = Number.MAX_SAFE_INTEGER;

        if(!this.movingPiece && this.mouse['left']){
            this.pieces.forEach(pieceList => {
                for(const piece of pieceList){
                    const dist = piece.distance({x: mX, y: mY});
                    if(dist < Math.max(piece.widthHalf, piece.heightHalf) && dist < lowestDist){
                        this.movingPiece = piece;
                        lowestDist = dist;
                    }
                }
            });
        }

        if(this.mouse['left'] && !this.movingPiece) this.translate(e);
        else if(this.mouse['left'] && this.movingPiece) {
            this.movingPiece.x += (e.movementX) / (this.zoom / this.scaleMultiplier);
            this.movingPiece.y += (e.movementY) / (this.zoom / this.scaleMultiplier);
        }
    }

    /** mouse down handler for canvas */
    mouseDown(e){ // ANCHOR mouseDown
        this.canvas.style.cursor = "grabbing";
        this.mouse[this.mouseMap[e.button]] = true;
    }

    /** mouse up handler for canvas */
    mouseUp(e){ // ANCHOR mouseUp
        this.canvas.style.cursor = "grab";
        // get previous mouse state
        const previousMouse = {
            left: this.mouse.left,
            right: this.mouse.right,
            middle: this.mouse.middle
        };
        this.mouse[this.mouseMap[e.button]] = false;

        const mX = this.mouse.x + (this.translation.x / this.zoom);
        const mY = this.mouse.y + (this.translation.y / this.zoom);
        const mouseTmp = {x: mX, y: mY};

        const near = [];
        const allPieces = [];
        this.pieces.forEach(pieceList => {
            for(const p of pieceList){
                allPieces.push(p);
            }
        });
        for(const p1 of allPieces){
            for(const p2 of allPieces){
                if(p1 != p2 && p1 !== this.movingPiece && p2 !== this.movingPiece){
                    const xDiff = p1.x - p2.x;
                    const yDiff = p1.y - p2.y;
                    // draw point from dist.start to dist.end
                    console.log(xDiff < (p1.width + this.snapTreshold) && yDiff < (p1.height + this.snapTreshold), p1.width, p1.height)
                    if(xDiff < (p1.width + this.snapTreshold) && yDiff < (p1.height + this.snapTreshold)){
                        let type = '';
                        if(yDiff < -(p1.heightHalf)) type = 'top';
                        else if(yDiff > p1.heightHalf) type = 'bottom';
                        else if(xDiff < -(p1.widthHalf)) type = 'right';
                        else if(xDiff > p1.widthHalf) type = 'left';
                        near.push({piece: p1, type: type, xDiff, yDiff});
                    }
                }
            }
        }
        console.log(near);
        for(const p of near){
            const x = p.piece.column;
            const y = p.piece.row;

            console.log(x,y);
            console.log(this.movingPiece.neighbours[p.type]);

            if(this.movingPiece.neighbours[p.type].x == x && this.movingPiece.neighbours[p.type].y == y){
                console.log('correct')
            }
        }

        this.movingPiece = undefined;
    }

    calcImage(){
        // check if image width is greater than height
        if(this.img.width > this.img.height){
            // place image in the middle of canvas
            let width = this.canvas.width * (this.maxImageWidth / 100);
            let height = 0;
            let ratio = this.img.width / this.img.height;

            do {
                // calculate aspect ratio to calculate height
                height = width / ratio;

                // if height is greater than max image height, reduce width
                if(height > this.canvas.height * ((this.maxImageHeight / 100))){
                    width--;
                }

            } while(height > this.canvas.height * ((this.maxImageHeight / 100)));

            // calculate x and y coordinates of image
            let x = this.canvas.width / 2.0 - width / 2.0;
            let y = this.canvas.height / 2.0 - height / 2.0;

            this.imgX = x;
            this.imgY = y;
            this.imgWidth = width;
            this.imgHeight = height;
        } else {
            // place image in the middle of canvas
            let height = this.canvas.height * (this.maxImageHeight / 100);
            // calculate aspect ratio to calculate height
            let ratio = this.img.height / this.img.width;
            let width = 0;

            do {
                // calculate aspect ratio to calculate height
                width = height / ratio;

                // if height is greater than max image height, reduce width
                if(width > this.canvas.width * ((this.maxImageWidth / 100))){
                    height--;
                }

            } while(width > this.canvas.width * ((this.maxImageWidth / 100)));

            // calculate x and y coordinates of image
            let x = this.canvas.width / 2.0  - width / 2.0;
            let y = this.canvas.height / 2.0 - height / 2.0;

            this.imgX = x;
            this.imgY = y;
            this.imgWidth = width;
            this.imgHeight = height;
        }
    }

    generatePieces(){
        this.calcImage();

        var puzzleWidth = this.imgWidth / this.columns;
        var puzzleHeight = this.imgHeight / this.rows;
        
        for(var y = 0; y < this.rows; y++){
            for(var x = 0; x < this.columns; x++){
                if(!this.pieces[x]) this.pieces[x] = [];
                this.pieces[x][y] = (new Piece({
                    x:x*puzzleWidth+this.imgX,
                    y:y*puzzleHeight+this.imgY,
                    width:puzzleWidth,
                    height:puzzleHeight,
                    row:y,
                    column:x,
                    rows:this.rows,
                    columns:this.columns,
                    img:this.img,
                    ctx:this.ctx,
                    zIndex: 0,
                    hintsEnabled: this.hintsEnabled
                }));
                this.pieces[x][y].isBorder = (y == 0 || y == this.rows-1 || x == 0 || x == this.columns-1);
                this.pieces[x][y].neighbours = {
                    left: {x: x-1, y: y},
                    right: {x: x == this.columns - 1 ? -1 : x+1, y: y},
                    top: {x: x, y: y-1},
                    bottom: {x: x, y: y == this.rows - 1 ? -1 : y+1},
                };
            }
        }

        for(var y = 0; y < this.rows; y++){            
            for(var x = 0; x < this.columns; x++){
                var curPiece = this.pieces[x][y];

                if(y === this.rows - 1){
                    curPiece.bottom = null;
                } else {
                    var tabState = Math.random() > 0.5 ? 1 : -1;
                    var pos = tabState * (Math.random() * 0.4 + 0.3); // between 0.3 and 0.7 (to avoid overlapping tabs)
                    curPiece.bottom = pos;
                }

                if(x === this.columns - 1){
                    curPiece.right = null;
                } else {
                    var tabState = Math.random() > 0.5 ? 1 : -1;
                    var pos = tabState * (Math.random() * 0.4 + 0.3); // between 0.3 and 0.7 (to avoid overlapping tabs)
                    curPiece.right = pos;
                }

                if(x === 0){
                    curPiece.left = null;
                } else {
                    var pos = -this.pieces[x-1][y].right;
                    curPiece.left = pos;
                }

                if(y === 0){
                    curPiece.top = null;
                } else {
                    var tabState = Math.random() > 0.5 ? 1 : -1;
                    var pos = -this.pieces[x][y-1].bottom;
                    curPiece.top = pos;
                }
            }
        }

        this.randomizePieces();
    }

    randomizePieces() {
        let puzzleWidth = this.pieces[0][0].width;
        let puzzleHeight = this.pieces[0][0].height;
    
        let placedCount = 0;
    
        const emptyRect = {
            width: this.canvas.height,
            height: this.canvas.height,
            x: (this.canvas.width / 2) - (this.canvas.height / 2),
            y: (this.canvas.height / 2) - (this.canvas.height / 2),
        };
    
        const isInsideEmptyRect = (x, y) => {
            return (
                x >= emptyRect.x &&
                x <= emptyRect.x + emptyRect.width &&
                y >= emptyRect.y &&
                y <= emptyRect.y + emptyRect.height
            );
        };
    
        const placedPositions = [];
    
        for (let y = 0; y < this.pieces.length; y++) {
            for (let x = 0; x < this.pieces[y].length; x++) {
                const piece = this.pieces[y][x];
    
                let pieceX, pieceY;
                let isInside = true;
    
                while (isInside) {
                    pieceX = Math.floor(Math.random() * this.canvas.width);
                    pieceY = Math.floor(Math.random() * this.canvas.height);
    
                    isInside = isInsideEmptyRect(pieceX, pieceY);
    
                    for (const position of placedPositions) {
                        if (
                            pieceX >= position.x - puzzleWidth && pieceX <= position.x + puzzleWidth &&
                            pieceY >= position.y - puzzleHeight && pieceY <= position.y + puzzleHeight
                        ) {
                            isInside = true;
                            break;
                        }
                    }
                }
    
                piece.setPosition(pieceX, pieceY);
                placedCount++;
                placedPositions.push({ x: pieceX, y: pieceY });
            }
        }
    
        // Optionally, you can also represent the empty rectangle conceptually
        this.emptyRect = emptyRect;
    }
    

    draw(){
        const mX = this.mouse.x + (this.translation.x / this.zoom);
        const mY = this.mouse.y + (this.translation.y / this.zoom);

        this.ctx.clearRect(0, 0, this.canvas.width,this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.translation.x, this.translation.y);
        this.ctx.scale(this.zoom, this.zoom);

        // draw image
        if(this.img){
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(this.img,this.imgX,this.imgY,this.imgWidth,this.imgHeight);
        }

        this.ctx.globalAlpha = 1;

        const all = [];
        this.pieces.forEach(pieceList => {
            for(const piece of pieceList){
                all.push(piece);
                if(this.viewMode == 'all' || (this.viewMode == 'border' && piece.isBorder === true) || (this.viewMode == 'non-border' && piece.isBorder === false)) piece.draw(this.ctx);
            }
        });

        this.ctx.strokeStyle = 'red';
            for(const p1 of all){
                for(const p2 of all){
                    if(p1 != p2){
                        const dist = p1.distance2D(p2);
                        // draw point from dist.start to dist.end
                        this.ctx.beginPath();
                        this.ctx.moveTo(dist.start.x, dist.start.y);
                        this.ctx.lineTo(dist.end.x, dist.end.y);
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                }
            }

        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(mX - 10, mY - 10, 20, 20);

        this.ctx.restore();
        requestAnimationFrame(this.draw.bind(this));
    }
}

class Piece{
    constructor(obj){
        this.x = obj.x;
        this.xCorrect = obj.x;
        this.y = obj.y;
        this.yCorrect = obj.y;
        this.row = obj.row;
        this.zIndex = obj.zIndex;
        this.hintsEnabled = obj.hintsEnabled;
        this.column = obj.column;
        this.rows = obj.rows;
        this.columns = obj.columns;
        this.img = obj.img;
        this.width = obj.width;
        this.height = obj.height;
        this.widthHalf = this.width / 2;
        this.heightHalf = this.height / 2;
        this.ctx = obj.ctx;
    }

    draw(ctx, stroke){
        ctx.strokeStyle = stroke || '#000';
        ctx.fillStyle = '#000';
        ctx.beginPath();

        const size = Math.min(this.width, this.height);
        const neck = 0.1 * size;
        const tabWidth = 0.2 * size;
        const tabHeight = 0.2 * size;

        // from top left
        ctx.moveTo(this.x,this.y);
        // to top right
        if(this.top){
            ctx.lineTo(this.x+this.width*Math.abs(this.top)-neck,this.y);
            ctx.bezierCurveTo(
                this.x+this.width*Math.abs(this.top)-neck,
                this.y-tabHeight*Math.sign(this.top)*0.2,

                this.x+this.width*Math.abs(this.top)-tabWidth,
                this.y-tabHeight*Math.sign(this.top),

                this.x+this.width*Math.abs(this.top),
                this.y-tabHeight*Math.sign(this.top)
            );
            ctx.bezierCurveTo(
                this.x+this.width*Math.abs(this.top)+tabWidth,
                this.y-tabHeight*Math.sign(this.top),

                this.x+this.width*Math.abs(this.top)+neck,
                this.y-tabHeight*Math.sign(this.top)*0.2,

                this.x+this.width*Math.abs(this.top)+neck,
                this.y
            );
            ctx.lineTo(this.x+this.width*Math.abs(this.top)+neck,this.y);
        }
        ctx.lineTo(this.x+this.width,this.y);
        // to bottom right
        if(this.right){
            ctx.lineTo(this.x+this.width,this.y+this.height*Math.abs(this.right)-neck);
            ctx.bezierCurveTo(
                this.x+this.width-tabHeight*Math.sign(this.right)*0.2,
                this.y+this.height*Math.abs(this.right)-neck,

                this.x+this.width-tabHeight*Math.sign(this.right),
                this.y+this.height*Math.abs(this.right)-tabWidth,

                this.x+this.width-tabHeight*Math.sign(this.right),
                this.y+this.height*Math.abs(this.right)
            );
            ctx.bezierCurveTo(
                this.x+this.width-tabHeight*Math.sign(this.right),
                this.y+this.height*Math.abs(this.right)+tabWidth,

                this.x+this.width-tabHeight*Math.sign(this.right)*0.2,
                this.y+this.height*Math.abs(this.right)+neck,

                this.x+this.width,
                this.y+this.height*Math.abs(this.right)+neck
            );
            ctx.lineTo(this.x+this.width,this.y+this.height*Math.abs(this.right)+neck);
        }
        ctx.lineTo(this.x+this.width,
                   this.y+this.height);
        // to bottom left
        if(this.bottom){
            ctx.lineTo(this.x+this.width*Math.abs(this.bottom)+neck,this.y+this.height);
            ctx.bezierCurveTo(
                this.x+this.width*Math.abs(this.bottom)+neck,
                this.y+this.height+tabHeight*Math.sign(this.bottom)*0.2,

                this.x+this.width*Math.abs(this.bottom)+tabWidth,
                this.y+this.height+tabHeight*Math.sign(this.bottom),

                this.x+this.width*Math.abs(this.bottom),
                this.y+this.height+tabHeight*Math.sign(this.bottom)
            );
            ctx.bezierCurveTo(
                this.x+this.width*Math.abs(this.bottom)-tabWidth,
                this.y+this.height+tabHeight*Math.sign(this.bottom),

                this.x+this.width*Math.abs(this.bottom)-neck,
                this.y+this.height+tabHeight*Math.sign(this.bottom)*0.2,

                this.x+this.width*Math.abs(this.bottom)-neck,
                this.y+this.height
            );
            ctx.lineTo(this.x+this.width*Math.abs(this.bottom)-neck,this.y+this.height);
        }
        ctx.lineTo(this.x,this.y+this.height);
        // back to top left
        if(this.left){
            ctx.lineTo(this.x,this.y+this.height*Math.abs(this.left)+neck);
            ctx.bezierCurveTo(
                this.x+tabHeight*Math.sign(this.left)*0.2,
                this.y+this.height*Math.abs(this.left)+neck,

                this.x+tabHeight*Math.sign(this.left),
                this.y+this.height*Math.abs(this.left)+tabWidth,

                this.x+tabHeight*Math.sign(this.left),
                this.y+this.height*Math.abs(this.left)
            );

            ctx.bezierCurveTo(
                this.x+tabHeight*Math.sign(this.left),
                this.y+this.height*Math.abs(this.left)-tabWidth,

                this.x+tabHeight*Math.sign(this.left)*0.2,
                this.y+this.height*Math.abs(this.left)-neck,

                this.x,
                this.y+this.height*Math.abs(this.left)-neck
            );
            ctx.lineTo(this.x,this.y+this.height*Math.abs(this.left)-neck);
        }
        ctx.lineTo(this.x,this.y);

        ctx.save();
        ctx.clip();

        const scaledTabHeight = Math.min(this.img.naturalWidth/this.columns,
                                this.img.naturalHeight/this.rows)*tabHeight/size;

        ctx.drawImage(this.img,
            this.column*(this.img.naturalWidth/this.columns)-scaledTabHeight,
            this.row*(this.img.naturalHeight/this.rows)-scaledTabHeight,
            this.img.naturalWidth/this.columns+(scaledTabHeight*2),
            this.img.naturalHeight/this.rows+(scaledTabHeight*2),
            this.x-tabHeight,
            this.y-tabHeight,
            this.width+tabHeight*2,
            this.height+tabHeight*2);

        ctx.restore();
        ctx.stroke();
        this.ctx.strokeStyle = '#000';
    }

    setPosition(x,y){
        this.x = x;
        this.y = y;
    }

    distance(b){
        const cX = this.x + this.width / 2;
        const cY = this.y + this.height / 2;
        return Math.sqrt(Math.pow(cX-b.x,2)+Math.pow(cY-b.y,2));
    }

    distance2D(b){
        const cX = this.x + this.width / 2;
        const cY = this.y + this.height / 2;

        const pX = b.x + this.width / 2;
        const pY = b.y + this.height / 2;

        const xDist = Math.abs(cX - pX);
        const yDist = Math.abs(cY - pY);

        return {x: xDist, y: yDist, start: {x: cX, y: cY}, end: {x: pX, y: pY}};
    }

    isNear(p){
        const cX = this.x + this.width / 2;
        const cY = this.y + this.height / 2;

        const pX = p.x + this.width / 2;
        const pY = p.y + this.height / 2;

        const minXDist = (this.width / 2 - 10) * 2;
        const maxXDist = minXDist + 40;
        const minYDist = (this.height / 2 - 10) * 2;
        const maxYDist = minYDist + 40;

        const xDist = Math.abs(cX - pX);
        const yDist = Math.abs(cY - pY);
        
        return (xDist >= minXDist && xDist <= maxXDist) && (yDist >= minYDist && yDist <= maxYDist);
    }
}