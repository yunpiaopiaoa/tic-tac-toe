const Chances = {
    Self: Symbol('self'),
    Enemy: Symbol('enemy')
}
const boardSize=9;
const ALL=(1<<boardSize) -1;
const victorySates=[
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
    for(let i=0;i<boardSize;i++){
        if(state &(1<<i)){
            res.push(i);
        }
    }
    return res;
}
class BoardState{
    constructor(chance){//chance为Chances类型
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
    getOptionalSteps(){
        let optionSteps=ALL^(this.selfState|this.enemyState);
        return toArray(optionSteps);
    }
    isVictory(){//满足获胜条件，棋局终止
        return this.chance==Chances.Enemy&&victorySates.some(it=>(it&this.selfState)==it);
    }
    isFail(){
        return this.chance==Chances.Self&&victorySates.some(it=>(it&this.enemyState)==it);
    }
    hash(){
        return (this.selfState<<boardSize)|(this.enemyState);
    }
}
class Record extends BoardState{
    constructor(chance){
        super(chance);
        this.victorySteps=0;
        this.failSteps=0;
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
            let optionSteps=ALL^(this.selfState|this.enemyState);
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
            let optionSteps=ALL^(this.selfState|this.enemyState);
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
        let initRecord1=new Record(Chances.Self);//己方先手
        let initRecord2=new Record(Chances.Enemy);//对方先手
        // this.dfs(initRecord1);
        this.dfs(initRecord2);
        console.log(this.dictionary.size);
    }
    dfs(record){
        if(!(record.isVictory()|| record.isFail())){
            let tmp=Object.assign(Object.create(Object.getPrototypeOf(record)), record);
            for(let step of record.getOptionalSteps()){
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
        // console.log(this);
        this.dictionary.set(record.hash(),record);
    }

    //state为BoardState类型
    //返回值为一个对象，分别为可选步，必胜步，必败步
    getNextSteps(state){
        let record= this.dictionary.get(state.hash());
        console.log(record);
        return {
            optionSteps: record.getOptionalSteps(),
            victorySteps: record.getVictorySteps(),
            failSteps: record.getFailSteps(),
        }
    }
}
// new Engine();
export{Chances,BoardState,Engine};