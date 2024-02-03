import { Chances,BoardState,Engine } from "./engine";
class Manager{
    constructor(){
        this.boardSate=new BoardState(Chances.Self);
        this.engine=new Engine();
    }
    newGame(isfirst){
        if(isfirst){
            this.boardSate=new BoardState(Chances.Enemy);
            return {index:null,gameStatus:null};
        }
        else{
            this.boardSate=new BoardState(Chances.Self);
            return this.f();
        }
    }
    solve(index){
        this.boardSate.setNextStep(index);
        if(this.boardSate.isFail()){
            let res= {index:null,gameStatus:"win"};
            return res;
        }
        // console.log("玩家下棋后棋盘状态:")
        // console.log(this.boardSate);
        return this.f();
    }
    f(){
        let nextSteps=this.engine.getNextSteps(this.boardSate);
        // console.log("可选下一步：");
        // console.log(nextSteps);
        let selectStep=-1;
        if(nextSteps.victorySteps.length>0){
            selectStep=nextSteps.victorySteps[Math.floor(Math.random()*nextSteps.victorySteps.length)];
        }
        else if(nextSteps.optionSteps.length>0){
            let tmp=nextSteps.optionSteps.filter(it=>!nextSteps.failSteps.includes(it))
            // console.log(tmp)
            if(tmp.length>0){
                selectStep=tmp[Math.floor(Math.random()*tmp.length)];
            }
            else{
                selectStep=nextSteps.optionSteps[Math.floor(Math.random()*nextSteps.optionSteps.length)];
            }
        }
        // else{
        //     selectStep=nextSteps.failSteps[Math.floor(Math.random()*nextSteps.victorySteps.length)];
        // }
        let res= {index:selectStep,gameStatus:null};
        this.boardSate.setNextStep(selectStep);
        // console.log("机器下棋后棋盘状态:")
        // console.log(this.boardSate);
        if(this.boardSate.isVictory()){
            res.gameStatus="lose";
        }
        // console.log("机器选择步骤以及结果：");
        // console.log(res);
        console.log(nextSteps);
        console.log(this.engine.getNextSteps(this.boardSate));
        return res;
    }
}export{Manager}