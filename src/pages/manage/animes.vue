<template>
  <q-page class="q-pa-lg manage-page">
    <div class="manage-header">
      <div>
        <h1 class="manage-title">Manage Animes</h1>
        <p class="manage-subtitle">Add, edit, or remove watchlist entries.</p>
      </div>

      <q-btn
        label="Add Anime"
        icon="add"
        no-caps
        unelevated
        class="add-btn"
        @click="openCreateDialog"
      />
    </div>

    <div v-if="loading" class="manage-loading">
      <q-spinner color="primary" size="32px" />
    </div>

    <div v-else-if="!animeList.length" class="manage-empty">No anime entries yet.</div>

    <div v-else class="anime-grid">
      <div v-for="anime in animeList" :key="anime.id" class="anime-card">
        <q-img :src="anime.coverImageUrl" ratio="2/3" class="anime-card-cover" />

        <div class="anime-card-body">
          <h3 class="anime-card-title">{{ anime.title }}</h3>
          <p class="anime-card-meta">
            {{ anime.type?.name || 'Unknown Type' }} • {{ anime.status }}
          </p>
          <p class="anime-card-genres">
            {{ anime.genres.map((genre) => genre.name).join(', ') || 'No genres' }}
          </p>

          <div class="anime-card-actions">
            <q-btn flat dense icon="edit" @click="openEditDialog(anime)" />
            <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(anime)" />
          </div>
        </div>
      </div>
    </div>

    <AnimeDialog v-model="dialogOpen" :anime="editingAnime" @success="onSaved" />
  </q-page>
</template>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["anime.create", "anime.update", "anime.delete"]
  }
}
</route>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'
import AnimeDialog from '@/components/anime/AnimeDialog.vue'

const $q = useQuasar()

const animeList = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const editingAnime = ref(null)

async function fetchAnime() {
  loading.value = true
  try {
    const { data } = await api.get('/watchlist')
    animeList.value = data
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingAnime.value = null
  dialogOpen.value = true
}

function openEditDialog(anime) {
  editingAnime.value = anime
  dialogOpen.value = true
}

function onSaved() {
  fetchAnime()
}

function confirmDelete(anime) {
  $q.dialog({
    title: 'Delete Anime',
    message: `Are you sure you want to delete "${anime.title}"?`,
    cancel: true,
    persistent: true,
    dark: true,
  }).onOk(async () => {
    await api.delete(`/watchlist/${anime.id}`)
    fetchAnime()
  })
}

onMounted(fetchAnime)
</script>

<style scoped>
.manage-page {
  color: #ffffff;
}

.manage-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.manage-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.manage-subtitle {
  color: #9a9a9a;
  margin: 4px 0 0;
}

.add-btn {
  background-color: #7c4dff;
  color: #ffffff;
  font-weight: 600;
  height: 40px;
  padding: 0 20px;
  border-radius: 6px;
}

.manage-loading,
.manage-empty {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  color: #9a9a9a;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.anime-card {
  background-color: #1c1c1c;
  border-radius: 10px;
  overflow: hidden;
}

.anime-card-cover {
  background-color: #242424;
}

.anime-card-body {
  padding: 12px;
}

.anime-card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.anime-card-meta {
  color: #9a9a9a;
  font-size: 12px;
  margin: 0 0 4px;
}

.anime-card-genres {
  color: #7c7c7c;
  font-size: 12px;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.anime-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
</style>
