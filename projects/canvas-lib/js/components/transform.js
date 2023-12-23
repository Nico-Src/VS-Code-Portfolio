class Transform{
    constructor(position, rotation, scale, size){
        this.type = "transform";
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.size = size;

        this.aspectRatio = this.size.width / this.size.height;

        this.edgePoints = [];
        this.edgeSize = 40;

        this.initEdgePoints();
    }

    initEdgePoints(){
        this.edgePoints.push(new EdgePoint(this.position.x, this.position.y));
        this.edgePoints.push(new EdgePoint(this.position.x + this.size.width, this.position.y));
        this.edgePoints.push(new EdgePoint(this.position.x + this.size.width, this.position.y + this.size.height));
        this.edgePoints.push(new EdgePoint(this.position.x, this.position.y + this.size.height));
    }

    updateEdgePoints(position, size){
        if(!position || !size){
            this.edgePoints = [];
            this.initEdgePoints();
        } else {            
            this.edgePoints[0].x = position.x;
            this.edgePoints[0].y = position.y;

            this.edgePoints[1].x = position.x + size.width;
            this.edgePoints[1].y = position.y;

            this.edgePoints[2].x = position.x + size.width;
            this.edgePoints[2].y = position.y + size.height;

            this.edgePoints[3].x = position.x;
            this.edgePoints[3].y = position.y + size.height;

            // keep aspect ratio
            if(this.edgePoints[1].x - this.edgePoints[0].x < this.edgePoints[2].y - this.edgePoints[1].y){
                this.edgePoints[1].x = this.edgePoints[0].x + (this.edgePoints[2].y - this.edgePoints[1].y) * this.aspectRatio;
                this.edgePoints[2].x = this.edgePoints[3].x + (this.edgePoints[2].y - this.edgePoints[1].y) * this.aspectRatio;
            }

            if(this.edgePoints[2].x - this.edgePoints[1].x < this.edgePoints[2].y - this.edgePoints[1].y){
                this.edgePoints[1].x = this.edgePoints[0].x + (this.edgePoints[2].y - this.edgePoints[1].y) * this.aspectRatio;
                this.edgePoints[2].x = this.edgePoints[3].x + (this.edgePoints[2].y - this.edgePoints[1].y) * this.aspectRatio;
            }

            if(this.edgePoints[2].y - this.edgePoints[1].y < this.edgePoints[1].x - this.edgePoints[0].x){
                this.edgePoints[2].y = this.edgePoints[1].y + (this.edgePoints[1].x - this.edgePoints[0].x) / this.aspectRatio;
                this.edgePoints[3].y = this.edgePoints[0].y + (this.edgePoints[1].x - this.edgePoints[0].x) / this.aspectRatio;
            }

            if(this.edgePoints[2].y - this.edgePoints[1].y < this.edgePoints[2].x - this.edgePoints[1].x){
                this.edgePoints[2].y = this.edgePoints[1].y + (this.edgePoints[2].x - this.edgePoints[1].x) / this.aspectRatio;
                this.edgePoints[3].y = this.edgePoints[0].y + (this.edgePoints[2].x - this.edgePoints[1].x) / this.aspectRatio;
            }

            // update size
            this.size.width = this.edgePoints[1].x - this.edgePoints[0].x;
            this.size.height = this.edgePoints[2].y - this.edgePoints[1].y;

            // update edge point size
            this.edgeSize = this.size.width / 50;

            // update position
            this.position.x = this.edgePoints[0].x;
            this.position.y = this.edgePoints[0].y;
        }
    }

    draw(ctx){
        ctx.strokeStyle = "#3d77d4";
        ctx.fillStyle = "#3d77d4";
        ctx.lineWidth = 5;
        ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);

        // draw edge points
        for(let i = 0; i < this.edgePoints.length; i++){
            if(this.edgePoints[i]?.selected === true) ctx.fillStyle = "#ff0000";
            else ctx.fillStyle = "#3d77d4";
            ctx.beginPath();
            ctx.rect(this.edgePoints[i].x - (this.edgeSize / 2), this.edgePoints[i].y - (this.edgeSize / 2), this.edgeSize, this.edgeSize);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }

    getNearEdge(x,y){
        let nearEdge = undefined;
        for(let i = 0; i < this.edgePoints.length; i++){
            // if the mouse is around the edge point (+- 10px)
            if(x >= this.edgePoints[i].x - 20 && x <= this.edgePoints[i].x + 20 && y >= this.edgePoints[i].y - 20 && y <= this.edgePoints[i].y + 20){
                nearEdge = i;
                break;
            }
        }
        return nearEdge;
    }
}

class EdgePoint{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.selected = false;
    }
}