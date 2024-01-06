class Util{
    // initialize 3d array and fill with 0s
    // x, y, z are the dimensions of the array
    static init3DArray(x,y,z){
        let arr = new Array(x);
    
        for (let i = 0; i < x; i++) {
            arr[i] = new Array(y);
            for (let j = 0; j < y; j++) arr[i][j] = new Array(z).fill(0); // You can initialize the values with any default value
        }
    
        return arr;
    } 

    // convert point to 3d vector
    static pointToVector(x, y){
        return new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
    }

    // convert deegrees to radians
    static toRadians(degr){
        return degr * (Math.PI / 180);
    }

    static formatSeconds(seconds) {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = Math.floor(seconds % 60);
    
        // Add leading zeros if needed
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
    
        return hours + ":" + minutes + ":" + remainingSeconds;
    }
}