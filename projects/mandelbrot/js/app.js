var canvas;
var gl;
var program;
var vs;
var fs;
var uniforms;
var currentShader;

var shaderVars = {
    'Green Matrix': {
        greenMatrixColorMultiplier: 64.0,
        greenMatrixType: 1.0
    }
};

var shaderInputs = {
    'Green Matrix': ['greenMatrixColorMultiplier','greenMatrixType']
};

var minI = -2.0;
var maxI = 2.0;
var minR = -2.0;
var maxR = 2.0;
var viewportDimensions = [0,0];
var previousTouch;

function loadShaderAsync(shaderURL,callback){
    var req = new XMLHttpRequest();
    req.open('GET',shaderURL,true);
    req.onload = () => {
        if(req.status < 200 || req.status >= 300){
            callback(`Could not load: ${shaderURL}`)
        } else {
            callback(null,req.responseText);
        }
    };
    req.send();
}

function addEvent(object, type, callback){
    if(object == null || typeof(object) == 'undefined') return;
    if(object.addEventListener){
        object.addEventListener(type, callback, false);
    } else if(object.attachEvent){
        object.attachEvent(`on${type}`, callback);
    } else {
        object[`on${type}`] = callback;
    }
};

function removeEvent(object, type, callback){
    if(object == null || typeof(object) == 'undefined') return;
    if(object.removeEventListener){
        object.removeEventListener(type, callback, false);
    } else if(object.detachEvent){
        object.detachEvent(`on${type}`, callback);
    } else {
        object[`on${type}`] = callback;
    }
};

function initMandelbrot(){
    console.log("Initializing Mandelbrot...");
    async.map({
        vsText: 'shaders/Default Blue/mandelbrot.vs.glsl',
        fsText: 'shaders/Default Blue/mandelbrot.fs.glsl'
    }, loadShaderAsync, run);
}

function run(loadErrors, loadedShaders){
    canvas = document.getElementById('mandelbrot');
    console.log(loadedShaders);
    // attach callbacks
    addEvent(window, 'resize', onWindowResize);
    addEvent(window, 'wheel', onZoom);
    addEvent(canvas, 'mousemove', OnPan);
    addEvent(canvas, 'touchmove', OnPan);
    document.querySelector('.controls #shader').addEventListener('change', shaderSelectionChanged);

    for(const key in shaderInputs){
        for(const input of shaderInputs[key]){
            document.querySelector(`.controls #${input}`).addEventListener('click', (e) => {e.preventDefault();e.stopPropagation()});
            document.querySelector(`#${input}`).addEventListener('change', (e) => {
                shaderVars[currentShader][input] = parseFloat(e.target.value);
                console.log(input, shaderVars[currentShader][input]);
            });
        }
    }

    gl = canvas.getContext('webgl');
    if(!gl){
        console.error("Could not get WebGL context!");
        return;
    }

    // create shader program
    vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, loadedShaders[0]);
    gl.compileShader(vs);
    if(!gl.getShaderParameter(vs,gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(vs));
        return;
    }
    fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, loadedShaders[1]);
    gl.compileShader(fs);
    if(!gl.getShaderParameter(fs,gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(fs));
        return;
    }

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    // get uniform locations
    uniforms = {
        viewportDimensions: gl.getUniformLocation(program, 'viewportDimensions'),
        minI: gl.getUniformLocation(program, 'minI'),
        maxI: gl.getUniformLocation(program, 'maxI'),
        minR: gl.getUniformLocation(program, 'minR'),
        maxR: gl.getUniformLocation(program, 'maxR'),
    };

    // set cpu-side variables for all of our shader variables
    viewportDimensions = [canvas.width, canvas.height];

    // create buffers
    const vertexBuffer = gl.createBuffer();
    var vertices = [
        -1, 1,
        -1, -1,
        1, -1,
        
        -1, 1,
        1, 1,
        1, -1
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, 'vPos');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2, gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    

    const loop = () => {
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        
        switch(currentShader){
            case 'Green Matrix':
                gl.uniform2f(uniforms.viewportDimensions, viewportDimensions[0], viewportDimensions[1]);
                gl.uniform1f(uniforms.minI, minI);
                gl.uniform1f(uniforms.maxI, maxI);
                gl.uniform1f(uniforms.minR, minR);
                gl.uniform1f(uniforms.maxR, maxR);
                gl.uniform1f(uniforms.colorMultiplier, shaderVars[currentShader].greenMatrixColorMultiplier);
                gl.uniform1f(uniforms.colorType, shaderVars[currentShader].greenMatrixType);
                break;
            default: 
                gl.uniform2f(uniforms.viewportDimensions, viewportDimensions[0], viewportDimensions[1]);
                gl.uniform1f(uniforms.minI, minI);
                gl.uniform1f(uniforms.maxI, maxI);
                gl.uniform1f(uniforms.minR, minR);
                gl.uniform1f(uniforms.maxR, maxR);
                break;
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    onWindowResize();
}

function onWindowResize(){
    if(!canvas){
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    viewportDimensions = [canvas.width, canvas.height];

    const oldRealRange = maxR - minR;
    maxR = (maxI - minI) * (canvas.width / canvas.height) + minR;
    const newRealRange = maxR - minR;

    minR -= (newRealRange - oldRealRange) / 2;
    maxR = (maxI - minI) * (canvas.width / canvas.height) + minR;

    gl.viewport(0,0,canvas.width,canvas.height);
}

function onZoom(e){
    const imaginaryRange = maxI - minI;
    let newRange;
    if(e.deltaY < 0){
        newRange = imaginaryRange * 0.95;
    } else {
        newRange = imaginaryRange * 1.05;
    }

    const delta = newRange - imaginaryRange;
    minI -= delta / 2;
    maxI = minI + newRange;

    onWindowResize();
}

function OnPan(e){
    if(e.type === 'touchmove'){
        const touch = e.touches[0];

        e.movementX = 0;
        e.movementY = 0;

        if (previousTouch) {
            // be aware that these only store the movement of the first touch in the touches array
            e.movementX = touch.pageX - previousTouch.pageX;
            e.movementY = touch.pageY - previousTouch.pageY;
        }
    
        previousTouch = touch;
    }

    if(e.buttons != 0 || e.type === 'touchmove' && e.touches.length > 0){
        const iRange = maxI - minI;
        const rRange = maxR - minR;

        const iDelta = (e.movementY / canvas.height) * iRange;
        const rDelta = (e.movementX / canvas.width) * rRange;
        
        minI += iDelta;
        maxI += iDelta;
        minR -= rDelta;
        maxR -= rDelta;
    }
}

function shaderSelectionChanged(e){
    const value = e.target.value;
    currentShader = value;

    for(const el of document.querySelectorAll('.shader-variable')){
        if(!shaderInputs[currentShader]?.includes(el.id)){
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
    }

    async.map({
        vsText: `shaders/${value}/mandelbrot.vs.glsl`,
        fsText: `shaders/${value}/mandelbrot.fs.glsl`
    }, loadShaderAsync, swapShadersTmp);
}

function swapShadersTmp(err,shaders){
    if(!err){
        swapShaders(shaders[0], shaders[1]);
    }
}

function swapShaders(newVSTxt, newFSTxt){
    const vsTmp = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsTmp, newVSTxt);
    gl.compileShader(vsTmp);
    if(!gl.getShaderParameter(vsTmp,gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(vsTmp));
        return;
    }
    const fsTmp = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsTmp, newFSTxt);
    gl.compileShader(fsTmp);
    if(!gl.getShaderParameter(fsTmp,gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(fsTmp));
        return;
    }

    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.attachShader(program, vsTmp);
    gl.attachShader(program, fsTmp);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    // get uniform locations
    switch(currentShader){
        case "Green Matrix":
            uniforms = {
                viewportDimensions: gl.getUniformLocation(program, 'viewportDimensions'),
                minI: gl.getUniformLocation(program, 'minI'),
                maxI: gl.getUniformLocation(program, 'maxI'),
                minR: gl.getUniformLocation(program, 'minR'),
                maxR: gl.getUniformLocation(program, 'maxR'),
                colorMultiplier: gl.getUniformLocation(program, 'colorMultiplier'),
                colorType: gl.getUniformLocation(program, 'colorType')
            };
            break;
        default: 
            uniforms = {
                viewportDimensions: gl.getUniformLocation(program, 'viewportDimensions'),
                minI: gl.getUniformLocation(program, 'minI'),
                maxI: gl.getUniformLocation(program, 'maxI'),
                minR: gl.getUniformLocation(program, 'minR'),
                maxR: gl.getUniformLocation(program, 'maxR'),
            };
    }

    // set cpu-side variables for all of our shader variables
    viewportDimensions = [canvas.width, canvas.height];

    // create buffers
    const vertexBuffer = gl.createBuffer();
    var vertices = [
        -1, 1,
        -1, -1,
        1, -1,
        
        -1, 1,
        1, 1,
        1, -1
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, 'vPos');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2, gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.useProgram(program);

    vs = vsTmp;
    fs = fsTmp;
}