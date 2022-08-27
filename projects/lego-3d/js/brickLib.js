class BrickLib{
    static brickMeshes = new Map();
    static bricks = [
        {
            name: '1x1',
            height: 1,
            path: '3005.glb',
            offset: new BABYLON.Vector3(0,0,0),
        },
        {
            name: '2x1',
            height: 1,
            path: '3004.glb',
            offset: new BABYLON.Vector3(-0.1,0,0),
        },
        {
            name: '2x2',
            height: 1,
            path: '3003.glb',
            offset: new BABYLON.Vector3(-0.1,0,-0.1)
        }
    ];
}