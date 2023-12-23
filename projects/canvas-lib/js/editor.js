class Editor{
    constructor(){
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.components = [];

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

        this.options = {
            
        };

        this.controls = {
            scale: 1,
            translation: {
                x: 0,
                y: 0
            },
            keys: {
                shift: false,
                ctrl: false,
                alt: false
            },
            transform: {
                topLeft: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                index: -1,
                el: undefined
            }
        };

        this.transformEdges = ['topLeft','topRight','bottomRight','bottomLeft'];

        this.selectionRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        this.selectedTool = 'move';

        this.init();
    }

    init(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize',()=>{
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        Array.from(document.querySelectorAll(".tools .item")).forEach((el)=>{
            el.onclick = (e)=>{
                this.selectTool(e,el);
            };
        });

        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener('mousewheel',this.scroll.bind(this));
        window.addEventListener('keydown',this.keyDown.bind(this));
        window.addEventListener('keyup',this.keyUp.bind(this));
        this.canvas.addEventListener('DOMMouseScroll',this.scroll.bind(this));
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());

        // handle file drop on canvas
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.components.push(new ImageComponent(img));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        requestAnimationFrame(this.draw.bind(this));
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw grid that moves with the canvas
        this.drawGrid(this.ctx);

        // scale and translate
        this.ctx.save();
        this.ctx.translate(this.controls.translation.x, this.controls.translation.y);
        this.ctx.scale(this.controls.scale, this.controls.scale);

        // draw all components
        for(let i = 0; i < this.components.length; i++){
            this.components[i].draw(this.ctx);
            if(this.components[i].selected && this.components[i].transform){
                this.components[i].transform.updateEdgePoints();
            }
        }

        for(let i = 0; i < this.components.length; i++){
            if(this.components[i].selected){
                this.components[i].transform.draw(this.ctx);
            }
        }

        if(this.selectedTool === 'select'){
            this.drawSelectionRect(this.ctx);
        }

        // draw mouse point
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'red';
        this.ctx.arc(this.mouse.x, this.mouse.y, 10, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.strokeStyle = 'white';

        // restore canvas to normal
        this.ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
    }

    keyDown(e){ // ANCHOR keyDown
        this.controls.keys.shift = e.shiftKey;
        this.controls.keys.ctrl = e.ctrlKey;
        this.controls.keys.alt = e.altKey;
    }

    keyUp(e){ // ANCHOR keyUp
        this.controls.keys.shift = false;
        this.controls.keys.ctrl = false;
        this.controls.keys.alt = false;
    }

    /** mouse down handler for canvas */
    mouseDown(e){ // ANCHOR mouseDown
        this.canvas.style.cursor = "grabbing";
        this.mouse[this.mouseMap[e.button]] = true;

        if(this.selectedTool === 'select' && this.mouse.left){
            this.selectionRect.x = this.mouse.x;
            this.selectionRect.y = this.mouse.y;
            this.selectionRect.width = 0;
            this.selectionRect.height = 0;
        }

        if(this.selectedTool === 'move' && this.mouse.right){
            const near = this.getNearPoint(e,undefined);
            console.log(near);
            if(near){
                near.selected = !near.selected;
                if(near.selected){
                    for(const component of this.components){
                        if(component !== near){
                            component.selected = false;
                        }
                    }
                }
            }
        }

        if(this.selectedTool === 'move' && this.mouse.left){
            const near = this.getNearPoint(e,undefined);
            if(near){
                if(near.selected){
                    const edgeIndex = near.transform.getNearEdge(this.mouse.x,this.mouse.y);
                    this.controls.transform[this.transformEdges[edgeIndex]] = true;
                    this.controls.transform.index = edgeIndex;
                    this.controls.transform.el = near;
                    // set all other edges to false
                    for(let i = 0; i < this.transformEdges.length; i++){
                        if(i !== edgeIndex){
                            this.controls.transform[this.transformEdges[i]] = false;
                        }
                    }
                }
            }
        }
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

        // reset selection rect
        this.selectionRect={x:0,y:0,width:0,height:0};

        // reset transform controls
        for(const key in this.controls.transform){
            this.controls.transform[key] = false;
            if(key === 'index'){
                this.controls.transform[key] = -1;
            }
        }
    }

    /** mouse move handler for canvas */
    mouseMove(e){ // ANCHOR mouseMove
        const rect = e.target.getBoundingClientRect();
        // calculate mouse position in canvas
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // apply canvas scale
        this.mouse.x /= (rect.width / this.canvas.width);
        this.mouse.y /= (rect.height / this.canvas.height);

        // apply translation (move)
        this.mouse.x -= this.controls.translation.x;       // ORDER OF THESE 3 OPERATIONS MATTER
        this.mouse.y -= this.controls.translation.y;

        // apply scale (zoom)
        this.mouse.x /= this.controls.scale;
        this.mouse.y /= this.controls.scale;

        if(this.selectedTool === 'select' && this.mouse.left){
            this.selectionRect.width = this.mouse.x - this.selectionRect.x;
            this.selectionRect.height = this.mouse.y - this.selectionRect.y;
            return;
        }

        // if left mouse is pressed and all other conditions are false move the area with the mouse
        if(this.mouse.left){
            // check if mouse was pressed on any element
            const near = this.getNearPoint(e,undefined);
            const transforming = this.controls.transform.topLeft || this.controls.transform.topRight || this.controls.transform.bottomLeft || this.controls.transform.bottomRight;
            // if not move the area
            if((!near || near.selected === false) && transforming === false){
                this.translate(e);
            } else if(transforming == false){
                // if mouse was pressed on an element move the element
                near.position.x += e.movementX / this.controls.scale;
                near.position.y += e.movementY / this.controls.scale;

                // only apply snapping if shift is pressed
                if(!this.controls.keys.shift){
                    return;
                }

                // snap elements edges to other elements edges
                for(const component of this.components){
                    if(component !== near){
                        // left edge to left edge
                        if(component.position.x - near.position.x < 10 && component.position.x - near.position.x > -10){
                            near.position.x = component.position.x;
                        }

                        // top edge to top edge
                        if(component.position.y - near.position.y < 10 && component.position.y - near.position.y > -10){
                            near.position.y = component.position.y;
                        }

                        // right edge to right edge
                        if(component.position.x + component.size.width - near.position.x < 10 && component.position.x + component.size.width - near.position.x > -10){
                            near.position.x = component.position.x + component.size.width;
                        }

                        // bottom edge to bottom edge
                        if(component.position.y + component.size.height - near.position.y < 10 && component.position.y + component.size.height - near.position.y > -10){
                            near.position.y = component.position.y + component.size.height;
                        }

                        // left edge to right edge
                        if(component.position.x - near.position.x - near.size.width < 10 && component.position.x - near.position.x - near.size.width > -10){
                            near.position.x = component.position.x - near.size.width;
                        }

                        // top edge to bottom edge
                        if(component.position.y - near.position.y - near.size.height < 10 && component.position.y - near.position.y - near.size.height > -10){
                            near.position.y = component.position.y - near.size.height;
                        }

                        // right edge to left edge
                        if(component.position.x + component.size.width - near.position.x - near.size.width < 10 && component.position.x + component.size.width - near.position.x - near.size.width > -10){
                            near.position.x = component.position.x + component.size.width - near.size.width;
                        }

                        // bottom edge to top edge
                        if(component.position.y + component.size.height - near.position.y - near.size.height < 10 && component.position.y + component.size.height - near.position.y - near.size.height > -10){
                            near.position.y = component.position.y + component.size.height - near.size.height;
                        }
                    }
                }
            } else {
                const selectedEl = this.controls.transform.el;
                const selectedEdge = selectedEl.transform.edgePoints[this.controls.transform.index];
                selectedEdge.selected = true;
                // move the transform edge
                selectedEdge.x = this.mouse.x;
                selectedEdge.y = this.mouse.y;

                console.log(selectedEdge)

                switch(this.controls.transform.index){
                    case 0: // top left
                        selectedEl.size.width += selectedEl.position.x - selectedEdge.x;
                        selectedEl.size.height += selectedEl.position.y - selectedEdge.y;
                        selectedEl.position.x = selectedEdge.x;
                        selectedEl.position.y = selectedEdge.y;
                        break;
                    case 1: // top right
                        selectedEl.size.width = selectedEdge.x - selectedEl.position.x;
                        selectedEl.size.height += selectedEl.position.y - selectedEdge.y;
                        selectedEl.position.y = selectedEdge.y;
                        break;
                    case 2: // bottom right
                        selectedEl.size.width = selectedEdge.x - selectedEl.position.x;
                        selectedEl.size.height = selectedEdge.y - selectedEl.position.y;
                        break;
                    case 3: // bottom left
                        selectedEl.size.width += selectedEl.position.x - selectedEdge.x;
                        selectedEl.size.height = selectedEdge.y - selectedEl.position.y;
                        selectedEl.position.x = selectedEdge.x;
                        break;
                }

                selectedEl.transform.updateEdgePoints(selectedEl.position, selectedEl.size);
            }
        }
    }

    /** mouse move */
    translate(e){ // ANCHOR translate
        this.controls.translation.x += e.movementX;
        this.controls.translation.y += e.movementY;
    }

    /** mouse wheel handler for canvas */
    scroll(e){ // ANCHOR scroll
        const previousScale = this.controls.scale;
        var delta = e.deltaY ? e.deltaY : (e.detail * 10);
        this.controls.scale += delta * -0.0005;
        this.controls.scale = Math.min(Math.max(.125, this.controls.scale), 4);

        const previousMouse = {
            x: this.mouse.x,
            y: this.mouse.y
        };

        // update mouse position
        const rect = e.target.getBoundingClientRect();
        // calculate mouse position in canvas
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // apply canvas scale
        this.mouse.x /= (rect.width / this.canvas.width);
        this.mouse.y /= (rect.height / this.canvas.height);

        // apply translation (move)
        this.mouse.x -= this.controls.translation.x;       // ORDER OF THESE 3 OPERATIONS MATTER
        this.mouse.y -= this.controls.translation.y;

        // apply scale (zoom)
        this.mouse.x /= this.controls.scale;
        this.mouse.y /= this.controls.scale;
    }

    /** check if there is a point next to the mouse with a given threshold */
    getNearPoint(e, selectedComponent){ // ANCHOR getNearPoint
        let x = this.mouse.x;
        let y = this.mouse.y;

        let near = undefined;
        const d = 10; // threshold

        for(const component of this.components){
            if(component.type === 'card') continue;
            // check if mouse is in the area of the component
            if(x > component.position.x - d && x < component.position.x + component.size.width + d && y > component.position.y - d && y < component.position.y + component.size.height + d){
                near = component;
                break;
            }
        }

        return near;
    }

    /** select tool */
    selectTool(e,clicked){ // ANCHOR selectTool
        createRipple(e);
        e.stopPropagation();
        // get tool from button
        const tool = clicked.getAttribute("data-tool");
        // remove active class from all buttons
        Array.from(document.querySelectorAll(".tools div")).forEach((el)=>{
            el.classList.remove('active');
        });
        // add active class to selected
        clicked.classList.add('active');
        this.selectedTool = tool;
    }

    /** draw grid */
    drawGrid(ctx){ // ANCHOR drawGrid
        // calculate grid size
        const gridSize = Math.floor(50 * this.controls.scale);

        // calculate offset
        const offsetX = Math.floor(this.controls.translation.x % gridSize);
        const offsetY = Math.floor(this.controls.translation.y % gridSize);

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
    }

    /** draw selection rect */
    drawSelectionRect(ctx){ // ANCHOR drawSelectionRect
        ctx.fillStyle = "#ffffff22";
        ctx.strokeStyle = "#ffffff88";
        ctx.beginPath();
        ctx.rect(this.selectionRect.x, this.selectionRect.y, this.selectionRect.width, this.selectionRect.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    /** download file with given content */
    download(filename, text) { // ANCHOR download
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}