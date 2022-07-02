import type { Ref } from 'vue'
import type { BlockState } from '~/types'

interface GameState {
  board: BlockState[][]
  mineGenerator: boolean
  playState: 'paly' | 'won' | 'lost'
}
export class PlayGames {
  state = ref() as Ref<GameState>
  directions = [
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ]

  constructor(public width: number = 10, public height: number = 10) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  reset() {
    this.state.value = {
      mineGenerator: false,
      playState: 'paly',
      board: Array.from({ length: this.height }, (_, y) => (
        Array.from({ length: this.width }, (_, x): BlockState => (
          {
            x,
            y,
            adjacentMines: 0,
            revealed: false,
          }))
      )),
    }
  }

  getSiblings(block: BlockState) {
    return this.directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      // 边界判断
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.board[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  updateNumbers() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines += 1
        })
      })
    })
  }

  // 格子周围没有炸弹是，自动翻开
  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSiblings(block).filter(i => !i.flagged).forEach((b) => {
      if (!b.revealed) {
        b.revealed = true
        this.expendZero(b)
      }
    })
  }

  // 生成炸弹
  generatorMines(initial: BlockState) {
    for (const row of this.board) {
      for (const block of row) {
        // 不在点击的格子周围生成炸弹
        if (Math.abs(initial.x - block.x) <= 1 || Math.abs(initial.y - block.y) <= 1)
          continue
        block.mine = Math.random() < 0.2
      }
    }
    this.updateNumbers()
  }

  onClick(block: BlockState) {
    if (this.state.value.playState !== 'paly')
      return
    if (!this.state.value.mineGenerator) {
      this.generatorMines(block)
      this.state.value.mineGenerator = true
    }
    if (block.mine) {
      this.state.value.playState = 'lost'
      this.showAllMine()
      return
    }

    block.revealed = true
    this.expendZero(block)
  }

  showAllMine() {
    this.board.flat().forEach((i) => {
      i.mine && (i.revealed = true)
    })
  }

  onRightClick(block: BlockState) {
    if (block.revealed || this.state.value.playState !== 'paly')
      return
    block.flagged = !block.flagged
  }

  // 检查游戏状态
  checkGameStatus() {
    if (!this.state.value.mineGenerator)
      return
    const block = this.board.flat()
    if (block.every(b => b.revealed || b.flagged)) {
      if (block.some(b => b.flagged && !b.mine)) {
        this.state.value.playState = 'lost'
        this.showAllMine()
      }
      else { this.state.value.playState = 'won' }
    }
  }
  // watchEffect(checkGameStatus)
}
