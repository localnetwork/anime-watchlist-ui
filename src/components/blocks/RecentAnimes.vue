<template>
  <section class="recent-animes-block">
    <h2>Recently Added</h2>

    <div class="anime-grid">
      <div v-for="anime in animeList" :key="anime.id" class="anime-card">
        <router-link :to="`/animes/${anime.slug}`" class="anime-card-link">
          <div class="anime-card-image-wrapper">
            <img :src="anime.coverImageUrl" :alt="anime.title" class="anime-card-image" />

            <span v-if="anime.type?.name" class="anime-card-type">{{ anime.type.name }}</span>
          </div>

          <div class="anime-card-info">
            <div class="anime-card-title">
              {{ anime.title }}
            </div>

            <div class="anime-card-meta">
              <span class="anime-card-views">
                <q-icon name="visibility" size="14px" /> {{ anime.viewCount }}
              </span>
              <span class="anime-card-airdate">{{ formatDate(anime.airedFrom) }}</span>
            </div>

            <div v-if="anime.genres?.length" class="anime-card-genres">
              <span v-for="genre in anime.genres.slice(0, 2)" :key="genre.id" class="genre-chip">
                {{ genre.name }}
              </span>
            </div>
          </div>
        </router-link>

        <q-btn
          flat
          round
          dense
          class="favorite-btn"
          :class="{ 'favorite-btn-active': favoritedIds.has(anime.id) }"
          :loading="pendingIds.has(anime.id)"
          @click="onToggleFavorite(anime)"
        >
          <q-icon :name="favoritedIds.has(anime.id) ? 'favorite' : 'favorite_border'" size="18px" />
          <q-tooltip>
            {{ favoritedIds.has(anime.id) ? 'Remove from Favorites' : 'Add to Favorites' }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import recentAnimes from '@/lib/preBuildScripts/static/recent-animes.json'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

const animeList = recentAnimes

const authStore = useAuthStore()
const uiStore = useUiStore()

const favoritedIds = reactive(new Set())
const pendingIds = reactive(new Set())

const formatDate = (date) => {
  if (!date) return 'Present'

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function loadFavoriteStatuses() {
  if (!authStore.isAuthenticated) return

  try {
    const { data } = await api.get('/watchlist/favorites', { params: { limit: 100 } })
    const favoritedEntryIds = new Set((data?.data || []).map((entry) => entry.id))
    animeList.forEach((anime) => {
      if (favoritedEntryIds.has(anime.id)) {
        favoritedIds.add(anime.id)
      }
    })
  } catch {
    // Ignore errors loading favorite state; buttons default to unfavorited.
  }
}

async function onToggleFavorite(anime) {
  if (!authStore.isAuthenticated) {
    uiStore.openAuthDialog('login')
    return
  }

  pendingIds.add(anime.id)
  try {
    if (favoritedIds.has(anime.id)) {
      await api.delete(`/watchlist/${anime.id}/favorite`)
      favoritedIds.delete(anime.id)
    } else {
      await api.put(`/watchlist/${anime.id}/favorite`)
      favoritedIds.add(anime.id)
    }
  } finally {
    pendingIds.delete(anime.id)
  }
}

onMounted(loadFavoriteStatuses)
</script>

<style scoped>
.recent-animes-block {
  padding: 20px 0;
}

.recent-animes-block h2 {
  font-weight: bold;
  font-size: 24px;
  margin: 0 0 20px;
  line-height: 25px;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
}

.anime-card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.anime-card-type {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;

  padding: 2px 8px;
  border-radius: 4px;

  background-color: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
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
  gap: 8px;
  margin-top: 5px;
  font-size: 13px;
  color: #666;
}

.anime-card-views {
  display: flex;
  align-items: center;
  gap: 3px;
}

.anime-card-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.genre-chip {
  padding: 2px 10px;
  border-radius: 12px;

  background-color: #7c4dff;
  color: #ffffff;
  font-size: 11px;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;

  background-color: rgba(0, 0, 0, 0.55);
  color: #ffffff;
}

.favorite-btn:hover {
  background-color: rgba(0, 0, 0, 0.75);
}

.favorite-btn-active {
  color: #ff3d71;
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
