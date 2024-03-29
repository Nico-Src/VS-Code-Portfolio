class Editor{
    constructor(){
        this.canvas = document.getElementById("canvas");

        this.blocks = [];
        this.connections = [];
        this.TREE = btree.create(2, btree.numcmp);
        this.btree = new this.TREE();

        this.previouslyAddedValues = [];

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
            blocks: {
                size: 2,
                height: 25,
                width: 40,
                horizontalSpacing: 50,

                strokeColor: 'white',
                stroke: 2,
                fillColor: 'white',
                tolerance: 10,
                fontStyle: 'bold'
            },
            fields: {
                tolerance: 10,
            },
            dots: {
                tolerance: 10
            },
            connections: {
                stroke: 2,
                strokeColor: "#fff"
            }
        };

        this.controls = {
            adding: false,
            scale: 1,
            translation: {
                x: 0,
                y: 0
            }
        };

        this.selectionRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        this.selectedBlock = undefined;
        this.selectedDot = undefined;
        this.selectedTool = 'move';

        this.tempConnection = new Connection();

        this.init();
    }

    /** update the trees block size */
    updateBlockSize(e){ // ANCHOR updateBlockSize
        // parse input value
        this.options.blocks.size = parseInt(e.target.value);
        this.TREE = btree.create(this.options.blocks.size, btree.numcmp);
        // get all the values from the blocks
        let values = [];
        this.blocks.forEach((block)=>{
            for(let i = 0; i < block.values.length; i++){
                values.push(block.values[i]);
            }
        });
        // create new tree
        this.btree = new this.TREE();
        // readd all the values
        for(let i = 0; i < values.length; i++){
            this.btree.put(values[i], values[i]);
        }

        // update the blocks and connections
        this.updateTree();
    }

    /** open settings window */
    openSettingsWindow(){ // ANCHOR openSettingsWindow
        document.querySelector('.window-overlay').classList.remove('hidden');
        document.querySelector('.settings-window').classList.remove('hidden');
    }

    /** close settings window */
    closeSettingsWindow(){ // ANCHOR closeSettingsWindow
        document.querySelector('.window-overlay').classList.add('hidden');
        document.querySelector('.settings-window').classList.add('hidden');
    }

    /** initialize canvas */
    init(){ // ANCHOR init
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // resize canvas on window resize
        window.addEventListener('resize',()=>{
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        // add event listeners to tools
        Array.from(document.querySelectorAll(".tools div")).forEach((el)=>{
            el.addEventListener('click',this.selectTool.bind(this));
        });

        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener('mousewheel',this.scroll.bind(this));
        window.addEventListener('keydown',this.keyDown.bind(this));
        this.canvas.addEventListener('DOMMouseScroll',this.scroll.bind(this));
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());

        // start draw loop
        requestAnimationFrame(this.draw.bind(this));
    }

    /** draw loop */
    draw(){ // ANCHOR draw
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#151515';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // draw grid that moves with the canvas
        this.drawGrid(ctx);

        // scale and translate
        ctx.save();
        ctx.translate(this.controls.translation.x, this.controls.translation.y);
        ctx.scale(this.controls.scale, this.controls.scale);
        
        // if select tool is selected draw selection rect
        if(this.selectedTool === 'select'){
            this.drawSelectionRect(ctx);
        }

        ctx.strokeStyle = this.options.connections.strokeColor;
        ctx.lineWidth = this.options.connections.stroke;

        // draw connections
        for(const connection of this.connections){
            connection.draw(ctx,this.connections);
        }

        ctx.strokeStyle = this.options.blocks.strokeColor;
        ctx.fillStyle = this.options.blocks.fillColor;
        ctx.lineWidth = this.options.blocks.stroke;

        // draw blocks
        for(const block of this.blocks){
            block.draw(ctx);
        }

        // restore canvas to normal (no scale or translate)
        ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
    }

    keyDown(e){ // ANCHOR keyDown
        // escape should open settings window
        if(e.key === 'Escape'){
            this.openSettingsWindow();
        }

        // s = Select tool, m = Move tool, e = Edit tool, c = Connect tool
        if(e.key === 's' || e.key === 'S'){
            const el = document.querySelector('.tools .select i');
            this.selectTool({target: el, currentTarget: el, stopPropagation: ()=>{}});
        }

        if(e.key === 'm' || e.key === 'M'){
            const el = document.querySelector('.tools .move i');
            this.selectTool({target: el, currentTarget: el, stopPropagation: ()=>{}});
        }

        if(e.key === 'e' || e.key === 'E'){
            const el = document.querySelector('.tools .edit i');
            this.selectTool({target: el, currentTarget: el, stopPropagation: ()=>{}});
        }

        if(e.key === 'c' || e.key === 'C'){
            const el = document.querySelector('.tools .connect i');
            this.selectTool({target: el, currentTarget: el, stopPropagation: ()=>{}});
        }

        // ctrl + z = undo
        if(e.ctrlKey && e.key === 'z'){
            const lastAction = this.previouslyAddedValues.pop();
            this.btree.del(lastAction);
            this.updateTree();
        }

        // ctrl + e = export image
        if(e.ctrlKey && e.key === 'e'){
            this.saveImage();
        }

        // delete key in tree
        if(e.key === 'Delete' && this.selectedField){
            const value = parseInt(this.selectedField.text);
            this.btree.del(value);
            this.updateTree();
        }

        // input handler for edit tool
        if(this.selectedTool === 'edit' && this.selectedField){
            if(e.key === 'Backspace'){
                this.selectedField.text = this.selectedField.text.slice(0,-1);
            }else if(e.key.length === 1){
                this.selectedField.text += e.key;
            }

            // remove non numeric characters
            this.selectedField.text = this.selectedField.text.replace(/[^0-9]/g,'');
            this.selectedField.parent.values[this.selectedField.parent.fields.indexOf(this.selectedField)] = this.selectedField.text;
        }

        // delete selected blocks
        if(this.selectedTool === 'select' && e.key === 'Delete'){
            const blocksToDelete = [];
            const connectionsToDelete = [];
            for(const block of this.blocks){
                if(block.selected){
                    // remove connections
                    for(const connection of this.connections){
                        if(block.dots.find(dot => dot.id === connection.source.id) || block.dots.find(dot => dot.id === connection.target.id)){
                            connectionsToDelete.push(connection);
                        }
                    }

                    // remove block
                    blocksToDelete.push(block);
                }
            }

            for(const block of blocksToDelete){
                this.blocks.splice(this.blocks.indexOf(block),1);
            }

            for(const connection of connectionsToDelete){
                this.connections.splice(this.connections.indexOf(connection),1);
            }
        }
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

        // if adding is currently active and left mouse is pressed place the state
        if(this.controls.adding && this.mouse.left){
            // deactivate adding
            this.controls.adding = false;
            document.querySelector('.add-btn').classList.remove('disabled');
            return;
        }

        // if adding is currently active and right mouse is pressed cancel adding
        if(this.controls.adding && this.mouse.right){
            // remove last state and deactivate adding
            this.controls.adding = false;
            this.blocks.pop();
            document.querySelector('.add-btn').classList.remove('disabled');
            return;
        }

        // if left mouse is pressed and tool is move select state
        if(this.mouse.left && this.selectedTool === 'move'){
            // get nearest state
            const near = this.getNearPoint(e,this.selectedBlock);
            
            // if there is a state near the mouse select it
            if(near){
                this.selectedBlock = near;
            }
        }

        // if left mouse is pressed and tool is connect create a new connection
        if(this.mouse.left && this.selectedTool === 'connect'){
            // get nearest state
            const start = this.getNearPointDot(e,this.selectedDot);
            
            // if there is a state near the mouse create a new connection
            if(start){
                // create new connection
                this.tempConnection.source = start;
                this.tempConnection.target = start;
                this.connections.push(this.tempConnection);
            }
        }

        // if right mouse is pressed and tool is connect delete a connection
        if(this.mouse.right && this.selectedTool === 'connect'){
            // get nearest state
            const near = this.getNearPointDot(e,this.selectedDot);
            
            // if there is a state near the mouse delete it
            if(near){
                // delete state
                this.connections = this.connections.filter((connection)=>{
                    return connection.source !== near && connection.target !== near;
                });
            }
        }

        if(this.mouse.right && this.selectedTool === 'edit'){
            const near = this.getNearPointField(e,undefined);
            if(near){
                near.selected = !near.selected;

                if(near.selected){
                    for(const block of this.blocks){
                        for(const field of block.fields){
                            if(field !== near){
                                field.selected = false;
                            }
                        }
                    }
                }

                this.selectedField = near.selected ? near : undefined;
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

        if(previousMouse.left && this.selectedTool === 'select'){
            // select all states in selection rect
            for(const block of this.blocks){
                if(this.selectionRect.width < 0){
                    this.selectionRect.x += this.selectionRect.width;
                    this.selectionRect.width *= -1;
                }

                if(this.selectionRect.height < 0){
                    this.selectionRect.y += this.selectionRect.height;
                    this.selectionRect.height *= -1;
                }

                block.selected = this.selectionRect.x < block.x + block.width && this.selectionRect.x + this.selectionRect.width > block.x && this.selectionRect.y < block.y + block.height && this.selectionRect.y + this.selectionRect.height > block.y;
            }
        }

        // reset selected state on mouse up
        this.selectedBlock = undefined;
        this.selectionRect={x:0,y:0,width:0,height:0};

        // if left mouse was pressed and tool is connect finish the connection
        if(previousMouse.left && this.selectedTool === 'connect'){
            // get nearest state
            const near = this.getNearPointDot(e,this.selectedDot);
            this.tempConnection.target = near;
            // if there wasnt a state near the mouse remove the connection
            if(!this.tempConnection.target || near.type === this.tempConnection.source.type){
                // remove last connection
                this.connections.pop();
            }
            // reset temp connection
            this.tempConnection = new Connection();
        }
    }

    /** mouse move handler for canvas */
    mouseMove(e){ // ANCHOR mouseMove
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // calculate mouse position in canvas with scale and translation
        this.mouse.x = (this.mouse.x - this.controls.translation.x) / this.controls.scale;
        this.mouse.y = (this.mouse.y - this.controls.translation.y) / this.controls.scale;

        // calculate selection rect width and height if select tool is active and left mouse is pressed
        if(this.selectedTool === 'select' && this.mouse.left){
            this.selectionRect.width = this.mouse.x - this.selectionRect.x;
            this.selectionRect.height = this.mouse.y - this.selectionRect.y;
            return;
        }

        // if adding is active move the last state to the mouse position
        if(this.controls.adding){
            this.blocks[this.blocks.length - 1].x = this.mouse.x;
            this.blocks[this.blocks.length - 1].y = this.mouse.y;
            this.blocks[this.blocks.length - 1].update();
            return;
        }

        // if connect tool is active, left mouse is pressed and there 
        // is a connection in progress move the target of the connection to the mouse position
        // or to the nearest state (if there is any)
        if(this.selectedTool === 'connect' && this.tempConnection.source && this.mouse.left){
            const near = this.getNearPointDot(e,undefined);
            if(near?.type !== this.connections[this.connections.length - 1].source.type){
                this.connections[this.connections.length - 1].target = near || {x: this.mouse.x, y: this.mouse.y};
            } else {
                this.connections[this.connections.length - 1].target = {x: this.mouse.x, y: this.mouse.y};
            }
            return;
        }

        // if left mouse is pressed and tool is move move the selected state to the mouse position
        if(this.mouse.left && this.selectedBlock && this.selectedTool === 'move'){
            // move selected blocks
            for(const block of this.blocks){
                if(block.selected == true){
                    block.x += e.movementX / this.controls.scale;
                    block.y += e.movementY / this.controls.scale;
                    block.update();
                }
            }
            return;
        }

        // if left mouse is pressed and all other conditions are false move the area with the mouse
        if(this.mouse.left){
            // check if mouse was pressed on any element
            const near = this.getNearPoint(e,undefined);
            // if not move the area
            if(!near){
                this.translate(e);
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
        var delta = e.deltaY ? e.deltaY : (e.detail * 10);
        this.controls.scale += delta * -0.0005;
        // max scale 4x min scale 0.125x
        this.controls.scale = Math.min(Math.max(.125, this.controls.scale), 4);
    }

    /** check if there is a point next to the mouse with a given threshold
     * @param {MouseEvent} e mouse event
     * @param {Block} selectedBlock block to ignore
     */
    getNearPoint(e, selectedBlock){ // ANCHOR getNearPoint
        let x = e.clientX || e.x;
        let y = e.clientY || e.y;

        // calculate mouse position in canvas with scale and translation
        x = (x - this.controls.translation.x) / this.controls.scale;
        y = (y - this.controls.translation.y) / this.controls.scale;

        let near = undefined;

        // check if mouse is inside block rectangle from x,y to x+width,y+height
        for(const block of this.blocks){
            if(block === selectedBlock) continue;
            
            // check if mouse is inside block rectangle
            if(x >= block.x - this.options.blocks.tolerance && x <= block.x + block.width + this.options.blocks.tolerance && y >= block.y - this.options.blocks.tolerance && y <= block.y + block.height + this.options.blocks.tolerance && block.selected == true){
                near = block;
                break;
            }
        }

        return near;
    }

    /** check if there is a dot next to the mouse with a given threshold
     * @param {MouseEvent} e mouse event
     * @param {Dot} selectedDot dot that should be ignored
     */
    getNearPointDot(e, selectedDot){ // ANCHOR getNearPointDot
        let x = e.clientX || e.x;
        let y = e.clientY || e.y;

        // calculate mouse position in canvas with scale and translation
        x = (x - this.controls.translation.x) / this.controls.scale;
        y = (y - this.controls.translation.y) / this.controls.scale;

        let near = undefined;

        for(const block of this.blocks){
            for(const dot of block.dots){
                if(dot === selectedDot) continue;
                
                // check if mouse is inside dot rectangle
                if(x >= dot.x - this.options.dots.tolerance && x <= dot.x + this.options.dots.tolerance && y >= dot.y - this.options.dots.tolerance && y <= dot.y + this.options.dots.tolerance){
                    near = dot;
                    break;
                }
            }
        }

        return near;
    }

    /** checks if there is a field next to the clicked point
     * @param {MouseEvent} e mouse event
     * @param {Field} selectedField field that should be ignored
     */
    getNearPointField(e, selectedField){ // ANCHOR getNearPointField
        let x = e.clientX || e.x;
        let y = e.clientY || e.y;

        // calculate mouse position in canvas with scale and translation
        x = (x - this.controls.translation.x) / this.controls.scale;
        y = (y - this.controls.translation.y) / this.controls.scale;

        let near = undefined;

        for(const block of this.blocks){
            for(const field of block.fields){
                if(field === selectedField) continue;

                // check if mouse is inside field rectangle
                if(x >= field.x - this.options.fields.tolerance && x <= field.x + field.width + this.options.fields.tolerance && y >= field.y - this.options.fields.tolerance && y <= field.y + field.height + this.options.fields.tolerance){
                    near = field;
                    break;
                }
            }
        }

        return near;
    }

    /** add value to b tree
     * @param {string} val value to add
     */
    addValue(val){ // ANCHOR addValue
        if(val == undefined || val.trim() === '') return;
        // check if there are multiple values (seperated by comma)
        if(val.includes(',')){
            const values = val.split(',');
            // add each value
            for(const value of values){
                // only add if value is not already in tree
                if(!this.btree.get(value)){
                    this.btree.put(value,value);
                    this.previouslyAddedValues.push(value);
                }
            }
        }
        else {
            // check if value is already in tree
            if(!this.btree.get(val)){
                this.btree.put(val,val);
                this.previouslyAddedValues.push(val);
            }
        }

        this.updateTree();
    }

    /** update tree */
    updateTree(){ // ANCHOR updateTree
        // clear blocks
        this.blocks = [];
        this.connections = [];

        if(this.btree.root == undefined) return;

        // calculate middle of canvas
        const middle = {x: this.canvas.width / 2, y: this.canvas.height / 2};
        const x = middle.x - (this.options.blocks.width / 2);
        const y = middle.y - (this.options.blocks.height / 2);
        // create root block
        const root = new Block(x,y,this.options.blocks.size * this.options.blocks.width, this.options.blocks.height, this.options.blocks.size);
        // add values to root block
        for(let i = 0; i < this.btree.root.leaves.length; i++){
            root.fields[i].text = this.btree.root.leaves[i].key;
            root.values[i] = parseInt(this.btree.root.leaves[i].key);
        }

        this.blocks.push(root);

        let nodes = this.btree.root.nodes;
        // build the rest of the tree
        this.processNodes(nodes, root, 0, x, y);
    }

    /** Export Canvas to Image */
    saveImage(e){ // ANCHOR saveImage
        createRipple(e);
        // render whole canvas area to image
        const image = this.canvas.toDataURL("image/png", 2.0);

        // create link to download image
        const link = document.createElement('a');
        link.download = 'btree.png';
        link.href = image;
        link.click();
    }

    /** Recursively process nodes in the b tree
     * @param {Array} nodes nodes to process
     * @param {Block} connectedBlock block these nodes are connected to
     * @param {Number} level level the nodes are on
     * @param {Number} x x position of the block above
     * @param {Number} y y position of the block above
     */
    processNodes(nodes, connectedBlock, level, x, y){
        if(nodes.filter(n => n != null).length == 0) return;
        for(let i = 0; i < nodes.length; i++){
            if(nodes[i] == null) continue;

            // check how many blocks are on the current level (to distribute evenly)
            const blocksOnLevel = this.getBlocksOnLevel(0, level, [], this.btree.root).length;
            // calculate center of the parent block
            const parentCenter = connectedBlock.x + (connectedBlock.width / 2);
            // calculate total width of the level
            const levelWidth = blocksOnLevel * (this.options.blocks.width * this.options.blocks.size) + ((blocksOnLevel-1) * (this.options.blocks.width));
            // calculate position of each block on the level
            const parentCenterOffset = parentCenter - (levelWidth / 2);
            // get index of the block (could be in another node)
            const index = this.getBlockIndexOnLevel(nodes[i], level);
            // calculate x and y position of the block
            const tmpX = parentCenterOffset + (index * this.options.blocks.width * this.options.blocks.size) + (this.options.blocks.width * index);
            const tmpY = y + (level * this.options.blocks.height) + (this.options.blocks.height * 3);

            // create block
            const block = new Block(tmpX,tmpY,this.options.blocks.size * this.options.blocks.width, this.options.blocks.height, this.options.blocks.size);
            block.index = index;

            // set values of the block
            for(let j = 0; j < nodes[i].leaves.length; j++){
                block.fields[j].text = nodes[i].leaves[j].key;
                block.values[j] = parseInt(nodes[i].leaves[j].key);
            }

            // add connections to the block
            let maxConnectionValue = -1;
            let maxConnectionIndex = -1;
            let minConnectionValue = Number.MAX_SAFE_INTEGER;
            let minConnectionIndex = -1;
            const maxBlockValue = Math.max(...block.values);
            for(let j = 0; j < connectedBlock.values.length; j++){
                if(connectedBlock.values[j] > maxBlockValue){
                    if(connectedBlock.values[j] < minConnectionValue){
                        minConnectionValue = connectedBlock.values[j];
                        minConnectionIndex = j+1;
                    }
                } else if(connectedBlock.values[j] < maxBlockValue){
                    if(connectedBlock.values[j] > maxConnectionValue){
                        maxConnectionValue = connectedBlock.values[j];
                        maxConnectionIndex = j+2;
                    }
                }
            }

            // check if there is a connection to the block
            if(maxConnectionIndex != -1){
                const connection = new Connection(connectedBlock.dots[maxConnectionIndex], block.dots[0]);
                this.connections.push(connection);
            } else if(minConnectionIndex != -1){
                const connection = new Connection(connectedBlock.dots[minConnectionIndex], block.dots[0]);
                this.connections.push(connection);
            }

            // add block to the list of blocks
            this.blocks.push(block);
            // process nodes of the block (till there are no more nodes)
            this.processNodes(nodes[i].nodes, block, level+1, tmpX, tmpY);
        }
    }

    /** Returns all the blocks on the given level
     * @param {Number} currentLevel current level
     * @param {Number} level level to get the blocks from
     * @param {Array} blocks array of blocks (will be returned)
     * @param {Block} currentBlock current block (will be checked if it is on the given level)
     */
    getBlocksOnLevel(currentLevel, level, blocks, currentBlock){ // ANCHOR getBlocksOnLevel
        // iterate through all the nodes of the current block
        for(let i = 0; i < currentBlock.nodes.length; i++){
            if(currentBlock.nodes[i] == null) continue;

            // if the current level is the level we want to get the blocks from, add the block to the list
            if(currentLevel == level) blocks.push(currentBlock.nodes[i]);
        }

        // if the current level is the level we want to get the blocks from, return the list of blocks
        if(currentLevel == level){
            return blocks;
        }

        // iterate through all the nodes of the current block
        for(let i = 0; i < currentBlock.nodes.length; i++){
            if(currentBlock.nodes[i] == null) continue;

            // get the blocks on the next level
            blocks = this.getBlocksOnLevel(currentLevel+1, level, blocks, currentBlock.nodes[i]);
        }

        return blocks;
    }

    /** Returns the index of the given block on the current level
     * @param {Block} block block to get the index from
     * @param {Number} level level to get the index from
     */
    getBlockIndexOnLevel(block, level){ // ANCHOR getBlockIndexOnLevel
        const blocks = this.getBlocksOnLevel(0, level, [], this.btree.root);
        return blocks.indexOf(block);
    }

    /** add new block */
    addBlock(e){ // ANCHOR addBlock
        createRipple(e); // create ripple effect on button

        this.controls.adding = true;
        document.querySelector('.add-btn').classList.add('disabled');

        // add block
        const block = new Block(0,0,this.options.blocks.size * this.options.blocks.width, this.options.blocks.height, this.options.blocks.size);
        this.blocks.push(block);
    }

    /** select tool */
    selectTool(e){ // ANCHOR selectTool
        createRipple(e);
        e.stopPropagation();
        // get tool from button
        const tool = e.target.parentElement.getAttribute("data-tool");
        // remove active class from all buttons
        Array.from(document.querySelectorAll(".tools div")).forEach((el)=>{
            el.classList.remove('active');
        });
        // add active class to selected
        e.target.parentElement.classList.add('active');
        this.selectedTool = tool;
    }

    /** draw the grid
    * @param {CanvasRenderingContext2D} ctx canvas context to draw on
    */
    drawGrid(ctx){ // ANCHOR drawGrid
        // calculate grid size
        const gridSize = 50 * this.controls.scale;

        // calculate offset
        const offsetX = this.controls.translation.x % gridSize;
        const offsetY = this.controls.translation.y % gridSize;

        // set line width
        ctx.lineWidth = 1;

        // set line color
        ctx.strokeStyle = "#555";

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

    /** draw the selection rectangle
     * @param {CanvasRenderingContext2D} ctx canvas context to draw on
     */
    drawSelectionRect(ctx){ // ANCHOR drawSelectionRect
        ctx.fillStyle = "#ffffff22";
        ctx.strokeStyle = "#ffffff88";
        ctx.beginPath();
        ctx.rect(this.selectionRect.x, this.selectionRect.y, this.selectionRect.width, this.selectionRect.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    /** save project */
    saveProject(e){ // ANCHOR saveProject
        createRipple(e);

        // create project object
        const project = {
            blocks: [],
            connections: [],
            options: this.options
        };

        // convert blocks to json compatible format
        for(const block of this.blocks){
            project.blocks.push({
                id: block.id,
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                size: block.size,
                values: block.values,
                children: block.children,
                dots: block.dots,
                fields: block.fields.map((field)=>{
                    return {
                        x: field.x,
                        y: field.y,
                        width: field.width,
                        height: field.height,
                        parent: field.parent.id,
                        text: field.text,
                        selected: field.selected
                    }
                })
            });
        }

        // convert connections to json compatible format
        for(const con of this.connections){
            project.connections.push({
                source: con.source.id,
                target: con.target.id,
                selected: con.selected
            });
        }

        const json = JSON.stringify(project);
        this.download('project.tree',json);
    }

    /** load project file */
    loadProject(e){ // ANCHOR loadProject
        createRipple(e);
        
        // trigger file input
        document.querySelector('#file-input').onchange = (e)=>{
            const file = e.target.files[0];
            if(!file) return;

            // read file
            const reader = new FileReader();
            reader.onload = (e)=>{
                const project = JSON.parse(e.target.result);

                this.blocks = [];
                this.connections = [];
                this.options = project.options;

                // setup blocks and dots
                for(const block of project.blocks){
                    const newBlock = new Block();
                    newBlock.id = block.id;
                    newBlock.x = block.x;
                    newBlock.y = block.y;
                    newBlock.width = block.width;
                    newBlock.height = block.height;
                    newBlock.size = block.size;
                    newBlock.values = block.values;
                    newBlock.children = block.children;
                    newBlock.dots = [];
                    for(const dot of block.dots){
                        const dotTmp = new Dot();
                        dotTmp.id = dot.id;
                        dotTmp.x = dot.x;
                        dotTmp.y = dot.y;
                        dotTmp.type = dot.type;
                        newBlock.dots.push(dotTmp);
                    }
                    newBlock.draw = Block.prototype.draw;
                    this.blocks.push(newBlock);
                }

                // setup edit fields
                for(const block of project.blocks){
                    const newBlock = this.blocks.find((b)=>b.id === block.id);
                    for(const field of block.fields){
                        const newField = new EditField();
                        newField.x = field.x;
                        newField.y = field.y;
                        newField.width = field.width;
                        newField.height = field.height;
                        newField.parent = this.blocks.find((b)=>b.id === field.parent);
                        newField.text = field.text;
                        newField.selected = field.selected;
                        newBlock.fields.push(newField);
                    }
                }

                // setup connections
                for(const con of project.connections){
                    const newCon = new Connection();
                    for(const block of project.blocks){
                        for(const dot of block.dots){
                            if(con.source === dot.id){
                                newCon.source = this.blocks.find((b)=>b.id === block.id).dots.find((d)=>d.id === dot.id);
                            }

                            if(con.target === dot.id){
                                newCon.target = this.blocks.find((b)=>b.id === block.id).dots.find((d)=>d.id === dot.id);
                            }
                        }
                    }
                    newCon.selected = con.selected;
                    this.connections.push(newCon);
                }

                this.TREE = btree.create(this.options.blocks.size, btree.numcmp);
                // get all the values from the blocks
                let values = [];
                this.blocks.forEach((block)=>{
                    for(let i = 0; i < block.values.length; i++){
                        values.push(block.values[i]);
                    }
                });
                this.btree = new this.TREE();
                for(let i = 0; i < values.length; i++){
                    this.btree.put(values[i], values[i]);
                }
                this.updateTree();
            }
            reader.readAsText(file);
        };
        document.querySelector('#file-input').click();
    }

    /** download file
     * @param {string} filename name of the file
     * @param {string} text text to save
     */
    download(filename, text) { // ANCHOR download
        // create temporary link
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        // click on link to download
        element.click();

        // remove temporary link
        document.body.removeChild(element);
    }
}