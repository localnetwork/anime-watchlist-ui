<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <Header />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import Header from '../components/_partials/Header.vue'
</script>
