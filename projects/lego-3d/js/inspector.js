class Inspector{
    constructor(editor){
        this.editor = editor;
        this.editor.currentColor = BrickLib.brickColors.find(c => c.name === 'White');
        this.setupControls();
    }

    setupControls(){
        BrickLib.brickColorCategories.forEach(cat=>{
            const catDiv = document.createElement('div');
            catDiv.classList.add('category');
            catDiv.innerHTML = cat;
            document.querySelector('.color-select .dropdown').appendChild(catDiv);
            for(const color of BrickLib.brickColors.filter(c => c.category === cat)){
                const item = document.createElement('div');
                item.classList.add('item');
                if(color.name === 'White') item.classList.add('active');
                item.setAttribute('value', color.name);
                item.onclick = (e) => {
                    e.stopPropagation();
                    // deselect all other items
                    Array.from(document.querySelectorAll('.color-select .dropdown .item')).forEach(item=>{
                        item.classList.remove('active');
                    });
                    // select this item
                    e.currentTarget.classList.add('active');
                    // find the selected color
                    const selectedColor = BrickLib.brickColors.find(c => c.name === e.currentTarget.getAttribute('value'));
                    this.editor.currentColor = selectedColor;
                    this.editor.elements.filter(elem => elem.selected).forEach(el => {
                        if(!el.element.material) return;
                        const r = selectedColor.rgba[0] / 255;
                        const g = selectedColor.rgba[1] / 255;
                        const b = selectedColor.rgba[2] / 255;
                        el.element.material.diffuseColor = new BABYLON.Color3(r,g,b);
                        el.element.material.alpha = selectedColor.rgba[3];
                    });
                    const colorSelect = document.querySelector('.color-select');
                    // update color select value
                    colorSelect.querySelector('.value .color').style.backgroundColor = selectedColor.hex;
                    colorSelect.querySelector('.value .color').style.opacity = selectedColor.rgba[3];
                    colorSelect.querySelector('.value .name').innerHTML = selectedColor.name;
                    colorSelect.classList.remove('expanded');
                };
                item.innerHTML = `<div class="color" style="background-color:${color.hex};opacity: ${color.rgba[3]};"></div>
                    <div class="name">${color.name}</div>`;
                document.querySelector('.color-select .dropdown').appendChild(item);
            }
        });

        document.addEventListener('selection-changed',(e)=>{
            
        });

        document.querySelector('.color-select').onclick = (e) => {
            e.stopPropagation();

            e.currentTarget.classList.toggle('expanded');
        };
    }
}