document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('file-input');
    const inputImg = document.getElementById('input-img');
    const colorsDiv = document.querySelector('.colors');

    let imageData;

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function() {
            inputImg.src = reader.result;
        }

        reader.readAsDataURL(file);
    });

    inputImg.addEventListener('load', () => {
        canvas.width = inputImg.width;
        canvas.height = inputImg.height;

        ctx.drawImage(inputImg, 0, 0);

        const worker = new Worker('js/colorExtractionWorker.js');

        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        worker.postMessage({ imageData });

        worker.onmessage = function(event) {
            const uniqueColors = event.data.uniqueColors;
            console.log(uniqueColors);

            uniqueColors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = color;
                colorsDiv.appendChild(colorBox);
            });

            overlayNumbers(event.data.colorMap);
        };
    });

    function overlayNumbers(colorMap) {
        ctx.font = '7px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
    
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imageDataLength = imageData.length;
    
        const colorIndexMap = new Map(Object.entries(colorMap).map(([color, index]) => [color, index]));
    
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const index = (y * canvasWidth + x) * 4;
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                const color = `rgb(${r}, ${g}, ${b})`;
    
                const colorIndex = colorIndexMap.get(color);
                if (colorIndex !== undefined) {
                    ctx.fillText(colorIndex, x, y);
                }
            }
        }
    }
});
