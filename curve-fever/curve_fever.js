class Line{

    constructor(a,b){
      this.array=[];
      this.array.push([a,b]);
      this.head = [a,b];
      this.interruption = false;
      this.currentColor = currentFromColor;
      this.colorCounter = 0;
      this.interruptionInterval = setInterval(this.randomInterval.bind(this), Math.random() * 1000 + 1000);
      this.colorCounterMode = "increment";
    }

    removeInterruption(){
        this.interruption = false;
    }

    randomInterval(){
        this.interruption = true;
        var rndDuration = Math.floor((Math.random() * 500 + 250));
        setTimeout(this.removeInterruption.bind(this), rndDuration);
    }
  
    add_position(a,b){
        this.array.push([a,b]);
    }
  
    // the only thing needed to move is the angle
    move(angle)
    {
        if(this.array.length % 200 === 0){
            //clearInterval(this.interruptionInterval);
            //this.interruptionInterval = setInterval(this.randomInterval.bind(this), Math.random() * 1000 + 1000);
        }

        if(this.colorCounter === 100){
            this.colorCounterMode = "decrement";
        }
        else if(this.colorCounter === 0){
            this.colorCounterMode  = "increment";
        }

        if(this.colorCounterMode === "decrement") this.colorCounter--;
        else if(this.colorCounterMode === "increment") this.colorCounter++;

        this.currentColor = lerpColor(currentFromColor, currentToColor, (this.colorCounter) / 100.0);
        //this.currentColor = color(255,255,255);
        var a=this.array[this.array.length-2];
        var b=this.array[this.array.length-1];
        var vectorx=(b[0]-a[0])
        var vectory=(b[1]-a[1])
        // we take the vector of the previous move
    
        // we apply a rotation matrix
        var x=vectorx*Math.cos(angle)-vectory*Math.sin(angle)
        var y=vectorx*Math.sin(angle)+vectory*Math.cos(angle)
    
        // and add this new vector to the last coord
        var new_x=b[0]+x
        var new_y=b[1]+y
    
        // print("distance",((new_x-b[0])**2+(new_y-b[1])**2)**0.5)
        this.head = [new_x,new_y];
        if(this.interruption === false) this.array.push([new_x,new_y,'player']);
        else this.array.push([new_x,new_y,'empty']);
    }
  
    // we only display the last line
    display()
    {
        for(var i=this.array.length-10;i<this.array.length-1;i++)
        {
            if(this.array[i]){
                if(this.array[i][2] === 'player' && this.array[i+1][2] === 'player') {
                    line(this.array[i][0],this.array[i][1],this.array[i+1][0],this.array[i+1][1]);
                }
                else {
                    drawingContext.shadowBlur = 0;
                    drawingContext.shadowColor = color(0,0,0,0);
                }
            }
        }

        if(bloom === true){
            drawingContext.shadowBlur = 32;
            drawingContext.shadowColor = this.currentColor;
        }
        line(this.head[0],this.head[1],this.head[0],this.head[1]);
    }
  
    // display line foreach player
    display_lines(line){
        stroke(this.currentColor);
        strokeWeight(lineWidth);
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = color(0,0,0,0);
        line.display();
    }

    resetHeadEnvironment(){
        fill(0,0,0);
        stroke(0,0,0,0);
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = color(0,0,0,0);
        ellipse(this.head[0], this.head[1], 22,22);
    }
  
    // check if the game is ended
    static is_ended(player_lines)
    {
      // check if someone get trough a wall
      for (var i=0;i<player_lines.length;i++)
      {
        for (var k=0;k<2;k++)
        {
          var x=player_lines[i].array[player_lines[i].array.length-1][k];
          if (x<=0 || x>=dimension)
          {
            print(true);
            return true;
          }
        }
      }
  
      // check if a line get trough another one or itself
      for (var i=0;i<player_lines.length;i++)
      {
        for (var j=0;j<player_lines.length;j++)
        {
          for(var k=0;k<player_lines[j].array.length;k++)
          {
            var x = player_lines[i].array[player_lines[i].array.length-1]
            var y = player_lines[j].array[k]
            var type = player_lines[j].array[k][2];
            if (Math.abs(x[0]-y[0])<lineWidth*0.8 && (Math.abs(x[1]-y[1])<lineWidth*0.8) && type !== 'empty')
            {
              if(i==j && k<player_lines[j].array.length-lineWidth-1)
              {
                print('Dead');
                return i;
              }
              else if (i!=j)
              {
                print("Dead");
                return i;
              }
            }
          }
        }
      }
      return -1;
    }
}