class Visualizer{
    constructor(audioElement,playButton,volumeControl,barNumberSelect,volumeInfluenceCheckBox,reverseLowBarsCheckBox,normalizeCheckBox,gradientStartInput,gradientEndInput){
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.track = this.audioCtx.createMediaElementSource(audioElement);
        this.analyser = this.audioCtx.createAnalyser();
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.gainNode = this.audioCtx.createGain();

        playButton.addEventListener('click', (e) => this.addClickHandlerPlayButton(this.audioCtx,playButton));
        volumeControl.addEventListener('input', (e) => this.addVolumeHandler(this.gainNode,volumeControl.value));
        volumeInfluenceCheckBox.addEventListener('click', (e) => this.volumeInfluence = volumeInfluenceCheckBox.checked);
        reverseLowBarsCheckBox.addEventListener('click', (e) => this.reverseLowBars = reverseLowBarsCheckBox.checked);
        normalizeCheckBox.addEventListener('click', (e) => this.normalize = normalizeCheckBox.checked);
        barNumberSelect.addEventListener('change',(e)=>this.barNumberChanged(barNumberSelect.value));
        gradientStartInput.addEventListener('change',(e)=>this.newColors(gradientStartInput.value,gradientEndInput.value));
        gradientEndInput.addEventListener('change',(e)=>this.newColors(gradientStartInput.value,gradientEndInput.value));

        // connect our graph
        this.track.connect(this.gainNode).connect(this.audioCtx.destination);
        this.track.connect(this.analyser);
        this.gradientStart = '#33C0FF';
        this.gradientEnd = '#75FF33';

        this.bars = 32;
        this.step = 800 / 1024;
        this.dataBlockSize = 1024 / this.bars;
        this.barSpacing = 10;
        this.minBarHeight = 10;
        this.reverseLowBars = false;
        this.barColors = this.generateColors(this.gradientEnd,this.gradientStart,this.bars);
        this.volumeInfluence = false;
        this.normalize = false;

        this.volumeControl = volumeControl;

        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x+r, y);
            this.arcTo(x+w, y,   x+w, y+h, r);
            this.arcTo(x+w, y+h, x,   y+h, r);
            this.arcTo(x,   y+h, x,   y,   r);
            this.arcTo(x,   y,   x+w, y,   r);
            this.closePath();
            return this;
          }

        console.log(this);
    }

    newColors(startColor,endColor){
        this.gradientStart = startColor;
        this.gradientEnd = endColor;
        this.barColors = this.generateColors(this.gradientEnd,this.gradientStart,this.bars);
    }

    barNumberChanged(value){
        this.bars = value;
        this.dataBlockSize = 1024 / this.bars;
        this.barColors = this.generateColors(this.gradientEnd,this.gradientStart,this.bars);
    }

    addVolumeHandler(gainNode,value){
        gainNode.gain.value = value;
    }

    addClickHandlerPlayButton(audioCtx,btn){
        // check if context is in suspended state (autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            btn.innerHTML = "Pause";
        } else {
            audioCtx.suspend();
            btn.innerHTML = "Play";
        }         
    }

    update(){
        var c = document.querySelector("canvas");
        var ctx = c.getContext("2d");

        // fill canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var width = c.width;
        var height = c.height;

        this.barWidth = width / this.bars;
        
        // get audio data
        this.analyser.getByteFrequencyData(this.dataArray);
        let blockBytes = [];
        let arr = [];
        for(let j = 0; j < 1024;j++){
            arr.push(this.dataArray[j]);
            if((j + 1) % this.dataBlockSize === 0){
                let avg = 0;
                let sum = 0;

                arr.forEach(byte => {
                    sum += byte;
                });

                avg = sum / arr.length;
                blockBytes.push(avg);
                arr = [];
            }
        }
        if(this.normalize)blockBytes = this.normalizeBytes(blockBytes,height - 50);

        let volumeMultiplier = this.normalize === true ? 1.0 : 1.5;

        let barCount = 0;
        let currentBlock = [];

        for(let i = 0;i<1024;i++){
            if((i + 1) % this.dataBlockSize === 0){
                let x = barCount * this.barWidth;
                let y = blockBytes[barCount];

                if(this.volumeInfluence){
                    y *= (volumeMultiplier * this.volumeControl.value);
                }

                ctx.fillStyle = "#" + this.barColors[barCount];
                ctx.fillRect(x + (this.barSpacing / 2),height - y - this.minBarHeight,this.barWidth - (this.barSpacing / 2),y - (this.reverseLowBars ? this.minBarHeight : -this.minBarHeight));
                barCount++;
                currentBlock = [];
            }
        }

        requestAnimationFrame(this.update.bind(this));
    }

    normalizeBytes(arr,normalizeValue){
        let max = 0;
        arr.forEach(byte => {if(byte > max) max = byte;});

        let ratio = normalizeValue / max;
        for(let i = 0; i < arr.length;i++){
            arr[i] = arr[i] * ratio;
        }

        return arr;
    }

    hex (c) {
        var s = "0123456789abcdef";
        var i = parseInt (c);
        if (i == 0 || isNaN (c))
          return "00";
        i = Math.round (Math.min (Math.max (0, i), 255));
        return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
    }
      
    /* Convert an RGB triplet to a hex string */
    convertToHex (rgb) {
        return this.hex(rgb[0]) + this.hex(rgb[1]) + this.hex(rgb[2]);
    }
      
    /* Remove '#' in color hex string */
    trim (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }
      
    /* Convert a hex string to an RGB triplet */
    convertToRGB (hex) {
        var color = [];
        color[0] = parseInt ((this.trim(hex)).substring (0, 2), 16);
        color[1] = parseInt ((this.trim(hex)).substring (2, 4), 16);
        color[2] = parseInt ((this.trim(hex)).substring (4, 6), 16);
        return color;
    }
      
    generateColors(colorStart,colorEnd,colorCount){
      
        // The beginning of your gradient
        var start = this.convertToRGB (colorStart);    
      
        // The end of your gradient
        var end   = this.convertToRGB (colorEnd);    
      
        // The number of colors to compute
        var len = colorCount;
      
        //Alpha blending amount
        var alpha = 0.0;
      
        var saida = [];
          
        for (var i = 0; i < len; i++) {
            var c = [];
            alpha += (1.0/len);
              
            c[0] = start[0] * alpha + (1 - alpha) * end[0];
            c[1] = start[1] * alpha + (1 - alpha) * end[1];
            c[2] = start[2] * alpha + (1 - alpha) * end[2];
      
            saida.push(this.convertToHex(c));
        }
        return saida;  
    }
}