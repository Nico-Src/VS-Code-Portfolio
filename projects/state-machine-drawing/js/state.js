class State{
    constructor(name, x, y, radius, color){
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius || 20;
        this.color = color || [255, 255, 255];
        this.connections = 0;
    }

    draw(ctx){
        // if this is the active state draw a red border
        if(editor.activeState === this) ctx.strokeStyle = "#f00";
        // else default white
        else ctx.strokeStyle = "#fff";

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
    }
}