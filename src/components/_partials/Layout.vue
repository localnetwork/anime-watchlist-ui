<template>
  <q-layout view="hHh lpR fFf">
    <AppHeader />

    <q-page-container>
      <main id="main" class="container" :class="{ 'has-sidebar': showSidebar }">
        <div class="main-content">
          <router-view />
        </div>

        <aside v-if="showSidebar" class="sidebar">
          <div></div>
        </aside>
      </main>
    </q-page-container>

    <AuthDialog />
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './Header.vue'
import AuthDialog from '@/components/auth/AuthDialog.vue'

const route = useRoute()

const showSidebar = computed(() => {
  return route.path === '/' || route.path.startsWith('/animes/')
})
</script>

<style>
#main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  padding-top: 20px;
}

#main.has-sidebar {
  grid-template-columns: 3fr 1fr;
}

.main-content {
  min-width: 0;
}

.sidebar {
  min-width: 0;
}

/* Mobile */
@media (max-width: 768px) {
  #main.has-sidebar {
    grid-template-columns: 1fr;
  }

  #main.has-sidebar .sidebar {
    display: none;
  }
}
</style>
