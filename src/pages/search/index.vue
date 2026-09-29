<template>
  <q-page class="q-pa-lg search-page">
    <div class="search-container">
      <h1 class="search-title">
        {{ query.q ? `Search Results for "${query.q}"` : 'Browse Anime' }}
      </h1>

      <div class="search-filters">
        <q-input
          v-model="query.q"
          dark
          filled
          dense
          clearable
          placeholder="Search anime..."
          class="filter-input filter-search"
          @keyup.enter="applyFilters"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="query.genreId"
          :options="genreOptions"
          label="Genre"
          dark
          filled
          dense
          clearable
          emit-value
          map-options
          class="filter-input"
        />

        <q-select
          v-model="query.typeId"
          :options="typeOptions"
          label="Type"
          dark
          filled
          dense
          clearable
          emit-value
          map-options
          class="filter-input"
        />

        <q-select
          v-model="query.airedStatus"
          :options="airedStatusOptions"
          label="Status"
          dark
          filled
          dense
          clearable
          emit-value
          map-options
          class="filter-input"
        />

        <q-select
          v-model="query.sort"
          :options="sortOptions"
          label="Sort By"
          dark
          filled
          dense
          emit-value
          map-options
          class="filter-input"
        />

        <q-btn
          label="Apply"
          no-caps
          unelevated
          class="filter-apply-btn"
          @click="applyFilters"
        />
      </div>

      <div v-if="loading" class="search-loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <div v-else-if="!results.length" class="search-empty">
        <q-icon name="search_off" size="40px" color="grey-6" />
        <p>No anime found matching your filters.</p>
      </div>

      <template v-else>
        <div class="anime-grid">
          <router-link
            v-for="anime in results"
            :key="anime.id"
            :to="`/animes/${anime.slug}`"
            class="anime-card"
          >
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
        </div>

        <div class="search-pagination">
          <q-pagination
            v-model="query.page"
            :max="meta.totalPages || 1"
            :max-pages="6"
            boundary-numbers
            direction-links
            color="primary"
            dark
            @update:model-value="fetchResults"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/boot/axios'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const results = ref([])
const meta = reactive({ totalPages: 1 })

const genreOptions = ref([])
const typeOptions = ref([])

const airedStatusOptions = [
  { label: 'Not Yet Released', value: 'NOT_YET_RELEASED' },
  { label: 'Airing', value: 'AIRING' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Hiatus', value: 'HIATUS' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const sortOptions = [
  { label: 'Newest', value: 'recent' },
  { label: 'Most Viewed', value: 'top' },
  { label: 'Highest Rated', value: 'rated' },
]

const query = reactive({
  q: route.query.q || '',
  genreId: route.query.genreId || null,
  typeId: route.query.typeId || null,
  airedStatus: route.query.airedStatus || null,
  sort: route.query.sort || 'recent',
  page: Number(route.query.page) || 1,
})

async function loadFilterOptions() {
  const [genresRes, typesRes] = await Promise.all([api.get('/genres'), api.get('/types')])
  genreOptions.value = genresRes.data.map((genre) => ({ label: genre.name, value: genre.id }))
  typeOptions.value = typesRes.data.map((type) => ({ label: type.name, value: type.id }))
}

function syncRouteQuery() {
  router.replace({
    path: '/search',
    query: {
      ...(query.q ? { q: query.q } : {}),
      ...(query.genreId ? { genreId: query.genreId } : {}),
      ...(query.typeId ? { typeId: query.typeId } : {}),
      ...(query.airedStatus ? { airedStatus: query.airedStatus } : {}),
      ...(query.sort && query.sort !== 'recent' ? { sort: query.sort } : {}),
      ...(query.page && query.page !== 1 ? { page: query.page } : {}),
    },
  })
}

async function fetchResults() {
  loading.value = true
  try {
    const { data } = await api.get('/animes', {
      params: {
        search: query.q || undefined,
        genreId: query.genreId || undefined,
        typeId: query.typeId || undefined,
        airedStatus: query.airedStatus || undefined,
        sort: query.sort,
        page: query.page,
        limit: 20,
      },
    })
    results.value = data?.data || []
    meta.totalPages = data?.meta?.totalPages || 1
  } catch {
    results.value = []
    meta.totalPages = 1
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  query.page = 1
  syncRouteQuery()
  fetchResults()
}

watch(
  () => route.query,
  (newQuery) => {
    query.q = newQuery.q || ''
    query.genreId = newQuery.genreId || null
    query.typeId = newQuery.typeId || null
    query.airedStatus = newQuery.airedStatus || null
    query.sort = newQuery.sort || 'recent'
    query.page = Number(newQuery.page) || 1
    fetchResults()
  },
)

onMounted(async () => {
  await loadFilterOptions()
  await fetchResults()
})
</script>

<style scoped>
.search-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px;
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 30px;
  align-items: center;
}

.filter-input {
  min-width: 160px;
}

.filter-search {
  min-width: 240px;
  flex: 1;
}

.filter-apply-btn {
  height: 40px;
  padding: 0 24px;
  background-color: #7c4dff;
  color: #ffffff;
  border-radius: 5px;
  font-weight: 600;
}

.filter-apply-btn:hover {
  background-color: #8f67ff;
}

.search-loading,
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 0;
  color: #9a9a9a;
  text-align: center;
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

.search-pagination {
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
