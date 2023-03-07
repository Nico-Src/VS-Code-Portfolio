class Dot{
    constructor(x, y,type){
        // generate random id
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.x = x;
        this.y = y;
        this.type = type;
    }

    draw(ctx){
        ctx.fillStyle='black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}