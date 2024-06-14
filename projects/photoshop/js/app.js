const canvas = new Canvas({
    fullscreen: true,
    zoomSensitivity: 5,
});

const tools = Array.from(document.querySelectorAll('.tool'));
for(const tool of tools){
    tool.addEventListener('click', () => {
        switch(tool.dataset.tool){
            case 'move':
                canvas.tool = TOOL.MOVE;
                break;
            case 'brush':
                canvas.tool = TOOL.BRUSH;
                break;
            case 'eraser':
                canvas.tool = TOOL.ERASER;
                break;
        }
    });
}