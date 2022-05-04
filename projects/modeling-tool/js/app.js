const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true,{stencil: true}); // Generate the BABYLON 3D engine
const ModelTool = new Modeler(canvas,engine);

function addModel(file){
    var filename = file.name;
    var directory = filename.split('.')[0];
    BABYLON.SceneLoader.Append(directory+"/", filename, ModelTool.scene, function (scene) {
        // do something with the scene
    });
}