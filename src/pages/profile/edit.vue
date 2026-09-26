<template>
  <q-page class="q-pa-lg profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="profile-title">Edit Profile</h1>
        <p class="profile-subtitle">Update your profile, social links, and profile picture.</p>
        <router-link
          v-if="authStore.user?.username"
          :to="`/u/${authStore.user.username}`"
          class="view-public-link"
        >
          View public profile
        </router-link>
        <span class="link-separator">•</span>
        <a href="#" class="view-public-link" @click.prevent="passwordDialogOpen = true">
          Change your password
        </a>
      </div>

      <ProfileForm />

      <ChangePasswordDialog v-model="passwordDialogOpen" />
    </div>
  </q-page>
</template>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["auth.profile.update"]
  }
}
</route>

<script setup>
import { ref } from 'vue'
import ProfileForm from '@/components/auth/ProfileForm.vue'
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog.vue'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
const passwordDialogOpen = ref(false)
</script>

<style scoped>
.profile-page {
  color: #ffffff;
}

.profile-container {
  max-width: 640px;
  margin: 0 auto;
  background-color: #1c1c1c;
  border-radius: 12px;
  padding: 32px;
}

.profile-header {
  margin-bottom: 24px;
}

.profile-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.profile-subtitle {
  color: #9a9a9a;
  margin: 4px 0 8px;
}

.view-public-link {
  color: #b47fff;
  font-size: 13px;
  text-decoration: none;
}

.view-public-link:hover {
  text-decoration: underline;
}

.link-separator {
  color: #555555;
  margin: 0 6px;
  font-size: 13px;
}
</style>
