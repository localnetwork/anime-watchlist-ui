<template>
  <q-footer class="bottom-nav mobile-only">
    <q-tabs
      :model-value="activeTab"
      class="bottom-tabs"
      active-color="deep-purple-accent-2"
      indicator-color="transparent"
      no-caps
      dense
    >
      <q-route-tab name="home" to="/" icon="home" label="Home" exact />
      <q-route-tab name="search" to="/search" icon="search" label="Search" />
      <q-tab name="favorites" icon="favorite" label="Favorites" @click.prevent="onFavorites" />
      <q-tab name="menu" :icon="authStore.isAuthenticated ? 'menu' : 'login'" :label="authStore.isAuthenticated ? 'More' : 'Sign In'" @click.prevent="onAccount" />
    </q-tabs>

    <q-dialog v-model="sheetOpen" position="bottom">
      <q-card class="account-sheet">
        <div class="user-name">{{ authStore.user?.name || authStore.user?.email }}</div>
        <q-list>
          <q-item
            v-for="item in browseItems"
            :key="item.label"
            v-close-popup
            clickable
            :to="item.to"
          >
            <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>

          <q-expansion-item icon="category" label="Genres" dark>
            <q-item
              v-for="genre in genres"
              :key="genre.id"
              v-close-popup
              clickable
              class="sub-item"
              :to="{ path: '/search', query: { genreId: genre.id } }"
            >
              <q-item-section>{{ genre.name }}</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item icon="movie" label="Types" dark>
            <q-item
              v-for="type in types"
              :key="type.id"
              v-close-popup
              clickable
              class="sub-item"
              :to="{ path: '/search', query: { typeId: type.id } }"
            >
              <q-item-section>{{ type.name }}</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator dark />

          <q-item
            v-for="item in menuItems"
            :key="item.label"
            v-close-popup
            clickable
            :to="item.to"
          >
            <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
          <q-item v-close-popup clickable @click="onLogout">
            <q-item-section avatar><q-icon name="logout" /></q-item-section>
            <q-item-section>Log Out</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-footer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import { api } from '@/boot/axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const sheetOpen = ref(false)
const genres = ref([])
const types = ref([])

const browseItems = [
  {
    label: 'Upcoming',
    icon: 'event',
    to: { path: '/search', query: { airedStatus: 'NOT_YET_RELEASED' } },
  },
  {
    label: 'Ongoing',
    icon: 'live_tv',
    to: { path: '/search', query: { airedStatus: 'AIRING' } },
  },
]

async function loadMenuData() {
  try {
    const [genresRes, typesRes] = await Promise.all([api.get('/genres'), api.get('/types')])
    genres.value = genresRes.data
    types.value = typesRes.data
  } catch {
    // Menu stays usable without the lists.
  }
}

const activeTab = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path.startsWith('/search')) return 'search'
  if (route.path.startsWith('/profile/favorites')) return 'favorites'
  return ''
})

const menuItems = computed(() => {
  const user = authStore.user
  const items = []
  if (user?.username) items.push({ label: 'View Profile', icon: 'person', to: `/u/${user.username}` })
  items.push({ label: 'Edit Profile', icon: 'manage_accounts', to: '/profile/edit' })
  if (authStore.hasPermission('anime.favorite.manage'))
    items.push({ label: 'My Favorites', icon: 'favorite', to: '/profile/favorites' })
  if (authStore.hasPermission('anime.rating.manage'))
    items.push({ label: 'My Ratings', icon: 'star_rate', to: '/profile/ratings' })
  if (authStore.hasPermission('genre.manage'))
    items.push({ label: 'Manage Genres', icon: 'category', to: '/manage/genres' })
  if (authStore.hasPermission('type.manage'))
    items.push({ label: 'Manage Types', icon: 'movie', to: '/manage/types' })
  if (authStore.hasAnyPermission(['anime.create', 'anime.update', 'anime.delete']))
    items.push({ label: 'Manage Animes', icon: 'theaters', to: '/manage/animes' })
  if (authStore.hasPermission('anime.update'))
    items.push({ label: 'Manage Rating', icon: 'star', to: '/manage/ratings' })
  return items
})

function onFavorites() {
  if (!authStore.isAuthenticated) {
    uiStore.openAuthDialog('login', '/profile/favorites')
    return
  }
  router.push('/profile/favorites')
}

function onAccount() {
  if (!authStore.isAuthenticated) {
    uiStore.openAuthDialog('login')
    return
  }
  sheetOpen.value = true
  loadMenuData()
}

function onLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.bottom-nav {
  background-color: #1c1c1c;
  color: #aaaaaa;
  border-top: 1px solid #2c2c2c;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-tabs {
  height: 56px;
}

.account-sheet {
  width: 100%;
  background-color: #242424;
  color: #d0d0d0;
  border-radius: 16px 16px 0 0;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  max-height: 80vh;
  overflow-y: auto;
}

.sub-item {
  padding-left: 72px;
}

.user-name {
  padding: 10px 16px;
  font-weight: 600;
  color: #ffffff;
  border-bottom: 1px solid #333333;
}
</style>
