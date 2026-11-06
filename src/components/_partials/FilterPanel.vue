<template>
  <q-dialog
    v-if="isMobile"
    :model-value="modelValue"
    position="right"
    full-height
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="filter-drawer">
      <div class="drawer-header">
        <span class="drawer-title">{{ title }}</span>
        <q-btn v-close-popup flat round dense icon="close" />
      </div>
      <div class="drawer-body">
        <slot />
      </div>
    </q-card>
  </q-dialog>

  <div v-else class="filter-inline">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Filters' },
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const isMobile = computed(() => $q.screen.width <= 768)
</script>

<style scoped>
.filter-inline {
  display: contents;
}

.filter-drawer {
  width: min(85vw, 340px);
  background-color: #1c1c1c;
  color: #ffffff;
  border-radius: 0;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #2c2c2c;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.drawer-body :slotted(*) {
  width: 100%;
  min-width: 0;
  flex: none;
}
</style>
