<script lang='ts' setup>
import type { BlockState } from '~/types'
import { isDev } from '~/composables'
defineProps<{ block: BlockState }>()
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-pink-500',
  'text-orange-500',
  'text-purple-500',
]

const getBlockClass = (block: BlockState) => {
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray-500/20'
  return block.mine ? 'bg-red-500/20' : numberColors[block.adjacentMines]
}
</script>

<template>
  <button
    min-w-10 min-h-10 m=".5"
    flex="~"
    items-center justify-center
    border="gray-500/10 1"
    :class="getBlockClass(block)"
  >
    <template v-if="block.flagged">
      <div i-mdi:flag text-red />
    </template>
    <template v-else-if="block.revealed || isDev">
      <div v-if="block.mine" i-mdi:mine />
      <div v-else font-bold>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>
