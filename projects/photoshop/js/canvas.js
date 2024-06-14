const TOOL = {
    MOVE: 0,
    BRUSH: 1,
    ERASER: 2
}

class Canvas{
    constructor(config){
        this.fullscreen = config.fullscreen || false;
        this.pixelScale = config.pixelScale || 1;
        this.resizeStrategy = config.resizeStrategy || RESIZE_STRATEGY.PRESERVE;
        this.zoomSensitivity = config.zoomSensitivity || 1;
        
        this.canvas = config.canvas;
        this.width = config.width || 600;
        this.height = config.height || 400;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.parent = config.parent;
        
        this.buttonMap = {
            0: "left",
            1: "middle",
            2: "right"
        };
        
        this.cursor = {
            x: 0,
            y: 0,
            left: false,
            middle: false,
            right: false
        };
        
        this.translation = {
            x: 0,
            y: 0,
        };
        
        this.scale = {
            x: 1,
            y: 1,
        };

        this.imageDimensions = {
            width: 800,
            height: 600
        };

        this.brushSize = 10;

        this.imageData = null;
        
        this.keys = {};
        
        this.showDebug = false;
        this.tool = TOOL.MOVE;
        
        this.currentFrame = 0;
        
        this.init();
    }
    
    init(){ // ANCHOR init
        // check if canvas is already created and if not create a new one
        if(!this.canvas) this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.setAttribute('id','canvas');
        this.imageData = this.ctx.createImageData(this.imageDimensions.width, this.imageDimensions.height);

        // fill image data with white
        for(let i = 0; i < this.imageData.data.length; i += 4){
            this.imageData.data[i] = 255;
            this.imageData.data[i + 1] = 255;
            this.imageData.data[i + 2] = 255;
            this.imageData.data[i + 3] = 255;
        }
        
        if(!this.fullscreen){
            this.canvas.width = this.width * this.pixelScale;
            this.canvas.height = this.height * this.pixelScale;
        } else {
            this.canvas.width = window.innerWidth * this.pixelScale;
            this.canvas.height = window.innerHeight * this.pixelScale;
        }
        
        // apply fullscreen styles if canvas should be fullscreen
        if(this.fullscreen) this.canvas.classList.add('fullscreen');
        
        // append to parent (or body if there is no parent)
        if(!this.parent) document.body.appendChild(this.canvas);
        else this.parent.appendChild(this.canvas);
        
        // events 
        this.canvas.onmousemove = (e) => this.cursorMove(e);
        this.canvas.addEventListener("mousedown", this.cursorDown.bind(this));
        this.canvas.addEventListener("mouseup", this.cursorUp.bind(this));
        window.addEventListener('keydown',this.keyDown.bind(this));
        window.addEventListener('keyup',this.keyUp.bind(this));
        this.canvas.addEventListener('mousewheel',this.scroll.bind(this));
        this.canvas.addEventListener('DOMMouseScroll',this.scroll.bind(this));
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());
        
        window.addEventListener('resize', this.windowResize.bind(this));
        
        this.animate();
    }
    
    animate(){ // ANCHOR animate
        requestAnimationFrame(this.animate.bind(this));

        // calculate delta time for transitions
        let deltaTime = (Date.now() - this.lastFrameTime || 0) / 1000;
        this.lastFrameTime = Date.now();

        // clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // draw grid that moves with the canvas (only when debug mode is active)
        this.drawGrid(this.ctx);
        
        // scale and translate
        this.ctx.save();
        this.ctx.translate(this.translation.x, this.translation.y);
        this.ctx.scale(this.scale.x, this.scale.y);
        
        this.ctx.lineWidth = 0.5;

        // draw image in center
        this.ctx.putImageData(this.imageData, this.translation.x, this.translation.y, 0, 0, this.imageDimensions.width, this.imageDimensions.height);
        
        // shows mouse position on the canvas
        if(this.showDebug){
            this.ctx.fillStyle = 'rgba(0,0,0,0)';
            this.ctx.beginPath();
            this.ctx.arc(this.cursor.x, this.cursor.y, 10 / this.scale.x, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();

            // draw mouse position above the cursor
            this.ctx.fillStyle = 'black';
            this.ctx.textAlign = 'center';
            this.ctx.font = `5px Arial`;
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`(${Math.round(this.cursor.x)}, ${Math.round(this.cursor.y)})`, this.cursor.x, this.cursor.y - 20 / this.scale.x);
        }

        if(this.tool == TOOL.ERASER || this.tool == TOOL.BRUSH){
            // draw rect with size of brushSize at mouse position
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            this.ctx.beginPath();
            this.ctx.rect(this.cursor.x - this.brushSize, this.cursor.y - this.brushSize, this.brushSize, this.brushSize);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        this.globalAlpha = 1;
        
        // restore canvas to normal
        this.ctx.restore();
    }

    getLayerColor(x, y, width){
        x = Math.floor(x);
        y = Math.floor(y);
        const red = y * (width * 4) + x * 4;
        return [red, red + 1, red + 2, red + 3];
    }

    setLayerColor(x,y,width,color){
        x = Math.floor(x);
        y = Math.floor(y);
        const red = y * (width * 4) + x * 4;
        this.imageData.data[red] = color.r;
        this.imageData.data[red + 1] = color.g;
        this.imageData.data[red + 2] = color.b;
        this.imageData.data[red + 3] = color.a;
    }
    
    windowResize(e){ // ANCHOR windowResize
        if(!this.fullscreen) return;
        
        // adjust based on resize strategy
        switch(this.resizeStrategy){
            case RESIZE_STRATEGY.NONE:
            return;
            case RESIZE_STRATEGY.PRESERVE:
            this.canvas.width = window.innerWidth * this.pixelScale;
            this.canvas.height = window.innerHeight * this.pixelScale;
            break;
        }
    }
    
    cursorDown(e){ // ANCHOR cursorDown
        this.canvas.style.cursor = "grabbing";
        this.cursor[this.buttonMap[e.button]] = true;
    }
    
    cursorUp(e){ // ANCHOR cursorUp
        this.canvas.style.cursor = "grab";
        this.cursor[this.buttonMap[e.button]] = false;
    }
    
    cursorMove(e){ // ANCHOR cursorMove
        const rect = this.canvas.getBoundingClientRect();
        // calculate mouse position in canvas
        this.cursor.x = e.clientX - rect.left;
        this.cursor.y = e.clientY - rect.top;
        
        // apply canvas scale
        this.cursor.x /= (rect.width / this.canvas.width);
        this.cursor.y /= (rect.height / this.canvas.height);
        
        // apply translation (move)
        this.cursor.x -= this.translation.x;       // ORDER OF THESE 3 OPERATIONS MATTER
        this.cursor.y -= this.translation.y;
        
        // apply scale (zoom)
        this.cursor.x /= this.scale.x;
        this.cursor.y /= this.scale.y;

        if(this.tool === TOOL.BRUSH && this.cursor.left){
            // fill circle with size of brushSize
            for(let i = 0; i < this.brushSize; i++){
                for(let j = 0; j < this.brushSize; j++){
                    this.setLayerColor(this.cursor.x - i, this.cursor.y - j, this.imageDimensions.width, {r: 255, g: 255, b: 255, a: 255});
                }
            }
        }

        if(this.tool === TOOL.ERASER && this.cursor.left){
            for(let i = 0; i < this.brushSize; i++){
                for(let j = 0; j < this.brushSize; j++){
                    this.setLayerColor(this.cursor.x - i, this.cursor.y - j, this.imageDimensions.width,{r: 0, g: 0, b: 0, a: 0});
                }
            }
        }
        
        if(this.cursor.left && this.tool == TOOL.MOVE){
            this.translation.x += e.movementX * this.pixelScale;
            this.translation.y += e.movementY * this.pixelScale;
        }
    }
    
    keyDown(e){ // ANCHOR keyDown
        this.keys.shift = e.shiftKey;
        this.keys.ctrl = e.ctrlKey;
        this.keys.alt = e.altKey;
        
        // Press d-key to toggle debug mode
        if(e.key === "d"){
            this.showDebug = !this.showDebug;
        }
    }
    
    keyUp(e){ // ANCHOR keyUp
        this.keys.shift = false;
        this.keys.ctrl = false;
        this.keys.alt = false;
    }
    
    /** mouse wheel handler for canvas */
    scroll(e){ // ANCHOR scroll
        var delta = e.deltaY ? e.deltaY * (this.zoomSensitivity) : (e.detail * (this.zoomSensitivity));

        this.brushSize += delta * -0.01;
        this.brushSize = Math.round(this.brushSize);
        
        /*this.scale.x += delta * -0.0005;
        this.scale.x = Math.min(Math.max(.125 / this.pixelScale, this.scale.x), 4 * this.pixelScale);
        
        this.scale.y += delta * -0.0005;
        this.scale.y = Math.min(Math.max(.125 / this.pixelScale, this.scale.y), 4 * this.pixelScale);
        
        // update mouse position
        const rect = e.target.getBoundingClientRect();
        
        // calculate mouse position in canvas
        this.cursor.x = e.clientX * this.pixelScale - rect.left;
        this.cursor.y = e.clientY * this.pixelScale - rect.top;
        
        // apply canvas scale
        this.cursor.x /= (rect.width / this.canvas.width);
        this.cursor.y /= (rect.height / this.canvas.height);
        
        // apply translation (move)
        this.cursor.x -= this.translation.x;       // ORDER OF THESE 3 OPERATIONS MATTER
        this.cursor.y -= this.translation.y;
        
        // apply scale (zoom)
        this.cursor.x /= this.scale.x;
        this.cursor.y /= this.scale.y;*/
    }
    
    drawGrid(ctx){ // ANCHOR drawGrid
        // calculate grid size
        const gridSize = Math.floor(50 * this.scale.x);
        
        // calculate offset
        const offsetX = Math.floor(this.translation.x % gridSize);
        const offsetY = Math.floor(this.translation.y % gridSize);
        
        // set line color
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 0.25;
        
        // draw vertical lines
        for(let x = offsetX; x < this.canvas.width; x += gridSize){
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // draw horizontal lines
        for(let y = offsetY; y < this.canvas.height; y += gridSize){
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
}

// clamp number between min and max
function clamp(num, min, max) {
    return num <= min 
      ? min 
      : num >= max 
        ? max 
        : num
}

// interpolate a to b by n
function lerp(a, b, n) {
    return (1-n)*a + n*b;
}