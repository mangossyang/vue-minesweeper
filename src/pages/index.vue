<script setup lang="ts">
import MineBlock from './MineBlock.vue'
import { isDev, toggleDev } from '~/composables'
import { PlayGames } from '~/composables/login'

const play = new PlayGames()
useStorage('minesweeper-state', play.state)
const state = computed(() => play.board)
watchEffect(() => play.checkGameStatus())
const countMines = computed(() => play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0), 0))
</script>

<template>
  <div p5>
    minesweeper
    <div
      v-for="row, y in state" :key="y"
      flex="~"
      items-center justify-center
    >
      <MineBlock
        v-for="block, x in row" :key="x"
        :block="block"
        @click="play.onClick(block)"
        @contextmenu.prevent="play.onRightClick(block)"
      />
    </div>
    <div flex="~ gap-2" justify-center>
      <div>Count:{{ countMines }}</div>
      <button btn @click="toggleDev(!isDev)">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
      <button btn @click="play.reset()">
        RESET
      </button>
    </div>
  </div>
</template>
