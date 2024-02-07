const Chances = {
    Self: Symbol('self'),
    Enemy: Symbol('enemy')
}
const BoardSize=9;
const ALL=(1<<BoardSize) -1;
const VictorySates=[
    (1<<0)|(1<<3)|(1<<6),
    (1<<1)|(1<<4)|(1<<7),
    (1<<2)|(1<<5)|(1<<8),
    (1<<0)|(1<<1)|(1<<2),
    (1<<3)|(1<<4)|(1<<5),
    (1<<6)|(1<<7)|(1<<8),
    (1<<0)|(1<<4)|(1<<8),
    (1<<2)|(1<<4)|(1<<6),
]
function toArray(state){
    let res=[];
    for(let i=0;i<BoardSize;i++){
        if(state &(1<<i)){
            res.push(i);
        }
    }
    return res;
}
class BoardState{
    constructor(chance=Chances.Self){//默认构造以己方为先手
        this.chance=chance;
        this.selfState=0;
        this.enemyState=0;
    }
    setNextStep(index){
        if(this.chance==Chances.Self){
            this.selfState |=1<<index;
            this.chance =Chances.Enemy;
        }
        else{
            this.enemyState |=1<<index;
            this.chance=Chances.Self;
        }
    }
    _getOptionalBits(){
        return ALL^(this.selfState|this.enemyState);
    }
    getOptionalSteps(){
        return toArray(this._getOptionalBits());
    }
    isDraw(){
        return this._getOptionalBits()==0;
    }
    isVictory(){//满足获胜条件，棋局终止
        return this.chance==Chances.Enemy&&VictorySates.some(it=>(it&this.selfState)==it);
    }
    isFail(){
        return this.chance==Chances.Self&&VictorySates.some(it=>(it&this.enemyState)==it);
    }
    hash(){
        return (this.selfState<<BoardSize)|(this.enemyState);
    }
}
class Record extends BoardState{
    constructor(){
        super();
        this.victorySteps=0;
        this.failSteps=0;
    }
    getCommonSteps(){
        return toArray(this._getOptionalBits()^(this.victorySteps|this.failSteps));
    }
    setVictorySteps(step){
        this.victorySteps |=1<<step;
    }
    getVictorySteps(){
        return toArray(this.victorySteps);
    }
    setFailSteps(step){
        this.failSteps |=1<<step;
    }
    getFailSteps(){
        return toArray(this.failSteps);
    }
    willbeVictory(){//处于必胜态
        if(this.isVictory()){
            return true;
        }
        if(this.chance==Chances.Enemy){
            let optionSteps=this._getOptionalBits();
            if(optionSteps!=0&&optionSteps==this.victorySteps){
                return true;
            }
        }
        else{
            if(this.victorySteps!=0){
                return true;
            }
        }
        return false;
    }
    willbeFail(){//处于必败状态
        if(this.isFail()){
            return true;
        }
        if(this.chance==Chances.Enemy){
            if(this.failSteps!=0){
                return true;
            }
        }
        else{
            let optionSteps=this._getOptionalBits();
            if(optionSteps!=0&&optionSteps==this.failSteps){
                return true;
            }
        }
        return false;
    }
}
class Engine{
    constructor(){
        this.dictionary=new Map()//记录Record的hash:Record
        let initRecord=new Record();//己方先手
        this.dfs(initRecord);
        console.log(this.dictionary.size);
    }
    dfs(record){
        if(!(record.isVictory()|| record.isFail())){
            let tmp=Object.assign(Object.create(Object.getPrototypeOf(record)), record);
            for(let step of tmp.getOptionalSteps()){
                let nextRecord=Object.assign(Object.create(Object.getPrototypeOf(tmp)), tmp);
                nextRecord.setNextStep(step);
                this.dfs(nextRecord);
                if(nextRecord.willbeVictory()){
                    record.setVictorySteps(step);
                }
                else if(nextRecord.willbeFail()){
                    record.setFailSteps(step);
                }
            }
        }
        this.dictionary.set(record.hash(),record);
    }

    //state为BoardState类型
    //返回值为一个对象，分别为可选步(不包括必胜步和必败步)，必胜步，必败步
    getNextSteps(state){
        let record= this.dictionary.get(state.hash());
        return {
            commonSteps: record.getCommonSteps(),
            victorySteps: record.getVictorySteps(),
            failSteps: record.getFailSteps(),
        }
    }
}
// new Engine();
export{BoardState,Engine};