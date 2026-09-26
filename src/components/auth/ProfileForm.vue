<template>
  <q-form class="q-gutter-md" @submit.prevent="onSubmit">
    <div class="avatar-upload">
      <q-avatar size="120px" class="avatar-preview">
        <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar preview" />
        <q-icon v-else name="account_circle" size="120px" color="grey-6" />
      </q-avatar>

      <div class="avatar-upload-actions">
        <q-file
          v-model="avatarFile"
          label="Profile picture"
          dark
          filled
          dense
          accept="image/png,image/jpeg,image/webp,image/gif"
          class="profile-input avatar-input"
          :loading="uploading"
          @update:model-value="onAvatarFileSelected"
        >
          <template #prepend>
            <q-icon name="upload" />
          </template>
        </q-file>
        <div v-if="uploadError" class="profile-error">{{ uploadError }}</div>
      </div>
    </div>

    <q-input v-model="form.name" label="Display name" dark filled class="profile-input" />

    <q-input
      v-model="form.username"
      label="Username"
      hint="Public profile URL: /u/username"
      dark
      filled
      class="profile-input"
      :rules="[usernameRule]"
    />

    <q-input
      v-model="form.bio"
      label="Bio"
      type="textarea"
      maxlength="500"
      counter
      dark
      filled
      class="profile-input"
    />

    <div class="social-links">
      <div class="social-links-header">
        <span class="social-links-title">Social links</span>
        <q-btn
          flat
          dense
          no-caps
          icon="add"
          label="Add link"
          class="add-link-btn"
          @click="addSocialLink"
        />
      </div>

      <div v-for="(link, index) in form.socialLinks" :key="index" class="social-link-row">
        <q-select
          v-model="link.platform"
          :options="platformOptions"
          label="Platform"
          dark
          filled
          dense
          emit-value
          map-options
          class="profile-input social-platform"
        />
        <q-input
          v-model="link.url"
          label="URL"
          dark
          filled
          dense
          class="profile-input social-url"
          placeholder="https://..."
        />
        <q-btn
          flat
          dense
          round
          icon="delete"
          color="negative"
          @click="removeSocialLink(index)"
        />
      </div>
    </div>

    <div v-if="errorMessage" class="profile-error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="profile-success">{{ successMessage }}</div>

    <div class="profile-actions">
      <q-btn
        type="submit"
        label="Save Changes"
        class="profile-submit"
        :loading="loading"
        no-caps
        unelevated
      />
    </div>
  </q-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
const emit = defineEmits(['success'])

const platformOptions = [
  { label: 'Twitter / X', value: 'twitter' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Discord', value: 'discord' },
  { label: 'GitHub', value: 'github' },
  { label: 'Website', value: 'website' },
  { label: 'Other', value: 'other' },
]

const user = authStore.user || {}

const form = reactive({
  name: user.name || '',
  username: user.username || '',
  bio: user.bio || '',
  avatarUrl: user.avatarUrl || '',
  socialLinks: (user.socialLinks || []).map((link) => ({ ...link })),
})

const avatarFile = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function usernameRule(val) {
  if (!val) return true
  return /^[a-z0-9](?:[a-z0-9_.-]{1,28}[a-z0-9])?$/i.test(val) || 'Invalid username format'
}

function addSocialLink() {
  form.socialLinks.push({ platform: 'website', url: '' })
}

function removeSocialLink(index) {
  form.socialLinks.splice(index, 1)
}

async function onAvatarFileSelected(file) {
  uploadError.value = ''
  if (!file) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const { data } = await api.post('/uploads/avatar', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.avatarUrl = data.url
  } catch (err) {
    uploadError.value = err?.response?.data?.error || 'Unable to upload image'
  } finally {
    uploading.value = false
  }
}

async function onSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const payload = {
      name: form.name || null,
      username: form.username ? form.username.toLowerCase() : null,
      bio: form.bio || null,
      avatarUrl: form.avatarUrl || null,
      socialLinks: form.socialLinks.filter((link) => link.url),
    }

    const data = await authStore.updateProfile(payload)
    successMessage.value = 'Profile updated successfully.'
    emit('success', data)
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || 'Unable to update profile'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
}

.avatar-preview {
  background-color: #242424;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-upload-actions {
  flex: 1;
  min-width: 0;
}

.profile-input :deep(.q-field__control) {
  background-color: #242424;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-links-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.social-links-title {
  color: #ffffff;
  font-weight: 600;
}

.add-link-btn {
  color: #b47fff;
}

.social-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.social-platform {
  min-width: 150px;
}

.social-url {
  flex: 1;
}

.profile-error {
  color: #ff6b6b;
  font-size: 13px;
}

.profile-success {
  color: #6bff9e;
  font-size: 13px;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
}

.profile-submit {
  background-color: #7c4dff;
  color: #ffffff;
  font-weight: 600;
  padding: 0 28px;
  height: 44px;
  border-radius: 6px;
}
</style>
