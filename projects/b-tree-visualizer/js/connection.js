class Connection{
    constructor(source, target, input){
        this.source = source;
        this.target = target;
        this.selected = false;
    }

    draw(ctx,connections){
        // if the connection is not complete skip it
        if(!this.source || !this.target) return;

        // draw the line
        ctx.beginPath();
        ctx.moveTo(this.source.x, this.source.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.stroke();
        ctx.closePath();
    }

    /** get point on line */
    getPointOnLine(distance){ // ANCHOR getPointOnLine
        const dx = this.target.x - this.source.x;
        const dy = this.target.y - this.source.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unit = distance / length;

        return {
            x: this.source.x + dx * unit,
            y: this.source.y + dy * unit
        };
    }

    isNear(x,y){
        const middle = this.getPointOnLine(0.5 * this.getLength());
        // subtract offset to get the right position of the line
        const dx = x - middle.x - this.offsetX;
        const dy = y - middle.y - this.offsetY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return {isNear: distance < 25, distance: distance};
    }
}