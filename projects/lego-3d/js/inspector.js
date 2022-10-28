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
                        el.color = selectedColor;
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

        // listen for the 'brick-added' event to keep the inspector up to date
        document.addEventListener('brick-added',(e)=>{
            const brick = e.detail;
            // create a new element in the inspector
            const brickDiv = document.createElement('div');
            brickDiv.classList.add('inspector-item');
            // set the brick's id as the element's id to make it easy to find
            brickDiv.setAttribute('id',"brick"+brick.id);
            brickDiv.innerHTML = brick.name;
            document.querySelector('.inspector-elements').appendChild(brickDiv);
        });

        // listen for the 'brick-remove' event to keep the inspector up to date
        document.addEventListener('brick-removed',(e)=>{
            const brick = e.detail;
            // find the element in the inspector and remove it
            const brickDiv = document.querySelector(`.inspector-item#brick${brick.id}`);
            brickDiv.remove();
        });

        document.addEventListener('selection-changed',(e)=>{
            const colorSelect = document.querySelector('.color-select');
            if(e.detail.selectedBricks.length === 1){
                const selectedColor = e.detail.selectedBricks[0].color;

                // deselect all other items
                Array.from(document.querySelectorAll('.color-select .dropdown .item')).forEach(item=>{
                    item.classList.remove('active');
                });

                document.querySelector('.color-select .dropdown .item[value="'+selectedColor.name+'"]').classList.add('active');

                // update color select value
                colorSelect.querySelector('.value .color').style.backgroundColor = selectedColor.hex;
                colorSelect.querySelector('.value .color').style.opacity = selectedColor.rgba[3];
                colorSelect.querySelector('.value .name').innerHTML = selectedColor.name;
            } else if(e.detail.selectedBricks.length > 1){
                const colors = [];

                // get how many different colors are selected
                e.detail.selectedBricks.forEach(el => {
                    if(!el.color) return;
                    if(!colors.includes(el.color)){
                        colors.push(el.color);
                    }
                });

                // change color select accordingly
                if(colors.length > 1){
                    colorSelect.querySelector('.value .color').style.backgroundColor = 'red';
                    colorSelect.querySelector('.value .color').style.opacity = 1;
                    colorSelect.querySelector('.value .name').innerHTML = "Mixed";
                } else {
                    colorSelect.querySelector('.value .color').style.backgroundColor = colors[0].hex;
                    colorSelect.querySelector('.value .color').style.opacity = colors[0].rgba[3];
                    colorSelect.querySelector('.value .name').innerHTML = colors[0].name;
                }

                // deselect all other items (because multiple colors are selected)
                Array.from(document.querySelectorAll('.color-select .dropdown .item')).forEach(item=>{
                    item.classList.remove('active');
                });
            } else {
                const selectedColor = this.editor.currentColor;
                colorSelect.querySelector('.value .color').style.backgroundColor = selectedColor.hex;
                colorSelect.querySelector('.value .color').style.opacity = selectedColor.rgba[3];
                colorSelect.querySelector('.value .name').innerHTML = selectedColor.name;
            }
        });

        document.querySelector('.color-select').onclick = (e) => {
            e.stopPropagation();

            e.currentTarget.classList.toggle('expanded');
        };
    }
}