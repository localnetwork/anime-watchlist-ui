<template>
  <q-page class="q-pa-lg manage-page">
    <h1 class="manage-title">Manage Types</h1>
    <p class="manage-subtitle">Type management tools will appear here.</p>
  </q-page>
</template>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["type.manage"]
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
