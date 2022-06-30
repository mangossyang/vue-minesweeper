export interface BlockState {
    x: number
    y: number
    revealed?: boolean // 是否点开
    mine?: boolean // 地雷
    flagged?: boolean // 标记
    adjacentMines: number // 炸弹数量
}
