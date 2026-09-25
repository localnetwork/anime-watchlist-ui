<template>
  <div class="auth-logo">
    <AppLogo />
  </div>

  <h1 class="auth-title">Create your account</h1>
  <p class="auth-subtitle">Start building your anime watchlist</p>

  <q-form class="q-gutter-md" @submit.prevent="onSubmit">
    <q-input
      v-model="form.name"
      label="Name"
      dark
      filled
      class="auth-input"
      :rules="[(val) => !!val || 'Name is required']"
    />

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
      :rules="[
        (val) => !!val || 'Password is required',
        (val) => val.length >= 6 || 'Password must be at least 6 characters',
      ]"
    >
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <q-input
      v-model="form.confirmPassword"
      label="Confirm Password"
      :type="showPassword ? 'text' : 'password'"
      dark
      filled
      class="auth-input"
      :rules="[
        (val) => !!val || 'Please confirm your password',
        (val) => val === form.password || 'Passwords do not match',
      ]"
    />

    <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>

    <q-btn
      type="submit"
      label="Sign Up"
      class="auth-submit"
      :loading="loading"
      no-caps
      unelevated
    />
  </q-form>

  <p class="auth-footer">
    Already have an account?
    <a href="#" class="auth-link" @click.prevent="emit('switchToLogin')">Log in</a>
  </p>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import AppLogo from '@/components/icons/AppLogo.vue'

const emit = defineEmits(['success', 'switchToLogin'])

const authStore = useAuthStore()

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    const data = await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    emit('success', data)
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || 'Unable to create account'
  } finally {
    loading.value = false
  }
}
</script>
