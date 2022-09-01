class BrickLib{
    static brickMeshes = new Map();
    static brickSize = 0.2;

    static brickColorCategories = [
        'Black',
        'Grey',
        'Silver',
        'White',
        'Lilac',
        'Blue',
        'Dark Green',
        'Green',
        'Yellow',
        'Gold',
        'Bright Orange',
        'Reddish Brown',
        'Red',
        'Purple'
    ];

    static brickCategories = [
        'Brick',
        'Plate',
        'Tile',
        'Arch',
        'Deco',
        'Panel',
        'Slope'
    ];

    static brickColors = [
        {
            name: 'Black',
            rgba: [21,21,21,1],
            hex: '#151515',
            category: 'Black',
        },
        {
            name: 'Titanium Metallic',
            rgba: [66,66,62,1],
            hex: '#42423e',
            category: 'Black',
        },
        {
            name: 'Dark Stone Grey',
            rgba: [100,103,101,1],
            hex: '#646765',
            category: 'Grey',
        },
        {
            name: 'Medium Stone Grey',
            rgba: [160,161,159,1],
            hex: '#a0a19f',
            category: 'Grey',
        },
        {
            name: 'Cool Silver, Drum Laquered',
            rgba: [119,119,121,1],
            hex: '#777779',
            category: 'Silver',
        },
        {
            name: 'Silver Metallic',
            rgba: [135,141,143,1],
            hex: '#878d8f',
            category: 'Silver',
        },
        {
            name: 'Metalized Silver',
            rgba: [206,206,208],
            hex: '#ceced0',
            category: 'Silver',
        },
        {
            name: 'Transparent',
            rgba: [239,239,238,.5],
            hex: '#efefee',
            category: 'White',
        },
        {
            name: 'Transparent White Glitter',
            rgba: [239,239,238, .5],
            hex: '#efefee',
            category: 'White',
        },
        {
            name: 'White',
            rgba: [244,244,244,1],
            hex: '#f4f4f4',
            category: 'White',
        },
        {
            name: 'White Glow',
            rgba: [230,237,207,1],
            hex: '#e6edcf',
            category: 'White',
        },
        {
            name: 'Medium Lavender',
            rgba: [150,117,180,1],
            hex: '#9675b4',
            category: 'Lilac',
        },
        {
            name: 'Lavender',
            rgba: [188,166,208,1],
            hex: '#bca6d0',
            category: 'Lilac',
        },
        {
            name: 'Medium Lilac',
            rgba: [76,47,146,1],
            hex: '#4c2f92',
            category: 'Lilac',
        },
        {
            name: 'Transparent Bright Violet Glitter',
            rgba: [118,114,181,.5],
            hex: '#7672b5',
            category: 'Lilac',
        },
        {
            name: 'Transparent Bright Violet',
            rgba: [118,114,181,.5],
            hex: '#7672b5',
            category: 'Lilac',
        },
        {
            name: 'Earth Blue',
            rgba: [0,57,94,1],
            hex: '#00395e',
            category: 'Blue',
        },
        {
            name: 'Bright Blue',
            rgba: [0,108,183,1],
            hex: '#006cb7',
            category: 'Blue',
        },
        {
            name: 'Light Royal Blue',
            rgba: [120,191,234,1],
            hex: '#78bfee',
            category: 'Blue',
        },
        {
            name: 'Transparent Blue',
            rgba: [0,153,212,.5],
            hex: '#0099d4',
            category: 'Blue',
        },
        {
            name: 'Medium Blue',
            rgba: [72,158,206,1],
            hex: '#489ece',
            category: 'Blue',
        },
        {
            name: 'Transparent Fluorescent Blue',
            rgba: [132,200,226,.5],
            hex: '#84c8e2',
            category: 'Blue',
        },
        {
            name: 'Sand Blue',
            rgba: [103,130,151,1],
            hex: '#6782a9',
            category: 'Blue',
        },
        {
            name: 'Dark Azur',
            rgba: [0,163,218,1],
            hex: '#00a3d6',
            category: 'Blue',
        },
        {
            name: 'Medium Azur',
            rgba: [0,190,211,1],
            hex: '#00bed3',
            category: 'Blue',
        },
        {
            name: 'Bright Bluish Green',
            rgba: [24,158,159,1],
            hex: '#189e9f',
            category: 'Blue',
        },
        {
            name: 'Transparent Light Blue with Glitter',
            rgba: [91,193,191,.5],
            hex: '#5bc1bf',
            category: 'Blue',
        },
        {
            name: 'Transparent Light Blue',
            rgba: [91,193,191,.5],
            hex: '#5bc1bf',
            category: 'Blue',
        },
        {
            name: 'Aqua',
            rgba: [193,228,218,1],
            hex: '#c1e4da',
            category: 'Blue',
        },
        {
            name: 'Sand Green',
            rgba: [111,148,122,1],
            hex: '#6f947a',
            category: 'Dark Green',
        },
        {
            name: 'Earth Green',
            rgba: [0,74,45,1],
            hex: '#004a2d',
            category: 'Dark Green',
        },
        {
            name: 'Dark Green',
            rgba: [0,146,71,1],
            hex: '#009247',
            category: 'Dark Green',
        },
        {
            name: 'Bright Green',
            rgba: [0,175,77,1],
            hex: '#00af4d',
            category: 'Dark Green',
        },
        {
            name: 'Bright Yellowish Green',
            rgba: [154,202,60,1],
            hex: '#9ac93c',
            category: 'Dark Green',
        },
        {
            name: 'Spring Yellowish Green',
            rgba: [204,225,151,1],
            hex: '#cce197',
            category: 'Dark Green',
        },
        {
            name: 'Olive Green',
            rgba: [130,131,83,1],
            hex: '#828353',
            category: 'Dark Green',
        },
        {
            name: 'Transparent Green',
            rgba: [0,168,79,.5],
            hex: '#00a84f',
            category: 'Green',
        },
        {
            name: 'Transparent Bright Green',
            rgba: [150,199,83,.5],
            hex: '#96c753',
            category: 'Green',
        },
        {
            name: 'Transparent Fluorescent Green',
            rgba: [227,224,41,.5],
            hex: '#e3e029',
            category: 'Green',
        },
        {
            name: 'Transparent Fluorescent Green with Glitter',
            rgba: [227,224,41,.5],
            hex: '#e3e029',
            category: 'Green',
        },
        {
            name: 'Flame Yellow Orange',
            rgba: [251,171,24,1],
            hex: '#fba718',
            category: 'Yellow',
        },
        {
            name: 'Bright Yellow',
            rgba: [255,205,3,1],
            hex: '#ffcd03',
            category: 'Yellow',
        },
        {
            name: 'Transparent Yellow',
            rgba: [247,209,18,.5],
            hex: '#f7d112',
            category: 'Yellow',
        },
        {
            name: 'Cool Yellow',
            rgba: [255,245,121,1],
            hex: '#fff579',
            category: 'Yellow',
        },
        {
            name: 'Warm Gold',
            rgba: [195,151,55,1],
            hex: '#c39737',
            category: 'Gold',
        },
        {
            name: 'Warm Gold Drum Lacquered',
            rgba: [210,161,42,1],
            hex: '#d2a12a',
            category: 'Gold',
        },
        {
            name: 'Metalized Gold',
            rgba: [224,192,119,1],
            hex: '#e0c077',
            category: 'Gold',
        },
        {
            name: 'Vibrant Coral',
            rgba: [249,108,98,1],
            hex: '#f96c62',
            category: 'Bright Orange',
        },
        {
            name: 'Transparent Fluorescent Reddish Orange',
            rgba: [240,87,41,.5],
            hex: '#f05729',
            category: 'Bright Orange',
        },
        {
            name: 'Bright Orange',
            rgba: [245,125,32,1],
            hex: '#f57d20',
            category: 'Bright Orange',
        },
        {
            name: 'Transparent Bright Orange',
            rgba: [245,136,48,.5],
            hex: '#f58830',
            category: 'Bright Orange',
        },
        {
            name: 'Dark Brown',
            rgba: [59,24,13,1],
            hex: '#692e14',
            category: 'Reddish Brown',
        },
        {
            name: 'Reddish Brown',
            rgba: [105,46,20,1],
            hex: '#692e14',
            category: 'Reddish Brown',
        },
        {
            name: 'Dark Orange',
            rgba: [166,83,34,1],
            hex: '#a65322',
            category: 'Reddish Brown',
        },
        {
            name: 'Medium Nougat',
            rgba: [175,116,70,1],
            hex: '#af7446',
            category: 'Reddish Brown',
        },
        {
            name: 'Nougat',
            rgba: [222,139,95,1],
            hex: '#de8b5f',
            category: 'Reddish Brown',
        },
        {
            name: 'Light Nougat',
            rgba: [252,195,158,1],
            hex: '#fcc39e',
            category: 'Reddish Brown',
        },
        {
            name: 'Sand Yellow',
            rgba: [148,126,95,1],
            hex: '#947e5f',
            category: 'Reddish Brown',
        },
        {
            name: 'Transparent Brown',
            rgba: [151,137,108,.5],
            hex: '#97896c',
            category: 'Reddish Brown',
        },
        {
            name: 'Brick Yellow',
            rgba: [221,196,142,1],
            hex: '#ddc48e',
            category: 'Reddish Brown',
        },
        {
            name: 'New Dark Red',
            rgba: [127,19,27,1],
            hex: '#7f131b',
            category: 'Red',
        },
        {
            name: 'Bright Red',
            rgba: [221,26,33,1],
            hex: '#dd1a21',
            category: 'Red',
        },
        {
            name: 'Transparent Red',
            rgba: [229,30,38,.5],
            hex: '#e51e26',
            category: 'Red',
        },
        {
            name : 'Bright Reddish Violet',
            rgba: [181,28,125,1],
            hex: '#b51c7d',
            category: 'Purple'
        },
        {
            name: 'Transparent Medium Reddish Violet',
            rgba: [232,80,156,.5],
            hex: '#e8509c',
            category: 'Purple',
        },
        {
            name: 'Bright Purple',
            rgba: [233,93,162,1],
            hex: '#e95da2',
            category: 'Purple',
        },
        {
            name: 'Light Purple',
            rgba: [246,173,205,1],
            hex: '#f6add5',
            category: 'Purple',
        }
    ];

    static bricks = [
        {
            name: '1x1',
            shortName: '1x1',
            height: .235,
            width: 1,
            depth: 1,
            path: '3005.glb',
            offset: new BABYLON.Vector3(0,.005,0),
            category: 'Brick',
            canPlaceOnTop: true,
        },
        {
            name: '2x1',
            shortName: '2x1',
            height: .235,
            width: 2,
            depth: 1,
            path: '3004.glb',
            offset: new BABYLON.Vector3(-0.1,.005,0),
            category: 'Brick',
            canPlaceOnTop: true,
        },
        {
            name: '2x2',
            shortName: '2x2',
            height: .235,
            width: 2,
            depth: 2,
            path: '3003.glb',
            offset: new BABYLON.Vector3(-0.1,0.005,-0.1),
            category: 'Brick',
            canPlaceOnTop: true,
        },
        {
            name: '2x2 without Groove',
            shortName: '2x2 without Groove',
            height: .08,
            width: 2,
            depth: 2,
            path: '3068a.glb',
            boundingBoxOffset: new BABYLON.Vector3(0,.155,0),
            offset: new BABYLON.Vector3(-0.1,-.155,-0.1),
            category: 'Tile',
            canPlaceOnTop: false,
        },
        {
            name: '1x1 Plate',
            shortName: '1x1',
            height: .08,
            width: 1,
            depth: 1,
            path: '3024.glb',
            boundingBoxOffset: new BABYLON.Vector3(0,.155,0),
            offset: new BABYLON.Vector3(0,-.155,0),
            category: 'Plate',
            canPlaceOnTop: true,
        },
        {
            name: '1x4',
            shortName: '1x4',
            height: .235,
            width: 4,
            depth: 1,
            path: '3659.glb',
            offset: new BABYLON.Vector3(0.1,0,0),
            category: 'Arch',
            canPlaceOnTop: true,
        },
        {
            name: '1x1 Crystal 5 Point',
            shortName: '1x1 Crystal 5 Point',
            height: .24,
            width: 1,
            depth: 1,
            path: '30385.glb',
            boundingBoxOffset: new BABYLON.Vector3(0,.235,0),
            offset: new BABYLON.Vector3(0,-.235,0),
            category: 'Deco',
            canPlaceOnTop: false,
        }
    ];
}