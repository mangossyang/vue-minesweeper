import type { Ref } from 'vue'
import type { BlockState } from '~/types'

type PlayState = 'paly' | 'won' | 'lost'
interface GameState {
  board: BlockState[][]
  mineGenerator: boolean
  playState: PlayState
  startMS?: number
  endMS?: number
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

  constructor(
    public width: number,
    public height: number,
    public mines: number) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.board.flat()
  }

  ramdom(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.ramdom(min, max))
  }

  reset(width = 9,
    height = 9,
    mines = 10) {
    this.width = width
    this.height = height
    this.mines = mines
    this.state.value = {
      startMS: +new Date(),
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
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = this.board[x][y]
      if (Math.abs(initial.x - block.x) <= 1 || Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines })
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    this.updateNumbers()
  }

  onClick(block: BlockState) {
    if (this.state.value.playState !== 'paly' || block.flagged)
      return
    if (!this.state.value.mineGenerator) {
      this.generatorMines(block)
      this.state.value.mineGenerator = true
    }
    if (block.mine) {
      this.gameOver('lost')
      return
    }

    block.revealed = true
    this.expendZero(block)
  }

  showAllMine() {
    this.board.flat().forEach((i) => {
      if (i.mine) {
        i.revealed = true
        i.flagged = false
      }
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
      if (block.some(b => b.flagged && !b.mine))
        this.gameOver('lost')

      else this.gameOver('won')
    }
  }

  autoExpend(block: BlockState) {
    const siblingsMines = this.getSiblings(block)
    const flagged = siblingsMines.reduce((a, b) => (a + (b.flagged ? 1 : 0)), 0)
    if (flagged === block.adjacentMines) {
      siblingsMines.forEach((i) => {
        if (!i.flagged && !i.revealed)
          i.revealed = true
        if (i.mine)
          this.gameOver('lost')
      })
    }
  }

  gameOver(state: PlayState) {
    this.state.value.playState = state
    this.state.value.endMS = +Date.now()
    if (state === 'lost')
      this.showAllMine()
  }
}
