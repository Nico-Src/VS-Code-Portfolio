class ToolBox{
    constructor(editor){
        this.editor = editor;
        this.init();
    }

    init(){
        BrickLib.bricks.forEach(brick=>{
            const item = document.createElement('div');
            item.classList.add('item');
            item.onclick = () => {this.editor.addBrickByName(brick.name)};
            item.innerHTML = `<img src="img/${brick.name}.png">
                <div class="name">${brick.name}</div>`;
            document.querySelector('.tool-box').appendChild(item);
        });
    }
}