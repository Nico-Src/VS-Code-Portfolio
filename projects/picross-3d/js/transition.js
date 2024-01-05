class Transition{
    constructor(target, prop, to, from, type, step){
        this.target = target;
        this.prop = prop;
        this.to = to;
        this.from = from;
        this.type = type;
        this.step = step || 0.01;
    }
}