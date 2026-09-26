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

    <div class="filter-bar">
      <q-input
        v-model="filters.search"
        label="Search title or description"
        dark
        filled
        dense
        debounce="400"
        clearable
        class="filter-input filter-search"
        @update:model-value="onFilterChange"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="filters.status"
        :options="statusOptions"
        label="Status"
        dark
        filled
        dense
        emit-value
        map-options
        clearable
        class="filter-input"
        @update:model-value="onFilterChange"
      />

      <q-select
        v-model="filters.airedStatus"
        :options="airedStatusOptions"
        label="Aired Status"
        dark
        filled
        dense
        emit-value
        map-options
        clearable
        class="filter-input"
        @update:model-value="onFilterChange"
      />

      <q-select
        v-model="filters.typeId"
        :options="typeOptions"
        label="Type"
        dark
        filled
        dense
        emit-value
        map-options
        clearable
        class="filter-input"
        @update:model-value="onFilterChange"
      />

      <q-select
        v-model="filters.genreId"
        :options="genreOptions"
        label="Genre"
        dark
        filled
        dense
        emit-value
        map-options
        clearable
        class="filter-input"
        @update:model-value="onFilterChange"
      />

      <q-select
        v-model="filters.sortBy"
        :options="sortByOptions"
        label="Sort by"
        dark
        filled
        dense
        emit-value
        map-options
        class="filter-input filter-sort"
        @update:model-value="onFilterChange"
      />

      <q-btn
        flat
        dense
        round
        :icon="filters.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'"
        class="sort-dir-btn"
        @click="toggleSortDir"
      >
        <q-tooltip>{{ filters.sortDir === 'asc' ? 'Ascending' : 'Descending' }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="hasActiveFilters"
        flat
        dense
        no-caps
        label="Clear filters"
        class="clear-filters-btn"
        @click="clearFilters"
      />
    </div>

    <div v-if="loading" class="manage-loading">
      <q-spinner color="primary" size="32px" />
    </div>

    <div v-else-if="!animeList.length" class="manage-empty">No anime entries match your filters.</div>

    <div v-else class="anime-list">
      <div v-for="anime in animeList" :key="anime.id" class="anime-row">
        <q-img :src="anime.coverImageUrl" ratio="2/3" class="anime-row-cover" />

        <div class="anime-row-body">
          <div class="anime-row-main">
            <h3 class="anime-row-title">{{ anime.title }}</h3>
            <p class="anime-row-meta">
              {{ anime.type?.name || 'Unknown Type' }} • {{ formatStatus(anime.status) }} •
              {{ anime.episodes?.length || 0 }} episode(s)
            </p>
            <p class="anime-row-genres">
              {{ anime.genres.map((genre) => genre.name).join(', ') || 'No genres' }}
            </p>
          </div>

          <div class="anime-row-actions">
            <q-btn
              flat
              dense
              no-caps
              icon="video_library"
              label="Episodes"
              class="episodes-btn"
              @click="openEpisodesDialog(anime)"
            />
            <q-btn flat dense round icon="edit" @click="openEditDialog(anime)" />
            <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(anime)" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && animeList.length" class="manage-pagination">
      <span class="pagination-count">
        Showing {{ animeList.length }} of {{ meta.total }}
      </span>
      <q-btn
        v-if="hasMore"
        no-caps
        unelevated
        label="Load More"
        icon="expand_more"
        class="load-more-btn"
        :loading="loadingMore"
        @click="loadMore"
      />
    </div>

    <AnimeDialog v-model="dialogOpen" :anime="editingAnime" @success="onSaved" />
    <EpisodeManagerDialog
      v-model="episodesDialogOpen"
      :anime="episodesAnime"
      @updated="fetchAnime"
    />
  </q-page>
</template>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["anime.create", "anime.update", "anime.delete", "anime.episode.manage"]
  }
}
</route>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'
import AnimeDialog from '@/components/anime/AnimeDialog.vue'
import EpisodeManagerDialog from '@/components/anime/EpisodeManagerDialog.vue'

const $q = useQuasar()

const animeList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const dialogOpen = ref(false)
const editingAnime = ref(null)
const episodesDialogOpen = ref(false)
const episodesAnime = ref(null)

const genreOptions = ref([])
const typeOptions = ref([])

const INITIAL_PAGE_SIZE = 12

const meta = reactive({ page: 1, limit: INITIAL_PAGE_SIZE, total: 0, totalPages: 1 })

const filters = reactive({
  search: '',
  status: null,
  airedStatus: null,
  typeId: null,
  genreId: null,
  sortBy: 'updatedAt',
  sortDir: 'desc',
  page: 1,
})

const statusOptions = [
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Dropped', value: 'DROPPED' },
]

const airedStatusOptions = [
  { label: 'Not Yet Released', value: 'NOT_YET_RELEASED' },
  { label: 'Airing', value: 'AIRING' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Hiatus', value: 'HIATUS' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const sortByOptions = [
  { label: 'Last Updated', value: 'updatedAt' },
  { label: 'Date Added', value: 'createdAt' },
  { label: 'Title', value: 'title' },
  { label: 'Views', value: 'viewCount' },
  { label: 'Aired From', value: 'airedFrom' },
  { label: 'Aired To', value: 'airedTo' },
]

const hasActiveFilters = computed(
  () =>
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.airedStatus) ||
    Boolean(filters.typeId) ||
    Boolean(filters.genreId),
)

const hasMore = computed(() => animeList.value.length < meta.total)

function formatStatus(status) {
  if (!status) return 'Unknown Status'
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function fetchAnime({ append = false } = {}) {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const { data } = await api.get('/watchlist/manage/animes', {
      params: {
        search: filters.search || undefined,
        status: filters.status || undefined,
        airedStatus: filters.airedStatus || undefined,
        typeId: filters.typeId || undefined,
        genreId: filters.genreId || undefined,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: filters.page,
        limit: INITIAL_PAGE_SIZE,
      },
    })
    animeList.value = append ? [...animeList.value, ...data.data] : data.data
    Object.assign(meta, data.meta)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  filters.page += 1
  fetchAnime({ append: true })
}

async function loadFilterOptions() {
  const [genresRes, typesRes] = await Promise.all([api.get('/genres'), api.get('/types')])
  genreOptions.value = genresRes.data.map((genre) => ({ label: genre.name, value: genre.id }))
  typeOptions.value = typesRes.data.map((type) => ({ label: type.name, value: type.id }))
}

function onFilterChange() {
  filters.page = 1
  fetchAnime()
}

function toggleSortDir() {
  filters.sortDir = filters.sortDir === 'asc' ? 'desc' : 'asc'
  onFilterChange()
}

function clearFilters() {
  filters.search = ''
  filters.status = null
  filters.airedStatus = null
  filters.typeId = null
  filters.genreId = null
  onFilterChange()
}

function openCreateDialog() {
  editingAnime.value = null
  dialogOpen.value = true
}

function openEditDialog(anime) {
  editingAnime.value = anime
  dialogOpen.value = true
}

function openEpisodesDialog(anime) {
  episodesAnime.value = anime
  episodesDialogOpen.value = true
}

function onSaved() {
  onFilterChange()
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
    onFilterChange()
  })
}

onMounted(() => {
  loadFilterOptions()
  fetchAnime()
})
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

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #1c1c1c;
  border-radius: 10px;
}

.filter-input {
  min-width: 160px;
}

.filter-input :deep(.q-field__control) {
  background-color: #242424;
}

.filter-search {
  min-width: 240px;
  flex: 1 1 240px;
}

.filter-sort {
  min-width: 170px;
}

.sort-dir-btn {
  color: #b47fff;
}

.clear-filters-btn {
  color: #9a9a9a;
}

.manage-loading,
.manage-empty {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  color: #9a9a9a;
}

.anime-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.anime-row {
  display: flex;
  gap: 16px;
  background-color: #1c1c1c;
  border-radius: 10px;
  overflow: hidden;
  padding: 12px;
}

.anime-row-cover {
  width: 72px;
  min-width: 72px;
  border-radius: 8px;
  background-color: #242424;
}

.anime-row-body {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.anime-row-main {
  min-width: 0;
}

.anime-row-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.anime-row-meta {
  color: #9a9a9a;
  font-size: 13px;
  margin: 0 0 4px;
}

.anime-row-genres {
  color: #7c7c7c;
  font-size: 12px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.anime-row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.episodes-btn {
  color: #b47fff;
}

.manage-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 20px;
  background-color: #1c1c1c;
  border-radius: 10px;
}

.pagination-count {
  color: #9a9a9a;
  font-size: 13px;
}

.load-more-btn {
  background-color: #7c4dff;
  color: #ffffff;
  font-weight: 600;
  padding: 0 24px;
  height: 40px;
  border-radius: 6px;
}
</style>
