<template>
  <q-page class="q-pa-lg manage-page">
    <h1 class="manage-title">Manage Ratings</h1>
    <p class="manage-subtitle">Rating management tools will appear here.</p>
  </q-page>
</template>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["anime.update"]
  }
}
</route>

<style scoped>
.manage-page {
  color: #ffffff;
}

.manage-title {
  font-size: 22px;
  font-weight: 600;
}

.manage-subtitle {
  color: #9a9a9a;
}
</style>
