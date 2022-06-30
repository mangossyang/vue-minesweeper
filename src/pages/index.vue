<script setup lang="ts">
import type { BlockState } from '~/types'
const WIDTH = 5
const HEIGHT = 5
const state = ref(
  Array.from({ length: HEIGHT }, (_, y) => (
    Array.from({ length: WIDTH }, (_, x): BlockState => (
      {
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      }))
  )),
)
let mineGenerator = false
const dev = false

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-pink-500',
  'text-orange-500',
  'text-purple-500',
]
const getSiblings = (block: BlockState) => {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    // 边界判断
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    return state.value[y2][x2]
  }).filter(Boolean) as BlockState[]
}
const updateNumbers = () => {
  state.value.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block.mine)
        return
      getSiblings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines += 1
      })
    })
  })
}
// 格子周围没有炸弹是，自动翻开
const expendZero = (block: BlockState) => {
  if (block.adjacentMines)
    return

  getSiblings(block).filter(i => !i.flagged).forEach((b) => {
    if (!b.revealed) {
      b.revealed = true
      expendZero(b)
    }
  })
}
// 生成炸弹
const generatorMines = (initial: BlockState) => {
  for (const row of state.value) {
    for (const block of row) {
      // 不在点击的格子周围生成炸弹
      if (Math.abs(initial.x - block.x) <= 1 || Math.abs(initial.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.2
    }
  }
  updateNumbers()
}
const onClick = (block: BlockState) => {
  if (!mineGenerator) {
    generatorMines(block)
    mineGenerator = true
  }
  if (block.mine)
    alert('boom!!')

  block.revealed = true
  expendZero(block)
}
const onRightClick = (block: BlockState) => {
  if (block.revealed)
    return
  block.flagged = !block.flagged
}
const getBlockClass = (block: BlockState) => {
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray-500/20'
  return block.mine ? 'bg-red-500/20' : numberColors[block.adjacentMines]
}
// 检查游戏状态
const checkGameStatus = () => {
  const block = state.value.flat()
  if (block.every(b => b.revealed || b.flagged)) {
    if (block.some(b => b.flagged && !b.mine))
      alert('You cheat!')
    else
      alert('You win!')
  }
}
watchEffect(checkGameStatus)
</script>

<template>
  minesweeper

  <div p5>
    <div
      v-for="row, y in state" :key="y"
      flex="~"
      items-center justify-center
    >
      <button
        v-for="block, x in row" :key="x"
        w-10 h-10 m=".5"
        flex="~"
        items-center justify-center
        border="gray-500/10 1"
        :class="getBlockClass(block)"
        @click="onClick(block)"
        @contextmenu.prevent="onRightClick(block)"
      >
        <template v-if="block.flagged">
          <div i-mdi:flag text-red />
        </template>
        <template v-else-if="block.revealed || dev">
          <div v-if="block.mine" i-mdi:mine />
          <div v-else>
            {{ block.adjacentMines }}
          </div>
        </template>
      </button>
    </div>
  </div>
</template>
