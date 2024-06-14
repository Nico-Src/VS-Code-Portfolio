class Hangman{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        // calculate aspect ratio of canvas style width and height computed style
        const computedStyle = getComputedStyle(this.canvas);
        const aspect = parseFloat(computedStyle.width) / parseFloat(computedStyle.height);
        this.canvas.width = 1000;
        this.canvas.height = this.canvas.width / aspect;

        this.solution = 'Testimony';
        const letters = 'abcdefghijklmnopqrstuvwxyz';

        this.revealedLetters = [];
        this.wrongLetters = [];

        this.states = [
            new State("1.png"),
            new State("2.png"),
            new State("3.png"),
            new State("4.png"),
            new State("5.png"),
            new State("6.png"),
            new State("7.png"),
            new State("8.png"),
        ];

        this.currentState = 0;

        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('keydown', (event)=>{
            // check if key is letter
            if(letters.includes(event.key)){
                if(this.solution.includes(event.key)){
                    if(!this.revealedLetters.includes(event.key)) this.revealedLetters.push(event.key);
                    this.updateSolution();
                } else {
                    if(!this.wrongLetters.includes(event.key)) this.wrongLetters.push(event.key);
                    this.currentState++;
                    this.updateWrong();
                }
            }
        });
    }

    start(){
        window.requestAnimationFrame(this.draw.bind(this));
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const state = this.states[this.currentState];
        if(state.imgLoaded){
            const center = {x: this.canvas.width / 2, y: this.canvas.height / 2};
            const aspect = state.img.width / state.img.height;
            const imageWidth = this.canvas.height * aspect;
            this.ctx.drawImage(state.img, center.x - imageWidth / 2 + 20, center.y - this.canvas.height / 2, imageWidth,this.canvas.height);
        }

        window.requestAnimationFrame(this.draw.bind(this));
    }

    resize(){
        const computedStyle = getComputedStyle(this.canvas);
        const aspect = parseFloat(computedStyle.width) / parseFloat(computedStyle.height);
        this.canvas.width = 1000;
        this.canvas.height = this.canvas.width / aspect;
        console.log(this.canvas.width);
    }

    updateSolution(){
        const letters = Array.from(document.querySelectorAll("#solution .letter"));
        for(let i = 0; i < this.solution.length; i++){
            if(this.revealedLetters.includes(this.solution[i].toLowerCase())){
                letters[i].innerHTML = this.solution[i];
            }
        }
    }

    updateWrong(){
        const wrongWrapper = document.querySelector("#wrong");
        const wrong = this.wrongLetters.map((letter,index) => `<div class="letter"><s>${letter.toUpperCase()}${index === this.wrongLetters.length - 1 ? "" : ","}</s></div>`).join('');
        wrongWrapper.innerHTML = wrong;
    }
}

class State{
    constructor(img){
        this.imgLoaded = false;
        this.img = new Image();
        this.img.onload = () => {
            this.imgLoaded = true;
        };
        this.img.src = `./img/${img}`;
    }
}