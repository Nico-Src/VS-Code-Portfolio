self.addEventListener('message', (event) => {
    const imageData = event.data.imageData;
    const uniqueColors = new Set();
    const colorMap = {};

    for (let i = 0; i < imageData.length; i += 4) {
        const color = `rgb(${imageData[i]}, ${imageData[i + 1]}, ${imageData[i + 2]})`;
        uniqueColors.add(color);
    }

    let index = 0;
    uniqueColors.forEach(color => {
        colorMap[color] = index++;
    });

    self.postMessage({ uniqueColors: Array.from(uniqueColors), colorMap: colorMap });
});