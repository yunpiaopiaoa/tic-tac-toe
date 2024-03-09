import { BoardState, Engine } from "./engine";
class Manager {
    constructor() {
        this.engine = new Engine();
        this.boardSate = null;
        this.playerFirst = null;
        this.invincible = null;
    }
    newGame(playerFirst, invincible) {
        this.playerFirst = playerFirst;
        this.invincible = invincible;
        this.boardSate = new BoardState();
        return playerFirst ? { index: null, gameStatus: null } : this.enemyMove();
    }
    selfMove(index) {
        this.boardSate.setNextStep(index);
        let gameStatus = null;
        if (this.boardSate.isFail()) {
            gameStatus = "win";
        }
        else if (this.boardSate.isDraw()) {
            gameStatus = "draw";
        }
        return gameStatus == null ? this.enemyMove() : { index: null, gameStatus: gameStatus };
    }
    enemyMove() {
        let nextSteps = this.engine.getNextSteps(this.boardSate);
        let selectStep = this.selectFrom(nextSteps);
        this.boardSate.setNextStep(selectStep);
        let gameStatus = null;
        if (this.boardSate.isFail()) {
            gameStatus = "lose";
        }
        else if (this.boardSate.isDraw()) {
            gameStatus = "draw";
        }
        // console.log(nextSteps);
        // console.log(this.engine.getNextSteps(this.boardSate));
        return { index: selectStep, gameStatus: gameStatus };
    }
    selectFrom(nextSteps) {
        function choice(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        let selectStep = -1;
        if (this.invincible) {//不可战胜模式，选择策略优先顺序为victorySteps>commonSteps>failSteps
            if (nextSteps.victorySteps.length > 0) {
                selectStep = choice(nextSteps.victorySteps);
            }
            else {
                let commonSteps = nextSteps.optionalSteps.filter(step => !nextSteps.failSteps.includes(step));
                if (commonSteps.length > 0) {
                    selectStep = choice(commonSteps);
                }
                else {
                    selectStep = choice(nextSteps.failSteps);
                }
            }
        }
        else {//一般模式，选择策略为随机
            selectStep = choice(nextSteps.optionalSteps);
        }
        return selectStep;
    }
} export { Manager }