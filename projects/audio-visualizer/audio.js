class Audio{
    constructor(audioEl){
        this.dom = audioEl;
        this.bgHueRotate = 0;
        this.bgBrightness = 0;
        this.updateCounter = 0;
        // get audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        // create audio source
        this.track = this.context.createMediaElementSource(this.dom);
        // create analyser
        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.8;
        // create gain node
        this.gainNode = this.context.createGain();

        // connect our graph
        this.track.connect(this.gainNode).connect(this.context.destination);
        this.track.connect(this.analyser);

        this.data = new Uint8Array(this.analyser.frequencyBinCount);
    }

    /** update data */
    updateData(){ // ANCHOR updateData
        this.analyser.getByteFrequencyData(this.data);
    }

    /** update bg hue */
    updateBG(){ // ANCHOR updateBG
        document.querySelector('.bg img').style.filter = `blur(50px) hue-rotate(${this.bgHueRotate}deg) brightness(${Math.max(this.bgBrightness, 15)}%)`;
    }
}