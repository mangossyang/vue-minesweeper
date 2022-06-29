<script setup lang="ts">
interface BlockState {
  x: number
  y: number
  revealed?: boolean // 是否点开
  mine?: boolean // 地雷
  flagged?: boolean // 标记
  adjacentMines: number
}
const WIDTH = 10
const HEIGHT = 10
const state = reactive(
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
const dev = true

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
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    return state[y2][x2]
  }).filter(Boolean) as BlockState[]
}
const updateNumbers = () => {
  state.forEach((row, y) => {
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
const expendZero = (block: BlockState) => {
  if (block.adjacentMines)
    return

  getSiblings(block).forEach((b) => {
    if (!b.revealed) {
      b.revealed = true
      expendZero(b)
    }
  })
}
const generatorMines = (initial: BlockState) => {
  for (const row of state) {
    for (const block of row) {
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

const getBlockClass = (block: BlockState) => {
  if (!block.revealed)
    return 'bg-gray-500/10'
  return block.mine ? 'bg-red-500/20' : numberColors[block.adjacentMines]
}
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
        hover="bg-gray-500 10"
        border="gray-500/10 1"
        :class="getBlockClass(block)"
        @click="onClick(block)"
      >
        <template v-if="block.revealed || dev">
          <div v-if="block.mine" i-mdi:mine />
          <div v-else>
            {{ block.adjacentMines }}
          </div>
        </template>
      </button>
    </div>
  </div>
</template>
