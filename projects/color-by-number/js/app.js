class App{
    constructor(img){
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d',{willReadFrequently:true, alpha:true});
        this.ctx.imageSmoothingEnabled = false;
        this.image = img;
        this.imageData = [];
        this.revealed = [];
        this.colorPalette = [];

        this.translate = {x: 0, y: 0};
        this.scale = 1;

        this.firstDraw = true;

        this.rows = img.naturalHeight;
        this.cols = img.naturalWidth;

        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        };

        this.mouseMap = {
            0: "left",
            1: "middle",
            2: "right"
        };

        this.init();
    }

    init(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.canvas.addEventListener('wheel', e => {
            this.scale += e.deltaY * -0.01;
            this.scale = Math.min(Math.max(.0125, this.scale), 50);
        });
        window.addEventListener('resize', this.resize.bind(this));

        requestAnimationFrame(this.draw.bind(this));
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.translate.x, this.translate.y);
        this.ctx.scale(this.scale, this.scale);

        // draw image
        this.drawImage();

        this.ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
    }

    drawImage(){
        if(this.firstDraw){
            // draw image
            this.ctx.drawImage(this.image, 0,0);

            this.getAverageColors(0,0,this.image.width,this.image.height);
            this.firstDraw = false;
        } else {
            this.ctx.drawImage(this.image, 0,0);
            this.cellWidth = this.image.width / this.cols;
            this.cellHeight = this.image.height / this.rows;

            let totalCells = this.cols * this.rows;
            let cellCount = 0;

            const that = this;

            // Precompute font size
            let fontSize = Math.min(this.cellWidth, this.cellHeight) * 0.5;
            this.ctx.font = fontSize + 'px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            let colorIndexMap = {};
            for (let i = 0; i < this.colorPalette.length; i++) {
                colorIndexMap[this.colorPalette[i]] = i + 1; // Assuming colorPalette is an array of color strings
            }

            function processBatch(startRow, endRow) {
                for (let i = startRow; i < endRow; i++) {
                    if (!that.revealed[i]) continue;
                    for (let j = 0; j < that.cols; j++) {
                        if (that.revealed[i][j]) continue;

                        let x = Math.floor(j * that.cellWidth);
                        let y = Math.floor(i * that.cellHeight);

                        if (x + that.cellWidth < -that.translate.x / that.scale ||
                            y + that.cellHeight < -that.translate.y / that.scale ||
                            x > (-that.translate.x / that.scale) + that.canvas.width / that.scale ||
                            y > (-that.translate.y / that.scale) + that.canvas.height / that.scale) continue;

                        let color = that.colorMap[i][j];
                        let colorIndex = colorIndexMap[color];

                        that.ctx.fillStyle = (that.selectedColor && that.selectedColor === color) ? 'gray' : 'white';

                        that.ctx.beginPath();
                        that.ctx.rect(x, y, that.cellWidth, that.cellHeight);
                        that.ctx.closePath();
                        that.ctx.fill();

                        that.ctx.fillStyle = 'black';
                        that.ctx.fillText(`${colorIndex}`, x + that.cellWidth / 2, y + that.cellHeight / 2);

                        cellCount++;
                    }
                }
            }

            let batchSize = 150; // Adjust batch size based on performance testing
            let numRows = this.rows;
            let i = 0;

            function processNextBatch() {
                let endRow = Math.min(i + batchSize, numRows);
                processBatch(i, endRow);
                i = endRow;

                if (i < numRows) {
                    requestAnimationFrame(processNextBatch);
                }
            }

            processNextBatch();

            document.querySelector('.total-cells .value').innerHTML = totalCells;
            document.querySelector('.rendered-cells .value').innerHTML = cellCount;
        }
    }

    resize(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.ctx.imageSmoothingEnabled = false;

        // draw image
        this.ctx.drawImage(this.image, 0,0);

        this.getAverageColors();
    }

    mouseDown(e){
        this.mouse[this.mouseMap[e.button]] = true;

        if(this.mouse.left){
            // check if the mouse hit a cell
            let x = Math.floor(this.mouse.x / this.cellWidth);
            let y = Math.floor(this.mouse.y / this.cellHeight);

            if(x < this.cols && y < this.rows){
                const targetColorIndex = this.colorPalette.indexOf(this.colorMap[y][x]);
                if(targetColorIndex === this.selectedColorIndex){
                    this.revealed[y][x] = true;
                    let remainingCells = 0;
                    for(let i = 0; i < this.rows; i++){
                        for(let j = 0; j < this.cols; j++){
                            if(this.colorMap[i][j] === this.selectedColor && !this.revealed[i][j]){
                                remainingCells++;
                            }
                        }
                    }
                    if(remainingCells === 0){
                        this.selectedColor = null;
                        this.selectedColorIndex = null;

                        document.querySelector('.colors .selected').classList.add('disabled');
                        document.querySelector('.colors .selected').classList.remove('selected');
                    }
                }
            }
        }
    }

    mouseMove(e){
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // apply translation and scale
        this.mouse.x = (this.mouse.x - this.translate.x) / this.scale;
        this.mouse.y = (this.mouse.y - this.translate.y) / this.scale;

        if(this.mouse.middle){
            this.translate.x += e.movementX;
            this.translate.y += e.movementY;
        }

        if(this.mouse.left){
            // check if the mouse hit a cell
            let x = Math.floor(this.mouse.x / this.cellWidth);
            let y = Math.floor(this.mouse.y / this.cellHeight);

            if(x < this.cols && y < this.rows){
                const targetColorIndex = this.colorPalette.indexOf(this.colorMap[y][x]);
                if(targetColorIndex === this.selectedColorIndex){
                    this.revealed[y][x] = true;
                    let remainingCells = 0;
                    for(let i = 0; i < this.rows; i++){
                        for(let j = 0; j < this.cols; j++){
                            if(this.colorMap[i][j] === this.selectedColor && !this.revealed[i][j]){
                                remainingCells++;
                            }
                        }
                    }
                    if(remainingCells === 0){
                        this.selectedColor = null;
                        this.selectedColorIndex = null;

                        document.querySelector('.colors .selected').classList.add('disabled');
                        document.querySelector('.colors .selected').classList.remove('selected');
                    }
                }
            }
        }
    }

    mouseUp(e){
        this.mouse[this.mouseMap[e.button]] = false;
    }

    solve(){
        // reveal all cells in a pattern
        let timeout = 0;
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                setTimeout(() => {
                    this.revealed[i][j] = true; 
                }, timeout);
                timeout += Math.sin(i+j)*750;
            }
        }
    }

    getAverageColors(xStart, yStart, width, height){
        // get average color of each cell (row x col)
        this.cellWidth = width / this.cols;
        this.cellHeight = height / this.rows;

        // create a 2d array to store the average color of each cell
        let colors = [];
        for(let i = 0; i < this.rows; i++){
            colors[i] = [];
            for(let j = 0; j < this.cols; j++){
                colors[i][j] = null;
            }
        }

        // get average color of each cell (only of the image not the whole canvas)
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                let x = Math.floor(j * this.cellWidth);
                let y = Math.floor(i * this.cellHeight);
                if(x >= width || y >= height) continue;
                let data = this.ctx.getImageData(x, y, this.cellWidth, this.cellHeight).data;
                let r = 0, g = 0, b = 0;
                for(let k = 0; k < data.length; k += 4){
                    r += data[k];
                    g += data[k + 1];
                    b += data[k + 2];
                }
                r /= data.length / 4;
                g /= data.length / 4;
                b /= data.length / 4;
                // check if the color is similar to any of the colors in the palette
                let color = this.getClosestColor(r, g, b);
                if(!color) color = `rgb(${r}, ${g}, ${b})`;
                colors[i][j] = color;

                if(this.colorPalette.indexOf(colors[i][j]) === -1){
                    this.colorPalette.push(colors[i][j]);
                }
                if(this.firstDraw){
                    if(!this.revealed[i]) this.revealed[i] = [];
                    this.revealed[i][j] = false;
                }
            }
        }

        this.colorMap = colors;

        document.querySelector('.colors').innerHTML = '';
        this.colorPalette.forEach((color, i) => {
            const div = document.createElement('div');
            div.style.backgroundColor = color;
            // check contrast for text color
            let contrast = this.getContrast(color);
            div.style.color = contrast === 'light' ? 'black' : 'white';
            div.innerHTML = `<span>${i+1}</span>`;
            div.onclick = () => {
                if(div.classList.contains('disabled')) return;
                this.selectedColor = color;
                this.selectedColorIndex = i;
                document.querySelector('.colors .selected')?.classList.remove('selected');
                div.classList.add('selected');
            };
            div.setAttribute('data-color', color);
            document.querySelector('.colors').appendChild(div);
        });
    }

    getContrast(color){
        // color in rgb(r, g, b) format
        let r = parseInt(color.substring(4, color.indexOf(',')));
        let g = parseInt(color.substring(color.indexOf(',') + 2, color.lastIndexOf(',')));
        let b = parseInt(color.substring(color.lastIndexOf(',') + 2, color.length - 1));
        let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'light' : 'dark';
    }

    getClosestColor(r, g, b){
        let threshold = 35;
        let color = null;
        for(let i = 0; i < this.colorPalette.length; i++){
            if(this.colorPalette[i] === null) continue;
            const col = {r: 0, g: 0, b: 0};
            // split color in palette format rgb(r, g, b)
            const rgb = this.colorPalette[i].split('(')[1].split(')')[0].split(',');
            col.r = parseInt(rgb[0]);
            col.g = parseInt(rgb[1]);
            col.b = parseInt(rgb[2]);
            let d = this.getDistance(r, g, b, col.r,col.g,col.b);
            if(d < threshold){
                color = this.colorPalette[i];
                threshold = d;
            }
        }
        return color;
    }

    getDistance(r1, g1, b1, r2, g2, b2){
        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    }
}

const input = document.getElementById('file-input');
input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            const img = document.querySelector('#input-img');
            img.src = reader.result;
            window.app = new App(img);
        }
    }
});