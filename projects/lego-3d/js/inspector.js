class Inspector{
    constructor(editor){
        this.editor = editor;
        this.setupControls();
    }

    setupControls(){
        document.querySelector('.inspector-toggle').addEventListener('click',(e)=>{
            document.querySelector('#app').classList.toggle('expanded');
            setTimeout(() => {
                this.editor.engine.resize();
            }, 300);
        });
    }
}