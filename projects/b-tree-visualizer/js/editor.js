class Editor{
    constructor(){
        this.canvas = document.getElementById("canvas");

        this.blocks = [];
        this.connections = [];
        this.TREE = btree.create(4, btree.numcmp);
        this.btree = new this.TREE();

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
                size: 4,
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

    openSettingsWindow(){
        document.querySelector('.window-overlay').classList.remove('hidden');
        document.querySelector('.settings-window').classList.remove('hidden');
    }

    closeSettingsWindow(){
        document.querySelector('.window-overlay').classList.add('hidden');
        document.querySelector('.settings-window').classList.add('hidden');
    }

    init(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize',()=>{
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

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

        requestAnimationFrame(this.draw.bind(this));
    }

    draw(){
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // draw grid that moves with the canvas
        this.drawGrid(ctx);

        // scale and translate
        ctx.save();
        ctx.translate(this.controls.translation.x, this.controls.translation.y);
        ctx.scale(this.controls.scale, this.controls.scale);

        if(this.selectedTool === 'select'){
            this.drawSelectionRect(ctx);
        }

        ctx.strokeStyle = this.options.connections.strokeColor;
        ctx.lineWidth = this.options.connections.stroke;

        for(const connection of this.connections){
            connection.draw(ctx,this.connections);
        }

        ctx.strokeStyle = this.options.blocks.strokeColor;
        ctx.fillStyle = this.options.blocks.fillColor;
        ctx.lineWidth = this.options.blocks.stroke;

        for(const block of this.blocks){
            block.draw(ctx);
        }

        // restore canvas to normal
        ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
    }

    keyDown(e){ // ANCHOR keyDown
        if(e.key === 'Escape'){
            this.openSettingsWindow();
        }

        if(e.ctrlKey && e.key === 'e'){
            this.saveImage();
        }

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
            // move selected block
            this.selectedBlock.x = this.mouse.x - (this.selectedBlock.width / 2);
            this.selectedBlock.y = this.mouse.y - (this.selectedBlock.height / 2);
            this.selectedBlock.update();
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
        this.controls.scale = Math.min(Math.max(.125, this.controls.scale), 4);
    }

    /** check if there is a point next to the mouse with a given threshold */
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
            if(x >= block.x - this.options.blocks.tolerance && x <= block.x + block.width + this.options.blocks.tolerance && y >= block.y - this.options.blocks.tolerance && y <= block.y + block.height + this.options.blocks.tolerance){
                near = block;
                break;
            }
        }

        return near;
    }

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

    addValue(val){
        if(val.includes(',')){
            const values = val.split(',');
            console.log(values)
            for(const value of values){
                if(!this.btree.get(value)) this.btree.put(value,value);
            }
        }
        else {
            if(!this.btree.get(val));
            this.btree.put(val,val);
        }

        // update blocks
        this.blocks = [];
        this.connections = [];

        // calculate middle of canvas
        const middle = {x: this.canvas.width / 2, y: this.canvas.height / 2};
        const x = middle.x - (this.options.blocks.width / 2);
        const y = middle.y - (this.options.blocks.height / 2);
        const root = new Block(x,y,this.options.blocks.size * this.options.blocks.width, this.options.blocks.height, this.options.blocks.size);
        for(let i = 0; i < this.btree.root.leaves.length; i++){
            root.fields[i].text = this.btree.root.leaves[i].key;
            root.values[i] = parseInt(this.btree.root.leaves[i].key);
            console.log(this.btree.root.leaves[i].key, root.fields[i].text)
        }

        this.blocks.push(root);

        let nodes = this.btree.root.nodes;
        this.processNodes(nodes, root, 0, x, y);
    }

    saveImage(e){
        createRipple(e);
        // render whole canvas area to image
        const image = this.canvas.toDataURL("image/png", 1.0);

        const link = document.createElement('a');
        link.download = 'btree.png';
        link.href = image;
        link.click();
    }

    processNodes(nodes, connectedBlock, level, x, y){
        if(nodes.filter(n => n != null).length == 0) return;
        for(let i = 0; i < nodes.length; i++){
            if(nodes[i] == null) continue;

            // calculate x and y position (based on level and the x and y of the block above)
            const blocksOnLevel = this.getBlocksOnLevel(0, level, [], this.btree.root).length;
            const parentCenter = connectedBlock.x + (connectedBlock.width / 2);
            const levelWidth = blocksOnLevel * (this.options.blocks.width * this.options.blocks.size) + ((blocksOnLevel-1) * (this.options.blocks.width));
            const parentCenterOffset = parentCenter - (levelWidth / 2);
            // distribute evenly on the level (based on the number of blocks on the level)
            const index = this.getBlockIndexOnLevel(nodes[i], level);
            const tmpX = parentCenterOffset + (index * this.options.blocks.width * this.options.blocks.size) + (this.options.blocks.width * index);
            const tmpY = y + (level * this.options.blocks.height) + (this.options.blocks.height * 3);

            const block = new Block(tmpX,tmpY,this.options.blocks.size * this.options.blocks.width, this.options.blocks.height, this.options.blocks.size);
            block.index = index;
            for(let j = 0; j < nodes[i].leaves.length; j++){
                block.fields[j].text = nodes[i].leaves[j].key;
                block.values[j] = parseInt(nodes[i].leaves[j].key);
            }

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

            if(maxConnectionIndex != -1){
                const connection = new Connection(connectedBlock.dots[maxConnectionIndex], block.dots[0]);
                this.connections.push(connection);
            } else if(minConnectionIndex != -1){
                const connection = new Connection(connectedBlock.dots[minConnectionIndex], block.dots[0]);
                this.connections.push(connection);
            }

            this.blocks.push(block);
            this.processNodes(nodes[i].nodes, block, level+1, tmpX, tmpY);
        }
    }

    getBlocksOnLevel(currentLevel, level, blocks, currentBlock){
        for(let i = 0; i < currentBlock.nodes.length; i++){
            if(currentBlock.nodes[i] == null) continue;

            if(currentLevel == level) blocks.push(currentBlock.nodes[i]);
        }

        if(currentLevel == level){
            console.log(currentBlock.nodes);
            return blocks;
        }

        for(let i = 0; i < currentBlock.nodes.length; i++){
            if(currentBlock.nodes[i] == null) continue;

            blocks = this.getBlocksOnLevel(currentLevel+1, level, blocks, currentBlock.nodes[i]);
        }

        return blocks;
    }

    getBlockIndexOnLevel(block, level){
        const blocks = this.getBlocksOnLevel(0, level, [], this.btree.root);
        return blocks.indexOf(block);
    }

    /** add new state */
    addBlock(e){ // ANCHOR addState
        createRipple(e);

        this.controls.adding = true;
        document.querySelector('.add-btn').classList.add('disabled');

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

        if(this.selectedTool !== 'edit'){
            for(const con of this.connections){
                con.selected = false;
            }

            for(const block of this.blocks){
                block.selected = false;

                for(const field of block.fields){
                    field.selected = false;
                }
            }
        }
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

    drawSelectionRect(ctx){
        ctx.fillStyle = "#ffffff22";
        ctx.strokeStyle = "#ffffff88";
        ctx.beginPath();
        ctx.rect(this.selectionRect.x, this.selectionRect.y, this.selectionRect.width, this.selectionRect.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    saveProject(e){
        createRipple(e);
        const project = {
            blocks: [],
            connections: []
        };

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

        for(const con of this.connections){
            project.connections.push({
                source: con.source.id,
                target: con.target.id,
                selected: con.selected
            });
        }

        const json = JSON.stringify(project);
        this.download('project.machine',json);
    }

    loadProject(e){
        createRipple(e);
        
        // trigger file input
        document.querySelector('#file-input').onchange = (e)=>{
            const file = e.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.onload = (e)=>{
                const project = JSON.parse(e.target.result);

                this.blocks = [];
                this.connections = [];

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
}