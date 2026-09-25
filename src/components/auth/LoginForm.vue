<template>
  <div class="auth-logo">
    <AppLogo />
  </div>

  <h1 class="auth-title">Welcome back</h1>
  <p class="auth-subtitle">Log in to continue your watchlist</p>

  <q-form class="q-gutter-md" @submit.prevent="onSubmit">
    <q-input
      v-model="form.email"
      label="Email"
      type="email"
      dark
      filled
      class="auth-input"
      :rules="[(val) => !!val || 'Email is required']"
    />

    <q-input
      v-model="form.password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      dark
      filled
      class="auth-input"
      :rules="[(val) => !!val || 'Password is required']"
    >
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>

    <q-btn
      type="submit"
      label="Log In"
      class="auth-submit"
      :loading="loading"
      no-caps
      unelevated
    />
  </q-form>

  <p class="auth-footer">
    Don't have an account?
    <a href="#" class="auth-link" @click.prevent="emit('switchToRegister')">Sign up</a>
  </p>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import AppLogo from '@/components/icons/AppLogo.vue'

const emit = defineEmits(['success', 'switchToRegister'])

const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    const data = await authStore.login({ email: form.email, password: form.password })
    emit('success', data)
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>
