<template>
  <q-dialog v-model="isOpen" persistent>
    <div class="modal-card">
      <q-btn
        flat
        round
        dense
        icon="close"
        class="modal-close"
        aria-label="Close"
        @click="uiStore.closeAuthDialog()"
      />

      <LoginForm
        v-if="uiStore.authDialogOpen && uiStore.authDialogMode === 'login'"
        @success="onSuccess"
        @switch-to-register="uiStore.authDialogMode = 'register'"
      />
      <RegisterForm
        v-else-if="uiStore.authDialogOpen"
        @success="onSuccess"
        @switch-to-login="uiStore.authDialogMode = 'login'"
      />
    </div>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import { useUiStore } from '@/stores/ui-store'

const router = useRouter()
const uiStore = useUiStore()

const isOpen = computed({
  get: () => uiStore.authDialogOpen,
  set: (value) => {
    if (!value) uiStore.closeAuthDialog()
  },
})

function onSuccess() {
  const redirect = uiStore.authRedirect
  uiStore.closeAuthDialog()
  if (redirect) router.push(redirect)
}
</script>

<style>
.modal-card {
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

.auth-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.auth-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.auth-subtitle {
  color: #9a9a9a;
  text-align: center;
  margin: 6px 0 24px;
  font-size: 14px;
}

.auth-input .q-field__control {
  background-color: #242424;
}

.auth-error {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
}

.auth-submit {
  width: 100%;
  background-color: #b47fff;
  color: #1c1c1c;
  font-weight: 600;
  height: 44px;
  border-radius: 6px;
}

.auth-footer {
  text-align: center;
  color: #9a9a9a;
  font-size: 14px;
  margin-top: 20px;
}

.auth-link {
  color: #b47fff;
  text-decoration: none;
  font-weight: 600;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
