const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const audioDom = document.querySelector('audio');
const fileInput = document.querySelector('input[type="file"]');
const playBtn = document.querySelector('.play-btn');
var audio, drawInterval, visualizer, playing = false;
audioDom.crossOrigin = "anonymous";
audioDom.volume = .1;
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    document.querySelector('#current-file .file-name span').innerHTML = file.name;
    document.querySelector('#current-file .file-size').innerHTML = '~ ' + (file.size / 1000 / 1000).toFixed(2) + ' MB';
    // create a blob url
    const url = URL.createObjectURL(file);
    // set the audio source
    audioDom.src = url;
    audioDom.play();
    playBtn.innerHTML = '<i class="bx bx-pause"></i>';
    playing = true;
    
    audio = new Audio(audioDom);

    visualizer = new BarVisualizer(audio, canvas);
    
    drawInterval = setInterval(() => {
        visualizer.draw();
    }, 1000 / 60);

    window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        visualizer.updateDimensions();
    };
};

const typeSelect = document.querySelector('.type-select');
const items = document.querySelectorAll('.type');
// register click event on each item
for(const item of items){
    item.onclick = (e) => {
        const type = item.getAttribute('data-type');
        setOptions(type);
        clearInterval(drawInterval);
        switch(type){
            case 'bar':
                visualizer = new BarVisualizer(audio, canvas);
                break;
            case 'circle-bar':
                visualizer = new CircleBarVisualizer(audio, canvas);
                break;
            case 'circle-wave':
                visualizer = new CircleWaveVisualizer(audio, canvas);
                break;
            case 'point-cloud':
                visualizer = new PointCloudVisualizer(audio, canvas);
                break;
            case 'point-grid':
                visualizer = new PointGridVisualizer(audio, canvas);
                break;
        }
        barSelect.value = 128;
        normalizeCheckbox.checked = true;
        circleRadiusInput.value = 200;
        pointCloudTrailsCombo.checked = false;
        pointGridTrailCombo.checked = false;
        pointGridRainbowCombo.checked = false;
        pointCloudSizeInput.value = 2;
        pointGridSizeInput.value = 10;
        drawInterval = setInterval(() => {
            visualizer.draw();
        }, 1000 / 60);
    }
};

var barSelect = document.querySelector('#bar-select');
barSelect.onchange = (e) => {
    visualizer.options.bars.count = e.target.value;
    visualizer.options.bars.width = canvas.width / e.target.value;
    visualizer.options.blocks.size = Math.floor(visualizer.options.audio.maxRange / e.target.value);
};

var wavePointSelect = document.querySelector('#wave-point-select');
wavePointSelect.onchange = (e) => {
    visualizer.options.wave.count = e.target.value;
    visualizer.options.wave.width = canvas.width / e.target.value;
    visualizer.options.blocks.size = Math.floor(visualizer.options.audio.maxRange / e.target.value);
};

var pointCloudCountSelect = document.querySelector('#point-cloud-count-select');
pointCloudCountSelect.onchange = (e) => {
    visualizer.options.points.count = e.target.value;
    visualizer.options.blocks.size = Math.floor(visualizer.options.audio.maxRange / e.target.value);
};

var pointCloudSizeInput = document.querySelector('#point-cloud-size');
pointCloudSizeInput.oninput = (e) => {
    visualizer.options.points.size = parseInt(e.target.value);
};

var pointGridSizeInput = document.querySelector('#point-grid-size');
pointGridSizeInput.oninput = (e) => {
    visualizer.options.points.size = parseInt(e.target.value);
};

var pointCloudTrailsCombo = document.querySelector('#point-cloud-trails');
pointCloudTrailsCombo.onchange = (e) => {
    visualizer.options.points.trails = e.target.checked;
};

var pointGridTrailCombo = document.querySelector('#point-grid-trails');
pointGridTrailCombo.onchange = (e) => {
    visualizer.options.points.trails = e.target.checked;
};

var pointGridRainbowCombo = document.querySelector('#point-grid-rainbow');
pointGridRainbowCombo.onchange = (e) => {
    visualizer.options.points.rainbow = e.target.checked;
};

var circleRadiusInput = document.querySelector('#circle-radius');
circleRadiusInput.oninput = (e) => {
    visualizer.options.circle.radius = parseInt(e.target.value);
};

var normalizeCheckbox = document.querySelector('#normalize');
normalizeCheckbox.onchange = (e) => {
    visualizer.options.audio.normalize = e.target.checked;
};

const volumeSlider = document.querySelector('input[type="range"]');
volumeSlider.oninput = (e) => {
    audioDom.volume = e.target.value / 100;
}

playBtn.onclick = () => {
    if(playing){
        audioDom.pause();
        playBtn.innerHTML = '<i class="bx bx-play"></i>';
        playing = false;
    } else {
        audioDom.play();
        playBtn.innerHTML = '<i class="bx bx-pause"></i>';
        playing = true;
    }
};

var optionWrapper = document.querySelector('.visualizer-options');
var options = optionWrapper.querySelectorAll('.option');
setOptions('bar');

function setOptions(sType){
    for(const option of options){
        const types = option.getAttribute('data-type').split('|');
        let isType = false;
        for(const type of types){
            if(type === sType){
                isType = true;
                break;
            }
        }
        if(isType){
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    }
}