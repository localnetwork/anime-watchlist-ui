<template>
  <q-header elevated class="app-header">
    <q-toolbar class="container">
      <!-- Left section -->
      <div class="header-left">
        <!-- Menu -->
        <q-btn flat dense round icon="menu" aria-label="Menu" class="app-toggle">
          <q-menu class="app-menu" :offset="[0, 10]" @hide="activeSubmenu = null">
            <div class="menu-container">
              <!-- Main menu -->
              <div class="menu-list">
                <a href="/" class="menu-item">
                  <q-icon name="home" />
                  <span>Home</span>
                </a>

                <div class="menu-item" @mouseenter="activeSubmenu = 'genres'">
                  <q-icon name="category" />
                  <span>Genres</span>
                  <q-icon name="chevron_right" class="menu-arrow" />
                </div>

                <div class="menu-item" @mouseenter="activeSubmenu = 'types'">
                  <q-icon name="movie" />
                  <span>Types</span>
                  <q-icon name="chevron_right" class="menu-arrow" />
                </div>

                <a href="#" class="menu-item">
                  <q-icon name="event" />
                  <span>Upcoming</span>
                </a>

                <a href="#" class="menu-item">
                  <q-icon name="play_circle" />
                  <span>Ongoing</span>
                </a>
              </div>

              <!-- Nested menu -->
              <div v-if="activeSubmenu" class="submenu">
                <template v-if="activeSubmenu === 'genres'">
                  <a href="#" class="submenu-item">Action</a>
                  <a href="#" class="submenu-item">Adventure</a>
                  <a href="#" class="submenu-item">Comedy</a>
                  <a href="#" class="submenu-item">Drama</a>
                  <a href="#" class="submenu-item">Fantasy</a>
                  <a href="#" class="submenu-item">Romance</a>
                  <a href="#" class="submenu-item">Sci-Fi</a>
                  <a href="#" class="submenu-item">Thriller</a>
                </template>

                <template v-if="activeSubmenu === 'types'">
                  <a href="#" class="submenu-item">TV</a>
                  <a href="#" class="submenu-item">Movie</a>
                  <a href="#" class="submenu-item">OVA</a>
                  <a href="#" class="submenu-item">ONA</a>
                  <a href="#" class="submenu-item">Special</a>
                </template>
              </div>
            </div>
          </q-menu>
        </q-btn>

        <!-- Logo -->
        <div class="app-logo">
          <router-link to="/">
            <AppLogo />
          </router-link>
        </div>

        <!-- Search -->
        <div class="search-wrapper">
          <q-input
            v-model="search"
            class="search-input"
            borderless
            dense
            placeholder="Search anime..."
            type="text"
          >
            <template #prepend>
              <q-icon name="search" class="search-icon" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Right section -->
      <div class="header-right">
        <q-btn
          v-if="!authStore.isAuthenticated"
          unelevated
          no-caps
          label="Sign In"
          class="sign-in-btn"
          @click="uiStore.openAuthDialog('login')"
        />

        <q-btn v-else flat round dense class="user-toggle">
          <q-avatar size="28px">
            <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" alt="Avatar" />
            <q-icon v-else name="account_circle" size="28px" />
          </q-avatar>
          <q-menu
            class="app-menu user-menu"
            :offset="[0, 10]"
            anchor="bottom right"
            self="top right"
          >
            <div class="menu-list">
              <div class="user-info">
                <div class="user-name">{{ authStore.user?.name || authStore.user?.email }}</div>
              </div>

              <router-link
                v-if="authStore.user?.username"
                :to="`/u/${authStore.user.username}`"
                class="menu-item"
              >
                <q-icon name="person" />
                <span>View Profile</span>
              </router-link>

              <router-link to="/profile/edit" class="menu-item">
                <q-icon name="manage_accounts" />
                <span>Edit Profile</span>
              </router-link>

              <router-link
                v-if="authStore.hasPermission(genrePermission)"
                to="/manage/genres"
                class="menu-item"
              >
                <q-icon name="category" />
                <span>Manage Genres</span>
              </router-link>

              <router-link
                v-if="authStore.hasPermission(typePermission)"
                to="/manage/types"
                class="menu-item"
              >
                <q-icon name="movie" />
                <span>Manage Types</span>
              </router-link>

              <router-link
                v-if="authStore.hasAnyPermission(animePermissions)"
                to="/manage/animes"
                class="menu-item"
              >
                <q-icon name="theaters" />
                <span>Manage Animes</span>
              </router-link>

              <router-link
                v-if="authStore.hasPermission(ratingPermission)"
                to="/manage/ratings"
                class="menu-item"
              >
                <q-icon name="star" />
                <span>Manage Rating</span>
              </router-link>

              <div class="menu-item" @click="onLogout">
                <q-icon name="logout" />
                <span>Log Out</span>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from '../icons/AppLogo.vue'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

const search = ref('')
const activeSubmenu = ref(null)

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const genrePermission = 'genre.manage'
const typePermission = 'type.manage'
const animePermissions = ['anime.create', 'anime.update', 'anime.delete']
const ratingPermission = 'anime.update'

function onLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.app-header {
  background-color: #1c1c1c;
  color: #ffffff;
  padding: 15px 0;
}

.app-header .q-toolbar {
  min-height: 50px;
}

/* Header */

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

/* Menu button */

.app-toggle {
  color: #aaaaaa;
  margin-right: 16px;
}

.app-toggle:hover {
  color: #ffffff;
}

/* Logo */

.app-logo {
  display: flex;
  align-items: center;
  margin-right: 30px;
}

/* Search */

.search-wrapper {
  position: relative;
  width: 500px;
}

.search-input {
  width: 100%;
  height: 40px;
  color: #ffffff;
  background-color: #0e0e0e;
  border-radius: 5px;
}

.search-input :deep(.q-field__control) {
  height: 40px;
  padding: 0 10px;
  border-radius: 5px;
}

.search-input :deep(.q-field__native) {
  color: #ffffff;
  padding-left: 5px;
}

.search-input :deep(.q-field__native::placeholder) {
  color: #484848;
  opacity: 1;
}

.search-icon {
  color: #484848;
  font-size: 20px;
}

/* Sign In */

.sign-in-btn {
  min-width: 100px;
  height: 40px;
  padding: 0 20px;

  border-radius: 5px;

  background-color: #7c4dff;
  color: #ffffff;

  font-size: 14px;
  font-weight: 600;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.sign-in-btn:hover {
  background-color: #8f67ff;
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(124, 77, 255, 0.3);
}

/* User menu */

.user-toggle {
  color: #d0d0d0;
  padding: 4px;
}

.user-toggle:hover {
  color: #ffffff;
}

.user-menu .menu-list {
  width: 220px;
}

.user-info {
  padding: 10px 14px;
  border-bottom: 1px solid #333333;
  color: #ffffff;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Main menu */

.app-menu {
  background: #242424 !important;
}

.menu-container {
  display: flex;
  align-items: flex-start;
  background-color: #242424;
}

.menu-list {
  width: 190px;
  padding: 6px 0;

  background-color: #242424;
  border-radius: 6px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;

  width: 190px;
  height: 42px;
  padding: 0 14px;

  box-sizing: border-box;

  color: #d0d0d0;
  text-decoration: none;

  cursor: pointer;
}

.menu-item:hover {
  background-color: #333333;
  color: #ffffff;
}

.menu-item .q-icon {
  font-size: 20px;
}

.menu-arrow {
  margin-left: auto;
  font-size: 18px !important;
}

/* Nested menu */

.submenu {
  width: 180px;
  padding: 6px 0;

  background-color: #242424;
  border-radius: 0 6px 6px 0;

  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.35);
}

.submenu-item {
  display: flex;
  align-items: center;

  width: 100%;
  height: 42px;
  padding: 0 14px;

  box-sizing: border-box;

  color: #d0d0d0;
  text-decoration: none;
}

.submenu-item:hover {
  background-color: #333333;
  color: #ffffff;
}

/* Mobile */

@media (max-width: 768px) {
  .search-wrapper {
    width: 100%;
    max-width: 300px;
  }

  .app-logo {
    margin-right: 15px;
  }

  .sign-in-btn {
    min-width: 85px;
    padding: 0 15px;
  }
}
</style>
