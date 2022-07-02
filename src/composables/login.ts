import type { BlockState } from '~/types'

export class PlayGames {
  state = ref<BlockState[][]>([])
  mineGenerator = false
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

  reset() {
    this.mineGenerator = false
    this.state.value = Array.from({ length: this.height }, (_, y) => (
      Array.from({ length: this.width }, (_, x): BlockState => (
        {
          x,
          y,
          adjacentMines: 0,
          revealed: false,
        }))
    ))
  }

  getSiblings(block: BlockState) {
    return this.directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      // 边界判断
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.state.value[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  updateNumbers() {
    this.state.value.forEach((row) => {
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
    for (const row of this.state.value) {
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
    if (!this.mineGenerator) {
      this.generatorMines(block)
      this.mineGenerator = true
    }
    if (block.mine)
      alert('boom!!')

    block.revealed = true
    this.expendZero(block)
  }

  onRightClick(block: BlockState) {
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  // 检查游戏状态
  checkGameStatus() {
    if (!this.mineGenerator)
      return
    const block = this.state.value.flat()
    if (block.every(b => b.revealed || b.flagged)) {
      if (block.some(b => b.flagged && !b.mine))
        alert('You cheat!')
      else
        alert('You win!')
    }
  }
  // watchEffect(checkGameStatus)
}
