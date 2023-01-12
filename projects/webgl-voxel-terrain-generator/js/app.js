const scene = new THREE.Scene();
// 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
// create the renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
// add stats
const stats = new Stats();
document.body.appendChild(stats.dom);

window.addEventListener('resize',()=>{
    renderer.domElement.width = window.innerWidth;
    renderer.domElement.height = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const biomes = {};

biomes.plains = new Biome('plains',[
    {block: 'grass', height: 0.95, minerals: false},
    {block: 'stone', height: 0.00, minerals: true},
], [
    {chance: 0.01, name: 'coal_ore', id: 'coal_ore'},
    {chance: 0.005, name: 'iron_ore', id: 'iron_ore'},
    {chance: 0.001, name: 'gold_ore', id: 'gold_ore'},
    {chance: 0.0001, name: 'diamond_ore', id: 'diamond_ore'},
    {chance: 1, name: 'stone', id: 'stone'},
], 5);

biomes.desert = new Biome('desert',[
    {block: 'sand', height: 0.95, minerals: false},
    {block: 'sandstone', height: 0.00, minerals: true},
], [
    {chance: 0.01, name: 'coal_ore', id: 'coal_ore'},
    {chance: 0.005, name: 'iron_ore', id: 'iron_ore'},
    {chance: 0.001, name: 'gold_ore', id: 'gold_ore'},
    {chance: 0.0001, name: 'diamond_ore', id: 'diamond_ore'},
    {chance: 1, name: 'sandstone', id: 'sandstone'},
], 1);

biomes.mines = new Biome('mines',[
    {block: 'coal_ore', height: 0.95, minerals: false},
    {block: 'iron_ore', height: 0.00, minerals: false},
], [], 1);

biomes.goldmines = new Biome('goldmines',[
    {block: 'dawu', height: 0.95, minerals: false},
    {block: 'feih', height: 0.00, minerals: true},
], [
    {chance: 0.02, name: 'c#', id: 'c#'},
    {chance: 0.2, name: 'f#', id: 'f#'},
    {chance: 1, name: 'feih', id: 'feih'},
], 1);

biomes.water = new Biome('water',[
    {block: 'water', height: 0.95, minerals: false},
    {block: 'water', height: 0.00, minerals: false},
], [
    {chance: 0.02, name: 'c#', id: 'c#'},
    {chance: 0.2, name: 'f#', id: 'f#'},
    {chance: 1, name: 'feih', id: 'feih'},
], 12);

const generator = new Generator({},scene,renderer,camera,controls,stats,biomes.plains);

document.querySelector('#biomeSelect').addEventListener('change',(e)=>{
    console.log(e.target.value);
    generator.reinit(biomes[e.target.value],true,true);
});

document.querySelector('#noiseSmoothnessInput').addEventListener('change',(e)=>{
    generator.changeConfig('noiseSmoothness',e.target.value);
});

document.querySelector('#chunkWidthInput').addEventListener('change',(e)=>{
    generator.changeConfig('chunkSize',e.target.value,['x','z']);
});

document.querySelector('#chunkHeightInput').addEventListener('change',(e)=>{
    generator.changeConfig('chunkSize',e.target.value,'y');
});

document.querySelector('#noiseOffsetX').addEventListener('input',(e)=>{
    generator.changeConfig('noiseOffsetX',e.target.value);
});

document.querySelector('#noiseOffsetZ').addEventListener('input',(e)=>{
    generator.changeConfig('noiseOffsetZ',e.target.value);
});

/* function getMouseWorldCoords(e){
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse

    vec.set(
        ( e.clientX / window.innerWidth ) * 2 - 1,
        - ( e.clientY / window.innerHeight ) * 2 + 1,
        0.5 );

    vec.unproject( camera );

    vec.sub( camera.position ).normalize();

    var distance = - camera.position.z / vec.z;

    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
    return pos;
}*/