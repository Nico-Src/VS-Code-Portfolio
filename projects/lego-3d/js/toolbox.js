class ToolBox{
    constructor(editor){
        this.editor = editor;
        this.init();
    }

    init(){
        // iterate over all brick categories
        BrickLib.brickCategories.forEach(cat=>{
            // get bricks of current category
            const bricks = BrickLib.bricks.filter(b=>b.category==cat);
            // create category wrapper
            const item = document.createElement("div");
            item.classList.add('category-wrapper');
            // calculate how many rows of bricks the category has
            const rowCount = Math.ceil(bricks.length/2);
            // set heights to match row count
            item.setAttribute('item-height', (30 + rowCount * 95 + (rowCount+1)*10) + 'px');
            item.setAttribute('content-height', (rowCount * 95 + (rowCount+1)*10) + 'px');
            // create header
            const header = document.createElement("div");
            header.classList.add('category-header');
            header.innerHTML = `<span>${cat}</span><i class='bx bx-chevron-down'></i>`;
            item.appendChild(header);
            // create content wrapper
            const content = document.createElement("div");
            content.classList.add('category-content');
            item.appendChild(content);
            // on header click toggle expanded state
            header.onclick = () => {
                // close all other wrappers to keep only one wrapper opened at a time
                Array.from(document.querySelectorAll('.category-wrapper')).forEach(c=>{
                    // if current wrapper is not the one clicked, close it
                    if(c !== item){
                        c.classList.remove('expanded');
                        c.style.height = '30px';
                        c.querySelector('.category-content').style.height = '0px';
                    }
                });

                // toggle expanded state on clicked wrapper
                item.classList.toggle('expanded');

                const expanded = item.classList.contains('expanded');
                if(expanded){
                    item.style.height = item.getAttribute('item-height');
                    content.style.height = item.getAttribute('content-height');
                } else {
                    item.style.height = '30px';
                    content.style.height = '0px';
                }
            };
            // iterate over bricks of current category
            bricks.forEach(brick=>{
                // create brick item
                const brickItem = document.createElement("div");
                brickItem.classList.add('brick-item');
                // onclick add brick to scene
                brickItem.onclick = () => {this.editor.addBrickByName(brick.name)};
                brickItem.innerHTML = `<img src="img/${brick.name}.png">
                <div class="name">${brick.shortName}</div>`;
                // append brick item to cateogry content
                content.appendChild(brickItem);
            });
            // append category to toolbox
            document.querySelector('.tool-box').appendChild(item);
        });

        // open first category wrapper by default
        setTimeout(() => {
            document.querySelector('.tool-box .category-wrapper .category-header').click();
        }, 500);
    }
}