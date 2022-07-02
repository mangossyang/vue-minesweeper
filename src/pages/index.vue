<script setup lang="ts">
import MineBlock from './MineBlock.vue'
import { isDev, toggleDev } from '~/composables'
import { PlayGames } from '~/composables/login'

const play = new PlayGames()
useStorage('minesweeper-state', play.state)
const state = computed(() => play.board)
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
      <button btn @click="toggleDev(!isDev)">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
      <button btn @click="play.reset()">
        RESET
      </button>
    </div>
  </div>
</template>
