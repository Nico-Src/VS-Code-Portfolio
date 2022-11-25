class Block{
    constructor(x, y,width,height,size){
        // generate random id
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.x = x || 0;
        this.y = y || 0;
        this.width = width;
        this.height = height;
        this.size = size;
        this.values = []; // list of values
        this.children = []; // list of children

        this.tree = null; // the tree this block belongs to
        this.parent = null; // the parent of this block

        this.dots = []; // list of dots
        this.fields = []; // list of fields

        // one dot on the top middle of the block
        this.dots.push(new Dot(this.x + this.width / 2, this.y - 2,"top"));

        // draw dots on the lines
        for(let i = 0; i <= this.size; i++){
            this.dots.push(new Dot(this.x + i * this.width / this.size, this.y + this.height,"bottom"));
        }

        // draw fields
        for(let i = 0; i < this.size; i++){
            this.fields.push(new EditField(this.x + i * this.width / this.size, this.y, this.width / this.size, this.height,this));
        }
    }

    update(){
        // update the dots
        this.dots[0].x = this.x + this.width / 2;
        this.dots[0].y = this.y - 2;
        for(let i = 0; i <= this.size; i++){
            this.dots[i + 1].x = this.x + i * this.width / this.size;
            this.dots[i + 1].y = this.y + this.height;
        }

        // update the fields
        for(let i = 0; i < this.size; i++){
            this.fields[i].x = this.x + i * this.width / this.size;
            this.fields[i].y = this.y;
            this.fields[i].width = this.width / this.size;
            this.fields[i].height = this.height;
        }
    }

    draw(ctx){
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.stroke();

        // draw seperators
        const seperators = this.size - 1;
        for(let i = 0; i < seperators; i++){
            ctx.beginPath();
            ctx.moveTo(this.x + (i + 1) * this.width / this.size, this.y);
            ctx.lineTo(this.x + (i + 1) * this.width / this.size, this.y + this.height);
            ctx.closePath();
            ctx.stroke();
        }

        // draw block values in the spaces between the lines
        ctx.font = "14px Poppins";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for(let i = 0; i < this.size; i++){
            ctx.fillText(this.values[i] || "-", this.x + (i + 0.5) * this.width / this.size, this.y + this.height / 2);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";

        for(let i = 0; i < this.fields.length; i++){
            this.fields[i].draw(ctx);
        }

        for(let i = 0; i < this.dots.length; i++){
            this.dots[i].draw(ctx);
        }
    }
}