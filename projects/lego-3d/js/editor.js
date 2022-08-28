class Editor{
    constructor(canvas){
        this.config = {
            selection: {
                show: true,
                lineWidth: 0.5,
                lineColor: new BABYLON.Color4(.46, 0.96, 0.96,1),
            },
            grid: {
                show: true,
                opacity: .5,
                backFaceCulling: true,
            },
            camera: {
                near: 0.01,
                far: 10000,
                zoomSpeed: 50,
                zoomToMouseLocation: true,
            }
        };
        
        this.gridEnabled = !this.config.grid.show; // because it is toggled on startup it will be reversed
        this.canvas = canvas;
        this.elements = [];
        this.keys = new Map();
        this.setupKeys();
        this.init();
    }

    /** setup key map */
    setupKeys(){
        this.keys.set('ControlLeft', false);
    }

    /** initialize scene */
    init(){
        this.engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
        this.scene = new BABYLON.Scene(this.engine); // Generate the scene
        this.scene.clearColor = new BABYLON.Color4(0.23,0.247,0.286,1).toLinearSpace(); // Set a background color
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), this.scene); // Generate the camera
        this.camera.wheelPrecision = this.config.camera.zoomSpeed;
        this.camera.zoomToMouseLocation = this.config.camera.zoomToMouseLocation;
        this.camera.minZ = this.config.camera.near;
        this.camera.maxZ = this.config.camera.far;
        this.camera.attachControl(this.anvas, true); // Attach the camera to the canvas

        this.scene.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Set the ambient color of the scene to dark gray
        
        const lights = [];
        lights.push(new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(5, 5, 10), this.scene)); // Generate a light

        // set intensity and groundcolor for each light
        lights.forEach(light=>{
            light.intensity = 0.75;
            light.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        });

        // FIXME this is a workaround for the bug that the grid is not visible when the scene is loaded and no cube is in the scene
        const cube = BABYLON.MeshBuilder.CreateBox("box", {}, this.scene);
        cube.position.x = 5000;
        this.addElement(this.getUniqueId(), "box", "box", false, cube);

        // set colors of the bounding box
        this.scene.getBoundingBoxRenderer().frontColor.set(.46, 0.96, 0.96);
        this.scene.getBoundingBoxRenderer().backColor.set(.46, 0.96, 0.96);

        // create grid
        this.createGrid();
        // toggle grid
        this.toggleGrid();

        // add brick building sounds
        this.buildSound = new BABYLON.Sound("lego_build", "sounds/lego_build.wav", this.scene);
        this.buildSound2 = new BABYLON.Sound("lego_build2", "sounds/lego_build2.wav", this.scene);
        this.buildSound3 = new BABYLON.Sound("lego_build3", "sounds/lego_build3.wav", this.scene);

        // create assetmanager
        this.assetsManager = new BABYLON.AssetsManager(this.scene);

        this.pipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            true, // Do you want the pipeline to use HDR texture?
            this.scene, // The scene instance
            [this.camera] // The list of cameras to be attached to
        );
        
        // enable sharpening in the pipeline
        this.pipeline.sharpenEnabled = true;

        // load brick meshes
        BrickLib.bricks.forEach(brick=>{
            // add tasak to load brick mesh
            const task = this.assetsManager.addMeshTask(brick.name, "", `models/`, brick.path);

            task.onSuccess = (task) => {
                // disable the original mesh and store it in the Atlas

                // make original meshes not pickable and hide them very far away
                task.loadedMeshes[0].isPickable = false;
                task.loadedMeshes[1].isPickable = false;
                task.loadedMeshes[1].position.x = 10000;

                // set mesh in brick library mesh map
                BrickLib.brickMeshes.set(brick.name,this.ConvertAbstractMeshToFlatShaded(task.loadedMeshes[1]));
            };
        });

        // start the render loop once every mesh is loaded
        this.assetsManager.onFinish = (tasks)=>{
            this.engine.runRenderLoop(()=>{
                this.scene.render();

                // iterate over all elements and check if they are hovered currently or selected
                this.elements.forEach(el=>{
                    // if the element is selected show bounding box and edge renderer
                    if(el.type === 'brick' && el.selected){
                        el.element.showBoundingBox = true;
                        el.element.enableEdgesRendering();
                        el.element.edgesWidth = this.config.selection.lineWidth;
                        el.element.edgesColor = this.config.selection.lineColor;
                    // else if the element is hovered show bounding box only
                    } else if(el.type === 'brick' && el.hovering) {
                        el.element.showBoundingBox = true;
                        el.element.disableEdgesRendering();
                        /* el.element.edgesWidth = this.config.selection.lineWidth;
                        const r = el.color.rgba[0] / 255;
                        const g = el.color.rgba[1] / 255;
                        const b = el.color.rgba[2] / 255;
                        el.element.edgesColor = new BABYLON.Color4(r,g,b,el.color.rgba[3]); */
                    // else if the element is not selected or hovered hide bounding box and edge renderer
                    } else if(el.type === 'brick') {
                        el.element.showBoundingBox = false;
                        el.element.disableEdgesRendering();
                        el.element.edgesWidth = this.config.selection.lineWidth;
                        /* el.element.edgesWidth = this.config.selection.lineWidth;
                        const r = el.color.rgba[0] / 255;
                        const g = el.color.rgba[1] / 255;
                        const b = el.color.rgba[2] / 255;
                        el.element.edgesColor = new BABYLON.Color4(r,g,b,el.color.rgba[3]); */
                    }
                });
            });
            
            // resize engine when window is resized
            window.addEventListener("resize", () => {
                this.engine.resize();
            });

            // setup controls
            this.setupControls();
        };

        // load all meshes
        this.assetsManager.load();
    }

    /** setup controls of the elements and everything else */
    setupControls(){
        document.onkeydown = (e) => {
            if(e.keyCode === 71){
                this.toggleGrid();
            } else if(e.code === 'KeyA' && e.ctrlKey){
                // prevent default behaviour of shift + a
                e.preventDefault();
                // select all bricks
                this.elements.forEach(el=>{
                    if(el.type === 'brick'){
                        el.selected = true;
                    }
                });

                // notify selection change
                this.notifySelectionChange();
            } else if(e.code === 'KeyA' && e.shiftKey){
                // prevent default behaviour of shift + a
                e.preventDefault();
                // deselect all bricks
                this.elements.forEach(el=>{
                    if(el.type === 'brick'){
                        el.selected = false;
                    }
                });
                
                // notify selection change
                this.notifySelectionChange();
            } else if(e.code === 'Delete'){
                // get selected elements and remove them from scene
                let selectedElements = this.elements.filter(el=>el.selected);
                selectedElements.forEach(el=>{
                    const index = this.elements.indexOf(el);
                    this.elements[index].element.dispose();
                    this.elements.splice(index, 1);
                });

                // notify selection change
                this.notifySelectionChange();
            }

            // set key pressed state in keys map
            this.keys.set(e.code, true);
        };

        document.onkeyup = (e) => {
            this.keys.set(e.code, false);
        }

        // on pointer down
        this.scene.onPointerDown = (evt, pickInfo) => {
            // if an object was hit with right click proceed
            if(pickInfo.hit && evt.button === 2) this.selectBrick(pickInfo.pickedMesh);
            // else if object was hit with left click update movement
            else if(pickInfo.hit && evt.button === 0) { // TODO make seperate function out of this
                if (pickInfo.hit) {
                    // get new selected mesh
                    this.currentMesh = pickInfo.pickedMesh;
                    const brick = this.elements.find(el=>el.element === this.currentMesh);
                    if(!brick) return;
                    const brickData = brick.data;
                    this.currentMesh.offset = brickData.offset;

                    // check if a mesh was picked
                    if (this.currentMesh) { // we need to disconnect camera from canvas
                        setTimeout(()=>{
                            this.camera.detachControl(this.canvas);
                        }, 0);
                    }
                }
            }
        };

        // on pointer up we need to attach camera to canvas again
        this.scene.onPointerUp = (evt) => {
            // check if there is a selected mesh
            if (this.currentMesh) {
                // attach camera to canvas
                this.camera.attachControl(this.canvas, true);
                // reset current mesh
                this.currentMesh = null;

                // play sound
                this.playBrickSound();

                return;
            }
        };

        // on pointer move update the position of the current mesh
        this.scene.onPointerMove = (evt) => {
            // check if mesh is currently picked
            if (!this.currentMesh) {
                this.highlightHoveredMesh();
                return;
            }
            
            // get grid position
            const grid = this.getGridPosition(evt);
            if (!grid) return;

            // calculate new position for picked mesh + offsets and sizes of the specific lego brick
            const pos = new BABYLON.Vector3(Math.round(grid.x / 0.2) * 0.2 + this.currentMesh.offset.x, grid._y + this.currentMesh.offset.y, Math.round(grid.z / 0.2) * 0.2 + this.currentMesh.offset.z);
            
            // update mesh position
            this.currentMesh.position = pos;
        };
    }

    /** generates grid */
    createGrid(){
        // get max and min values of the scene
        var extend = this.scene.getWorldExtends();
        var width = (extend.max.x - extend.min.x) * 10.0;
        var depth = (extend.max.z - extend.min.z) * 10.0;
        
        // create grid
        this.grid = BABYLON.Mesh.CreateGround("grid", 10.0, 10.0, 1, this.scene);
        
        // scale grid
        this.grid.scaling.x = Math.max(width, depth);
        this.grid.scaling.z = this.grid.scaling.x;
        this.grid.isPickable = false;
        
        // set ground material
        var groundMaterial = new BABYLON.GridMaterial("GridMaterial", this.scene);
        // CONSTANTS
        groundMaterial.majorUnitFrequency = 10;
        groundMaterial.minorUnitVisibility = 0.3;
        groundMaterial.gridRatio = 0.02;
        // CONFIGURABLE
        groundMaterial.backFaceCulling = this.config.grid.backFaceCulling;
        groundMaterial.mainColor = new BABYLON.Color3(1, 1, 1);
        groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        groundMaterial.opacity = this.config.grid.opacity;

        groundMaterial.opacityTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/backgroundGround.png", this.scene);

        // position grid correctly
        this.grid.position = new BABYLON.Vector3(0.1, -.235, 0.1);
        this.grid.material = groundMaterial;
    }

    /** toggle grid */
    toggleGrid(){
        // dispose grid if it is currently visible
        this.gridEnabled = !this.gridEnabled;
        this.grid.setEnabled(this.gridEnabled);
    }

    /** add element to editor
     * @param {String} id unique id of the element (if undefined gets generated)
     * @param {String} name name of the element
     * @param {String} type type of the element (mesh, light, camera, etc)
     * @param {Boolean} selected selected status of the element (active, inactive, etc)
     * @param {Object} element the element to add
     */
    addElement(name,type,selected,element){
        // default values
        if(!selected) selected = false;

        this.elements.push({
            id: element.uniqueId,
            name: name,
            type: type,
            selected: selected,
            hovering: false,
            element: element,
        });
    }

    /** add brick to the editor by name
     * @param {String} name name of the brick to add
     */
    addBrickByName(name){
        // get brick data
        const brickData = BrickLib.bricks.find(b=>b.name === name);
        // create brick instance
        const brickMesh = BrickLib.brickMeshes.get(name);
        const brick = brickMesh.clone(name);
        brick.isPickable = true;
        brick.position = new BABYLON.Vector3(0, 0, 0).add(brickData.offset);
        // create lego brick material and set it to the brick
        const brickMaterial = new BABYLON.StandardMaterial("mat", this.scene);
        // calculate brick color (babylon uses 0-1 values for colors)
        const r = this.currentColor.rgba[0] / 255;
        const g = this.currentColor.rgba[1] / 255;
        const b = this.currentColor.rgba[2] / 255;
        // set properties of the bricks material
        brickMaterial.diffuseColor = new BABYLON.Color3(r, g, b);
        brickMaterial.alpha = this.currentColor.rgba[3];

        // TODO add specular and emissive colors also to BrickLib colors
        brickMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        brickMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        brickMaterial.ambientColor = new BABYLON.Color3(0.75, 0.75, 0.75);
        brick.material = brickMaterial;

        // check if brick exists
        if(!brick) return;

        // set brick offset
        brick.offset = brickData.offset || new BABYLON.Vector3(0,0,0);

        // push to editors elements
        this.elements.push({
            id:brick.uniqueId,
            name,
            element: brick,
            data: brickData,
            type: 'brick',
            selected: false,
            hovering: false,
            color: this.currentColor
        });
    }

    /** select brick in the editor
     * @param {BABYLON.Mesh} pickedMesh the mesh that was picked
     */
    selectBrick(pickedMesh){
        // get new active element
        this.elements.forEach((object)=>{
            // check if the picked mesh is the same as the current elements mesh
            if(object.element === pickedMesh && object.type === "brick"){
                // check if the brick is already selected
                const isSelected = object.selected;
                // only deselect other bricks if ctrl is not pressed
                if(this.keys.get('ControlLeft') === false){
                    this.elements.forEach(el => el.selected = false);
                }
                // negate selection state
                object.selected = !isSelected;

                // notify inspector that selection changed
                this.notifySelectionChange();
            }
            else if(this.keys.get('ControlLeft') === false) object.selected = false;
        });
    }

    /** higlight hovered bricks */
    highlightHoveredMesh(){
        let hoveringMesh = undefined;
        // check if there is currently a brick hovered
        const brickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => { return mesh != this.grid && mesh != this.currentMesh && mesh.isPickable === true });
        // check if brick was hit with ray
        if(brickInfo.hit){
            hoveringMesh = brickInfo.pickedMesh;
        }

        // hide all other bounding boxes
        this.elements.forEach(el=>{
            // set hovering to true on hovered mesh and check if hovered mesh is a brick
            if(el.element === hoveringMesh && el.type === 'brick'){
                el.hovering = true;
            } else {
                el.hovering = false;
            }
        });
    }

    /** Get Position of Grid for moving elements
     * @returns {Object} hit point
     */
    getGridPosition(){
        // Use a predicate to get position on the ground
        var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => { return mesh == this.grid; });
        var brickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => { return mesh != this.grid && mesh != this.currentMesh && mesh.isPickable === true });
        // check if brick is dragged onto another brick
        if (brickInfo.hit) {
            // get brick info
            const brick = BrickLib.bricks.find(b=>b.name === brickInfo.pickedMesh.name);
            // set brick y position based on the height of the brick it is placed on
            return new BABYLON.Vector3(brickInfo.pickedPoint.x, brickInfo.pickedMesh._position._y + brick.height, brickInfo.pickedPoint.z);
        } else if(pickInfo.hit){
            pickInfo.pickedPoint.y -= this.grid.position._y; // add grid offset to make brick position correct
            return pickInfo.pickedPoint;
        }

        return null;
    }

    /** notify inspector that selection changed in order to update ui */
    notifySelectionChange(){
        // dispatch event with selected bricks as parameter
        document.dispatchEvent(new CustomEvent('selection-changed', { detail: {selectedBricks: this.elements.filter(el => el.type === 'brick' && el.selected === true)} }));
    }

    /** randomly play one of the 3 build sounds */
    playBrickSound(){
        const rnd = Math.random();
        if(rnd < 0.33) this.buildSound.play();
        else if(rnd < 0.66) this.buildSound2.play();
        else this.buildSound3.play();
    }

    /** generate a unique id
     * @returns {String} unique id
     */
    getUniqueId(){
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    ConvertAbstractMeshToFlatShaded = (mesh)=>{
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        const indices = mesh.getIndices();
    
        const flatMesh = new BABYLON.Mesh(mesh.name+"_flat", mesh.getScene());
        flatMesh.position = mesh.position;
        flatMesh.rotation = mesh.rotation;
        flatMesh.scaling = mesh.scaling;
        mesh.dispose();
    
        const data = new BABYLON.VertexData();
        data.positions = positions;
        data.normals = normals;
        data.indices = indices.reverse();
        data.applyToMesh(flatMesh);
    
        flatMesh.convertToFlatShadedMesh();
        return flatMesh;
    }
}