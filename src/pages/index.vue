<script setup lang="ts">
import MineBlock from './MineBlock.vue'
import { PlayGames } from '~/composables/login'

const play = new PlayGames(9, 9, 10)

const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS || +now) - (play.state.value.startMS)) / 1000))

useStorage('minesweeper-state', play.state)
const state = computed(() => play.board)
watchEffect(() => play.checkGameStatus())
const mineRest = computed(() => {
  if (!play.state.value.mineGenerator)
    return play.mines
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
})
function newGame(mode: 'easy' | 'medium' | 'hard') {
  switch (mode) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(15, 15, 15)
      break
    case 'hard':
      play.reset(30, 30, 99)
      break
    default:
      break
  }
}
</script>

<template>
  <div p5 w-full overflow-auto>
    minesweeper
    <div flex="~ gap-1" justify-center p-4>
      <button btn @click="newGame('easy')">
        New Game
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>
    <div flex="~ gap-10" justify-center p-4 text-20px>
      <div flex items-center gap-1>
        <div i-mdi-clock-outline />
        {{ timerMS }}
      </div>

      <div flex items-center gap-1>
        <div i-mdi:mine />
        {{ mineRest }}
      </div>
    </div>
    <div
      v-for="row, y in state" :key="y"
      flex="~"
      items-center justify-center w-max ma
    >
      <MineBlock
        v-for="block, x in row" :key="x"
        :block="block"
        @click="play.onClick(block)"
        @contextmenu.prevent="play.onRightClick(block)"
        @dblclick="play.autoExpend(block)"
      />
    </div>
    <Confetti :passed="play.state.value.playState === 'won'" />
  </div>
</template>
