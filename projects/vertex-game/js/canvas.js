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
        
        this.keys = {};
        
        this.vertices = [
            {x: 0, y: 0},
            {x: 25, y: 50},
            {x: 50, y: 0},
            {x: 0, y: 35},
            {x: 75, y: 50},
            {x: 50, y: 70},
            {x: 17.5, y: 65},
            {x: 25, y: -50},
            {x: 100, y: 0},
            {x: 125, y: 50},
            {x: 150, y: 0},
            {x: 175, y: 50},
            {x: 200, y: 0},
            {x: 225, y: 50},
            {x: 250, y: 0},
            {x: 100, y: 70},
            {x: 150, y: 70},
            {x: 200, y: 70},
            {x: 232.5, y: 65},
            {x: 250, y: 35},
            {x: 75, y: -50},
            {x: 125, y: -50},
            {x: 175, y: -50},
            {x: 225, y: -50},
            {x: 50, y: -100},
            {x: 100, y: -100},
            {x: 150, y: -100},
            {x: 200, y: -100},
            {x: 75, y: -150},
            {x: 125, y: -150},
            {x: 175, y: -150},
            {x: 100, y: -200},
            {x: 150, y: -200},
            {x: 125, y: -250}
        ];
        
        this.vertexFaces = [
            {vertices: [0,1,2], color: '#77ab58'},
            {vertices: [0,1,3], color: '#416443'},
            {vertices: [1,2,4], color: '#b2d19d'},
            {vertices: [1,4,5], color: '#416443'},
            {vertices: [1,3,6], color: '#174311'},
            {vertices: [1,5,6], color: '#174311'},
            {vertices: [0,2,7], color: '#d32f2e'},
            {vertices: [2,4,8], color: '#77ab58'},
            {vertices: [4,8,9], color: '#b2d19d'},
            {vertices: [8,9,10], color: '#77ab58'},
            {vertices: [9,10,11], color: '#b2d19d'},
            {vertices: [10,11,12], color: '#77ab58'},
            {vertices: [11,12,13], color: '#b2d19d'},
            {vertices: [12,13,14], color: '#77ab58'},
            {vertices: [4,5,15], color: '#174311'},
            {vertices: [4,9,15], color: '#416443'},
            {vertices: [9,15,16], color: '#174311'},
            {vertices: [9,11,16], color: '#416443'},
            {vertices: [11,16,17], color: '#174311'},
            {vertices: [11,13,17], color: '#416443'},
            {vertices: [13,17,18], color: '#174311'},
            {vertices: [13,18,19], color: '#174311'},
            {vertices: [13,14,19], color: '#416443'},
            {vertices: [2,7,20], color: '#df5655'},
            {vertices: [2,8,20], color: '#d32f2e'},
            {vertices: [8,20,21], color: '#df5655'},
            {vertices: [8,10,21], color: '#d32f2e'},
            {vertices: [10,21,22], color: '#df5655'},
            {vertices: [10,12,22], color: '#d32f2e'},
            {vertices: [12,22,23], color: '#df5655'},
            {vertices: [12,14,23], color: '#d32f2e'},
            {vertices: [7,20,24], color: '#d32f2e'},
            {vertices: [20,24,25], color: '#df5655'},
            {vertices: [20,21,25], color: '#d32f2e'},
            {vertices: [21,25,26], color: '#df5655'},
            {vertices: [21,22,26], color: '#d32f2e'},
            {vertices: [22,26,27], color: '#df5655'},
            {vertices: [22,23,27], color: '#d32f2e'},
            {vertices: [24,25,28], color: '#d32f2e'},
            {vertices: [25,28,29], color: '#df5655'},
            {vertices: [25,26,29], color: '#d32f2e'},
            {vertices: [26,29,30], color: '#df5655'},
            {vertices: [26,27,30], color: '#d32f2e'},
            {vertices: [28,29,31], color: '#d32f2e'},
            {vertices: [29,31,32], color: '#df5655'},
            {vertices: [29,30,32], color: '#d32f2e'},
            {vertices: [31,32,33], color: '#d32f2e'},
        ];
        
        // calc remaining connections
        for(let i = 0; i < this.vertices.length; i++){
            // remaining connections = how many times the id is in one of the vertex faces
            this.vertices[i].remainingConnections = this.vertexFaces.filter(f => f.vertices.includes(i)).length + 1;
            this.vertices[i].id = i;
            this.vertices[i].hovered = false;
            this.vertices[i].circlePadding = 2;
            this.vertices[i].opacity = 0;
        }

        // calc remaining connections
        for(let i = 0; i < this.vertexFaces.length; i++){
            // remaining connections = how many times the id is in one of the vertex faces
            this.vertexFaces[i].show = false;
            this.vertexFaces[i].opacity = 0;
        }
        
        this.vertexConnections = [
            
        ];

        this.fadeOutConnections = [];
        
        this.blockTranslation = false;
        this.baseVertex = null;
        this.connectTo = null;
        
        this.showDebug = false;
        
        this.vertexSize = 5;
        
        this.currentFrame = 0;
        this.finished = false;
        
        this.init();
    }
    
    init(){ // ANCHOR init
        // check if canvas is already created and if not create a new one
        if(!this.canvas) this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.setAttribute('id','canvas');
        
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

        let deltaTime = (Date.now() - this.lastFrameTime || 0) / 1000;
        this.lastFrameTime = Date.now();

        if(this.baseVertex){
            if(this.baseVertex.circlePadding < 3) this.baseVertex.circlePadding += deltaTime * 10;
            else this.baseVertex.circlePadding = 3;

            // decrease all other vertices circlePadding
            for(let i = 0; i < this.vertices.length; i++){
                if(this.vertices[i] !== this.baseVertex){
                    if(this.vertices[i].circlePadding > 2) this.vertices[i].circlePadding -= deltaTime * 10;
                    else this.vertices[i].circlePadding = 2;
                }
            }
        } else {
            for(let i = 0; i < this.vertices.length; i++){
                if(this.vertices[i].circlePadding > 2) this.vertices[i].circlePadding -= deltaTime * 10;
                else this.vertices[i].circlePadding = 2;
            }
        }
        
        // clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // draw grid that moves with the canvas
        // this.drawGrid(this.ctx);
        
        // scale and translate
        this.ctx.save();
        this.ctx.translate(this.translation.x, this.translation.y);
        this.ctx.scale(this.scale.x, this.scale.y);
        
        this.ctx.lineWidth = 0.5;
        
        // draw vertex connections (line from point a to b)
        for(let i = 0; i < this.vertexConnections.length; i++){
            this.ctx.strokeStyle = 'black';
            this.ctx.beginPath();
            this.ctx.moveTo(this.vertexConnections[i].a.x, this.vertexConnections[i].a.y);
            this.ctx.lineTo(this.vertexConnections[i].b.x, this.vertexConnections[i].b.y);
            this.ctx.stroke();
        }
        
        // draw vertex faces (polygon with lines from vertices in the face)
        for(let i = 0; i < this.vertexFaces.length; i++){
            if(!this.vertexFaces[i].show){
                if(this.vertexFaces[i].opacity > 0) this.vertexFaces[i].opacity = clamp(this.vertexFaces[i].opacity - deltaTime * 4, 0, 1);
                continue;
            }
            this.ctx.globalAlpha = this.vertexFaces[i].opacity;
            if(this.vertexFaces[i].opacity < 1) this.vertexFaces[i].opacity = clamp(this.vertexFaces[i].opacity + deltaTime * 4, 0, 1);
            this.ctx.fillStyle = this.vertexFaces[i].color;
            this.ctx.strokeStyle = this.vertexFaces[i].color;
            this.ctx.beginPath();
            this.ctx.moveTo(this.vertices[this.vertexFaces[i].vertices[0]].x, this.vertices[this.vertexFaces[i].vertices[0]].y);
            for(let j = 1; j < this.vertexFaces[i].vertices.length; j++){
                this.ctx.lineTo(this.vertices[this.vertexFaces[i].vertices[j]].x, this.vertices[this.vertexFaces[i].vertices[j]].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
        
        this.ctx.fillStyle = '#202020';
        
        /* this.ctx.beginPath();
        this.ctx.rect(0,0,30,30);
        this.ctx.stroke();
        this.ctx.fill(); */
        
        // draw dashed line from baseVertex to current cursor position if baseVertex is set
        if(this.baseVertex){
            this.ctx.strokeStyle = this.vertices.filter(v => v.id !== this.baseVertex.id && v.hovered === true).length > 0 ? '#e8ae35' : 'black';
            this.ctx.beginPath();
            this.ctx.setLineDash([2, 2]);
            this.ctx.moveTo(this.baseVertex.x, this.baseVertex.y);
            this.ctx.lineTo(this.cursor.x, this.cursor.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // draw fadeoutconnections
        for(let i = 0; i < this.fadeOutConnections.length; i++){
            this.ctx.strokeStyle = this.fadeOutConnections[i].color || 'black';
            this.ctx.beginPath();
            this.ctx.setLineDash([2, 2]);
            this.ctx.moveTo(this.fadeOutConnections[i].start.x, this.fadeOutConnections[i].start.y);
            this.ctx.lineTo(this.fadeOutConnections[i].end.x, this.fadeOutConnections[i].end.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // lerp end point to start point and if the end point is close to the start point remove the connection
            if(Math.abs(this.fadeOutConnections[i].end.x - this.fadeOutConnections[i].start.x) < 5 && Math.abs(this.fadeOutConnections[i].end.y - this.fadeOutConnections[i].start.y) < 5){
                this.fadeOutConnections.splice(i, 1);
            } else {
                this.fadeOutConnections[i].end.x = lerp(this.fadeOutConnections[i].end.x, this.fadeOutConnections[i].start.x, deltaTime * 10);
                this.fadeOutConnections[i].end.y = lerp(this.fadeOutConnections[i].end.y, this.fadeOutConnections[i].start.y, deltaTime * 10);
            }
        }
        
        // draw points (vertices) with the number of remaining connections in it
        for(let i = 0; i < this.vertices.length; i++){
            this.ctx.strokeStyle = 'black';
            this.ctx.globalAlpha = this.vertices[i].opacity;
            if(!this.finished){
                if(this.vertices[i].opacity < 1) this.vertices[i].opacity = clamp(this.vertices[i].opacity + deltaTime * 4, 0, 1);
            } else {
                if(this.vertices[i].opacity > 0) this.vertices[i].opacity = clamp(this.vertices[i].opacity - deltaTime * 4, 0, 1);
            }

            this.ctx.fillStyle = (this.vertices[i].hovered || this.vertices[i] === this.baseVertex ? 'rgba(200,200,200,.5)' : 'rgba(0,0,0,0)');
            
            // draw dotted outline with a radius of 5 bigger than the point
            this.ctx.beginPath();
            this.ctx.setLineDash([1, 1]);
            this.ctx.arc(this.vertices[i].x, this.vertices[i].y, this.vertexSize + this.vertices[i].circlePadding, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.setLineDash([]);
            
            this.ctx.fillStyle = this.vertices[i].hovered ? this.baseVertex ? '#e8ae35' : 'black' : 'white';
            this.ctx.strokeStyle = this.vertices[i].hovered ? this.baseVertex ? 'black' : 'white' : 'black';
            
            this.ctx.beginPath();
            this.ctx.arc(this.vertices[i].x, this.vertices[i].y, this.vertexSize, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            
            // draw number of connections remaining in the center of the point
            this.ctx.fillStyle = this.vertices[i].hovered ? this.baseVertex ? 'black' : 'white' : 'black';
            this.ctx.textAlign = 'center';
            this.ctx.font = `${this.vertexSize}px Arial`;
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.showDebug ? this.vertices[i].id : this.vertices[i].remainingConnections, this.vertices[i].x, this.vertices[i].y);
        }
        
        // draw cursor on top of everything else
        this.ctx.lineWidth = 1 / this.scale.x;
        this.ctx.fillStyle = 'rgba(255,255,255,.25)';
        this.globalAlpha = 0.25;

        if(this.baseVertex){
            // draw dotted outline with a radius of 5 bigger than the point
            this.ctx.beginPath();
            this.ctx.setLineDash([1, 1]);
            this.ctx.arc(this.cursor.x, this.cursor.y, this.vertexSize / 2 + 2, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.setLineDash([]);

            this.ctx.fillStyle = this.vertices.filter(v => v.id !== this.baseVertex.id && v.hovered === true).length > 0 ? '#e8ae35' : 'black';
            this.ctx.strokeStyle = this.vertices.filter(v => v.id !== this.baseVertex.id && v.hovered === true).length > 0 ? '#e8ae35' : 'black';

            this.ctx.beginPath();
            this.ctx.arc(this.cursor.x, this.cursor.y, this.vertexSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        if(this.showDebug){
            this.ctx.beginPath();
            this.ctx.arc(this.cursor.x, this.cursor.y, 10 / this.scale.x, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        this.globalAlpha = 1;
        
        // restore canvas to normal
        this.ctx.restore();
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
        
        // check if the cursor is over a vertex
        for(let i = 0; i < this.vertices.length; i++){
            const dx = this.vertices[i].x - this.cursor.x;
            const dy = this.vertices[i].y - this.cursor.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if(distance < this.vertexSize){
                if(this.cursor.left){
                    this.baseVertex = this.vertices[i];
                    this.blockTranslation = true;
                    break;
                } else if(this.cursor.right) {
                    // remove all vertex connections that connect to this vertex
                    for(let j = 0; j < this.vertexConnections.length; j++){
                        if(this.vertexConnections[j].a === this.vertices[i]){
                            this.vertexConnections[j].a.remainingConnections++;
                            this.vertexConnections[j].b.remainingConnections++;
                            this.fadeOutConnections.push({start: {x: this.vertexConnections[j].a.x, y: this.vertexConnections[j].a.y}, end: {x: this.vertexConnections[j].b.x, y: this.vertexConnections[j].b.y}});
                            this.vertexConnections.splice(j, 1);
                            j--;
                        } else if(this.vertexConnections[j].b === this.vertices[i]) {
                            this.vertexConnections[j].a.remainingConnections++;
                            this.vertexConnections[j].b.remainingConnections++;
                            this.fadeOutConnections.push({start: {x: this.vertexConnections[j].b.x, y: this.vertexConnections[j].b.y}, end: {x: this.vertexConnections[j].a.x, y: this.vertexConnections[j].a.y}});
                            this.vertexConnections.splice(j, 1);
                            j--;
                        }
                    }
                    
                    // check if any of the vertex faces is filled in (all connections used)
                    for(let i = 0; i < this.vertexFaces.length; i++){
                        
                        // example: [0,1,2] means the vertex with the id 0 has to be connected to 1 and the the vertex with the id 1 has to be connected to 2 and 2 to 0
                        // all have to be connected
                        
                        let allConnected = true;
                        for(let j = 0; j < this.vertexFaces[i].vertices.length; j++){
                            // check if there is a connection from vertex j to vertex j+1 or from j+1 to j
                            if(j == this.vertexFaces[i].vertices.length - 1){
                                if(!this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[j] && c.b.id === this.vertexFaces[i].vertices[0])
                                && !this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[0] && c.b.id === this.vertexFaces[i].vertices[j])){
                                    allConnected = false;
                                    break;
                                }
                                // from last to first
                            } else {
                                if(!this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[j] && c.b.id === this.vertexFaces[i].vertices[j+1])
                                && !this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[j+1] && c.b.id === this.vertexFaces[i].vertices[j])){
                                    allConnected = false;
                                    break;
                                }
                            }
                        }
                        
                        // all connections are used
                        this.vertexFaces[i].show = allConnected;
                    }
                }
            }
        }
        
        if(!this.baseVertex){
            this.blockTranslation = false;
        }
    }
    
    cursorUp(e){ // ANCHOR cursorUp
        this.canvas.style.cursor = "grab";
        this.cursor[this.buttonMap[e.button]] = false;
        
        // check if there is a vertex to connect to (not the baseVertex)
        if(this.baseVertex){
            for(let i = 0; i < this.vertices.length; i++){
                if(this.vertices[i] !== this.baseVertex){
                    const dx = this.vertices[i].x - this.cursor.x;
                    const dy = this.vertices[i].y - this.cursor.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    if(distance < this.vertexSize){
                        this.connectTo = this.vertices[i];
                        break;
                    }
                }
            }
            
            if(this.connectTo && this.connectTo !== this.baseVertex){
                if(this.connectTo.remainingConnections > 0 && this.baseVertex.remainingConnections > 0){
                    this.vertexConnections.push({a: this.baseVertex, b: this.connectTo});
                    // decrease remaining connections
                    this.baseVertex.remainingConnections--;
                    this.connectTo.remainingConnections--;
                } else {
                    this.fadeOutConnections.push({start: {x: this.baseVertex.x, y: this.baseVertex.y}, end: {x: this.cursor.x, y: this.cursor.y}, color: 'red'});
                }
            } else {
                this.fadeOutConnections.push({start: {x: this.baseVertex.x, y: this.baseVertex.y}, end: {x: this.cursor.x, y: this.cursor.y}, color: 'red'});
            }
        }
        
        // check if any of the vertex faces is filled in (all connections used)
        for(let i = 0; i < this.vertexFaces.length; i++){
            // vertices shows all points that have to be connected
            if(this.vertexFaces[i].show) continue;
            
            // example: [0,1,2] means the vertex with the id 0 has to be connected to 1 and the the vertex with the id 1 has to be connected to 2 and 2 to 0
            // all have to be connected
            
            let allConnected = true;
            for(let j = 0; j < this.vertexFaces[i].vertices.length; j++){
                // check if there is a connection from vertex j to vertex j+1 or from j+1 to j
                if(j == this.vertexFaces[i].vertices.length - 1){
                    if(!this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[j] && c.b.id === this.vertexFaces[i].vertices[0])
                    && !this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[0] && c.b.id === this.vertexFaces[i].vertices[j])){
                        allConnected = false;
                        break;
                    }
                    // from last to first
                } else {
                    if(!this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[j] && c.b.id === this.vertexFaces[i].vertices[j+1])
                    && !this.vertexConnections.some(c => c.a.id === this.vertexFaces[i].vertices[j+1] && c.b.id === this.vertexFaces[i].vertices[j])){
                        allConnected = false;
                        break;
                    }
                }
            }
            
            // all connections are used
            this.vertexFaces[i].show = allConnected;
        }

        // check if all faces are shown
        this.finished = this.vertexFaces.every(f => f.show) && this.vertexFaces.length > 0;
        
        this.baseVertex = null;
        this.connectTo = null;
        this.blockTranslation = false;
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
        
        if(this.cursor.left && !this.blockTranslation){
            this.translation.x += e.movementX;
            this.translation.y += e.movementY;
        }
        
        // check if the cursor is over a vertex
        for(let i = 0; i < this.vertices.length; i++){
            const dx = this.vertices[i].x - this.cursor.x;
            const dy = this.vertices[i].y - this.cursor.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if(distance < this.vertexSize){
                this.vertices[i].hovered = true;
                break;
            } else {
                this.vertices[i].hovered = false;
            }
        }
    }
    
    keyDown(e){ // ANCHOR keyDown
        this.keys.shift = e.shiftKey;
        this.keys.ctrl = e.ctrlKey;
        this.keys.alt = e.altKey;
        
        // d-key 
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
        
        this.scale.x += delta * -0.0005;
        this.scale.x = Math.min(Math.max(.125, this.scale.x), 4);
        
        this.scale.y += delta * -0.0005;
        this.scale.y = Math.min(Math.max(.125, this.scale.y), 4);
        
        // update mouse position
        const rect = e.target.getBoundingClientRect();
        
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
    }
    
    drawGrid(ctx){ // ANCHOR drawGrid
        // calculate grid size
        const gridSize = Math.floor(50 * this.scale.x);
        
        // calculate offset
        const offsetX = Math.floor(this.translation.x % gridSize);
        const offsetY = Math.floor(this.translation.y % gridSize);
        
        // set line color
        ctx.strokeStyle = "#333";
        
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

function clamp(num, min, max) {
    return num <= min 
      ? min 
      : num >= max 
        ? max 
        : num
}

function lerp(a, b, n) {
    return (1-n)*a + n*b;
}