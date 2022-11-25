class Editor{
    constructor(){
        this.canvas = document.getElementById("canvas");

        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        }

        this.mouseMap = {
            0: "left",
            1: "middle",
            2: "right"
        };

        this.options = {
            blocks: {
                size: 3,
                height: 20,
                width: 40,
                horizontalSpacing: 50,

                strokeColor: 'white',
                stroke: 2,
            }
        };

        this.controls = {
            scale: 1,
            translation: {
                x: 0,
                y: 0
            }
        };

        this.blocks = [];

        this.init();
    }

    init(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize',()=>{
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener('mousewheel',this.scroll.bind(this));
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());

        requestAnimationFrame(this.draw.bind(this));
    }

    addBlock(e){
        this.blocks.push()
    }

    draw(){
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw grid that moves with the canvas
        this.drawGrid(ctx);

        // scale and translate
        ctx.save();
        ctx.translate(this.controls.translation.x, this.controls.translation.y);
        ctx.scale(this.controls.scale, this.controls.scale);

        ctx.strokeStyle = this.options.blocks.strokeColor;
        ctx.lineWidth = this.options.blocks.stroke;

        // traverse b-tree
        // begin at root
        let node = this.tree.root;
        
        if(node){
            // draw block tree block

            // draw children blocks
            this.traverseChildren(ctx, node);
        }

        // restore canvas to normal
        ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
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

        
    }

    /** mouse move handler for canvas */
    mouseMove(e){ // ANCHOR mouseMove
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // calculate mouse position in canvas with scale and translation
        this.mouse.x = (this.mouse.x - this.controls.translation.x) / this.controls.scale;
        this.mouse.y = (this.mouse.y - this.controls.translation.y) / this.controls.scale;

        if(this.mouse.left){
            this.translate(e);
        }
    }

    /** mouse move */
    translate(e){ // ANCHOR translate
        this.controls.translation.x += e.movementX;
        this.controls.translation.y += e.movementY;
    }

    /** mouse wheel handler for canvas */
    scroll(e){ // ANCHOR scroll
        this.controls.scale += e.deltaY * -0.0005;
        this.controls.scale = Math.min(Math.max(.125, this.controls.scale), 4);
    }

    drawGrid(ctx){
        // draw grid

        // calculate grid size
        const gridSize = 50 * this.controls.scale;

        // calculate offset
        const offsetX = this.controls.translation.x % gridSize;
        const offsetY = this.controls.translation.y % gridSize;

        // set line width
        ctx.lineWidth = 1;

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

    saveProject(e){
        createRipple(e);
    }

    loadProject(e){
        createRipple(e);
        
        // trigger file input
        document.querySelector('#file-input').onchange = (e)=>{
            const file = e.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.onload = (e)=>{
                const json = JSON.parse(e.target.result);
            }
            reader.readAsText(file);
        };
        document.querySelector('#file-input').click();
    }

    download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    traverseChildren(ctx,node,prevX, prevY){
        prevX = prevX || canvas.width / 2;
        prevY = prevY || canvas.height / 2;

        // calculate the horizontal distance between the blocks
        const horizontalDistance = this.options.blocks.width * this.options.blocks.size + this.options.blocks.horizontalSpacing;

        // calculate the distance to the parent block
        let parentDistance = (canvas.height / 2 - this.options.blocks.height) / 2;

        // calculate current tree level by counting the number of parents
        let level = 0;
        let parent = node.parent;
        while(parent){
            level++;
            parent = parent.parent;
        }

        parentDistance += level * (this.options.blocks.height + 20);

        // draw all children
        for(let i = 0; i < node.children.length; i++){
            // calculate the position of the child block based on the parent block
            const x = prevX + (i - (node.children.length - 1) / 2) * horizontalDistance;
            const y = prevY + parentDistance;

            // draw the child block
            this.drawBlock(ctx, node.children[i], x, y);

            // calculate offset to the value the child block should be connected to
            const indexInParent = node.parent ? node.parent.children.indexOf(node) : (i-.5);
            const offset = indexInParent * this.options.blocks.width + this.options.blocks.width / 2;

            // draw the line to the parent block
            ctx.beginPath();
            ctx.moveTo(prevX + offset, prevY + this.options.blocks.height);
            ctx.lineTo(x + this.options.blocks.width / 2, y);
            ctx.closePath();
            ctx.stroke();

            // traverse the children of the child block
            this.traverseChildren(ctx, node.children[i],x,y);
        }
    }
    
    drawBlock(ctx, node, x, y){
        // draw the block
        ctx.beginPath();
        ctx.rect(x, y, this.options.blocks.width * this.options.blocks.size, this.options.blocks.height);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();

        // draw the lines
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.options.blocks.width * this.options.blocks.size, y);
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + this.options.blocks.height);
        ctx.moveTo(x + this.options.blocks.width * this.options.blocks.size, y);
        ctx.lineTo(x + this.options.blocks.width * this.options.blocks.size, y + this.options.blocks.height);
        ctx.moveTo(x, y + this.options.blocks.height);
        ctx.lineTo(x + this.options.blocks.width * this.options.blocks.size, y + this.options.blocks.height);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "green";

        // one dot on the top middle of the block
        ctx.beginPath();
        ctx.arc(x + this.options.blocks.width * this.options.blocks.size / 2, y - 2, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        // draw dots on the lines
        for(let i = 1; i < this.options.blocks.size; i++){
            ctx.beginPath();
            ctx.arc(x + this.options.blocks.width * i, y + this.options.blocks.height, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }

        // draw the values
        ctx.font = "17px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for(let i = 0; i < this.options.blocks.size; i++){
            ctx.fillText(node.values[i] || "-", x + (i + 0.5) * this.options.blocks.width, y + this.options.blocks.height / 2);
        }
    }
}