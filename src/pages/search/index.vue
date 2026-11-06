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

        <q-btn
          icon="tune"
          label="Filters"
          no-caps
          unelevated
          class="filter-toggle-btn mobile-only"
          @click="drawerOpen = true"
        />

        <FilterPanel v-model="drawerOpen">
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
        </FilterPanel>
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

        <div ref="sentinelRef" class="search-sentinel">
          <q-spinner v-if="loadingMore" color="primary" size="28px" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/boot/axios'
import FilterPanel from '@/components/_partials/FilterPanel.vue'

const route = useRoute()
const router = useRouter()

const drawerOpen = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const results = ref([])
const meta = reactive({ totalPages: 1 })
const sentinelRef = ref(null)
let observer = null
let requestId = 0

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
  page: 1,
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
    },
  })
}

async function fetchResults({ append = false } = {}) {
  const currentRequest = ++requestId
  if (append) {
    loadingMore.value = true
  } else {
    query.page = 1
    loading.value = true
    loadingMore.value = false
  }
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
    if (currentRequest !== requestId) return
    const items = data?.data || []
    results.value = append ? [...results.value, ...items] : items
    meta.totalPages = data?.meta?.totalPages || 1
  } catch {
    if (currentRequest !== requestId) return
    if (append) {
      query.page -= 1
    } else {
      results.value = []
      meta.totalPages = 1
    }
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

function loadMore() {
  if (loading.value || loadingMore.value || query.page >= meta.totalPages) return
  query.page += 1
  fetchResults({ append: true })
}

function applyFilters() {
  drawerOpen.value = false
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
    fetchResults()
  },
)

// The sentinel only exists once results render, so (re)attach when it appears.
watch(sentinelRef, (el, oldEl) => {
  if (oldEl) observer?.unobserve(oldEl)
  if (el) observer?.observe(el)
})

onMounted(async () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMore()
    },
    { rootMargin: '300px' },
  )
  await nextTick()
  if (sentinelRef.value) observer.observe(sentinelRef.value)
  await loadFilterOptions()
  await fetchResults()
})

onBeforeUnmount(() => observer?.disconnect())
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

.search-sentinel {
  display: flex;
  justify-content: center;
  min-height: 40px;
  margin-top: 24px;
}

@media (max-width: 992px) {
  .anime-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .search-page {
    padding: 12px;
  }

  .search-title {
    font-size: 20px;
    margin-bottom: 14px;
  }

  .search-filters {
    flex-wrap: nowrap;
    margin-bottom: 20px;
  }

  .filter-search {
    min-width: 0;
  }

  .filter-toggle-btn {
    height: 40px;
    background-color: #242424;
    color: #b47fff;
    border-radius: 5px;
  }

  .anime-grid {
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .anime-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
