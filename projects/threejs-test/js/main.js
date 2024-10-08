import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { FBXLoader } from './FBXLoader.js';

const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

const materials = {
    "Cube": new THREE.MeshPhongMaterial({ color: 0x202020 }),
    "Cube001": new THREE.MeshPhongMaterial({ color: 0xdddddd }),
    "Cube002": new THREE.MeshPhongMaterial({ color: 0x0000ff, emissive: 0x0000ff }),
    "Cube003": new THREE.MeshPhongMaterial({ color: 0x0000dd, emissive: 0x0000dd }),
    "Cube004": new THREE.MeshPhongMaterial({ color: 0x0000bb, emissive: 0x0000bb }),
    "Cube005": new THREE.MeshPhongMaterial({ color: 0x000090, emissive: 0x000090 }),
    "Cube006": new THREE.MeshPhongMaterial({ color: 0x000070, emissive: 0x000070 }),
    "Cube007": new THREE.MeshPhongMaterial({ color: 0x000050, emissive: 0x000050 }),
    "Cube008": new THREE.MeshPhongMaterial({ color: 0x00aa00, emissive: 0x00aa00 }),
    "Cube009": new THREE.MeshPhongMaterial({ color: 0x009000, emissive: 0x009000 }),
    "Cube010": new THREE.MeshPhongMaterial({ color: 0x005000, emissive: 0x005000 }),
    "Cube011": new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00 }),
    "Cube012": new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }),
    "Cube013": new THREE.MeshPhongMaterial({ color: 0x202020 }),
    "Cube014": new THREE.MeshPhongMaterial({ color: 0xdddddd }),
    "Cube015": new THREE.MeshPhongMaterial({ color: 0x202020 }),
    "Cube016": new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }),
    "Cube017": new THREE.MeshPhongMaterial({ color: 0xdddddd }),
    "Icosphere": new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }),
    "Sphere": new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000 }),
    "Sphere001": new THREE.MeshPhongMaterial({ color: 0xaa0000, emissive: 0xaa0000 }),
    "Sphere002": new THREE.MeshPhongMaterial({ color: 0x900000, emissive: 0x900000 }),
};

const targetPositions = [
    { x: -11550, y: 30, z: 0 },
    { x: -6150, y: 30, z: 0},
    { x: 0, y: 30, z: 0 },
];

const targetCameraPositions = [
    {x: -11550, y: 115, z: 514},
    {x: -6130, y: 115, z: 514},
    {x: 20, y: 115, z: 334},
];

var targetIndex = 2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);
camera.position.set(20, 115, 334);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = 'three-canvas';
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: ''
};

const loader = new FBXLoader();
var mainObj = null;
// load model
loader.load('./models/model.fbx', (object) => {
    scene.add(object);
    mainObj = object;
    // assign each child a material of the material list (if there is one)
    for(const child of mainObj.children) {
        if(child.isMesh) {
            if(materials[child.name]) child.material = materials[child.name];
        }
    }
    // update control target
    controls.target = new THREE.Vector3(mainObj.position.x, mainObj.position.y, mainObj.position.z);
    controls.update();
});

// add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// render loop
function animate() {
    controls.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

nextBtn.onclick = () => {
    targetIndex++;
    if(targetIndex >= targetPositions.length) targetIndex = 0;

    // animate camera and target values
    gsap.to(controls.target, {
        x: targetPositions[targetIndex].x,
        y: targetPositions[targetIndex].y,
        z: targetPositions[targetIndex].z,
        duration: 2,
        ease: "expoScale(0.5,7,none)",
    });

    gsap.to(camera.position, {
        x: targetCameraPositions[targetIndex].x,
        y: targetCameraPositions[targetIndex].y,
        z: targetCameraPositions[targetIndex].z,
        duration: 2,
        ease: "expoScale(0.5,7,none)",
    });
}

prevBtn.onclick = () => {
    targetIndex--;
    if(targetIndex < 0) targetIndex = targetPositions.length - 1;

     // animate camera and target values
    gsap.to(controls.target, {
        x: targetPositions[targetIndex].x,
        y: targetPositions[targetIndex].y,
        z: targetPositions[targetIndex].z,
        duration: 2,
        ease: "expoScale(0.5,7,none)",
    });

    gsap.to(camera.position, {
        x: targetCameraPositions[targetIndex].x,
        y: targetCameraPositions[targetIndex].y,
        z: targetCameraPositions[targetIndex].z,
        duration: 2,
        ease: "expoScale(0.5,7,none)",
    });
}