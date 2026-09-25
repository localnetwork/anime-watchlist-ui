<template>
  <q-header elevated class="app-header">
    <q-toolbar class="container">
      <!-- Menu -->
      <q-btn flat class="app-toggle" dense round icon="menu" aria-label="Menu">
        <q-menu class="app-menu" :offset="[0, 10]" @hide="activeSubmenu = null">
          <div class="menu-container">
            <!-- Main menu -->
            <div class="menu-list">
              <!-- Home -->
              <a href="#" class="menu-item">
                <q-icon name="home" />
                <span>Home</span>
              </a>

              <!-- Genres -->
              <div class="menu-item" @mouseenter="activeSubmenu = 'genres'">
                <q-icon name="category" />
                <span>Genres</span>
                <q-icon name="chevron_right" class="menu-arrow" />
              </div>

              <!-- Types -->
              <div class="menu-item" @mouseenter="activeSubmenu = 'types'">
                <q-icon name="movie" />
                <span>Types</span>
                <q-icon name="chevron_right" class="menu-arrow" />
              </div>

              <!-- Upcoming -->
              <a href="#" class="menu-item">
                <q-icon name="event" />
                <span>Upcoming</span>
              </a>

              <!-- Ongoing -->
              <a href="#" class="menu-item">
                <q-icon name="play_circle" />
                <span>Ongoing</span>
              </a>
            </div>

            <!-- Nested menu -->
            <div
              v-if="activeSubmenu"
              class="submenu"
              @mouseenter="submenuHovered = true"
              @mouseleave="submenuHovered = false"
            >
              <!-- Genres -->
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

              <!-- Types -->
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
        <AppLogo />
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
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { ref } from 'vue'
import AppLogo from '../icons/AppLogo.vue'

const search = ref('')
const activeSubmenu = ref(null)
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

.app-menu,
.q-menu {
  background: #242424 !important;
}
.app-toggle {
  color: #aaaaaa;
  margin-right: 16px;
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
  color: #484848;
  background-color: #0e0e0e;
  border-radius: 5px;
}

.search-input :deep(.q-field__control) {
  height: 40px;
  padding: 0 10px;
  border-radius: 5px;
}

.search-input :deep(.q-field__native) {
  color: #484848;
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

/* Main menu */

.menu-container {
  display: flex;
  align-items: flex-start;
}

.menu-list {
  width: 190px;
  padding: 6px 0;
  background-color: #242424;
  border-radius: 6px;
  overflow: hidden;
}

/* Parent menu item */

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
</style>
