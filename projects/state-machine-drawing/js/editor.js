class Editor{
    constructor(){
        this.canvas = document.getElementById("canvas");

        this.debugPoints = [];
        this.states = [];
        this.connections = [];

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
            states: {
                radius: 35,
                stroke: 4,
                strokeColor: "#fff",
                fillColor: "#333"
            },
            connections: {
                stroke: 2,
                strokeColor: "#fff"
            },
            animation: {
                speed: 1,
                speeds: [0.5,1,1.5,2,2.5,4,8]
            }
        };

        this.controls = {
            adding: false,
            animate: false,
            animationFinished: false,
            scale: 1,
            translation: {
                x: 0,
                y: 0
            }
        };

        this.selectedState = undefined;
        this.selectedTool = 'move';

        this.activeState = undefined;
        this.editElement = undefined;

        this.tempConnection = new Connection();

        this.inputSequence = ['0'];
        this.output = "";
        this.currentInput = 0;

        this.init();
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
        this.canvas.addEventListener('DOMMouseScroll',this.scroll.bind(this));
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());

        requestAnimationFrame(this.draw.bind(this));
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

        ctx.strokeStyle = this.options.connections.strokeColor;
        ctx.lineWidth = this.options.connections.stroke;

        for(const connection of this.connections){
            connection.draw(ctx,this.connections);
            // if animation has started and this connection is currently being animated increase progress
            if(connection.input.includes('!')){
                if(this.controls.animate && connection.source === this.activeState && connection.input.substring(1,connection.input.length) !== this.inputSequence[this.currentInput]) connection.progress += (0.001 * this.options.animation.speeds[this.options.animation.speed]);
            } else {
                if(this.controls.animate && connection.source === this.activeState && connection.input === this.inputSequence[this.currentInput]) connection.progress += (0.001 * this.options.animation.speeds[this.options.animation.speed]);
            }
            

            // if progress finished reset progress and set active state to the next state
            if(connection.progress >= 1){
                connection.progress = 0;
                this.activeState = connection.target;
                this.output += connection.output;
                document.querySelector('.output').value = this.output;
                this.currentInput++;
                // check if the active state is a final state
                if(this.currentInput > this.inputSequence.length - 1){
                    this.controls.animationFinished = true;
                    this.controls.animate = false;
                    document.querySelector('.play-pause-btn').innerHTML = '<i class="bx bx-play"></i>';
                }
            }
        }

        ctx.strokeStyle = this.options.states.strokeColor;
        ctx.fillStyle = this.options.states.fillColor;
        ctx.lineWidth = this.options.states.stroke;

        for(const state of this.states){
            state.draw(ctx);
        }

        for(const point in this.debugPoints){
            ctx.fillStyle = this.debugPoints[point].color;
            ctx.beginPath();
            ctx.arc(this.debugPoints[point].x, this.debugPoints[point].y, this.debugPoints[point].size, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }

        // restore canvas to normal
        ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
    }

    /** mouse down handler for canvas */
    mouseDown(e){ // ANCHOR mouseDown
        this.canvas.style.cursor = "grabbing";
        this.mouse[this.mouseMap[e.button]] = true;

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
            this.states.pop();
            document.querySelector('.add-btn').classList.remove('disabled');
            return;
        }

        // if left mouse is pressed and tool is move select state
        if(this.mouse.left && this.selectedTool === 'move'){
            // get nearest state
            const near = this.getNearPoint(e,this.selectedState);
            
            // if there is a state near the mouse select it
            if(near){
                this.selectedState = near;
            }
        }

        // if left mouse is pressed and tool is connect create a new connection
        if(this.mouse.left && this.selectedTool === 'connect'){
            // get nearest state
            const start = this.getNearPoint(e,this.selectedState);
            
            // if there is a state near the mouse create a new connection
            if(start){
                // create new connection
                this.tempConnection.source = start;
                this.tempConnection.target = start;
                this.connections.push(this.tempConnection);
            }
        }

        if(this.mouse.right && this.selectedTool === 'edit'){
            const near = this.getNearPointCon(e,undefined);
            if(near){
                near.selected = !near.selected;

                if(near.selected){
                    for(const connection of this.connections){
                        if(connection !== near) connection.selected = false;
                    }
                    for(const state of this.states){
                        state.selected = false;
                    }
                    this.editElement = {type:'connection',element:near};
                } else {
                    this.editElement = undefined;
                }
                this.updateEditMenu();
            }

            const nearState = this.getNearPoint(e,undefined);
            console.log(nearState);
            if(nearState){
                // toggle selected
                nearState.selected = !nearState.selected;

                if(nearState.selected){
                    for(const state of this.states){
                        if(state !== nearState) state.selected = false;
                    }
                    for(const connection of this.connections){
                        connection.selected = false;
                    }
                    this.editElement = {type:'state',element:nearState};
                } else {
                    this.editElement = undefined;
                }
                console.log(nearState.selected);
                this.updateEditMenu();
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

        // reset selected state on mouse up
        this.selectedState = undefined;

        // if left mouse was pressed and tool is connect finish the connection
        if(previousMouse.left && this.selectedTool === 'connect'){
            // get nearest state
            this.tempConnection.target = this.getNearPoint(e,this.selectedState);
            // if there wasnt a state near the mouse remove the connection
            if(!this.tempConnection.target){
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

        // if adding is active move the last state to the mouse position
        if(this.controls.adding){
            this.states[this.states.length - 1].x = this.mouse.x;
            this.states[this.states.length - 1].y = this.mouse.y;
            return;
        }

        // if connect tool is active, left mouse is pressed and there 
        // is a connection in progress move the target of the connection to the mouse position
        // or to the nearest state (if there is any)
        if(this.selectedTool === 'connect' && this.tempConnection.source && this.mouse.left){
            this.connections[this.connections.length - 1].target = this.getNearPoint(e,undefined) || {x: this.mouse.x, y: this.mouse.y};
            return;
        }

        // if left mouse is pressed and tool is move move the selected state to the mouse position
        if(this.mouse.left && this.selectedState && this.selectedTool === 'move'){
            this.selectedState.x = this.mouse.x;
            this.selectedState.y = this.mouse.y;
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
    getNearPoint(e, selectedState){ // ANCHOR getNearPoint
        let x = e.clientX || e.x;
        let y = e.clientY || e.y;

        // calculate mouse position in canvas with scale and translation
        x = (x - this.controls.translation.x) / this.controls.scale;
        y = (y - this.controls.translation.y) / this.controls.scale;

        let near = undefined;

        for(const state of this.states){
            // skip the selected state
            if(state === selectedState) continue;

            // calculate distance
            const dist = Math.sqrt(Math.pow(state.x - x, 2) + Math.pow(state.y - y, 2));
            // if distance is smaller than threshold set near to state
            if(dist < this.options.states.radius){
                near = state;
                break;
            }
        }

        return near;
    }

    getNearPointCon(e, selectedCon){ // ANCHOR getNearPointCon
        let x = e.clientX || e.x;
        let y = e.clientY || e.y;

        // calculate mouse position in canvas with scale and translation
        x = (x - this.controls.translation.x) / this.controls.scale;
        y = (y - this.controls.translation.y) / this.controls.scale;

        let near = undefined;
        let minDistance = 500;

        for(const con of this.connections){
            // skip the selected state
            if(con === selectedCon) continue;

            if(con.source === con.target){
                const distanceCheck = con.isSelfNear(x,y);
                if(distanceCheck.distance < minDistance){
                    near = con;
                    minDistance = distanceCheck.distance;
                }
            } else {
                // check if mouse is near the connection
                const distanceCheck = con.isNear(x,y);
                if(distanceCheck.isNear && distanceCheck.distance < minDistance){
                    near = con;
                    minDistance = distanceCheck.distance;
                }
            }
        }

        return near;
    }

    /** add new state */
    addState(e){ // ANCHOR addState
        createRipple(e);

        this.controls.adding = true;
        document.querySelector('.add-btn').classList.add('disabled');

        const state = new State("S" + (this.states.length + 1), 0,0, undefined,undefined, this.states.length === 0 ? true : false);
        this.states.push(state);
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

            for(const state of this.states){
                state.selected = false;
            }

            this.editElement = undefined;
            this.updateEditMenu();
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

    resetAnimation(){
        this.connections.forEach((connection)=>{
            connection.progress = 0;
        });

        this.activeState = this.states.find((state)=>{ return state.isStart; });
        this.currentInput = 0;
        this.controls.animationFinished = false;

        this.output = "";
    }

    toggleAnimation(e){
        createRipple(e);
        const newAnimationState = !this.controls.animate;

        console.log(this.controls.animationFinished);
        // TODO check if animation finished and if so reset animation
        if(!this.activeState || this.controls.animationFinished){
            this.resetAnimation();
        }

        this.controls.animate = newAnimationState;

        if(this.controls.animate){
            e.target.innerHTML = "<i class='bx bx-pause'></i>";
            this.animationFinished = false;
        } else {
            e.target.innerHTML = "<i class='bx bx-play'></i>";
        }
    }

    changeAnimationSpeed(e,type){
        if(type === 'slower'){
            this.options.animation.speed--;
            if(this.options.animation.speed < 0) this.options.animation.speed = 0;
        } else {
            this.options.animation.speed++;
            if(this.options.animation.speed >= this.options.animation.speeds.length) this.options.animation.speed = this.options.animation.speeds.length - 1;
        }

        document.querySelector('.speed-input .value').innerHTML = `${this.options.animation.speeds[this.options.animation.speed]}x`;
    }

    updateEditMenu(){
        if(!this.editElement){
            document.querySelector('.edit-menu').classList.add('empty');
            document.querySelector('.edit-menu .none').classList.remove('hidden');
            document.querySelector('.edit-menu .menu').classList.add('hidden');
            return;
        } else {
            document.querySelector('.edit-menu').classList.remove('empty');
            document.querySelector('.edit-menu .none').classList.add('hidden');
            document.querySelector('.edit-menu .menu').classList.remove('hidden');

            const type = this.editElement.type;
            Array.from(document.querySelectorAll('.edit-menu .input-wrapper')).forEach((el)=>{
                const settingType = el.getAttribute('setting-type');
                if(settingType === type){
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });

            if(type === 'connection'){
                document.querySelector('.edit-menu .type').innerHTML = `Connection (${this.editElement.element.source.name}->${this.editElement.element.target.name})`;
                document.querySelector('#condition input').value = this.editElement.element.input;
                document.querySelector('#condition input').oninput = (e)=>{
                    this.editElement.element.input = e.target.value;
                };
                document.querySelector('#output input').value = this.editElement.element.output;
                document.querySelector('#output input').oninput = (e)=>{
                    this.editElement.element.output = e.target.value;
                };
            } else {
                document.querySelector('.edit-menu .type').innerHTML = `State ("${this.editElement.element.name}")`;
                document.querySelector('#name input').value = this.editElement.element.name;
                document.querySelector('#name input').oninput = (e)=>{
                    this.editElement.element.name = e.target.value;
                };

                document.querySelector('#isStart input').checked = this.editElement.element.isStart;
                document.querySelector('#isStart input').onchange = (e)=>{
                    this.editElement.element.isStart = e.target.checked;
                    for(const state of this.states){
                        if(state !== this.editElement.element){
                            state.isStart = false;
                        }
                    }
                }
            }
        }
    }

    saveProject(e){
        createRipple(e);
        const project = {
            states: [],
            connections: []
        };

        this.states.forEach((state)=>{
            project.states.push({
                name: state.name,
                x: state.x,
                y: state.y,
                isStart: state.isStart
            });
        });

        this.connections.forEach((connection)=>{
            project.connections.push({
                source: connection.source.name,
                target: connection.target.name,
                input: connection.input
            });
        });

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
                
                // clear current project
                this.states = [];
                this.connections = [];

                this.resetAnimation();

                // load new project
                project.states.forEach((state,index)=>{
                    this.states.push(new State(state.name,state.x,state.y,undefined,undefined,state.isStart));
                });

                project.connections.forEach((connection)=>{
                    const source = this.states.find((state)=>state.name === connection.source);
                    const target = this.states.find((state)=>state.name === connection.target);
                    this.connections.push(new Connection(source,target,connection.input));
                });

                this.updateEditMenu();
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