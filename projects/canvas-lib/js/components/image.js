class ImageComponent{
    constructor(image){
        this.type = "image";
        this.image = image;

        this.size = {
            width: this.image.width,
            height: this.image.height
        };

        this.position = {
            x: 0,
            y: 0
        };

        this.rotation = {
            x: 0,
            y: 0,
        };

        this.scale = {
            x: 1,
            y: 1
        };

        this.selected = false;
        this.transform = new Transform(this.position, this.rotation, this.scale, this.size);
    }

    draw(ctx){
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);

        if(this.selected) this.transform.draw(ctx);
    }
}