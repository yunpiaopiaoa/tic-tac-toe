# tic-tac-toe井字棋

## 项目安装和运行
安装
```
npm install
```
运行
```
npm run serve
```

### 项目结构
src/components/ChessBoard.vue 井字棋的界面组件：可选择先后手和难度，具备胜负和弹窗提示

src/engine/engine.js:井字棋的引擎，可查询某一棋局局面下的可选着、必胜着、必负着。

src/engine/manager.js:棋局管理器。维护棋局局面，对于玩家的一个棋着，向引擎查询下一棋着的集合，根据玩家选择的难度选择其中一个棋着。


### 井字棋引擎
对于棋盘格子编号为0-8，由于编号较少，考虑使用二进制串存储棋盘。这样，胜利棋局棋面VictorySates仅有八种情况。

BoardState类：
+ 成员变量
  + chance：下一步棋权，取值为Chances.Self(己方)或者Chance.Enemy(敌方)。
  + selfState：己方下棋的格子的集合，例如0b000000101表示己方在格子0和2下了棋着。
  + enemyState：敌方下棋的格子的集合。
+ 方法
  + setNextStep(index)：在编号index的格子下一棋着，并且交换棋权。
  + _getOptionalBits：获取可选的下一步的格子的集合，也就是全部格子排除selfState和enemyState后剩下的格子。
  + isDraw：判断当前棋局是否为和棋。和棋一定满足_getOptionalBits()为空集。注意，完全正确的写法应该是当前局面不满足胜或者负的前提下，可选棋着为空集才为和棋。
  + isVictory：判断当前棋局是否胜利。容易得知等价条件为当前棋局棋权属于敌方且己方棋面属于VictorySates的其中一种。
  + isFail:判断当前棋局是否失败。容易得知等价条件为当前棋局棋权属于己方且敌方棋面属于VictorySates的其中一种。
  + hash：该函数是为了方便后面字典把BoardState的哈希值作为键。应该融合BoardState的chance，selfState，enemyState三个值作为哈希值。不过，后面搜索棋面树时，只讨论己方为先手的情况，所以该hash函数并没有影响程序正确性。但是理论来说确实算得上一个设计缺陷。如果同时讨论己方为先手和敌方为先手的情况，那么该hash函数应当被修正。但是实际上，己方先手和敌方先手的棋面树是一一对应的，没必要讨论两次。
+ Record类：继承自BoardState类
  + 新增成员变量
    + victorySteps：对于己方来说必胜着的集合
    + failSteps：对于己方来说必败着的集合
    + 注意：必胜着不是只有己方才能下，必败着也不是只有敌方才能下。其意思为，当某一方下出必胜着，会使得我方进入的棋面为必胜状态，下面将给出必胜状态的定义。
  + 必胜状态的定义：
    + 简单来说，一个棋面如果处于必胜状态，则双方在最优选择下最终能够必然是我方获胜。
    + 其具体判断算法为：
    + 如果当前棋面己方恰好获胜（isVictory），那么当前棋面为必胜状态；
    + 如果当前棋权为敌方，敌方的可选棋着均为必胜着，那么敌方任意下一棋着，棋面必然进入必胜态。
    + 如果当前棋权为我方，我方存在下一棋着能够使得下一棋面处于必胜状态，那么当前棋面也处于必胜状态。其等价说法为，如果必胜着集合不为空，那么当前棋面处于必胜状态。
    + 必败状态的定义请自行思考。
  + 至此，不再过多解释Record类的其他方法，唯一需要注意的是，Record类变量在什么时候可以计算出其必胜着和必败着。请看Engine类。
+ Engine类：计算和存储整个棋面树，并提供搜索方法。
  + 成员变量：只有字典dictionary，键为Record的hash值，值为Record对象。
  + 方法dfs：深度优先遍历，构建整个棋面树，并存储进dictionary。该方法放在最后面解释。
  + getNextSteps(state)：以棋面为参数，从字典获取对应的Record，从该Record容易得到一般棋着、必胜着、必败着等信息。
+ dfs方法：
  + 假设初始棋面为己方先手，己方敌方均没有下任一棋着。
  + 如果当前棋面己方获胜或者失败，没有必要继续dfs遍历下去，直接记入字典即可。
  + 否则，遍历所有可选的下一棋着，从而逐个产生下一棋面，对下一棋面进行深度遍历。
    + 我们假定在dfs返回之后，下一棋面的必胜着和必败着已经全部计算出来。如果下一棋面为必胜状态（注意不是指恰好获胜），那么不论当前棋权属于己方还是敌方，只要选择这一棋着，必然进入必胜状态，也就是说，该棋着为必胜着。因此，把该棋着记入当前棋面的必胜着。同理，如果下一棋面为必败棋面，该棋着为必败着。
  + 遍历完当前棋面的所有可选的下一棋着之后，显然，当前棋面的所有必胜着和必败着已经计算完毕。最后把当前棋面加入字典即可。
+ 补充说明：深刻理解必胜状态和必败状态是理解dfs方法的关键。当前棋面处于必胜状态不意味着己方最终一定能够胜利。例如，当前棋权为己方，存在下一步可以直接获胜，但是自己却没有选择必胜着，而是选择其他棋着，那么必胜状态的棋面也可能变成一个必败状态的棋面。

### 棋局管理器
+ 如果理解了engine.js，那么理解棋局管理器也应该没有任何难度。
+ 方法
  + newGame(playerFirst,invincible)
    + playerFirst表示是否为玩家先手。若是，则函数返回一个对象，该对象的index和gameStatus字段都是null。否则，让引擎先走一步，返回的对象的index字段不为空。
    + invincible为玩家选择的难度是否为不可战胜难度。若是，管理器会优先选择对引擎提供的棋着中最优的棋着，否则，管理器会随机选一个棋着。
  + solve(index)：玩家在编号为index的格子下一着棋，更新当前棋面。之后，会对当前棋面进行胜负和的判断，如果棋局能够继续，会让引擎走下一步。
  + selectFrom(nextSteps)：从引擎提供的nextSteps选择一个棋着。
  + judgeGameStatus：判断当前棋局是否为胜负和，并返回一个字符串。如果该字符串不为null，说明棋局结束，前端的组件将会发出一个弹窗。（此处返回字符串的设计明显并不太好，有待改进）另外，当前棋面是否获胜和玩家是否获胜不是完全对应的，和玩家是否为先手也有关。这是因为dfs函数只讨论了己方为先手的情况。如果玩家先手，那么当前棋面获胜等于玩家获胜；如果玩家是后手，即引擎先手，当前棋面获胜等于玩家失败。（可见一处设计缺陷带来整个系统代码的可读性下降有多么严重！）
  + enemyMove:让引擎下一棋着。