<script setup>
import { reactive, onMounted } from 'vue';
import { Manager } from '../engine/manager';

const Empty = -1;
const Self = 0;
const Enemy = 1;
const manager = new Manager();
const arr = reactive(new Array(9));
for (let i = 0; i < arr.length; i++) {
    arr[i] = Empty;
}
const data=reactive({
    dialogVisible:false,
    message:"",
    gameOver:false,
})
function click(index) {
    if (data.gameOver || (arr[index] != Empty)) {
        return;
    }
    arr[index] = Self;
    let res = manager.solve(index);
    arr[res.index] = Enemy;
    if (res.gameStatus != null) {
        data.gameOver = true;
        data.message = res.gameStatus;
        data.dialogVisible = true;
        // console.log(data);
    }
    // console.log(arr);
}
function newGame(isfirst) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Empty;
    }
    let res = manager.newGame(isfirst);
    // console.log(res);
    if (res.index != undefined) {
        arr[res.index] = Enemy;
    }
    data.gameOver = false;
}
onMounted(() => {
    newGame(true);
})
</script>

<template>
    <div class="container">
        <div v-for="(item, index) in arr" :key="index" tabindex="-1" class='item' @click="click(index)">
            <el-icon v-if="arr[index] == Self" style="width:100%;height:100%">
                <Check />
            </el-icon>
            <el-icon v-if="arr[index] == Enemy" style="width:100%;height:100%">
                <Close />
            </el-icon>
        </div>
    </div>
    <br />
    <el-button @click="newGame(true)">重新开始（先手）</el-button>
    <el-button @click="newGame(false)">重新开始（后手）</el-button>
    <el-dialog v-model="data.dialogVisible" title="提示" width="30%" >
        <div>{{data.message}}</div>
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