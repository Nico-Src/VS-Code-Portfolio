const canvas = document.getElementById("renderCanvas"); // Get the canvas element
alert(canvas);
// const engine = new BABYLON.Engine(canvas, true,{stencil: true}); // Generate the BABYLON 3D engine
const ModelTool = new Modeler(canvas,engine);