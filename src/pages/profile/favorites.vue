<template>
  <q-page class="q-pa-lg favorites-page">
    <div class="favorites-container">
      <h1 class="favorites-title">My Favorites</h1>
      <p class="favorites-subtitle">Anime you've marked as favorites.</p>

      <div v-if="loading" class="favorites-loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <div v-else-if="!favorites.length" class="favorites-empty">
        <q-icon name="favorite_border" size="40px" color="grey-6" />
        <p>You haven't added any favorites yet.</p>
        <q-btn label="Browse Anime" no-caps unelevated to="/search" class="browse-btn" />
      </div>

      <template v-else>
        <div class="anime-grid">
          <div v-for="anime in favorites" :key="anime.id" class="anime-card">
            <router-link :to="`/animes/${anime.slug}`" class="anime-card-link">
              <div class="anime-card-image-wrapper">
                <img :src="anime.coverImageUrl" :alt="anime.title" class="anime-card-image" />
              </div>

              <div class="anime-card-info">
                <div class="anime-card-title">{{ anime.title }}</div>
                <div class="anime-card-meta">
                  <span v-if="anime.type?.name">{{ anime.type.name }}</span>
                  <span v-if="anime.averageRating">
                    <q-icon name="star" size="14px" /> {{ anime.averageRating.toFixed(1) }}
                  </span>
                </div>
              </div>
            </router-link>

            <q-btn
              flat
              round
              dense
              class="remove-favorite-btn"
              :loading="removingId === anime.id"
              @click="onRemoveFavorite(anime)"
            >
              <q-icon name="favorite" size="20px" />
              <q-tooltip>Remove from Favorites</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="favorites-pagination">
          <q-pagination
            v-model="page"
            :max="totalPages"
            :max-pages="6"
            boundary-numbers
            direction-links
            color="primary"
            dark
            @update:model-value="fetchFavorites"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["anime.favorite.manage"]
  }
}
</route>

<script setup>
import { onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const loading = ref(true)
const favorites = ref([])
const page = ref(1)
const totalPages = ref(1)
const removingId = ref(null)

async function fetchFavorites() {
  loading.value = true
  try {
    const { data } = await api.get('/watchlist/favorites', {
      params: { page: page.value, limit: 24 },
    })
    favorites.value = data?.data || []
    totalPages.value = data?.meta?.totalPages || 1
  } catch {
    favorites.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

async function onRemoveFavorite(anime) {
  removingId.value = anime.id
  try {
    await api.delete(`/watchlist/${anime.id}/favorite`)
    favorites.value = favorites.value.filter((item) => item.id !== anime.id)
  } catch {
    Notify.create({ type: 'negative', message: 'Unable to remove favorite' })
  } finally {
    removingId.value = null
  }
}

onMounted(fetchFavorites)
</script>

<style scoped>
.favorites-page {
  color: #ffffff;
}

.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
}

.favorites-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
}

.favorites-subtitle {
  color: #9a9a9a;
  margin: 0 0 24px;
}

.favorites-loading,
.favorites-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: #9a9a9a;
  text-align: center;
}

.browse-btn {
  background-color: #7c4dff;
  color: #ffffff;
  border-radius: 6px;
  margin-top: 8px;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.anime-card {
  position: relative;
}

.anime-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.anime-card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 141%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #242424;
}

.anime-card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.anime-card-info {
  margin-top: 10px;
}

.anime-card-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.anime-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  font-size: 13px;
  color: #9a9a9a;
}

.remove-favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;

  background-color: rgba(0, 0, 0, 0.55);
  color: #ff3d71;
}

.remove-favorite-btn:hover {
  background-color: rgba(0, 0, 0, 0.75);
}

.favorites-pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 992px) {
  .anime-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .anime-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
