class Connection{
    constructor(source, target){
        this.source = source;
        this.target = target;
        this.progress = 0;
        this.input = '0';
        this.selected = false;
    }

    draw(ctx,connections){
        // if the connection is not complete skip it
        if(!this.source || !this.target) return;
        // check if there are any other connections between these two states
        const otherConnections = connections.filter(c => (c.source === this.source && c.target === this.target) || (c.source === this.target && c.target === this.source));
        // get index subtracted by half of the item count (to distribute the connections evenly)
        const index = otherConnections.indexOf(this) - Math.floor(otherConnections.length / 2.0);

        const offset = 17.5;
        const characterWidth = 7.5;
        const lineLength = this.getLength();

        // calculate angle in degrees
        const angle = Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x) * 180 / Math.PI;
        // calculate line progress length
        const currentProgress = Math.min(this.progress, 1) * lineLength;
        // calculate the point on the line where the progress stops right now
        const progressPoint = this.getPointOnLine(currentProgress);

        // if source and target are the same state (loop)
        if(this.source === this.target){
            // 3 lines to draw
            const line1 = {source: {x: this.source.x - 10, y: this.source.y - 15}, target: {x: this.source.x - 10, y: this.source.y - 35}};
            const line2 = {source: {x: this.source.x - 10, y: this.source.y - 35}, target: {x: this.source.x + 10, y: this.source.y - 35}};
            const line3 = {source: {x: this.source.x + 10, y: this.source.y - 35}, target: {x: this.source.x + 10, y: this.source.y - 15}};

            // progress set to progress * 3 (because there are 3 lines)
            let tmpProgress = Math.min(this.progress, 1) * 3;

            // calculate progress length and progress percentage for each line
            const line1Length = (tmpProgress > 0) ? this.calcLength(line1.source, line1.target) * (tmpProgress > 1 ? 1 : tmpProgress) : 0;
            const line1Progress = (tmpProgress > 1 ? 1 : tmpProgress);
            tmpProgress -= 1;
            const line2Length = (tmpProgress > 0) ? this.calcLength(line2.source, line2.target) * (tmpProgress > 1 ? 1 : tmpProgress) : 0;
            const line2Progress = (tmpProgress > 1 ? 1 : tmpProgress);
            tmpProgress -= 1;
            const line3Length = (tmpProgress > 0) ? this.calcLength(line3.source, line3.target) * (tmpProgress > 1 ? 1 : tmpProgress) : 0;
            const line3Progress = (tmpProgress > 1 ? 1 : tmpProgress);

            // get the point on each line where the progress stops right now
            const progressP1 = this.getPointOnCustomLine(line1Length * Math.min(line1Progress,1),line1);
            const progressP2 = this.getPointOnCustomLine(line2Length * Math.min(line2Progress,1),line2);
            const progressP3 = this.getPointOnCustomLine(line3Length * Math.min(line3Progress,1),line3);

            const middle2 = this.getPointOnCustomLine(this.calcLength(line2.source, line2.target) * 0.5,line2);

            ctx.save();
            // draw text in the middle of the line
            ctx.font = "12px Poppins";
            ctx.textAlign = "center";
            ctx.baseLine = "middle";
            // rotate text to be parallel to line and always upright
            ctx.translate(middle2.x, middle2.y);
            if(line2.target.x > line2.source.x){
                ctx.rotate(Math.atan((line2.target.y - line2.source.y) / (line2.target.x - line2.source.x)));
            } else {
                ctx.rotate(Math.atan((line2.target.y - line2.source.y) / (line2.target.x - line2.source.x)) + Math.PI/100);
            }
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.rect(-((characterWidth / 2.0) + (this.input.length * (characterWidth / 2.0))), -20, (this.input.length * characterWidth + characterWidth), 15);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillText(this.input, 0, -10);
            if(line2.target.x > line2.source.x){
                ctx.rotate(-Math.atan((line2.target.y - line2.source.y) / (line2.target.x - line2.source.x)));
            } else {
                ctx.rotate(-Math.atan((line2.target.y - line2.source.y) / (line2.target.x - line2.source.x)) - Math.PI/100);
            }
            ctx.translate(-middle2.x, -middle2.y);
            ctx.restore();

            ctx.strokeStyle = 'white';

            // draw the lines
            if(line1Length > 0){
                // progress in green
                ctx.strokeStyle = 'green';
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(this.source.x - 10, this.source.y - 15);
                ctx.lineTo(progressP1.x, progressP1.y);
                ctx.stroke();
                ctx.closePath();

                // rest in white
                ctx.strokeStyle = 'white';
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(progressP1.x, progressP1.y);
                ctx.lineTo(this.source.x - 10, this.source.y - 35);
                ctx.stroke();
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.moveTo(this.source.x - 10, this.source.y - 15);
                ctx.lineTo(this.source.x - 10, this.source.y - 35);
                ctx.closePath();
                ctx.stroke();
            }

            if(line2Length > 0){
                // progress in green
                ctx.strokeStyle = 'green';
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(this.source.x - 10, this.source.y - 35);
                ctx.lineTo(progressP2.x, progressP2.y);
                ctx.stroke();
                ctx.closePath();

                // rest in white
                ctx.strokeStyle = 'white';
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(progressP2.x, progressP2.y);
                ctx.lineTo(this.source.x + 10, this.source.y - 35);
                ctx.stroke();
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.moveTo(this.source.x - 10, this.source.y - 35);
                ctx.lineTo(this.source.x + 10, this.source.y - 35);
                ctx.closePath();
                ctx.stroke();
            }

            if(line3Length > 0){
                // progress in green
                ctx.strokeStyle = 'green';
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(this.source.x + 10, this.source.y - 35);
                ctx.lineTo(progressP3.x, progressP3.y);
                ctx.stroke();
                ctx.closePath();

                // rest in white
                ctx.strokeStyle = 'white';
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(progressP3.x, progressP3.y);
                ctx.lineTo(this.source.x + 10, this.source.y - 15);
                ctx.stroke();
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.moveTo(this.source.x + 10, this.source.y - 35);
                ctx.lineTo(this.source.x + 10, this.source.y - 15);
                ctx.closePath();
                ctx.stroke();
            }
        } else {
            if((Math.abs(angle) > 45 && Math.abs(angle) < 135) || (Math.abs(angle) > 225 && Math.abs(angle) < 315)){
                // save offsets for calculations
                this.offsetX = index * offset;
                this.offsetY = 0;

                // progress in green
                ctx.beginPath();
                ctx.moveTo(this.source.x  + (index * offset), this.source.y);
                ctx.lineTo(progressPoint.x  + (index * offset), progressPoint.y);
                ctx.strokeStyle = "#0f0";
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.stroke();
                ctx.closePath();
    
                // else in white
                ctx.beginPath();
                ctx.moveTo(progressPoint.x  + (index * offset), progressPoint.y);
                ctx.lineTo(this.target.x  + (index * offset), this.target.y);
                ctx.strokeStyle = "#fff";
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.stroke();
                ctx.closePath();


                const middle = this.getPointOnLine(0.75 * lineLength);
                ctx.save();
                // draw text in the middle of the line
                ctx.font = "12px Poppins";
                ctx.textAlign = "center";
                ctx.baseLine = "middle";
                // rotate text to be parallel to line and always upright
                ctx.translate(middle.x + (index * offset), middle.y);
                if(this.target.x > this.source.x){
                    ctx.rotate(Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)));
                } else {
                    ctx.rotate(Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)) + Math.PI/100);
                }
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                ctx.rect(-((characterWidth / 2.0) + (this.input.length * (characterWidth / 2.0))), -10, (this.input.length * characterWidth + characterWidth), 15);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.fillText(this.input, 0, 3);
                if(this.target.x > this.source.x){
                    ctx.rotate(-Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)));
                } else {
                    ctx.rotate(-Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)) - Math.PI/100);
                }
                ctx.translate(-(middle.x + index * offset), -middle.y);
                ctx.restore();
            }
            else {
                // save offsets for calculations
                this.offsetX = 0;
                this.offsetY = index * offset;

                // progress in green
                ctx.beginPath();
                ctx.moveTo(this.source.x, this.source.y + (index * offset));
                ctx.lineTo(progressPoint.x, progressPoint.y + (index * offset));
                ctx.strokeStyle = "#0f0";
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.stroke();
                ctx.closePath();
    
                // else in white
                ctx.beginPath();
                ctx.moveTo(progressPoint.x, progressPoint.y + (index * offset));
                ctx.lineTo(this.target.x, this.target.y + (index * offset));
                ctx.strokeStyle = "#fff";
                if(this.selected) ctx.strokeStyle = 'yellow';
                ctx.stroke();
                ctx.closePath();

                const middle = this.getPointOnLine(0.75 * lineLength);
                ctx.save();
                // draw text in the middle of the line
                ctx.font = "12px Poppins";
                ctx.textAlign = "center";
                ctx.baseLine = "middle";
                // rotate text to be parallel to line and always upright
                ctx.translate(middle.x, middle.y  + (index * offset));
                if(this.target.x > this.source.x){
                    ctx.rotate(Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)));
                } else {
                    ctx.rotate(Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)) + Math.PI/100);
                }
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                ctx.rect(-((characterWidth / 2.0) + (this.input.length * (characterWidth / 2.0))), -10, (this.input.length * characterWidth + characterWidth), 15);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.fillText(this.input, 0, 2);
                if(this.target.x > this.source.x){
                    ctx.rotate(-Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)));
                } else {
                    ctx.rotate(-Math.atan((this.target.y - this.source.y) / (this.target.x - this.source.x)) - Math.PI/100);
                }
                ctx.translate(-middle.x, -(middle.y + index * offset));
                ctx.restore();
            }
        }

        ctx.fillStyle = "#fff";
        if(this.selected) ctx.strokeStyle = 'yellow';
        // calculate point on line to draw the arrow (middle of the line)
        const arrowPoint = this.getPointOnLine(lineLength * 0.5);
        const arrowSize = 5;

        // angle > 45 && angle < 135 || angle > 225 && angle < 315 => line is horizontal (offset applied on x)
        // else => line is vertical (offset applied on y)
        if((Math.abs(angle) > 45 && Math.abs(angle) < 135) || (Math.abs(angle) > 225 && Math.abs(angle) < 315)){
            ctx.save();
            ctx.translate(arrowPoint.x + (index * offset), arrowPoint.y);
            ctx.rotate(Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x) + Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, arrowSize);
            ctx.lineTo(arrowSize, arrowSize);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        else {
            ctx.save();
            ctx.translate(arrowPoint.x, arrowPoint.y + (index * offset));
            ctx.rotate(Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x) + Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, arrowSize);
            ctx.lineTo(arrowSize, arrowSize);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    /** calculate length of two points */
    calcLength(a,b){ // ANCHOR calcLength
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** calculate length of connection */
    getLength(){ // ANCHOR getLength
        const dx = this.target.x - this.source.x;
        const dy = this.target.y - this.source.y;
        return Math.sqrt(dx * dx + dy * dy);
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

    /** get point on custom line */
    getPointOnCustomLine(distance, line){ // ANCHOR getPointOnCustomLine
        const dx = line.target.x - line.source.x;
        const dy = line.target.y - line.source.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unit = distance / length;

        return {
            x: line.source.x + dx * unit,
            y: line.source.y + dy * unit
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