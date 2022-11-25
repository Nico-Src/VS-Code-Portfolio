class EditField{
    constructor(x, y, width, height,parent){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.parent = parent;
        this.text = "";
        this.selected = false;
    }

    draw(ctx){
        if(!this.selected) return;
        ctx.font = "14px Poppins";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.fillText(this.text, this.x + (this.width / 2), this.y + (this.height / 2));
    }
}