const BoardSize = 9;
const ALL = (1 << BoardSize) - 1;
const VictorySates = [
    (1 << 0) | (1 << 3) | (1 << 6),
    (1 << 1) | (1 << 4) | (1 << 7),
    (1 << 2) | (1 << 5) | (1 << 8),
    (1 << 0) | (1 << 1) | (1 << 2),
    (1 << 3) | (1 << 4) | (1 << 5),
    (1 << 6) | (1 << 7) | (1 << 8),
    (1 << 0) | (1 << 4) | (1 << 8),
    (1 << 2) | (1 << 4) | (1 << 6),
]
function toArray(state) {
    let res = [];
    for (let i = 0; i < BoardSize; i++) {
        if (state & (1 << i)) {
            res.push(i);
        }
    }
    return res;
}
class BoardState {
    constructor() {
        //默认chance初始值为0，即0先手，1后手
        this.chance = 0;
        this.states = [0, 0];
    }
    setNextStep(index) {
        this.states[this.chance] |= 1 << index;
        this.chance ^= 1;
    }
    _getOptionalBits() {
        return ALL ^ (this.states[0] | this.states[1]);
    }
    getOptionalSteps() {
        return toArray(this._getOptionalBits());
    }
    isDraw() {
        return this._getOptionalBits() == 0;
    }
    //判断当前棋手是否失败
    isFail() {
        let prePlayer = this.chance ^ 1;
        return VictorySates.some(it => (it & this.states[prePlayer]) == it);
    }
    hash() {
        return (this.states[0] << BoardSize) | (this.states[1]);
    }
}
class Record extends BoardState {
    constructor() {
        super();
        this.victorySteps = 0;
        this.failSteps = 0;
    }
    //copy函数访问了父类变量，如何改进？
    copy() {
        let ret = new Record();
        ret.chance = this.chance;
        ret.states[0] = this.states[0];
        ret.states[1] = this.states[1];
        ret.victorySteps = this.victorySteps;
        ret.failSteps = this.failSteps;
        return ret;
    }
    setVictorySteps(step) {
        this.victorySteps |= 1 << step;
    }
    getVictorySteps() {
        return toArray(this.victorySteps);
    }
    setFailSteps(step) {
        this.failSteps |= 1 << step;
    }
    getFailSteps() {
        return toArray(this.failSteps);
    }
    //当前棋手是否处于必胜态
    willbeVictory() {
        return this.victorySteps != 0;
    }
    //当前棋手是否处于必败状态
    willbeFail() {
        if (this.isFail()) {
            return true;
        }
        let optionSteps = this._getOptionalBits();
        return optionSteps != 0 && optionSteps == this.failSteps;
    }
}
class Engine {
    constructor() {
        this.dictionary = new Map()//记录Record的hash:Record
        let initRecord = new Record();
        this.dfs(initRecord);
        console.log(this.dictionary.size);
    }
    dfs(record) {
        if (!record.isFail()) {
            let tmp = record.copy();
            for (let step of tmp.getOptionalSteps()) {
                let nextRecord = tmp.copy();
                nextRecord.setNextStep(step);
                //避免重复搜索棋面
                if (this.dictionary.has(nextRecord.hash())) {
                    nextRecord=this.dictionary.get(nextRecord.hash());
                }
                else{
                    this.dfs(nextRecord);
                }
                if (nextRecord.willbeVictory()) {
                    record.setFailSteps(step);
                }
                else if (nextRecord.willbeFail()) {
                    record.setVictorySteps(step);
                }
            }
        }
        this.dictionary.set(record.hash(), record);
    }

    //state为BoardState类型
    //返回值为一个对象，分别为可选步(不包括必胜步和必败步)，必胜步，必败步
    getNextSteps(state) {
        let record = this.dictionary.get(state.hash());
        return {
            victorySteps: record.getVictorySteps(),
            failSteps: record.getFailSteps(),
            optionalSteps: record.getOptionalSteps(),
        }
    }
}
export { BoardState, Engine };