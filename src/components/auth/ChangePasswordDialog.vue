<template>
  <q-dialog v-model="isOpen" persistent>
    <div class="password-modal">
      <q-btn
        flat
        round
        dense
        icon="close"
        class="modal-close"
        aria-label="Close"
        @click="close"
      />

      <h2 class="password-title">Change your password</h2>
      <p class="password-subtitle">Enter your current password and choose a new one.</p>

      <q-form class="q-gutter-md" @submit.prevent="onSubmit">
        <q-input
          v-model="form.currentPassword"
          label="Current password"
          :type="showCurrent ? 'text' : 'password'"
          dark
          filled
          class="password-input"
          :rules="[(val) => !!val || 'Current password is required']"
        >
          <template #append>
            <q-icon
              :name="showCurrent ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showCurrent = !showCurrent"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.newPassword"
          label="New password"
          :type="showNew ? 'text' : 'password'"
          dark
          filled
          class="password-input"
          :rules="[
            (val) => !!val || 'New password is required',
            (val) => val.length >= 6 || 'Password must be at least 6 characters',
          ]"
        >
          <template #append>
            <q-icon
              :name="showNew ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showNew = !showNew"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.confirmPassword"
          label="Confirm new password"
          :type="showConfirm ? 'text' : 'password'"
          dark
          filled
          class="password-input"
          :rules="[
            (val) => !!val || 'Please confirm your new password',
            (val) => val === form.newPassword || 'Passwords do not match',
          ]"
        >
          <template #append>
            <q-icon
              :name="showConfirm ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirm = !showConfirm"
            />
          </template>
        </q-input>

        <div v-if="errorMessage" class="password-error">{{ errorMessage }}</div>

        <q-btn
          type="submit"
          label="Update Password"
          class="password-submit"
          :loading="loading"
          no-caps
          unelevated
        />
      </q-form>
    </div>
  </q-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth-store'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const authStore = useAuthStore()

const isOpen = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  },
)
watch(isOpen, (val) => {
  emit('update:modelValue', val)
  if (!val) resetForm()
})

const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const errorMessage = ref('')

function resetForm() {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  errorMessage.value = ''
}

function close() {
  isOpen.value = false
}

async function onSubmit() {
  errorMessage.value = ''

  if (form.newPassword !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    await authStore.updateProfile({
      currentPassword: form.currentPassword,
      password: form.newPassword,
    })
    emit('success')
    close()
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || 'Unable to change password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  background-color: #1c1c1c;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #9a9a9a;
  z-index: 1;
}

.modal-close:hover {
  color: #ffffff;
}

.password-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.password-subtitle {
  color: #9a9a9a;
  text-align: center;
  margin: 6px 0 24px;
  font-size: 14px;
}

.password-input :deep(.q-field__control) {
  background-color: #242424;
}

.password-error {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
}

.password-submit {
  width: 100%;
  background-color: #b47fff;
  color: #1c1c1c;
  font-weight: 600;
  height: 44px;
  border-radius: 6px;
}
</style>
