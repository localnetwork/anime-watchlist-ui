<template>
  <q-page class="flex flex-center access-denied-page">
    <div class="access-denied-card">
      <q-icon name="block" class="access-denied-icon" />
      <h1 class="access-denied-title">Access Denied</h1>
      <p class="access-denied-subtitle">You don't have permission to view this page.</p>
      <q-btn unelevated no-caps label="Go Home" class="access-denied-btn" to="/" />
    </div>
  </q-page>
</template>

<style scoped>
.access-denied-page {
  min-height: 100vh;
  background-color: #0e0e0e;
}

.access-denied-card {
  text-align: center;
  color: #ffffff;
  padding: 40px;
}

.access-denied-icon {
  font-size: 64px;
  color: #ff6b6b;
  margin-bottom: 16px;
}

.access-denied-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}

.access-denied-subtitle {
  color: #9a9a9a;
  margin-bottom: 24px;
}

.access-denied-btn {
  background-color: #7c4dff;
  color: #ffffff;
  font-weight: 600;
  height: 44px;
  padding: 0 24px;
  border-radius: 6px;
}
</style>
