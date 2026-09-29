<template>
  <q-page class="q-pa-lg anime-detail-page">
    <div v-if="loading" class="detail-loading">
      <q-spinner color="primary" size="32px" />
    </div>

    <div v-else-if="notFound" class="detail-not-found">
      <h2>Anime not found</h2>
      <p>We couldn't find an anime with that URL.</p>
      <q-btn label="Go Home" no-caps unelevated to="/" class="home-btn" />
    </div>

    <div v-else class="detail-container">
      <div class="episode-video-container">
        <video
          v-if="selectedEpisode?.videoUrl"
          :key="selectedEpisode.id"
          :src="selectedEpisode.videoUrl"
          controls
          autoplay
          class="episode-video-player"
        />
        <div v-else class="no-video-placeholder">
          <q-icon name="movie" size="48px" color="grey-6" />
          <p>No video available for this episode yet.</p>
        </div>
      </div>
      <div class="detail-hero">
        <!-- <q-img :src="anime.coverImageUrl" ratio="2/3" class="detail-cover" /> -->

        <div class="detail-info">
          <div class="detail-title-row">
            <h1 class="detail-title">{{ anime.title }}</h1>

            <q-btn
              v-if="authStore.isAuthenticated"
              flat
              round
              dense
              class="favorite-btn"
              :class="{ 'favorite-btn-active': isFavorited }"
              :loading="favoriteLoading"
              @click="onToggleFavorite"
            >
              <q-icon :name="isFavorited ? 'favorite' : 'favorite_border'" size="26px" />
              <q-tooltip>{{ isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}</q-tooltip>
            </q-btn>
          </div>

          <div class="detail-meta">
            <span v-if="anime.type" class="meta-chip">{{ anime.type.name }}</span>
            <span class="meta-chip">{{ formatAiredStatus(anime.airedStatus) }}</span>
            <span class="meta-chip">
              <q-icon name="visibility" size="16px" /> {{ anime.viewCount }}
            </span>
            <span v-if="anime.ratingCount" class="meta-chip">
              <q-icon name="star" size="16px" /> {{ anime.averageRating }} ({{ anime.ratingCount }})
            </span>
          </div>

          <div v-if="anime.genres?.length" class="detail-genres">
            <span v-for="genre in anime.genres" :key="genre.id" class="genre-chip">
              {{ genre.name }}
            </span>
          </div>

          <p class="detail-description">{{ anime.description }}</p>

          <div v-if="anime.authors?.length" class="detail-authors">
            <span class="detail-authors-label">Authors:</span>
            <span v-for="(author, index) in anime.authors" :key="author.id" class="detail-author">
              {{ author.name }}<span v-if="author.role"> ({{ author.role }})</span
              >{{ index < anime.authors.length - 1 ? ', ' : '' }}
            </span>
          </div>

          <p class="detail-aired">
            Aired: {{ formatDate(anime.airedFrom) }} — {{ formatDate(anime.airedTo) }}
          </p>

          <div v-if="authStore.isAuthenticated" class="detail-status">
            <span class="detail-status-label">My Status:</span>
            <q-select
              v-model="myStatus"
              :options="statusOptions"
              dark
              filled
              dense
              emit-value
              map-options
              clearable
              class="status-select"
              :loading="statusLoading"
              @update:model-value="onStatusChange"
            />
          </div>
        </div>
      </div>

      <!-- <q-separator dark spaced /> -->

      <!-- <div class="episode-player-section">
        <h2 class="section-title">
          {{ selectedEpisode?.title || `Episode ${selectedEpisode?.episodeNumber}` }}
        </h2>

        <p v-if="selectedEpisode?.description" class="episode-description">
          {{ selectedEpisode.description }}
        </p>
      </div> -->

      <!-- <q-separator dark spaced /> -->

      <div class="episode-list-section">
        <h2 class="section-title">Episodes</h2>

        <div v-if="!anime.episodes?.length" class="no-episodes">No episodes added yet.</div>
        <div v-else class="episode-grid">
          <q-btn
            v-for="episode in sortedEpisodes"
            :key="episode.id"
            no-caps
            unelevated
            :class="['episode-btn', { 'episode-btn-active': selectedEpisode?.id === episode.id }]"
            @click="selectEpisode(episode)"
          >
            <q-icon
              v-if="episode.videoUrl"
              name="play_circle"
              size="16px"
              class="episode-btn-icon"
            />
            <q-icon v-else name="lock" size="14px" class="episode-btn-icon" />
            {{ episode.episodeNumber }}
          </q-btn>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const notFound = ref(false)
const selectedEpisode = ref(null)
const myStatus = ref(null)
const statusLoading = ref(false)
const isFavorited = ref(false)
const favoriteLoading = ref(false)

const statusOptions = [
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Dropped', value: 'DROPPED' },
]

const anime = reactive({
  title: '',
  description: '',
  coverImageUrl: '',
  slug: '',
  airedFrom: null,
  airedTo: null,
  airedStatus: null,
  viewCount: 0,
  averageRating: 0,
  ratingCount: 0,
  type: null,
  genres: [],
  authors: [],
  episodes: [],
})

const sortedEpisodes = computed(() =>
  [...(anime.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber),
)

function selectEpisode(episode) {
  selectedEpisode.value = episode
}

function formatDate(date) {
  if (!date) return 'Present'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatAiredStatus(status) {
  if (!status) return 'Unknown'
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function fetchMyStatus() {
  if (!authStore.isAuthenticated || !anime.id) return
  try {
    const { data } = await api.get(`/watchlist/${anime.id}/status`)
    myStatus.value = data.status
  } catch {
    myStatus.value = null
  }
}

async function onStatusChange(value) {
  if (!anime.id) return
  statusLoading.value = true
  try {
    if (value) {
      await api.put(`/watchlist/${anime.id}/status`, { status: value })
    } else {
      await api.delete(`/watchlist/${anime.id}/status`)
    }
  } finally {
    statusLoading.value = false
  }
}

async function fetchFavoriteStatus() {
  if (!authStore.isAuthenticated || !anime.id) return
  try {
    const { data } = await api.get(`/watchlist/${anime.id}/favorite`)
    isFavorited.value = Boolean(data.favorited)
  } catch {
    isFavorited.value = false
  }
}

async function onToggleFavorite() {
  if (!anime.id) return
  favoriteLoading.value = true
  try {
    if (isFavorited.value) {
      await api.delete(`/watchlist/${anime.id}/favorite`)
      isFavorited.value = false
    } else {
      await api.put(`/watchlist/${anime.id}/favorite`)
      isFavorited.value = true
    }
  } finally {
    favoriteLoading.value = false
  }
}

async function fetchAnime() {
  loading.value = true
  notFound.value = false
  try {
    const { data } = await api.get(`/animes/${route.params.slug}`)
    Object.assign(anime, data)
    const episodes = [...(data.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber)
    selectedEpisode.value = episodes.find((ep) => ep.episodeNumber === 1) || episodes[0] || null
    await fetchMyStatus()
    await fetchFavoriteStatus()
  } catch (err) {
    if (err?.response?.status === 404) {
      notFound.value = true
    } else {
      throw err
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnime)
</script>

<style scoped>
.detail-loading,
.detail-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  text-align: center;
}

.home-btn {
  background-color: #7c4dff;
  color: #ffffff;
  border-radius: 6px;
}

.detail-container {
  max-width: 1100px;
  margin: 0 auto;
}

.detail-hero {
  display: flex;
  gap: 32px;
}

.detail-cover {
  width: 260px;
  min-width: 260px;
  border-radius: 10px;
  background-color: #242424;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 32px;
}

.detail-title-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.detail-title-row .detail-title {
  flex: 1;
  min-width: 0;
}

.favorite-btn {
  color: #9a9a9a;
  margin-top: -4px;
}

.favorite-btn:hover {
  color: #ff6b9d;
}

.favorite-btn-active {
  color: #ff3d71;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background-color: #242424;
  border-radius: 20px;
  font-size: 13px;
}

.detail-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.genre-chip {
  padding: 4px 12px;
  background-color: #7c4dff;
  border-radius: 20px;
  font-size: 12px;
}

.detail-description {
  line-height: 1.7;
  margin: 0 0 16px;
  white-space: pre-wrap;
}

.detail-authors {
  font-size: 14px;
  margin: 0 0 12px;
}

.detail-authors-label {
  font-weight: 600;
  margin-right: 6px;
}

.detail-aired {
  font-size: 13px;
  margin: 0;
}

.detail-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.detail-status-label {
  font-weight: 600;
  font-size: 13px;
}

.status-select {
  min-width: 160px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
}

.episode-video-player {
  width: 100%;
  border-radius: 10px;
  background-color: #000000;
}

.episode-video-container {
  position: relative;
  padding-bottom: 56.25%;
  margin-bottom: 30px;
}
.episode-video-container > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-video-placeholder {
  display: flex;
  align-items: center;
  flex-flow: column;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
  color: #9a9a9a;
  background-color: #1c1c1c;
  border-radius: 10px;
  height: 100%;
  width: 100%;
}

.episode-description {
  margin-top: 16px;
  line-height: 1.6;
}

.episode-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.episode-btn {
  min-width: 48px;
  height: 40px;
  background-color: #1c1c1c;
  color: #d0d0d0;

  border-radius: 6px;
}

.episode-btn-icon {
  margin-right: 4px;
}

.episode-btn-active {
  background-color: #7c4dff;
  color: #ffffff;
}

@media (max-width: 768px) {
  .detail-hero {
    flex-direction: column;
  }

  .detail-cover {
    width: 100%;
    min-width: 0;
    max-width: 260px;
    margin: 0 auto;
  }
}
</style>
