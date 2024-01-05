class Game{
    constructor(mode){
        this.levelSelectMenu = document.querySelector('#level-select');
        this.pauseBtn = document.querySelector('#pause-btn');
        this.pauseBanner = document.querySelector('#pause-banner');
        this.menu = document.querySelector('#menu');
        this.pauseMenu = document.querySelector('#pause-menu');

        this.currentMode = mode;
        this.transitions = [];
        this.textureManager = new TextureManager(new THREE.TextureLoader());

        this.level = undefined;

        this.init();
    }

    init(){
        this.initScene();
        this.initListeners();
    }

    initScene(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.gridOffset = 0.5;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor( 0xf0dbb1, 0);
        document.body.appendChild(this.renderer.domElement);

        // lighting
        const ambientLight = new THREE.AmbientLight('white', 0.75);
        this.scene.add(ambientLight);

        const light = new THREE.DirectionalLight('white', 0.5);
        light.position.set( 1, 1, 1 );
        this.scene.add(light);

        // init orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // disable everything besides rotating with mouse left button
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: '',
            RIGHT: ''
        };

        // set camera position
        this.camera.position.x = -5;
        this.camera.position.y = 10;
        this.camera.position.z = 10;

        const size = 10;
        const divisions = 10;

        // init grid
        this.gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color(0xFFFFFF), new THREE.Color(0xAAAAAA));
        // disable raycast on grid
        this.gridHelper.disableRaycast = true;
        // set target for orbit control
        this.controls.target = this.gridHelper.position;
        this.scene.add(this.gridHelper);
        this.gridHelper.scale.x = 0;
        this.gridHelper.scale.y = 0;
        this.gridHelper.scale.z = 0;
    }

    // initialize event listeners
    initListeners(){
        // add resize listener
        window.addEventListener('resize', this.resize.bind(this), false);
        
        // add mouse down event listener
        document.addEventListener('mousedown', this.mouseDown.bind(this));
    }

    // start rendering
    run(){
        this.animate();
    }

    // render loop
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.handleTransitions();
        this.renderer.render(this.scene, this.camera);
    }

    // resize handler
    resize(){
        // update camera and renderer
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // mouse down handler
    mouseDown(e){
        e.preventDefault();
        // nothing on left click
        if(e.button === 0 || this.pauseMenu.classList.contains('show')) return;

        // calc 3d mouse vector
        const mouse3D = Util.pointToVector(e.clientX, e.clientY);    

        // create raycaster from mouse and camera
        const raycaster =  new THREE.Raycaster();                                        
        raycaster.setFromCamera(mouse3D, this.camera);
        // check if raycaster intersects with any objects (apart from objects that have raycast disabled)
        const intersects = raycaster.intersectObjects(this.scene.children.filter(c => !c.disableRaycast));

        if(intersects.length > 0){
            if(e.button === 2 && e.altKey){
                // layer, z, x
                const obj = intersects[0].object;
                // get position of clicked block
                const x = Math.floor(obj.position.x);
                const y = Math.floor(obj.position.y);
                const z = Math.floor(obj.position.z);
                const blockState = this.level.blockMap[y][z][x];
                // if block is marked it cant be destroyed
                if(obj.marked === true){
                    this.transitions.push(new Transition(obj, 'scale', 1.1, 1.0, 'in'));
                    return;
                }
                // if block is non destroyable, mark it and reduce players life
                if(blockState === BLOCK_STATE.NON_DESTROYABLE){
                    obj.marked = true;
                    this.transitions.push(new Transition(obj, 'scale', 1.1, 1.0, 'in'));
                    for(const mat of obj.material){
                        mat.color.setHex(0x1c55a0);
                    }
                    this.checkForRowsColumns(x,y,z);
                    // TODO: reduce players life
                    return;
                }
                this.transitions.push(new Transition(obj, 'scale', 0.0, 1.0, 'out', 0.02));
                obj.disableRaycast = true;
                // remove block from blocks array
                this.level.blocks[x][y][z] = undefined;
                this.checkForRowsColumns(x,y,z);
                setTimeout(()=>{
                    // destroy block and dispose materials and geometry to not leak any memory
                    obj.geometry.dispose();
                    obj.material.forEach((mat)=>{
                        mat.dispose();
                    });
                    this.scene.remove(obj);
                },400);
            // right click without alt key
            } else if(e.button === 2){
                // layer, z, x
                const obj = intersects[0].object;
                // get position of clicked block
                const x = Math.floor(obj.position.x);
                const y = Math.floor(obj.position.y);
                const z = Math.floor(obj.position.z);

                // add transition to clicked block
                this.transitions.push(new Transition(obj, 'scale', 1.1, 1.0, 'in'));
                // get materials
                const materials = obj.material;
                if(obj.marked === true && obj.fixed === true) return;
                obj.marked = !obj.marked;
                for(const mat of materials){
                    // if cube is already marked reset
                    if(!obj.marked) mat.color.setHex(0xFFFFFF);
                    // else mark it
                    else mat.color.setHex(0x1c55a0);
                }
                this.checkForRowsColumns(x,y,z);
            }
        }
    }

    // handle transitions
    handleTransitions(){
        const transitionsToAdd = []; const transitionsToRemove = [];
        for(const transition of this.transitions){
            switch(transition.prop){
                case 'scale':
                    // check which way the transition goes
                    if(transition.to > transition.from){
                        // check if transition is still ongoing
                        if(transition.target.scale.x < transition.to){
                            transition.target.scale.x += transition.step;
                            transition.target.scale.y += transition.step;
                            transition.target.scale.z += transition.step;
                        // if transition was of type 'in' add reverse transition and remove current transition
                        } else if(transition.type === 'in') {
                            transition.target.scale.x = transition.to;
                            transition.target.scale.y = transition.to;
                            transition.target.scale.z = transition.to;
                            transitionsToRemove.push(transition);
                            this.transitions.push(new Transition(transition.target, 'scale', transition.from, transition.to, 'out'));
                        // else just remove current transition
                        } else {
                            transition.target.scale.x = transition.to;
                            transition.target.scale.y = transition.to;
                            transition.target.scale.z = transition.to;
                            transitionsToRemove.push(transition);
                        }
                    } else {
                        // check if transition is still ongoing
                        if(transition.target.scale.x > transition.to){
                            transition.target.scale.x -= transition.step;
                            transition.target.scale.y -= transition.step;
                            transition.target.scale.z -= transition.step;
                        // if transition was of type 'in' add reverse transition and remove current transition
                        } else if(transition.type === 'in') {
                            transition.target.scale.x = transition.to;
                            transition.target.scale.y = transition.to;
                            transition.target.scale.z = transition.to;
                            transitionsToRemove.push(transition);
                            this.transitions.push(new Transition(transition.target, 'scale', transition.from, transition.to, 'out'));
                        // else just remove current transition
                        } else {
                            transition.target.scale.x = transition.to;
                            transition.target.scale.y = transition.to;
                            transition.target.scale.z = transition.to;
                            transitionsToRemove.push(transition);
                        }
                    }
                    break;
                case 'opacity':
                    // check which way the transition goes
                    if(transition.to > transition.from){
                        // check if transition is still ongoing
                        if(transition.target.material.opacity < transition.to){
                            transition.target.material.opacity += transition.step;
                        // if transition was of type 'in' add reverse transition and remove current transition
                        } else if(transition.type === 'in') {
                            transition.target.material.opacity = transition.to;
                            transitionsToRemove.push(transition);
                            this.transitions.push(new Transition(transition.target, 'opacity', transition.from, transition.to, 'out'));
                        // else just remove current transition
                        } else {
                            transition.target.material.opacity = transition.to;
                            transitionsToRemove.push(transition);
                        }
                    } else {
                        // check if transition is still ongoing
                        if(transition.target.material.opacity > transition.to){
                            transition.target.material.opacity -= transition.step;
                        // if transition was of type 'in' add reverse transition and remove current transition
                        } else if(transition.type === 'in') {
                            transition.target.material.opacity = transition.to;
                            transitionsToRemove.push(transition);
                            this.transitions.push(new Transition(transition.target, 'opacity', transition.from, transition.to, 'out'));
                        // else just remove current transition
                        } else {
                            transition.target.material.opacity
                            transitionsToRemove.push(transition);
                        }
                    }
                    break;
            }
        }

        // add new transitions and remove finished transitions
        for(const transition of transitionsToAdd) this.transitions.push(transition);
        for(const transition of transitionsToRemove) this.transitions.splice(this.transitions.indexOf(transition),1);
    }

    // place a block at a specific position
    placeBlock(x,y,z,index,transition){
        // get hints for that position
        const hints = this.level.hintMap[y][z][x];
        
        // right, left, top, bottom, front, back
        const urls = [
            `img/block${hints.horizontalRightLeft}_${hints.horizontalRightLeftType}.png`, `img/block${hints.horizontalRightLeft}_${hints.horizontalRightLeftType}.png`,
            `img/block${hints.vertical}_${hints.verticalType}.png`, `img/block${hints.vertical}_${hints.verticalType}.png`,
            `img/block${hints.horizontalBackFront}_${hints.horizontalBackFrontType}.png`,`img/block${hints.horizontalBackFront}_${hints.horizontalBackFrontType}.png`
        ];
                    
        // load textures
        const materials = urls.map(url => {
            const tex = this.textureManager.load(url);
            tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            const mat = new THREE.MeshPhongMaterial({ map: tex });
            mat.specular = new THREE.Color(0x000000);
            mat.map.minFilter = mat.map.maxFilter = THREE.LinearFilter;
            return mat;
        });

        // create box and set position
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const block = new THREE.Mesh(geometry, materials);

        block.name = 'block';
        block.state = this.level.blockMap[y][z][x];
        block.marked = false;
        block.position.x = x + this.gridOffset;
        block.position.y = y + this.gridOffset;
        block.position.z = z + this.gridOffset;

        // check if block should be transitioned (scaled up)
        if(transition){
            block.scale.x = 0;
            block.scale.y = 0;
            block.scale.z = 0;
        }
        this.level.blocks[x][y][z] = block;
        this.scene.add(block);

        // add upscale transition if block should be scaled up
        if(transition){
            setTimeout(()=>{
                this.transitions.push(new Transition(block, 'scale', 1.0, 0.0, 'out', 0.02));
            }, 200 + (10 * index));
        }
    }

    // checks if any of the rows and columns of the block at the given position is finished
    // and grays them out to show that this column is finished
    checkForRowsColumns(x,y,z){
        // vertical check (top bottom)
        // if there is a block that can be destroyed the column is not finished
        // neither if one of the non destroyable blocks is not marked
        let destroyableBlocks = 0; let nonMarkedBlocks = 0;
        for(let y1 = 0; y1 < this.level.size.y; y1++){
            const block = this.level.blocks[x][y1][z];
            if(!block) continue;
            if(block.state === BLOCK_STATE.DESTROYABLE) destroyableBlocks++;
            if(block.state === BLOCK_STATE.NON_DESTROYABLE && block.marked === false) nonMarkedBlocks++;
        }

        // if there arent any destroyable blocks or non marked blocks left gray them out to show they are fixed now
        if(destroyableBlocks === 0 && nonMarkedBlocks === 0){
            for(let y1 = 0; y1 < this.level.size.y; y1++){
                const block = this.level.blocks[x][y1][z];
                if(!block) continue;
                block.material[BLOCK_SIDE.TOP].opacity = 0.7;
                block.material[BLOCK_SIDE.BOTTOM].opacity = 0.7;
                block.fixed = true;
            }
        }

        // reset variables
        destroyableBlocks = 0; nonMarkedBlocks = 0;

        // horizontal check (left right)
        for(let x1 = 0; x1 < this.level.size.x; x1++){
            const block = this.level.blocks[x1][y][z];
            if(!block) continue;
            if(block.state === BLOCK_STATE.DESTROYABLE) destroyableBlocks++;
            if(block.state === BLOCK_STATE.NON_DESTROYABLE && block.marked === false) nonMarkedBlocks++;
        }

        // if there arent any destroyable blocks or non marked blocks left gray them out to show they are fixed now
        if(destroyableBlocks === 0 && nonMarkedBlocks === 0){
            for(let x1 = 0; x1 < this.level.size.x; x1++){
                const block = this.level.blocks[x1][y][z];
                if(!block) continue;
                block.material[BLOCK_SIDE.LEFT].opacity = 0.7;
                block.material[BLOCK_SIDE.RIGHT].opacity = 0.7;
                block.fixed = true;
            }
        }

        // reset variables
        destroyableBlocks = 0; nonMarkedBlocks = 0;

        // horizontal check (front back)
        for(let z1 = 0; z1 < this.level.size.z; z1++){
            const block = this.level.blocks[x][y][z1];
            if(!block) continue;
            if(block.state === BLOCK_STATE.DESTROYABLE) destroyableBlocks++;
            if(block.state === BLOCK_STATE.NON_DESTROYABLE && block.marked === false) nonMarkedBlocks++;
        }

        // if there arent any destroyable blocks or non marked blocks left gray them out to show they are fixed now
        if(destroyableBlocks === 0 && nonMarkedBlocks === 0){
            for(let z1 = 0; z1 < this.level.size.z; z1++){
                const block = this.level.blocks[x][y][z1];
                if(!block) continue;
                block.material[BLOCK_SIDE.FRONT].opacity = 0.7;
                block.material[BLOCK_SIDE.BACK].opacity = 0.7;
                block.fixed = true;
            }
        }
    }

    // switch mode (MENU, PLAY, EDIT)
    async switchMode(mode, lvl){
        if(this.currentMode == mode) return;
        this.currentMode = mode;

        switch(this.currentMode){
            case MODES.MENU:
                this.controls.enabled = false;
                // update dom elements
                setTimeout(()=>{
                    this.menu.classList.add('show');
                    this.pauseBtn.classList.remove('show');
                    this.pauseMenu.classList.remove('show');
                    this.pauseBanner.classList.remove('show');
                    this.levelSelectMenu.classList.remove('show');
                }, 300);

                // transition grid out
                this.transitions.push(new Transition(this.gridHelper, 'scale', 0.0, 1.0, 'out', 0.03));

                // reset level and layer handles
                for(const handle of this.level.layerHandles){
                    handle.handle.geometry.dispose();
                    handle.handle.material.dispose();
                    this.transitions.push(new Transition(handle.handle, 'opacity', 0.0, 1.0, 'out', 0.02));
                    setTimeout(()=>{
                        this.scene.remove(handle.handle);
                    },400);
                }

                // disable and dispose drag controls 
                this.dragControls.deactivate();
                this.dragControls.dispose();
                this.dragControls = undefined;

                this.level.layerHandles = [];
                this.level = undefined;

                // remove all blocks
                for(const obj of this.scene.children.filter(c => c.name === 'block')){
                    // transition block out
                    this.transitions.push(new Transition(obj, 'scale', 0.0, 1.0, 'out', 0.02));
                    // disable raycast so block doesnt block other blocks behind it while it transitions
                    obj.disableRaycast = true;
                    setTimeout(()=>{
                        // destroy block and dispose materials and geometry to not leak any memory
                        obj.geometry.dispose();
                        obj.material.forEach((mat)=>{
                            mat.dispose();
                        });
                        this.scene.remove(obj);
                    },400 + (10 * this.scene.children.indexOf(obj))); // small delay after each block
                }
                break;
            case MODES.PLAYING:
                this.controls.enabled = true;
                // update dom elements
                this.menu.classList.remove('show');
                this.pauseBtn.classList.add('show');
                this.levelSelectMenu.classList.remove('show');
                
                // load level
                this.level = await Level.loadFromFile('levels/' + lvl);
                this.transitions.push(new Transition(this.gridHelper, 'scale', 1.0, 0.0, 'out', 0.03));

                // create box and set position
                this.level.layerHandles.push(new LayerHandle(this.scene, 0x00FF00, {x: this.level.size.x, y: this.level.size.y + 1, z: this.level.size.z}, undefined, ['x','z']));
                this.level.layerHandles.push(new LayerHandle(this.scene, 0xFF0000, {x: this.level.size.x, y: 0, z: this.level.size.z + 1}, {x: 90, y: 0, z: 0}, ['x','y']));
                this.level.layerHandles.push(new LayerHandle(this.scene, 0x0000FF, {x: -1, y: 0, z: 0}, {x: 0, y: 0, z: 90}, ['y','z']));

                // add drag controls to layer handles
                this.dragControls = new THREE.DragControls(this.level.layerHandles.map(l => l.handle), this.camera, this.renderer.domElement);

                // drag start handler
                this.dragControls.addEventListener('dragstart', (e) => {
                    // set emissive color
                    e.object.material.emissive.set(0xaaaaaa);
                    // disable orbit controls
                    this.controls.enabled = false;
                    // set fixed positions for handle
                    for(const handle of this.level.layerHandles){
                        for(const key of Object.keys(handle.fixedPos)){
                            handle.handle.position[key] = handle.fixedPos[key];
                        }
                    }
                });

                // drag handler
                this.dragControls.addEventListener('drag', (e) => {
                    for(const handle of this.level.layerHandles){
                        if(e.object.color === handle.color){
                            ['x','y','z'].filter(a => !handle.fixedAxes.includes(a)).forEach((k)=>{
                                handle.handle.position[k] = Math.round(handle.handle.position[k]);
                                // make sure handle doesnt go out of bounds
                                if(handle.originPos[k] > 0){
                                    // handle cant go past the original position (y and z axis)
                                    if(handle.handle.position[k] > handle.originPos[k]) handle.handle.position[k] = handle.originPos[k];
                                    // calc diff between origin and current position
                                    let diff = handle.originPos[k] - handle.handle.position[k];
                                    // max position is the level size (in the given axis) - 1
                                    // if diff is greater move handle back
                                    if(diff > this.level.size[k] - 1){
                                        handle.handle.position[k] -= (this.level.size[k] - 1) - diff;
                                        diff = this.level.size[k] - 1;
                                    }
                                    // update layers
                                    this.updateLayers(k, Math.abs(diff));
                                } else {
                                    // handle cant go past the original position (x axis)
                                    if(handle.handle.position[k] < handle.originPos[k]) handle.handle.position[k] = handle.originPos[k];
                                    // calc diff between origin and current position
                                    let diff = handle.originPos[k] - handle.handle.position[k];
                                    // max position is the level size (in the given axis) - 1
                                    // if diff is smaller move handle back
                                    if(diff < -(this.level.size[k] - 1)){
                                        handle.handle.position[k] += (this.level.size[k] - 1) + diff;
                                        diff = -handle.handle.position[k] - 1;
                                    }
                                    // update layers
                                    this.updateLayers(k, Math.abs(diff));
                                }
                            });
                        }

                        // set fixed positions for handle
                        for(const key of Object.keys(handle.fixedPos)){
                            handle.handle.position[key] = handle.fixedPos[key];
                        }
                    }
                });

                // drag end lisstener
                this.dragControls.addEventListener('dragend', (e) => {
                    // remove emissive color
                    e.object.material.emissive.set(0x000000);
                    // enable rotate controls again
                    this.controls.enabled = true;
                    // set fixed positions for handle
                    for(const handle of this.level.layerHandles){
                        for(const key of Object.keys(handle.fixedPos)){
                            handle.handle.position[key] = handle.fixedPos[key];
                        }
                    }
                });

                // fade in handles
                setTimeout(()=>{
                    this.transitions.push(new Transition(this.level.layerHandles[0].handle, 'opacity', 1.0, 0.0, 'out', 0.02));
                    this.transitions.push(new Transition(this.level.layerHandles[1].handle, 'opacity', 1.0, 0.0, 'out', 0.02));
                    this.transitions.push(new Transition(this.level.layerHandles[2].handle, 'opacity', 1.0, 0.0, 'out', 0.02));
                },500);

                let index = 0;
                // place blocks after level loaded
                for(let x = 0; x < this.level.size.x; x++){
                    for(let y = 0; y < this.level.size.y; y++){
                        for(let z = 0; z < this.level.size.z; z++){
                            // layer, z, x
                            this.placeBlock(x,y,z,index,true);
                            index++;
                        }
                    }
                }

                // set grid position and set orbit controls target
                this.gridHelper.position.x = Math.floor(this.level.size.x / 2);
                this.gridHelper.position.z = Math.floor(this.level.size.z / 2);
                this.controls.target = this.gridHelper.position;
                break;
            case MODES.LEVEL_SELECT:
                this.levelSelectMenu.classList.add('show');
                this.menu.classList.remove('show');
                this.pauseBtn.classList.remove('show');
                this.pauseMenu.classList.remove('show');
                this.pauseBanner.classList.remove('show');
                break;
        }
    }

    // update the visibility of layers at the given axis to the given extent (how many layers to hide)
    updateLayers(axis, extent){
        let block;
        // iterate over all blocks
        for(let x = 0; x < this.level.size.x; x++){
            for(let y = 0; y < this.level.size.y; y++){
                for(let z = 0; z < this.level.size.z; z++){
                    block = this.level.blocks[x][y][z];
                    // if there is no block (removed already for example) skip iteration
                    if(!block) continue;
                    // based on axis check if block should be shown or not (and based on that disable / enable raycast interaction)
                    switch(axis){
                        case 'x':
                            // example: extent = 3, size = 4,4,4 | only the blocks with x < 3 will be hidden
                            if(x < extent){
                                block.visible = false;
                                block.disableRaycast = true;
                            } else {
                                block.visible = true;
                                block.disableRaycast = false;
                            }
                            break;
                        case 'y':
                            if(((this.level.size.y - 1) - y) < extent){
                                block.visible = false;
                                block.disableRaycast = true;
                            } else {
                                block.visible = true;
                                block.disableRaycast = false;
                            }
                            break;
                        case 'z':
                            if(((this.level.size.z - 1) - z) < extent){
                                block.visible = false;
                                block.disableRaycast = true;
                            } else {
                                block.visible = true;
                                block.disableRaycast = false;
                            }
                            break;
                    }
                }
            }
        }
    }

    // open pause menu (dom element)
    openPauseMenu(){
        this.controls.enabled = false;
        this.pauseMenu.classList.add('show');
        this.pauseBanner.classList.add('show');
    }

    closePauseMenu(){
        this.controls.enabled = true;
        this.pauseMenu.classList.remove('show');
        this.pauseBanner.classList.remove('show');
    }
}

const game = new Game(MODES.MENU);
game.run();