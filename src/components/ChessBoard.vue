<script setup>
import { reactive, onMounted } from 'vue';
import { Manager } from '../engine/manager';

const BoardState = {
    Empty: -1,
    Self: 0,
    Enemy: 1
}
const manager = new Manager();
const arr = reactive(new Array(9).fill(BoardState.Empty));
const data = reactive({
    dialogVisible: false,
    message: "",
    gameOver: false,
    playerFirst: true,
    invincible: false,
})
function click(index) {
    if (data.gameOver || (arr[index] != BoardState.Empty)) {
        return;
    }
    arr[index] = BoardState.Self;
    let res = manager.selfMove(index);
    arr[res.index] = BoardState.Enemy;
    if (res.gameStatus != null) {
        data.gameOver = true;
        data.message = res.gameStatus;
        data.dialogVisible = true;
        // console.log(data);
    }
    // console.log(arr);
}
function newGame(isfirst, invincible) {
    arr.fill(BoardState.Empty);
    let res = manager.newGame(isfirst, invincible);
    // console.log(res);
    if (res.index != undefined) {
        arr[res.index] = BoardState.Enemy;
    }
    data.gameOver = false;
}
onMounted(() => {
    newGame(data.playerFirst, data.invincible);
})
</script>

<template>
    <div class="container">
        <div v-for="(item, index) in arr" :key="index" tabindex="-1" class='item' @click="click(index)">
            <el-icon v-if="arr[index] == BoardState.Self" style="width:100%;height:100%">
                <Check />
            </el-icon>
            <el-icon v-if="arr[index] == BoardState.Enemy" style="width:100%;height:100%">
                <Close />
            </el-icon>
        </div>
    </div>
    <br />
    <el-radio v-model="data.playerFirst" :label="true">先手</el-radio>
    <el-radio v-model="data.playerFirst" :label="false">后手</el-radio>
    <br />
    <el-radio v-model="data.invincible" :label="false">一般</el-radio>
    <el-radio v-model="data.invincible" :label="true">无敌</el-radio>
    <br />
    <el-button @click="newGame(data.playerFirst, data.invincible)">重新开始</el-button>
    <el-dialog v-model="data.dialogVisible" title="提示" width="30%">
        <div>{{ data.message }}</div>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="data.dialogVisible = false">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped lang="css">
.container {
    width: 160px;
    margin: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-row-gap: 5px;
    grid-column-gap: 5px;
}

.item {
    width: 50px;
    height: 50px;
    /* background-color: yellow; */
    border: 1px solid;
}

.item:hover {
    /* background-color: rgb(105, 196, 219); */
    cursor: pointer;
}
</style>