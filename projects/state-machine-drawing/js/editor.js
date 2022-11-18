class Editor{
    constructor(){
        this.canvas = document.getElementById("canvas");

        this.states = [];
        this.connections = [];

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
            states: {
                radius: 35,
                stroke: 4,
                strokeColor: "#fff",
                fillColor: "#333"
            },
            connections: {
                stroke: 2,
                strokeColor: "#fff"
            }
        };

        this.controls = {
            adding: false,
            animate: false,
            scale: 1,
            translation: {
                x: 0,
                y: 0
            }
        };

        this.selectedState = undefined;
        this.selectedTool = 'move';

        this.activeState = undefined;

        this.tempConnection = new Connection();

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
        this.canvas.addEventListener("contextmenu", e => e.preventDefault());

        requestAnimationFrame(this.draw.bind(this));
    }

    draw(){
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // scale and translate
        ctx.save();
        ctx.translate(this.controls.translation.x, this.controls.translation.y);
        ctx.scale(this.controls.scale, this.controls.scale);

        ctx.strokeStyle = this.options.connections.strokeColor;
        ctx.lineWidth = this.options.connections.stroke;

        for(const connection of this.connections){
            connection.draw(ctx,this.connections);
            // if animation has started and this connection is currently being animated increase progress
            if(this.controls.animate && connection.source === this.activeState) connection.progress += 0.005;

            // if progress finished reset progress and set active state to the next state
            if(connection.progress >= 1){
                connection.progress = 0;
                this.activeState = connection.target;
            }
        }

        ctx.strokeStyle = this.options.states.strokeColor;
        ctx.fillStyle = this.options.states.fillColor;
        ctx.lineWidth = this.options.states.stroke;

        for(const state of this.states){
            state.draw(ctx);
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
        this.controls.scale += e.deltaY * -0.0005;
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

    /** add new state */
    addState(e){ // ANCHOR addState
        createRipple(e);

        this.controls.adding = true;
        document.querySelector('.add-btn').classList.add('disabled');

        const state = new State("S" + (this.states.length + 1), 0,0);
        this.states.push(state);
    }

    /** select tool */
    selectTool(e){ // ANCHOR selectTool
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

    startAnimation(){
        this.connections.forEach((connection)=>{
            connection.progress = 0;
        });

        this.controls.animate = true;

        this.activeState = this.states[0];
    }
}