<template>
  <teleport to="body">
    <div v-if="active" class="tour-root">
      <div class="tour-backdrop" @click="finish" />
      <div v-if="rect" class="tour-spotlight" :style="spotlightStyle" />
      <div class="tour-card" :style="cardStyle">
        <div class="tour-step-count">Step {{ index + 1 }} of {{ steps.length }}</div>
        <div class="tour-title">{{ current.title }}</div>
        <div class="tour-text">{{ current.text }}</div>
        <div class="tour-actions">
          <q-btn flat dense no-caps label="Skip" class="tour-skip" @click="finish" />
          <q-space />
          <q-btn v-if="index > 0" flat dense no-caps label="Back" @click="go(index - 1)" />
          <q-btn
            unelevated
            dense
            no-caps
            class="tour-next"
            :label="isLast ? 'Done' : 'Next'"
            @click="isLast ? finish() : go(index + 1)"
          />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const steps = [
  {
    target: 'avatar',
    title: 'Add a profile picture',
    text: 'Upload a PNG, JPG, WEBP or GIF so people recognize you.',
  },
  {
    target: 'name',
    title: 'Display name',
    text: 'This is the name shown on your profile and ratings.',
  },
  {
    target: 'username',
    title: 'Pick a username',
    text: 'Your public profile lives at /u/username.',
  },
  {
    target: 'bio',
    title: 'Tell us about yourself',
    text: 'Write a short bio, up to 500 characters.',
  },
  {
    target: 'social',
    title: 'Social links',
    text: 'Add links to your other profiles.',
  },
  {
    target: 'save',
    title: 'Save your changes',
    text: 'Remember to save when you are done.',
  },
]

const PADDING = 8
const CARD_WIDTH = 320

const active = ref(false)
const index = ref(0)
const rect = ref(null)

const current = computed(() => steps[index.value])
const isLast = computed(() => index.value === steps.length - 1)

const spotlightStyle = computed(() => ({
  top: `${rect.value.top - PADDING}px`,
  left: `${rect.value.left - PADDING}px`,
  width: `${rect.value.width + PADDING * 2}px`,
  height: `${rect.value.height + PADDING * 2}px`,
}))

const cardStyle = computed(() => {
  const width = Math.min(CARD_WIDTH, window.innerWidth - 24)
  if (!rect.value) {
    return { width: `${width}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  const left = Math.max(12, Math.min(rect.value.left, window.innerWidth - width - 12))
  const below = rect.value.bottom + PADDING + 12
  const fitsBelow = below + 170 < window.innerHeight
  const top = fitsBelow ? below : Math.max(12, rect.value.top - PADDING - 12 - 170)
  return { width: `${width}px`, top: `${top}px`, left: `${left}px` }
})

function measure() {
  const el = document.querySelector(`[data-tour="${current.value.target}"]`)
  rect.value = el ? el.getBoundingClientRect() : null
}

async function go(next) {
  index.value = next
  await nextTick()
  const el = document.querySelector(`[data-tour="${current.value.target}"]`)
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  // Wait for the smooth scroll to settle before measuring.
  setTimeout(measure, 350)
}

async function start() {
  active.value = true
  window.addEventListener('resize', measure)
  window.addEventListener('scroll', measure, true)
  await go(0)
}

function finish() {
  active.value = false
  window.removeEventListener('resize', measure)
  window.removeEventListener('scroll', measure, true)
}

onBeforeUnmount(finish)

defineExpose({ start })
</script>

<style>
.tour-root {
  position: fixed;
  inset: 0;
  z-index: 9000;
}

.tour-backdrop {
  position: absolute;
  inset: 0;
}

.tour-spotlight {
  position: fixed;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  border: 2px solid #b47fff;
  pointer-events: none;
  transition: all 0.25s ease;
}

.tour-card {
  position: fixed;
  background: #242424;
  color: #ffffff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  transition: top 0.25s ease, left 0.25s ease;
}

.tour-step-count {
  color: #9a9a9a;
  font-size: 12px;
}

.tour-title {
  font-size: 16px;
  font-weight: 600;
  margin: 4px 0;
}

.tour-text {
  color: #cfcfcf;
  font-size: 14px;
  margin-bottom: 12px;
}

.tour-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tour-skip {
  color: #9a9a9a;
}

.tour-next {
  background: #b47fff;
  color: #1c1c1c;
  font-weight: 600;
  padding: 0 14px;
}
</style>
