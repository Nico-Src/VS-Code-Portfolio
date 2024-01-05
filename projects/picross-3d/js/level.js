class LayerHandle{
    constructor(scene, color, pos, rot, fixedAxes){
        this.color = color;
        this.scene = scene;
        this.handle = undefined;
        this.pos = pos;
        this.originPos = JSON.parse(JSON.stringify(pos));
        // calculate fixed position based on the axes that should be fixed
        this.fixedAxes = fixedAxes;
        this.fixedPos = {};
        for(const key of this.fixedAxes) this.fixedPos[key] = this.pos[key];
        this.rot = rot || {x: 0, y: 0, z: 0};

        this.init();
    }

    init(){
        const geometry = new THREE.OctahedronGeometry(.25, 0);
        this.handle = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: this.color}));
        this.handle.color = this.color;
        this.setScale(1,1.5,1);
        this.setPosition(this.pos.x, this.pos.y, this.pos.z);
        this.setRotation(this.rot.x, this.rot.y, this.rot.z);
        this.scene.add(this.handle);

        this.handle.disableRaycast = true;

        this.handle.material.opacity = 0;
        this.handle.material.transparent = true;
    }

    setPosition(x,y,z){
        this.handle.position.x = x;
        this.handle.position.y = y;
        this.handle.position.z = z;
    }

    setScale(x,y,z){
        this.handle.scale.x = x;
        this.handle.scale.y = y;
        this.handle.scale.z = z;
    }

    setRotation(x,y,z){
        const xRad = Util.toRadians(x);
        const yRad = Util.toRadians(y);
        const zRad = Util.toRadians(z);

        this.handle.rotation.x = xRad;
        this.handle.rotation.y = yRad;
        this.handle.rotation.z = zRad;
    }
}

class Level{
    constructor(size){
        this.size = {x: size[0], y: size[1], z: size[2]};
        // init block and hint map
        this.blockMap = Util.init3DArray(this.size.x, this.size.y, this.size.z);
        this.blocks = Util.init3DArray(this.size.x, this.size.y, this.size.z);
        this.hintMap = Util.init3DArray(this.size.x, this.size.y, this.size.z);

        this.layerHandles = [];
    }

    // load level from file
    static loadFromFile(path){
        return new Promise((resolve,reject)=>{
            fetch(path).then((res) => res.text())
            .then((text) => {
                // read line by line
                let lines = text.split('\n');
                // first line is the size of the level (x y z)
                const size = lines[0].split(' ').map((val)=>parseInt(val));
                const level = new Level(size);
                
                // go through each line and set the block states
                let index = 1;
                let layer = 0;
                while(index < lines.length){
                    for(let c = 0; c < lines[index].length - 1; c++){
                        // layer, z, x
                        level.blockMap[layer][(index-1) % level.size.z][c] = parseInt(lines[index][c]);
                    }
                    index++;
                    // theres no space between lines so after each "n"-lines increase layer
                    if((index-1) % level.size.y === 0) layer++;
                }

                // calculate hints for the given blocks
                for(let x = 0; x < level.size.x; x++){
                    for(let y = 0; y < level.size.y; y++){
                        for(let z = 0; z < level.size.z; z++){
                            let vertical = 0;
                            let verticalGroups = 0; // counter for the number of groups (for the hint)
                            let inGroup = false;  // flag to track if we are currently in a group of 1s

                            for (let y1 = 0; y1 < level.size.y; y1++) {
                                if (level.blockMap[y1][z][x] === BLOCK_STATE.NON_DESTROYABLE) {
                                    vertical++;
                                    // found a block with value 1
                                    if (!inGroup) {
                                        // if not already in a group, start a new group
                                        inGroup = true;
                                        verticalGroups++;
                                    }
                                } else {
                                    // found a block with value other than 1, mark the end of the current group
                                    inGroup = false
                                }
                            }

                            inGroup = false;
                            let horizontalRightLeft = 0;
                            let horizontalRightLeftGroups = 0;
                            for(let x1 = 0; x1 < level.size.x; x1++){
                                if(level.blockMap[y][z][x1] === BLOCK_STATE.NON_DESTROYABLE){
                                    horizontalRightLeft++;
                                    // found a block with value 1
                                    if (!inGroup) {
                                        // if not already in a group, start a new group
                                        inGroup = true;
                                        horizontalRightLeftGroups++;
                                    }
                                } else {
                                    // found a block with value other than 1, mark the end of the current group
                                    inGroup = false
                                }
                            }

                            inGroup = false;
                            let horizontalBackFront = 0;
                            let horizontalBackFrontGroups = 0;
                            for(let z1 = 0; z1 < level.size.z; z1++){
                                if(level.blockMap[y][z1][x] === BLOCK_STATE.NON_DESTROYABLE){
                                    horizontalBackFront++;
                                    // found a block with value 1
                                    if (!inGroup) {
                                        // if not already in a group, start a new group
                                        inGroup = true;
                                        horizontalBackFrontGroups++;
                                    }
                                } else {
                                    // found a block with value other than 1, mark the end of the current group
                                    inGroup = false
                                }
                            }

                            // set hints
                            level.hintMap[y][z][x] = {
                                vertical, 
                                verticalType: verticalGroups <= 1 ? 'single' : verticalGroups === 2 ? 'two' : 'three',
                                horizontalBackFront, 
                                horizontalBackFrontType: horizontalBackFrontGroups <= 1 ? 'single' : horizontalBackFrontGroups === 2 ? 'two' : 'three',
                                horizontalRightLeft,
                                horizontalRightLeftType: horizontalRightLeftGroups <= 1 ? 'single' : horizontalRightLeftGroups === 2 ? 'two' : 'three',
                            };
                        }
                    }
                }
                resolve(level);
            }).catch((e) => console.error(e));
        });
    }
}