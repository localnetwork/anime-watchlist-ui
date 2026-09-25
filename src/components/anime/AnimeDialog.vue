<template>
  <q-dialog v-model="isOpen" persistent>
    <div class="modal-card anime-modal-card">
      <q-btn
        flat
        round
        dense
        icon="close"
        class="modal-close"
        aria-label="Close"
        @click="isOpen = false"
      />

      <AnimeForm v-if="isOpen" :anime="anime" @success="onSuccess" @cancel="isOpen = false" />
    </div>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import AnimeForm from './AnimeForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  anime: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function onSuccess(data) {
  isOpen.value = false
  emit('success', data)
}
</script>

<style>
.anime-modal-card {
  max-width: 640px;
}

.anime-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 40px;
  color: #b47fff;
}

.anime-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.anime-subtitle {
  color: #9a9a9a;
  text-align: center;
  margin: 6px 0 24px;
  font-size: 14px;
}

.anime-input .q-field__control {
  background-color: #242424;
}

.anime-row {
  display: flex;
  gap: 16px;
}

.anime-row .anime-input {
  flex: 1;
}

.cover-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cover-preview {
  border-radius: 8px;
  background-color: #242424;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-upload-actions {
  flex: 1;
}

.anime-error {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
}

.anime-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.anime-cancel {
  color: #9a9a9a;
}

.anime-submit {
  background-color: #b47fff;
  color: #1c1c1c;
  font-weight: 600;
  height: 44px;
  padding: 0 24px;
  border-radius: 6px;
}
</style>
