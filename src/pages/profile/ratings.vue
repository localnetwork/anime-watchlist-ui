<template>
  <q-page class="q-pa-lg ratings-page">
    <div class="ratings-container">
      <h1 class="ratings-title">My Ratings</h1>
      <p class="ratings-subtitle">Anime you've rated.</p>

      <div v-if="loading" class="ratings-loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <div v-else-if="!ratings.length" class="ratings-empty">
        <q-icon name="star_border" size="40px" color="grey-6" />
        <p>You haven't rated any anime yet.</p>
        <q-btn label="Browse Anime" no-caps unelevated to="/search" class="browse-btn" />
      </div>

      <template v-else>
        <div class="anime-grid">
          <router-link
            v-for="anime in ratings"
            :key="anime.id"
            :to="`/animes/${anime.slug}`"
            class="anime-card"
          >
            <div class="anime-card-image-wrapper">
              <img :src="anime.coverImageUrl" :alt="anime.title" class="anime-card-image" />
              <div class="my-rating-badge">
                <q-icon name="star" size="14px" /> {{ anime.myRating }}
              </div>
            </div>

            <div class="anime-card-info">
              <div class="anime-card-title">{{ anime.title }}</div>
              <div class="anime-card-meta">
                <span v-if="anime.type?.name">{{ anime.type.name }}</span>
                <span v-if="anime.averageRating">Avg {{ anime.averageRating.toFixed(1) }}</span>
              </div>
            </div>
          </router-link>
        </div>

        <div class="ratings-pagination">
          <q-pagination
            v-model="page"
            :max="totalPages"
            :max-pages="6"
            boundary-numbers
            direction-links
            color="primary"
            dark
            @update:model-value="fetchRatings"
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
    "permissions": ["anime.rating.manage"]
  }
}
</route>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/boot/axios'

const loading = ref(true)
const ratings = ref([])
const page = ref(1)
const totalPages = ref(1)

async function fetchRatings() {
  loading.value = true
  try {
    const { data } = await api.get('/watchlist/ratings', {
      params: { page: page.value, limit: 24 },
    })
    ratings.value = data?.data || []
    totalPages.value = data?.meta?.totalPages || 1
  } catch {
    ratings.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

onMounted(fetchRatings)
</script>

<style scoped>
.ratings-page {
  color: #ffffff;
}

.ratings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.ratings-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  line-height: 100%;
}

.ratings-subtitle {
  color: #9a9a9a;
  margin: 0 0 24px;
}

.ratings-loading,
.ratings-empty {
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

.my-rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffc107;
  font-size: 13px;
  font-weight: 700;
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

.ratings-pagination {
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
