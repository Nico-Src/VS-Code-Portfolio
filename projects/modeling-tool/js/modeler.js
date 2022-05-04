class Modeler{
    constructor(canvas,engine){
        this.canvas = canvas;
        this.engine = engine;
        this.config = {
            selection: {
                show: true,
                lineWidth: 4.0,
                lineColor: new BABYLON.Color4(0.46, 0.85, .37,1)
            }
        };
        this.sceneObjects = [];

        this.init();
    }

    // initialize engine and scene
    init(){
        this.scene = this.createScene();
        // create hightlight layer for selected elements
        this.highlightLayer = new BABYLON.HighlightLayer("hl1", this.scene);
        // configure layer
        this.highlightLayer.blurHorizontalSize = 0.5;
        this.highlightLayer.blurVerticalSize = 0.5;
        this.setupControls();

        // init inspector
        Inspector.initInspector(this.sceneObjects);
        // enable grid
        this.toggleGrid();

        // start render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active' && this.config.selection.show === true){
                    object.element.enableEdgesRendering();	
                    object.element.edgesWidth = this.config.selection.lineWidth;
                    object.element.edgesColor = this.config.selection.lineColor;
                } else {
                    try{
                        object.element.disableEdgesRendering();
                    } catch {
                        // ignore
                    }
                }
            });
        });

        // resize engine when window is resized
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    // create starting scene
    createScene(){
        // create scene and set clear color to a light gray
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // create default cube
        var box = BABYLON.Mesh.CreateBox("box", 1,scene);
        this.addElement(this.getUniqueId(),'Cube01','cube','active',box);

        var box2 = BABYLON.Mesh.CreateBox("box", 1,scene);
        box.position.x = 5;
        this.addElement(this.getUniqueId(),'Cube02','cube','inactive',box2);

        // create camera
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
        this.camera.wheelPrecision = 10;
        this.camera.attachControl(this.canvas, true);

        // create default light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
        this.addElement(this.getUniqueId(),'HemisphericLight01','light','inactive',light);
        
        return scene;
    }

    // add element to scnee element collection
    addElement(id,name,type,status,element){
        this.sceneObjects.push({
            id: id,
            name: name,
            type: type,
            status: status,
            element: element,
            axes: undefined
        });
    }

    setupControls(){
        this.scene.onPointerDown = (evt, pickInfo) => {
            // if an object was hit with right click proceed
            if(pickInfo.hit && evt.button === 2) {
                let activeEl,activeInspectorElement;

                // get new active element
                this.sceneObjects.forEach((object)=>{
                    if(object.element === pickInfo.pickedMesh && object.type !== "light"){
                        if(object.status === 'active'){
                            object.status = 'inactive';
                            $(".inspector-item").removeClass('active');
                            $(".inspector-item").addClass('inactive');
                            return;
                        } else {
                            object.status = 'active';
                            activeEl = $(`.inspector-item#${object.id}`).get(0);
                            activeInspectorElement = object.element;
                        }
                    } else {
                        object.status = 'inactive';
                    }
                });

                if(!activeEl || !activeInspectorElement) return;

                // show new active inspector item
                $(".inspector-item").removeClass('active');
                $(".inspector-item").addClass('inactive');
                $(activeEl).removeClass("inactive");
                $(activeEl).addClass("active");

                // set position values in inspector
                $("#x-input").val(activeInspectorElement.position.x);
                $("#y-input").val(activeInspectorElement.position.y);
                $("#z-input").val(activeInspectorElement.position.z);

                $("#x-scale-input").val(activeInspectorElement.scaling.x);
                $("#y-scale-input").val(activeInspectorElement.scaling.y);
                $("#z-scale-input").val(activeInspectorElement.scaling.z);

                $("#x-rotate-input").val(activeInspectorElement.rotation.x);
                $("#y-rotate-input").val(activeInspectorElement.rotation.y);
                $("#z-rotate-input").val(activeInspectorElement.rotation.z);
            }
        }

        const xInput = $("#x-input").get(0);
        const yInput = $("#y-input").get(0);
        const zInput = $("#z-input").get(0);
        const xScaleInput = $("#x-scale-input").get(0);
        const yScaleInput = $("#y-scale-input").get(0);
        const zScaleInput = $("#z-scale-input").get(0);
        const xRotateInput = $("#x-rotate-input").get(0);
        const yRotateInput = $("#y-rotate-input").get(0);
        const zRotateInput = $("#z-rotate-input").get(0);

        const selectionLineWidthInput = $("#selection-line-width-input").get(0);

        xInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    console.log(xInput.value);
                    object.element.position.x = xInput.value;
                    return;
                }
            });
        };

        yInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.position.y = yInput.value;
                    return;
                }
            });
        };

        zInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.position.z = zInput.value;
                    return;
                }
            });
        };

        xScaleInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.scaling.x = xScaleInput.value;
                    return;
                }
            });
        };

        yScaleInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.scaling.y = yScaleInput.value;
                    return;
                }
            });
        };

        zScaleInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.scaling.z = zScaleInput.value;
                    return;
                }
            });
        };

        xRotateInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.rotation.x = BABYLON.Tools.ToRadians(xRotateInput.value);
                    return;
                }
            });
        };

        yRotateInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.rotation.y = BABYLON.Tools.ToRadians(yRotateInput.value);
                    return;
                }
            });
        };

        zRotateInput.onchange = () => {
            this.sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.rotation.z = BABYLON.Tools.ToRadians(zRotateInput.value);
                    return;
                }
            });
        };

        selectionLineWidthInput.onchange = () => {
            this.config.selection.lineWidth = parseFloat(selectionLineWidthInput.value);
        };
    }

    toggleGrid(){
        if (!this.grid) {
            var extend = this.scene.getWorldExtends();
            var width = (extend.max.x - extend.min.x) * 10.0;
            var depth = (extend.max.z - extend.min.z) * 10.0;
    
            this.grid = BABYLON.Mesh.CreateGround("grid", 10.0, 10.0, 1, this.scene);
            if (!this.grid.reservedDataStore) {
                this.grid.reservedDataStore = {};
            }
            this.grid.scaling.x = Math.max(width, depth);
            this.grid.scaling.z = this.grid.scaling.x;
            this.grid.reservedDataStore.isInspectorGrid = true;
            this.grid.isPickable = false;
    
            var groundMaterial = new BABYLON.GridMaterial("GridMaterial", this.scene);
            groundMaterial.majorUnitFrequency = 10;
            groundMaterial.minorUnitVisibility = 0.3;
            groundMaterial.gridRatio = 0.01;
            groundMaterial.backFaceCulling = true;
            groundMaterial.mainColor = new BABYLON.Color3(1, 1, 1);
            groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            groundMaterial.opacity = 0.8;
            groundMaterial.zOffset = 1.0;
            groundMaterial.opacityTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/backgroundGround.png", this.scene);
            this.grid.position.y = -0.5;
            this.grid.material = groundMaterial;
    
            return;
        }
    
        this.grid.dispose(true, true);
        this.grid = null;
    }

    // get a unique id
    getUniqueId(){
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}