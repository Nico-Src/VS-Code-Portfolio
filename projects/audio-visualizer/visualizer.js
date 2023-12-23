class BarVisualizer{
    constructor(audio, canvas){
        this.audio = audio;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            bars: {
                minHeight: 10,
                count: 128,
                spacing: 10,
                width: this.canvas.width / 128,
                height: this.canvas.height - 200
            },
            blocks: {
                size: Math.floor(768 / 128)
            },
            audio: {
                maxRange: 768,
                normalize: true
            }
        }

        this.blocks = [];
    }

    /** update */
    update(){ // ANCHOR update
        this.audio.updateData();
    }

    /** window resize handler */
    updateDimensions(){ // ANCHOR updateDimensions
        this.options.bars.width = this.canvas.width / this.options.bars.count;
        this.options.bars.height = this.canvas.height;
    }

    /** draw visualizer */
    draw(){ // ANCHOR draw
        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.blocks = [];

        // calculate average of each block
        let byteArr = [], barNum = 0;

        for(let i = 0; i < this.options.audio.maxRange; i++){
            byteArr.push(this.audio.data[i]); // push bytes
            if((i + 1) % this.options.blocks.size === 0){ //  check if block is full
                let avg = 0, sum = 0; 

                byteArr.forEach(byte => {
                    sum += byte;
                });

                avg = sum / byteArr.length;
                this.blocks.push(avg); // push average to blocks
                byteArr = []; // reset byte array
            }
        }

        // normalize blocks
        let max = this.options.bars.minHeight;
        let sum = 0;
        this.blocks.forEach(block => {
            sum += block;
            if(block > max){
                max = block;
            }
        });

        this.audio.bgHueRotate += (sum / this.blocks.length) / 100;
        this.audio.bgBrightness = (sum / this.blocks.length);
        this.audio.updateBG();

        if(this.options.audio.normalize){
            this.blocks.forEach((block, index) => {
                this.blocks[index] = (block / max) * this.options.bars.height;
            });
        }

        for(let i = 0;i < this.options.audio.maxRange; i++){
            if((i + 1) % this.options.blocks.size === 0){
                let x = barNum * this.options.bars.width;
                let y = this.blocks[barNum];

                this.ctx.fillStyle = "white";
                this.ctx.fillRect(x + (this.options.bars.spacing / 2),
                                  this.canvas.height - y - this.options.bars.minHeight,
                                  this.options.bars.width - (this.options.bars.spacing / 2),
                                  y + this.options.bars.minHeight);
                barNum++;
            }
        }
    }
}

class CircleBarVisualizer{
    constructor(audio, canvas){
        this.audio = audio;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            bars: {
                minHeight: 10,
                count: 256,
                spacing: 10,
                width: this.canvas.width / 256,
                height: this.canvas.height
            },
            blocks: {
                size: Math.floor(768 / 256)
            },
            audio: {
                maxRange: 768,
                normalize: true
            },
            circle: {
                radius: 200,
            }
        }

        this.blocks = [];
    }

    /** update */
    update(){ // ANCHOR update
        this.audio.updateData();
    }

    /** window resize handler */
    updateDimensions(){ // ANCHOR updateDimensions
        this.options.bars.width = this.canvas.width / this.options.bars.count;
        this.options.bars.height = this.canvas.height;
    }

    /** draw visualizer */
    draw(){ // ANCHOR draw
        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.blocks = [];

        // calculate average of each block
        let byteArr = [], barNum = 0;

        for(let i = 0; i < this.options.audio.maxRange; i++){
            byteArr.push(this.audio.data[i]); // push bytes
            if((i + 1) % this.options.blocks.size === 0){ //  check if block is full
                let avg = 0, sum = 0; 

                byteArr.forEach(byte => {
                    sum += byte;
                });

                avg = sum / byteArr.length;
                this.blocks.push(avg); // push average to blocks
                byteArr = []; // reset byte array
            }
        }

        // normalize blocks
        let max = this.options.bars.minHeight;
        let sum = 0;
        this.blocks.forEach(block => {
            sum += block;
            if(block > max){
                max = block;
            }
        });

        this.audio.bgHueRotate += (sum / this.blocks.length) / 100;
        this.audio.bgBrightness = (sum / this.blocks.length);
        this.audio.updateBG();

        if(this.options.audio.normalize){
            this.blocks.forEach((block, index) => {
                this.blocks[index] = (block / max) * this.options.circle.radius;
            });
        }

        // draw bars in a circle
        let radius = this.options.circle.radius + (sum / this.blocks.length) / 2;
        let center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };

        barNum = 0;

        for(let i = 0;i < this.options.audio.maxRange; i++){
            if((i + 1) % this.options.blocks.size === 0){
                // distribute bars evenly around the circle
                let angle = (i / this.options.audio.maxRange) * 2 * Math.PI;
                let x = center.x + radius * Math.cos(angle);
                let y = center.y + radius * Math.sin(angle);

                let barHeight = Math.max(this.blocks[barNum], this.options.bars.minHeight);

                // rotate bars to face away from the center and draw the bars so that the inner radius is free of bars
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 2);
                this.ctx.fillStyle = "white";
                this.ctx.fillRect(0, -barHeight, 2, barHeight);
                this.ctx.restore();

                barNum++;
            }
        }
    }
}

class CircleWaveVisualizer{
    constructor(audio, canvas){
        this.audio = audio;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            wave: {
                minHeight: 10,
                count: 256,
                spacing: 10,
                width: this.canvas.width / 256,
                height: this.canvas.height
            },
            blocks: {
                size: Math.floor(768 / 256)
            },
            audio: {
                maxRange: 768,
                normalize: true
            },
            circle: {
                radius: 200,
            }
        }

        this.blocks = [];
    }

    /** update */
    update(){ // ANCHOR update
        this.audio.updateData();
    }

    /** window resize handler */
    updateDimensions(){ // ANCHOR updateDimensions
        this.options.wave.width = this.canvas.width / this.options.wave.count;
        this.options.wave.height = this.canvas.height;
    }

    /** draw visualizer */
    draw(){ // ANCHOR draw
        this.update();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.blocks = [];

        // calculate average of each block
        let byteArr = [], barNum = 0;

        for(let i = 0; i < this.options.audio.maxRange; i++){
            byteArr.push(this.audio.data[i]); // push bytes
            if((i + 1) % this.options.blocks.size === 0){ //  check if block is full
                let avg = 0, sum = 0; 

                byteArr.forEach(byte => {
                    sum += byte;
                });

                avg = sum / byteArr.length;
                this.blocks.push(avg); // push average to blocks
                byteArr = []; // reset byte array
            }
        }

        // normalize blocks
        let max = this.options.wave.minHeight;
        let sum = 0;
        this.blocks.forEach(block => {
            sum += block;
            if(block > max){
                max = block;
            }
        });

        this.audio.bgHueRotate += (sum / this.blocks.length) / 100;
        this.audio.bgBrightness = (sum / this.blocks.length);
        this.audio.updateBG();

        if(this.options.audio.normalize){
            this.blocks.forEach((block, index) => {
                this.blocks[index] = (block / max) * this.options.circle.radius;
            });
        }

        // draw bars in a circle
        let radius = this.options.circle.radius + (sum / this.blocks.length) / 2;
        let center = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };

        barNum = 0;

        this.ctx.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.translate(-center.x, -center.y);
        this.ctx.strokeStyle = "white";
        this.ctx.beginPath();
        for(let i = 0;i < this.options.audio.maxRange; i++){
            if((i + 1) % this.options.blocks.size === 0){
                // distribute bars evenly around the circle
                let angle = (i / this.options.audio.maxRange) * 2 * Math.PI;
                let x = center.x + radius * Math.cos(angle);
                let y = center.y + radius * Math.sin(angle);

                let barHeight = Math.max(this.blocks[barNum], this.options.wave.minHeight);

                // add height to the point in the given angle (direction)
                x += barHeight * Math.cos(angle);
                y += barHeight * Math.sin(angle);

                this.ctx.lineTo(x, y);

                barNum++;
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }
}

class PointCloudVisualizer{
    constructor(audio, canvas){
        this.audio = audio;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            points: {
                count: 256,
                spacing: 10,
                size: 2,
                trails: false
            },
            blocks: {
                size: Math.floor(1024 / 256)
            },
            audio: {
                maxRange: 1024,
                normalize: true
            },
        }

        this.blocks = [];
    }

    /** update */
    update(){ // ANCHOR update
        this.audio.updateData();
    }

    /** window resize handler */
    updateDimensions(){ // ANCHOR updateDimensions
        
    }

    /** draw visualizer */
    draw(){ // ANCHOR draw
        this.update();

        if(this.options.points.trails == false) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        else {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';

        this.blocks = [];

        // calculate average of each block
        let byteArr = [];

        for(let i = 0; i < this.options.audio.maxRange; i++){
            byteArr.push(this.audio.data[i]); // push bytes
            if((i + 1) % this.options.blocks.size === 0){ //  check if block is full
                let avg = 0, sum = 0; 

                byteArr.forEach(byte => {
                    sum += byte;
                });

                avg = sum / byteArr.length;
                this.blocks.push(avg); // push average to blocks
                byteArr = []; // reset byte array
            }
        }

        // normalize blocks
        let max = 10;
        let sum = 0;
        this.blocks.forEach(block => {
            sum += block;
            if(block > max){
                max = block;
            }
        });

        const totalAvg = sum / this.blocks.length;

        this.audio.bgHueRotate += totalAvg / 100;
        this.audio.bgBrightness = totalAvg;
        this.audio.updateBG();

        // set spiral properties
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const spiralCount = this.options.points.count;
        const spiralSpacing = radius / spiralCount;
        const rotationIncrement = Math.PI * 2 / 100;
        let rotation = 0;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(totalAvg / 100);
        this.ctx.translate(-centerX, -centerY);

        // draw spirals
        for (let i = 0; i < spiralCount; i++) {
            const audioValue = this.blocks[Math.floor(i * (this.blocks.length / spiralCount))];
            const spiralRadius = (audioValue / 255) * radius;
            const spiralRotation = rotation + (i * (Math.PI / 4)) % (Math.PI * 2);
            let spiralX = centerX + spiralRadius * Math.cos(spiralRotation);
            let spiralY = centerY + spiralRadius * Math.sin(spiralRotation);

            this.ctx.beginPath();
            this.ctx.arc(spiralX, spiralY, this.options.points.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255,255,255,${audioValue / 100})`;
            this.ctx.fill();

            rotation += rotationIncrement;
        }

        this.ctx.restore();
    }
}

class PointGridVisualizer{
    constructor(audio, canvas){
        this.audio = audio;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            points: {
                count: 256,
                spacing: 10,
                size: 10,
                trails: false,
                rainbow: false
            },
            blocks: {
                size: Math.floor(1024 / 256)
            },
            audio: {
                maxRange: 1024,
                normalize: true
            },
        }

        this.blocks = [];
    }

    /** update */
    update(){ // ANCHOR update
        this.audio.updateData();
    }

    /** window resize handler */
    updateDimensions(){ // ANCHOR updateDimensions
        
    }

    /** draw visualizer */
    draw(){ // ANCHOR draw
        this.update();

        if(this.options.points.trails == false) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        else {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';

        this.blocks = [];

        // calculate average of each block
        let byteArr = [];

        for(let i = 0; i < this.options.audio.maxRange; i++){
            byteArr.push(this.audio.data[i]); // push bytes
            if((i + 1) % this.options.blocks.size === 0){ //  check if block is full
                let avg = 0, sum = 0; 

                byteArr.forEach(byte => {
                    sum += byte;
                });

                avg = sum / byteArr.length;
                this.blocks.push(avg); // push average to blocks
                byteArr = []; // reset byte array
            }
        }

        // normalize blocks
        let max = 10;
        let sum = 0;
        this.blocks.forEach(block => {
            sum += block;
            if(block > max){
                max = block;
            }
        });

        this.audio.bgHueRotate += (sum / this.blocks.length) / 100;
        this.audio.bgBrightness = (sum / this.blocks.length);
        this.audio.updateBG();

        const pointSize = this.options.points.size;
        const pointSpacing = 10;
        const rowCount = Math.floor(canvas.height / (pointSize + pointSpacing));
        const colCount = Math.floor(canvas.width / (pointSize + pointSpacing));
        const startX = (canvas.width - (colCount * (pointSize + pointSpacing) - pointSpacing)) / 2;
        const startY = (canvas.height - (rowCount * (pointSize + pointSpacing) - pointSpacing)) / 2;

        // draw grid
        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < colCount; col++) {
                const pointX = startX + col * (pointSize + pointSpacing);
                const pointY = startY + row * (pointSize + pointSpacing);
                const pointValue = this.blocks[Math.floor((row * colCount + col) * (this.blocks.length / (rowCount * colCount)))] / 255;
                const pointScale = pointValue + 0.5;
                // use x and y for color and value for alpha
                const angle = Math.atan2(pointY - canvas.height / 2, pointX - canvas.width / 2);
                const hue = ((angle * 180 / Math.PI) + 360) % 360;
                const pointColor = this.options.points.rainbow ? `hsla(${hue}, 100%, 50%, ${pointValue * 2})`
                                                               : `rgba(255, 255, 255, ${pointValue * 2})`;

                this.ctx.fillStyle = pointColor;
                this.ctx.fillRect(pointX, pointY, pointSize * pointScale, pointSize * pointScale);
            }
        }
    }
}