import { BoardState,Engine } from "./engine";
class Manager{
    constructor(){
        this.engine=new Engine();
        this.boardSate=null;
        this.playerFirst=null;
        this.invincible=null;
    }
    newGame(playerFirst,invincible){
        this.playerFirst=playerFirst;
        this.invincible=invincible;
        console.log(invincible);
        this.boardSate=new BoardState();
        return playerFirst?{index:null,gameStatus:null}:this.enemyMove();
    }
    solve(index){
        this.boardSate.setNextStep(index);
        let gameStatus=this.judgeGameStatus();
        return gameStatus==null?this.enemyMove():{index:null,gameStatus:gameStatus};
    }
    selectFrom(nextSteps){
        if(this.playerFirst){
            [nextSteps.victorySteps,nextSteps.failSteps]=[nextSteps.failSteps,nextSteps.victorySteps];
        }
        function choice(array){
            return array[Math.floor(Math.random()*array.length)];
        }
        let selectStep=-1;
        // console.log(this.invincible)
        if(this.invincible){//不可战胜模式，选择策略优先顺序为victorySteps>commonSteps>failSteps
            if(nextSteps.victorySteps.length>0){
                selectStep=choice(nextSteps.victorySteps);
            }
            else if(nextSteps.commonSteps.length>0){
                selectStep=choice(nextSteps.commonSteps);
            }
            else{
                selectStep=choice(nextSteps.failSteps);
            }
        }
        else{//一般模式，选择策略为随机
            let tmp=[];
            if(nextSteps.victorySteps.length>0){
                tmp.push(choice(nextSteps.victorySteps));
            }
            if(nextSteps.commonSteps.length>0){
                tmp.push(choice(nextSteps.commonSteps));
            }
            if(nextSteps.failSteps.length>0){
                tmp.push(choice(nextSteps.failSteps));
            }
            console.log(tmp);
            selectStep=choice(tmp);
        }

        return selectStep;
    }
    judgeGameStatus(){
        if(this.boardSate.isVictory()){
            return this.playerFirst?"win":"lose";
        }
        if(this.boardSate.isFail()){
            return this.playerFirst?"lose":"win";
        }
        if(this.boardSate.isDraw()){
            return "draw";
        }
        return null;
    }
    enemyMove(){
        let nextSteps=this.engine.getNextSteps(this.boardSate);
        let selectStep=this.selectFrom(nextSteps);
        this.boardSate.setNextStep(selectStep);
        let res= {index:selectStep,gameStatus:this.judgeGameStatus()};
        console.log(nextSteps);
        console.log(this.engine.getNextSteps(this.boardSate));
        return res;
    }
}export{Manager}