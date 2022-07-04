<script setup lang="ts">
import confetti from 'canvas-confetti'
const props = defineProps<{
  passed: boolean
}>()
function congrats() {
  const defaults = {
    colors: [
      '#5D8C7B',
      '#F2D091',
      '#F2A679',
      '#D9695F',
      '#8C4646',
    ],
    shapes: ['square'],
    ticks: 500,
  } as confetti.Options
  confetti({
    particleCount: 100,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    ...defaults,
  })
  confetti({
    particleCount: 100,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    ...defaults,
  })
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      ...defaults,
    })
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      ...defaults,
    })
  }, 200)
}
watch(
  () => props.passed,
  (v) => {
    if (v)
      setTimeout(congrats, 300)
  },
  { flush: 'post' },
)
</script>

<template>
  <div />
</template>
