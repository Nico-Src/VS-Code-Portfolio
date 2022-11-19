class State{
    constructor(name, x, y, radius, color, isStart){
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius || 20;
        this.color = color || [255, 255, 255];
        this.connections = 0;
        this.selected = false;
        this.isStart = isStart == undefined ? false : isStart;
    }

    draw(ctx){
        // if this is the active state draw a red border
        if(editor.activeState === this) ctx.strokeStyle = "green";
        // else default white
        else ctx.strokeStyle = "#fff";

        if(this.selected) ctx.strokeStyle = "yellow";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "12px Poppins";
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "#fff";
        ctx.fillText(this.name, this.x, this.y);
        ctx.fillStyle = "#333";

        // draw small green dot in the top right corner if this is the start state
        if(this.isStart){
            ctx.beginPath();
            ctx.arc(this.x + this.radius * .5, this.y - this.radius * .5, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = "green";
            ctx.fill();
            ctx.closePath();
            ctx.fillStyle = "#333";
        }
    }
}