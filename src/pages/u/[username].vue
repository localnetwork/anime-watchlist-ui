<template>
  <q-page class="q-pa-lg public-profile-page">
    <div v-if="loading" class="profile-loading">
      <q-spinner color="primary" size="32px" />
    </div>

    <div v-else-if="notFound" class="profile-not-found">
      <h2>Profile not found</h2>
      <p>We couldn't find a user with that username.</p>
      <q-btn label="Go Home" no-caps unelevated to="/" class="home-btn" />
    </div>

    <div v-else class="profile-card">
      <q-avatar size="140px" class="profile-avatar">
        <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="Avatar" />
        <q-icon v-else name="account_circle" size="140px" color="grey-6" />
      </q-avatar>

      <h1 class="profile-name">{{ profile.name || profile.username }}</h1>
      <p class="profile-username">@{{ profile.username }}</p>

      <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

      <div v-if="profile.socialLinks?.length" class="profile-socials">
        <a
          v-for="(link, index) in profile.socialLinks"
          :key="index"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-chip"
        >
          <q-icon :name="socialIcon(link.platform)" />
          <span>{{ platformLabel(link.platform) }}</span>
        </a>
      </div>

      <p class="profile-joined">Joined {{ formatDate(profile.createdAt) }}</p>

      <q-btn
        v-if="authStore.user?.username === profile.username"
        label="Edit Profile"
        no-caps
        unelevated
        icon="edit"
        class="edit-btn"
        to="/profile/edit"
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const notFound = ref(false)
const profile = reactive({
  username: '',
  name: '',
  bio: '',
  avatarUrl: '',
  socialLinks: [],
  createdAt: null,
})

const PLATFORM_LABELS = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitch: 'Twitch',
  discord: 'Discord',
  github: 'GitHub',
  website: 'Website',
  other: 'Link',
}

const PLATFORM_ICONS = {
  twitter: 'flutter_dash',
  instagram: 'photo_camera',
  facebook: 'thumb_up',
  youtube: 'smart_display',
  tiktok: 'music_note',
  twitch: 'videogame_asset',
  discord: 'forum',
  github: 'code',
  website: 'language',
  other: 'link',
}

function platformLabel(platform) {
  return PLATFORM_LABELS[platform] || 'Link'
}

function socialIcon(platform) {
  return PLATFORM_ICONS[platform] || 'link'
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}

async function fetchProfile() {
  loading.value = true
  notFound.value = false
  try {
    const { data } = await api.get(`/users/${route.params.username}`)
    Object.assign(profile, data)
  } catch (err) {
    if (err?.response?.status === 404) {
      notFound.value = true
    } else {
      throw err
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)
</script>

<style scoped>
.public-profile-page {
  color: #ffffff;
}

.profile-loading,
.profile-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  text-align: center;
}

.home-btn {
  background-color: #7c4dff;
  color: #ffffff;
  border-radius: 6px;
}

.profile-card {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #1c1c1c;
  border-radius: 12px;
  padding: 40px 32px;
}

.profile-avatar {
  background-color: #242424;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
}

.profile-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.profile-username {
  color: #9a9a9a;
  margin: 4px 0 16px;
}

.profile-bio {
  color: #d0d0d0;
  margin: 0 0 20px;
  white-space: pre-wrap;
}

.profile-socials {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.social-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #242424;
  border-radius: 20px;
  color: #b47fff;
  text-decoration: none;
  font-size: 13px;
}

.social-chip:hover {
  background-color: #333333;
}

.profile-joined {
  color: #7c7c7c;
  font-size: 13px;
  margin: 0 0 20px;
}

.edit-btn {
  background-color: #7c4dff;
  color: #ffffff;
  font-weight: 600;
  padding: 0 24px;
  height: 40px;
  border-radius: 6px;
}
</style>
