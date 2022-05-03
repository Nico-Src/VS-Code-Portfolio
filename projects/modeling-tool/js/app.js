const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var camera = undefined;
var grid = undefined;
var sceneObjects = [];
var highlight = undefined;
var scene = createScene(); //Call the createScene function

toggleGrid();
Inspector.initInspector(sceneObjects);

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();

    sceneObjects.forEach((object)=>{
        if(object.status === 'active'){
            highlight.addMesh(object.element,new BABYLON.Color3(0.54,0.78,0.35));
        } else {
            highlight.removeMesh(object.element);
        }
    });
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

function createScene(){
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    var box = BABYLON.Mesh.CreateBox("box", 1,scene);
    box.position.y = 0;

    sceneObjects.push({
        id: getUniqueId(),
        name: 'Cube01',
        type: 'cube',
        status: 'active',
        element: box
    });

    var box2 = BABYLON.Mesh.CreateBox("box", 1,scene);
    box.position.x = 5;

    sceneObjects.push({
        id: getUniqueId(),
        name: 'Cube02',
        type: 'cube',
        status: 'inactive',
        element: box2
    });

    camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.wheelPrecision = 50;
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    sceneObjects.push({
        id: getUniqueId(),
        name: 'HemisphericLight01',
        type: 'light',
        status: 'inactive',
        element: light
    });
    
    highlight = new BABYLON.HighlightLayer("hl1", scene);
    highlight.blurHorizontalSize = 0.5;
    highlight.blurVerticalSize = 0.5;

    scene.onPointerDown = function(evt, pickInfo) {
        if(pickInfo.hit && evt.button === 2) {
            let activeEl,activeInspectorElement;
            sceneObjects.forEach((object)=>{
                if(object.element === pickInfo.pickedMesh){
                    object.status = 'active';
                    activeEl = $(`.inspector-item#${object.id}`).get(0);
                    activeInspectorElement = object.element;
                } else {
                    object.status = 'inactive';
                }
            });
            console.log(activeEl);
            $(".inspector-item").removeClass('active');
            $(".inspector-item").addClass('inactive');
            $(activeEl).removeClass("inactive");
            $(activeEl).addClass("active");

            $("#x-input").val(activeInspectorElement.position.x);
            $("#y-input").val(activeInspectorElement.position.y);
            $("#z-input").val(activeInspectorElement.position.z);
        }
    }
    
    return scene;
};

function getUniqueId(){
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function toggleGrid(){
    if (!grid) {
        var extend = scene.getWorldExtends();
        var width = (extend.max.x - extend.min.x) * 10.0;
        var depth = (extend.max.z - extend.min.z) * 10.0;

        grid = BABYLON.Mesh.CreateGround("grid", 10.0, 10.0, 1, scene);
        if (!grid.reservedDataStore) {
            grid.reservedDataStore = {};
        }
        grid.scaling.x = Math.max(width, depth);
        grid.scaling.z = grid.scaling.x;
        grid.reservedDataStore.isInspectorGrid = true;
        grid.isPickable = false;

        var groundMaterial = new BABYLON.GridMaterial("GridMaterial", scene);
        groundMaterial.majorUnitFrequency = 10;
        groundMaterial.minorUnitVisibility = 0.3;
        groundMaterial.gridRatio = 0.01;
        groundMaterial.backFaceCulling = true;
        groundMaterial.mainColor = new BABYLON.Color3(1, 1, 1);
        groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        groundMaterial.opacity = 0.8;
        groundMaterial.zOffset = 1.0;
        groundMaterial.opacityTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/backgroundGround.png", scene);
        grid.position.y = -0.5;
        grid.material = groundMaterial;

        return;
    }

    grid.dispose(true, true);
    grid = null;
}