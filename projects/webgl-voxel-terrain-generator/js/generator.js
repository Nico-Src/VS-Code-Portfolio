class Generator {
  constructor(config,scene,renderer,camera,controls,stats,biome) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.controls = controls;
    this.stats = stats;
    this.biome = biome;
    this.options = {
        cubeSize: config?.cubeSize || 0.1,
        chunkSize: config?.chunkSize || {x: 64, y: 64, z: 64},
        noiseSmoothness: this.biome.smoothness || config?.noiseSmoothness || 1,
        minHeight: config?.minHeight || 6,
        fallSpeed: config?.fallSpeed || 0.1,
        noiseOffsetX: config?.noiseOffsetX || 0,
        noiseOffsetZ: config?.noiseOffsetZ || 0,
    };

    this.controls.target.set(this.options.chunkSize.x*this.options.cubeSize/2,this.options.chunkSize.y*this.options.cubeSize/4,this.options.chunkSize.z*this.options.cubeSize/2);

    this.numOfCubes = this.options.chunkSize.x * this.options.chunkSize.y * this.options.chunkSize.z;
    this.heightmap = [];

    this.generateHeightmap();
    this.cubeMap = [];
    this.blockMap = [];
    this.blockIDMap = [];
    this.blockTransition = -10;
    this.blockTransitionOffsets = [];

    document.querySelector('#noiseSmoothnessInput').value = this.options.noiseSmoothness;

    this.initCubeMap(true);
    this.initBlockMap();
    this.renderLoop();
    this.render();
  }

  changeConfig(key,value,subKey){
    if(subKey !== undefined){
        if(typeof subKey === 'object'){
            for(const sub in subKey){
                console.log(`Setting: ${key}.${subKey[sub]} to ${value}`);
                this.options[key][subKey[sub]] = parseFloat(value);
            }
        } else {
            this.options[key][subKey] = parseFloat(value);
        }
    } else {
        this.options[key] = value;
    }

    if(key === 'noiseOffsetX' || key === 'noiseOffsetZ'){
        this.reinit(this.biome,false,false);
    }
    else this.reinit(this.biome,key !== 'noiseSmoothness',true);
  }

  reinit(biome,overrideSmoothness,transition){
    // remove old instances fast
    for(const block in this.blockMap){
        this.scene.remove(this.blockMap[block]);
    }
    this.biome = biome;
    if(overrideSmoothness === true) this.options.noiseSmoothness = this.biome.smoothness;
    document.querySelector('#noiseSmoothnessInput').value = this.options.noiseSmoothness;
    this.generateHeightmap();
    this.cubeMap = [];
    this.blockMap = [];
    this.blockIDMap = [];
    if(transition){
        this.blockTransition = -10;
        this.blockTransitionOffsets = [];
    } else {
        this.blockTransition = 0;
        this.blockTransitionOffsets = [];
    }
    this.initCubeMap(transition);
    this.initBlockMap();
    this.render();
  }

  initBlockMap(){
    this.blockMap['grass'] = this.generateInstance('moss_block.png', this.cubeMap['grass']);
    this.blockMap['stone'] = this.generateInstance('stone.png', this.cubeMap['stone']);
    this.blockMap['coal_ore'] = this.generateInstance('coal_ore.png', this.cubeMap['coal_ore']);
    this.blockMap['iron_ore'] = this.generateInstance('iron_ore.png', this.cubeMap['iron_ore']);
    this.blockMap['gold_ore'] = this.generateInstance('gold_ore.png', this.cubeMap['gold_ore']);
    this.blockMap['diamond_ore'] = this.generateInstance('diamond_ore.png', this.cubeMap['diamond_ore']);
    this.blockMap['sand'] = this.generateInstance('sand.png', this.cubeMap['sand']);
    this.blockMap['sandstone'] = this.generateInstance('sandstone.png', this.cubeMap['sandstone']);
    this.blockMap['blackstone'] = this.generateInstance('blackstone.png', this.cubeMap['blackstone']);
  }

  initCubeMap(transition){
    let sum = 0;
    const defaultTreasureBlock = this.biome.minerals.sort((a,b) => b.chance - a.chance)[0];
    for(let x = 0; x < this.options.chunkSize.x; x++){
        for(let y = 0; y < this.options.chunkSize.y; y++){
            for(let z = 0; z < this.options.chunkSize.z; z++){
                if(y > this.heightmap[x][z]) continue;
                // check if there are blocks around the current block
                const blocksAround = {
                    top: y < this.options.chunkSize.y-1 ? this.heightmap[x][z] >= y+1 : false,
                    bottom: y > 0 ? this.heightmap[x][z] >= y-1 : false,
                    left: x > 0 ? this.heightmap[x-1][z] >= y : false,
                    right: x < this.options.chunkSize.x-1 ? this.heightmap[x+1][z] >= y : false,
                    front: z > 0 ? this.heightmap[x][z-1] >= y : false,
                    back: z < this.options.chunkSize.z-1 ? this.heightmap[x][z+1] >= y : false,
                }
                
                if(blocksAround.top && blocksAround.bottom && blocksAround.left && blocksAround.right && blocksAround.front && blocksAround.back) continue;

                for(const range of this.biome.ranges){
                    if(y >= Math.floor(range.height * this.heightmap[x][z])){
                        if(range.minerals === true){
                            const chance = Math.random();
                            let blockPlaced = false;
                            for(const mineral of this.biome.minerals.sort((a,b) => a.chance - b.chance).filter(mineral => mineral.chance < 1)){
                                if(chance < mineral.chance){
                                    if(this.cubeMap[mineral.name] == undefined) this.cubeMap[mineral.name] = 0;
                                    this.cubeMap[mineral.name]++;
                                    this.blockIDMap[`${x},${y},${z}`] = mineral.id;
                                    blockPlaced = true;
                                    break;
                                }
                            }

                            if(!blockPlaced){
                                if(this.cubeMap[defaultTreasureBlock.name] == undefined) this.cubeMap[defaultTreasureBlock.name] = 0;
                                this.cubeMap[defaultTreasureBlock.name]++;
                                this.blockIDMap[`${x},${y},${z}`] = defaultTreasureBlock.name;
                            }
                        } else {
                            this.cubeMap[range.block] = this.cubeMap[range.block] || 0;
                            this.cubeMap[range.block]++;
                            this.blockIDMap[`${x},${y},${z}`] = range.block;
                            break;
                        }
                    }
                }

                if(transition){
                    this.blockTransitionOffsets[`${x},${y},${z}`] = -sum / 1000;
                } else {
                    this.blockTransitionOffsets[`${x},${y},${z}`] = 0;
                }

                sum++;
            }
        }
    }
    document.querySelector('#rendered-blocks').innerHTML = sum;
  }
  
  generateHeightmap(){
    const offsetX = this.options.noiseOffsetX*this.options.cubeSize/this.options.noiseSmoothness;
    const offsetZ = this.options.noiseOffsetZ*this.options.cubeSize/this.options.noiseSmoothness;
    const noiseSmooth = this.options.cubeSize/this.options.noiseSmoothness;
    for(let x = 0; x < this.options.chunkSize.x; x++){
        this.heightmap[x] = [];
        for(let z = 0; z < this.options.chunkSize.z; z++){
            const perlinValue = noise.perlin2((x*noiseSmooth)+(offsetX),(z*noiseSmooth)+(offsetZ));
            this.heightmap[x][z] = Math.abs(perlinValue) * this.options.chunkSize.y;
            if(this.heightmap[x][z] <= this.options.minHeight) this.heightmap[x][z] = this.options.minHeight;
        }
    }
    console.log(this.heightmap);
  }

  generateInstance(texturePath, num){
    if((num == undefined || num == 0) && texturePath !== 'blackstone.png') return;
    // generate cube out of 100000 instanced cubes
    const geometry = new THREE.BoxGeometry(this.options.cubeSize,this.options.cubeSize,this.options.cubeSize);
    // textured cube
    const tex = new THREE.TextureLoader().load(`assets/textures/${texturePath}`);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    const mat = new THREE.MeshBasicMaterial({map:tex});
    mat.opacity = .5;
    const mesh = new THREE.InstancedMesh(geometry, mat, (texturePath === 'blackstone.png') ? 5000 : num);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(mesh);
    return mesh;
  }

  renderLoop(){
    requestAnimationFrame(this.renderLoop.bind(this));
    this.stats.begin();
    this.render();
    this.controls.update();
	this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }

  render(){
    if(this.reinitiated === false) return;
    let blockIndizes = [];
    for(const block in this.blockMap){
        blockIndizes[block] = 0;
    }

    for(let x = 0; x < this.options.chunkSize.x; x++){
        for(let y = 0; y < this.options.chunkSize.y; y++){
            for(let z = 0; z < this.options.chunkSize.z; z++){
                if(y > this.heightmap[x][z] || this.blockIDMap[`${x},${y},${z}`] === undefined) continue;
                let matrix = new THREE.Matrix4();
                // get deltatime
                matrix.setPosition(x*this.options.cubeSize,(y*this.options.cubeSize)+this.blockTransition+this.blockTransitionOffsets[`${x},${y},${z}`],z*this.options.cubeSize);
                this.blockTransitionOffsets[`${x},${y},${z}`]+=.4;
                if(this.blockTransitionOffsets[`${x},${y},${z}`] >= 0) this.blockTransitionOffsets[`${x},${y},${z}`] = 0;
                let block = this.blockIDMap[`${x},${y},${z}`];
                this.blockMap[block].setMatrixAt(blockIndizes[block], matrix);
                blockIndizes[block]++;
            }
        }
    }
    // instance matrix needs update 
    for(const block in this.blockMap){
        if(this.blockMap[block]) this.blockMap[block].instanceMatrix.needsUpdate = true;
    }
    this.blockTransition += 0.75;
    if(this.blockTransition >= 0) this.blockTransition = 0;
    if(this.biomeChanged === true){
        this.reinitiated = false;
    }
    this.biomeChanged = false;
  }
}

class Biome{
    constructor(name,ranges,minerals,smoothness){
        this.name = name;
        this.ranges = ranges;
        this.minerals = minerals;
        this.smoothness = smoothness;
    }
}