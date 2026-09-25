<template>
  <q-layout view="hHh lpR fFf">
    <AppHeader />

    <q-page-container>
      <main id="main" class="container">
        <div class="main-content">
          <router-view />
        </div>

        <aside class="sidebar">
          <div></div>
        </aside>
      </main>
    </q-page-container>

    <AuthDialog />
  </q-layout>
</template>

<script setup>
import AppHeader from './Header.vue'
import AuthDialog from '@/components/auth/AuthDialog.vue'
</script>

<style>
#main {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
  padding-top: 20px;
}

.main-content {
  min-width: 0;
}

.sidebar {
  min-width: 0;
}

/* Mobile */
@media (max-width: 768px) {
  #main {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}
</style>
