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

        this.stats = {};
        for(const el of Array.from(document.querySelectorAll('.debug-info .stat'))){
            this.stats[el.getAttribute("id")] = {label: el.querySelector(".label"), value: el.querySelector(".value")};
        }

        this.baseVertexSize = 3;
        this.vertexShrinkFactor = 4;
        
        this.colorPalette = [];
        this.vertices = [];
        this.vertexFaces = [];

        this.loadLevel("level1");

        // connection dictionary to keep track which connections have been used yet
        this.connectionDictionary = [];
        
        this.vertexConnections = [];
        this.animatedLines = [];
        
        this.blockTranslation = false;
        this.baseVertex = null;
        this.connectTo = null;
        
        this.showDebug = false;
        
        this.currentFrame = 0;
        this.finished = false;
        
        this.init();
    }

    loadLevel(name){
        this.vertices = [];
        this.vertexFaces = [];
        this.vertexConnections = [];
        this.animatedLines = [];
        this.connectionDictionary = [];
        this.finished = false;
        this.baseVertex = null;
        this.connectTo = null;
        this.blockTranslation = false;

        // load level (in level folder)
        const file = `./levels/${name}.lvl`;
        // send request
        fetch(file).then(response => response.json()).then(data => {
            this.vertices = data.vertices;
            this.vertexFaces = data.faces;
            this.colorPalette = data.palette;

            for(const face of this.vertexFaces){
                face.color = this.colorPalette[face.color];
            }

            console.log(this.vertices, this.vertexFaces, this.colorPalette);

            this.initLevel();
        });
    }

    initLevel(){
        // init vertices
        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].id = i;
            this.vertices[i].remainingConnections = 0;
            this.vertices[i].hovered = false;
            this.vertices[i].circlePadding = 2;
            this.vertices[i].opacity = 0;
        }

        // init faces
        for(let i = 0; i < this.vertexFaces.length; i++){
            this.vertexFaces[i].show = false;
            this.vertexFaces[i].opacity = 0;

            // calculate remaining connections for each vertex (point)
            for(let j = 0; j < this.vertexFaces[i].vertices.length; j++){
                // connection from last to first point to close the shape
                if(j == this.vertexFaces[i].vertices.length - 1){
                    const start = this.vertices.find(v => v.id === this.vertexFaces[i].vertices[j]);
                    const end = this.vertices.find(v => v.id === this.vertexFaces[i].vertices[0]);

                    // don't count the same connection twice (just skip if the connection is already used)
                    if(this.connectionDictionary.find(c => c.start === start.id && c.end === end.id) || this.connectionDictionary.find(c => c.end === start.id && c.start === end.id)) continue;
                    this.connectionDictionary.push({start: start.id, end: end.id});

                    // invalid connection
                    if(!start || !end){
                        console.error('Corrupted Level Data.');
                        return;
                    }

                    start.remainingConnections++;
                    end.remainingConnections++;
                }
                // else normal connection
                else {
                    const start = this.vertices.find(v => v.id == this.vertexFaces[i].vertices[j]);
                    const end = this.vertices.find(v => v.id == this.vertexFaces[i].vertices[j+1]);

                    // don't count the same connection twice (just skip if the connection is already used)
                    if(this.connectionDictionary.find(c => c.start === start.id && c.end === end.id) || this.connectionDictionary.find(c => c.end === start.id && c.start === end.id)) continue;
                    this.connectionDictionary.push({start: start.id, end: end.id});

                    // invalid connection
                    if(!start || !end){
                        console.error('Corrupted Level Data.');
                        return;
                    }

                    start.remainingConnections++;
                    end.remainingConnections++;
                }
            }
        }
        
        // calc size of vertex based on the remaining connections and shrink factor
        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].vertexSize = this.baseVertexSize + this.vertices[i].remainingConnections / this.vertexShrinkFactor;
        }

        this.stats["total-vertices"].value.innerHTML = `${this.vertices.length}`;
        this.stats["total-faces"].value.innerHTML = `${this.vertexFaces.length}`;

        // Calculate translation to move midpoint of vertices to the center of the canvas
        const minX = Math.min(...this.vertices.map(v => v.x));
        const minY = Math.min(...this.vertices.map(v => v.y));
        const maxX = Math.max(...this.vertices.map(v => v.x));
        const maxY = Math.max(...this.vertices.map(v => v.y));

        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        this.translation.x = this.canvas.width / 2 - midX;
        this.translation.y = this.canvas.height / 2 - midY;
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

        if(!this.vertexFaces) return;

        // calculate delta time for transitions
        let deltaTime = (Date.now() - this.lastFrameTime || 0) / 1000;
        this.lastFrameTime = Date.now();

        // transitions for the outer circle for vertices (when they are clicked)
        // -- transition in
        if(this.baseVertex){
            if(this.baseVertex.circlePadding < 3) this.baseVertex.circlePadding = clamp(this.baseVertex.circlePadding + deltaTime * 10, 2, 3);

            // decrease others
            for(let i = 0; i < this.vertices.length; i++){
                if(this.vertices[i] !== this.baseVertex){
                    if(this.vertices[i].circlePadding > 2) this.vertices[i].circlePadding = clamp(this.vertices[i].circlePadding - deltaTime * 10, 2, 3);
                }
            }
        // -- transition out
        } else {
            for(let i = 0; i < this.vertices.length; i++){
                if(this.vertices[i].circlePadding > 2) this.vertices[i].circlePadding = clamp(this.vertices[i].circlePadding - deltaTime * 10, 2, 3);
            }
        }
        
        // clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // draw grid that moves with the canvas (only when debug mode is active)
        if(this.showDebug) this.drawGrid(this.ctx);
        
        // scale and translate
        this.ctx.save();
        this.ctx.translate(this.translation.x, this.translation.y);
        this.ctx.scale(this.scale.x, this.scale.y);
        
        this.ctx.lineWidth = 0.5;
        
        if(!this.finished){
            // draw vertex connections (straight lines)
            for(let i = 0; i < this.vertexConnections.length; i++){
                this.ctx.strokeStyle = 'black';
                this.ctx.beginPath();
                this.ctx.moveTo(this.vertexConnections[i].a.x, this.vertexConnections[i].a.y);
                this.ctx.lineTo(this.vertexConnections[i].b.x, this.vertexConnections[i].b.y);
                this.ctx.stroke();
            }
        }
        
        // draw vertex faces (polygon with lines from vertices in the face)
        for(let i = 0; i < this.vertexFaces.length; i++){
            // fade out face if it isnt currently shown and opacity is above 0
            if(!this.vertexFaces[i].show){
                if(this.vertexFaces[i].opacity > 0) this.vertexFaces[i].opacity = clamp(this.vertexFaces[i].opacity - deltaTime * 4, 0, 1);
                continue;
            }

            this.ctx.globalAlpha = this.vertexFaces[i].opacity;
            // fade face in if opacity is below 1
            if(this.vertexFaces[i].opacity < 1) this.vertexFaces[i].opacity = clamp(this.vertexFaces[i].opacity + deltaTime * 4, 0, 1);
            this.ctx.fillStyle = this.vertexFaces[i].color;
            this.ctx.strokeStyle = this.vertexFaces[i].color;
            // draw face
            this.ctx.beginPath();
            this.ctx.moveTo(this.vertices[this.vertexFaces[i].vertices[0]].x, this.vertices[this.vertexFaces[i].vertices[0]].y);
            for(let j = 1; j < this.vertexFaces[i].vertices.length; j++){
                this.ctx.lineTo(this.vertices[this.vertexFaces[i].vertices[j]].x, this.vertices[this.vertexFaces[i].vertices[j]].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }

        // reset opacity
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#202020';
        
        // draw connection indicator if user currently tries to connect two points (if baseVertex is set)
        if(this.baseVertex){
            // if there user hovers over other point while connecting color changes to dark yellow
            this.ctx.strokeStyle = this.vertices.filter(v => v.id !== this.baseVertex.id && v.hovered === true).length > 0 ? '#e8ae35' : 'black';
            this.ctx.beginPath();
            this.ctx.setLineDash([2, 2]);
            this.ctx.moveTo(this.baseVertex.x, this.baseVertex.y);
            this.ctx.lineTo(this.cursor.x, this.cursor.y);
            this.ctx.stroke();
            // reset line dash to keep other lines normal
            this.ctx.setLineDash([]);
        }

        // draw animate lines
        for(let i = 0; i < this.animatedLines.length; i++){
            this.ctx.strokeStyle = this.animatedLines[i].color || 'black';
            this.ctx.beginPath();
            this.ctx.setLineDash([2, 2]);
            this.ctx.moveTo(this.animatedLines[i].start.x, this.animatedLines[i].start.y);
            this.ctx.lineTo(this.animatedLines[i].end.x, this.animatedLines[i].end.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // lerp end point to start point and if the end point is close to the start point remove the connection
            if(Math.abs(this.animatedLines[i].end.x - this.animatedLines[i].start.x) < 5 && Math.abs(this.animatedLines[i].end.y - this.animatedLines[i].start.y) < 5){
                this.animatedLines.splice(i, 1);
            } else {
                this.animatedLines[i].end.x = lerp(this.animatedLines[i].end.x, this.animatedLines[i].start.x, deltaTime * 10);
                this.animatedLines[i].end.y = lerp(this.animatedLines[i].end.y, this.animatedLines[i].start.y, deltaTime * 10);
            }
        }
        
        // draw points (vertices) with the number of remaining connections in it
        for(let i = 0; i < this.vertices.length; i++){
            this.ctx.strokeStyle = 'black';
            this.ctx.globalAlpha = this.vertices[i].opacity;
            // fade in or fade out vertex based on its opacity (and if the game is finished)
            if(!this.finished){
                if(this.vertices[i].opacity < 1) this.vertices[i].opacity = clamp(this.vertices[i].opacity + deltaTime * 4, 0, 1);
            } else {
                if(this.vertices[i].opacity > 0) this.vertices[i].opacity = clamp(this.vertices[i].opacity - deltaTime * 4, 0, 1);
            }

            // point outline is only filled in with a color when the user tries to connect from this point
            this.ctx.fillStyle = (this.vertices[i].hovered || this.vertices[i] === this.baseVertex ? 'rgba(200,200,200,.5)' : 'rgba(0,0,0,0)');
            
            // draw dotted outline with a radius of 5 bigger than the point
            this.ctx.beginPath();
            this.ctx.setLineDash([1, 1]);
            this.ctx.arc(this.vertices[i].x, this.vertices[i].y, this.vertices[i].vertexSize + this.vertices[i].circlePadding, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.setLineDash([]);
            
            this.ctx.fillStyle = this.vertices[i].hovered ? this.baseVertex ? '#e8ae35' : 'black' : 'white';
            this.ctx.strokeStyle = this.vertices[i].hovered ? this.baseVertex ? 'black' : 'white' : 'black';
            
            this.ctx.beginPath();
            this.ctx.arc(this.vertices[i].x, this.vertices[i].y, this.vertices[i].vertexSize, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            
            // draw number of connections remaining in the center of the point
            this.ctx.fillStyle = this.vertices[i].hovered ? this.baseVertex ? 'black' : 'white' : 'black';
            this.ctx.textAlign = 'center';
            this.ctx.font = `${this.vertices[i].vertexSize}px Arial`;
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.showDebug ? this.vertices[i].id : this.vertices[i].remainingConnections, this.vertices[i].x, this.vertices[i].y);

            // draw coordinates if debug mode is active (top left)
            if(this.showDebug){
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(`(${Math.round(this.vertices[i].x)}, ${Math.round(this.vertices[i].y)})`, this.vertices[i].x, this.vertices[i].y - this.vertices[i].vertexSize * 2);
            }
        }
        
        // draw cursor on top of everything else
        this.ctx.lineWidth = 1 / this.scale.x;
        this.ctx.fillStyle = 'rgba(255,255,255,.25)';
        this.globalAlpha = 0.25;

        if(this.baseVertex){
            // draw dotted outline with a radius of 5 bigger than the point
            this.ctx.beginPath();
            this.ctx.setLineDash([1, 1]);
            this.ctx.arc(this.cursor.x, this.cursor.y, this.baseVertexSize / 2 + 2, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.setLineDash([]);

            this.ctx.fillStyle = this.vertices.filter(v => v.id !== this.baseVertex.id && v.hovered === true).length > 0 ? '#e8ae35' : 'black';
            this.ctx.strokeStyle = this.vertices.filter(v => v.id !== this.baseVertex.id && v.hovered === true).length > 0 ? '#e8ae35' : 'black';

            this.ctx.beginPath();
            this.ctx.arc(this.cursor.x, this.cursor.y, this.baseVertexSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
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

            // stats
            this.stats["frametime"].value.innerHTML = `${deltaTime * 1000}ms`;
            this.stats["fps"].value.innerHTML = `${Math.round(1000 / (deltaTime * 1000))}`;
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
            // check if mouse is inside vertex
            if(distance < this.vertices[i].vertexSize){
                // set as base vertex if user is pressing the left mouse button (and block translation for connecting)
                if(this.cursor.left){
                    this.baseVertex = this.vertices[i];
                    this.blockTranslation = true;
                    break;
                // remove all connections from vertex on right click
                } else if(this.cursor.right) {
                    for(let j = 0; j < this.vertexConnections.length; j++){
                        // check which of the two is the vertex clicked on (based on that the line will animate to the clicked vertex)
                        if(this.vertexConnections[j].a === this.vertices[i]){
                            this.vertexConnections[j].a.remainingConnections++;
                            this.vertexConnections[j].b.remainingConnections++;
                            // add animated line
                            this.animatedLines.push({start: {x: this.vertexConnections[j].a.x, y: this.vertexConnections[j].a.y}, end: {x: this.vertexConnections[j].b.x, y: this.vertexConnections[j].b.y}});
                            this.vertexConnections.splice(j, 1);
                            j--;
                        } else if(this.vertexConnections[j].b === this.vertices[i]) {
                            this.vertexConnections[j].a.remainingConnections++;
                            this.vertexConnections[j].b.remainingConnections++;
                            // add animated line
                            this.animatedLines.push({start: {x: this.vertexConnections[j].b.x, y: this.vertexConnections[j].b.y}, end: {x: this.vertexConnections[j].a.x, y: this.vertexConnections[j].a.y}});
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
        
        // if base vertex is not set (no vertex has been clicked) disable translation block
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
                    // check if mouse is in vertex (if so set connectTo vertex)
                    if(distance < this.vertices[i].vertexSize){
                        this.connectTo = this.vertices[i];
                        break;
                    }
                }
            }
            
            // if connectTo is set and is not the same as the baseVertex proceed
            if(this.connectTo && this.connectTo !== this.baseVertex){
                // check if both have remaining connections left (if so connect them)
                if(this.connectTo.remainingConnections > 0 && this.baseVertex.remainingConnections > 0){
                    this.vertexConnections.push({a: this.baseVertex, b: this.connectTo});
                    // decrease remaining connections
                    this.baseVertex.remainingConnections--;
                    this.connectTo.remainingConnections--;
                    // recalculate vertex sizes
                    this.baseVertex.vertexSize = this.baseVertexSize + this.baseVertex.remainingConnections / this.vertexShrinkFactor;
                    this.connectTo.vertexSize = this.baseVertexSize + this.connectTo.remainingConnections / this.vertexShrinkFactor;
                // else show an animated line retracting
                } else {
                    this.animatedLines.push({start: {x: this.baseVertex.x, y: this.baseVertex.y}, end: {x: this.cursor.x, y: this.cursor.y}, color: 'red'});
                }
            // else show an animated line retracing
            } else {
                this.animatedLines.push({start: {x: this.baseVertex.x, y: this.baseVertex.y}, end: {x: this.cursor.x, y: this.cursor.y}, color: 'red'});
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

        // check if all faces are shown (game finished)
        this.finished = this.vertexFaces.every(f => f.show) && this.vertexFaces.length > 0;
        
        // reset vertex references and unblock translation
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
            this.translation.x += e.movementX * this.pixelScale;
            this.translation.y += e.movementY * this.pixelScale;
        }
        
        // check if the cursor is over a vertex
        for(let i = 0; i < this.vertices.length; i++){
            const dx = this.vertices[i].x - this.cursor.x;
            const dy = this.vertices[i].y - this.cursor.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if(distance < this.vertices[i].vertexSize){
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
        
        // Press d-key to toggle debug mode
        if(e.key === "d"){
            this.showDebug = !this.showDebug;
            document.querySelector(".debug-info").classList.toggle('show');
        }

        // Press c-key to prompt level name
        if(e.key === "c"){
            const name = prompt("Enter level name:");
            this.finished = true;
            for(const face of this.vertexFaces) face.show = false;
            setTimeout(() => {
                if(name != null) this.loadLevel(name);
            },400);
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
        this.cursor.y /= this.scale.y;
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