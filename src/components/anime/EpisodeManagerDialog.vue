<template>
  <q-dialog v-model="isOpen" persistent>
    <div class="modal-card episode-modal-card">
      <q-btn
        flat
        round
        dense
        icon="close"
        class="modal-close"
        aria-label="Close"
        @click="isOpen = false"
      />

      <div class="episode-header">
        <h2 class="episode-title">Manage Episodes</h2>
        <p class="episode-subtitle">{{ anime?.title }}</p>
      </div>

      <q-form class="episode-form" @submit.prevent="onSubmit">
        <div class="episode-form-row">
          <q-input
            v-model.number="form.episodeNumber"
            type="number"
            min="1"
            label="Episode #"
            dark
            filled
            dense
            class="episode-input episode-number-input"
            :rules="[(val) => !!val || 'Required']"
          />
          <q-input
            v-model="form.title"
            label="Title"
            dark
            filled
            dense
            class="episode-input"
          />
          <q-input
            v-model.number="form.durationMinutes"
            type="number"
            min="1"
            label="Duration (min)"
            dark
            filled
            dense
            clearable
            class="episode-input episode-duration-input"
          />
          <q-input
            v-model="form.airDate"
            type="date"
            label="Air date"
            dark
            filled
            dense
            clearable
            class="episode-input episode-date-input"
          />
        </div>
        <q-input
          v-model="form.description"
          label="Description"
          type="textarea"
          dark
          filled
          dense
          autogrow
          class="episode-input"
        />

        <div class="episode-video-upload">
          <q-file
            v-model="videoFile"
            label="Episode video"
            dark
            filled
            dense
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
            class="episode-input episode-video-input"
            :loading="uploadingVideo"
            @update:model-value="onVideoFileSelected"
          >
            <template #prepend>
              <q-icon name="movie" />
            </template>
          </q-file>

          <q-linear-progress
            v-if="uploadingVideo"
            indeterminate
            color="primary"
            class="episode-video-progress"
          />
          <div v-if="videoUploadError" class="episode-error">{{ videoUploadError }}</div>

          <video
            v-if="form.videoUrl"
            :src="form.videoUrl"
            controls
            class="episode-video-preview"
          />
        </div>

        <div v-if="formError" class="episode-error">{{ formError }}</div>

        <div class="episode-form-actions">
          <q-btn
            v-if="editingId"
            flat
            no-caps
            label="Cancel Edit"
            class="episode-cancel"
            @click="resetForm"
          />
          <q-btn
            type="submit"
            :label="editingId ? 'Save Episode' : 'Add Episode'"
            no-caps
            unelevated
            class="episode-submit"
            :loading="saving"
          />
        </div>
      </q-form>

      <q-separator dark class="episode-separator" />

      <div v-if="loading" class="episode-loading">
        <q-spinner color="primary" size="28px" />
      </div>
      <div v-else-if="!episodes.length" class="episode-empty">No episodes added yet.</div>
      <q-list v-else dark class="episode-list">
        <template v-for="episode in sortedEpisodes" :key="episode.id">
          <q-item class="episode-item">
            <q-item-section avatar>
              <div class="episode-number-badge">{{ episode.episodeNumber }}</div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="episode-item-title">{{
                episode.title || `Episode ${episode.episodeNumber}`
              }}</q-item-label>
              <q-item-label caption class="episode-item-meta">
                <span v-if="episode.durationMinutes">{{ episode.durationMinutes }} min</span>
                <span v-if="episode.airDate">
                  {{ ' • ' }}{{ new Date(episode.airDate).toLocaleDateString() }}
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="episode-item-actions">
                <q-btn
                  v-if="episode.videoUrl"
                  flat
                  dense
                  round
                  :icon="playingEpisodeId === episode.id ? 'expand_less' : 'play_circle'"
                  color="primary"
                  size="sm"
                  @click="toggleVideoPreview(episode)"
                />
                <q-btn flat dense round icon="edit" size="sm" @click="startEdit(episode)" />
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="confirmDeleteEpisode(episode)"
                />
              </div>
            </q-item-section>
          </q-item>
          <video
            v-if="playingEpisodeId === episode.id"
            :src="episode.videoUrl"
            controls
            autoplay
            class="episode-video-inline"
          />
        </template>
      </q-list>
    </div>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  anime: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const $q = useQuasar()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const episodes = ref([])
const loading = ref(false)
const saving = ref(false)
const editingId = ref(null)
const formError = ref('')
const videoFile = ref(null)
const uploadingVideo = ref(false)
const videoUploadError = ref('')
const playingEpisodeId = ref(null)

function emptyForm() {
  return {
    episodeNumber: null,
    title: '',
    description: '',
    durationMinutes: null,
    airDate: '',
    videoUrl: '',
  }
}

const form = ref(emptyForm())

const sortedEpisodes = computed(() =>
  [...episodes.value].sort((a, b) => a.episodeNumber - b.episodeNumber),
)

function resetForm() {
  editingId.value = null
  formError.value = ''
  videoFile.value = null
  videoUploadError.value = ''
  form.value = emptyForm()
}

async function loadEpisodes() {
  if (!props.anime?.id) return
  loading.value = true
  try {
    const { data } = await api.get(`/watchlist/${props.anime.id}`)
    episodes.value = data.episodes || []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
      playingEpisodeId.value = null
      loadEpisodes()
    }
  },
)

function startEdit(episode) {
  editingId.value = episode.id
  formError.value = ''
  videoFile.value = null
  videoUploadError.value = ''
  form.value = {
    episodeNumber: episode.episodeNumber,
    title: episode.title || '',
    description: episode.description || '',
    durationMinutes: episode.durationMinutes ?? null,
    airDate: episode.airDate ? episode.airDate.slice(0, 10) : '',
    videoUrl: episode.videoUrl || '',
  }
}

function toggleVideoPreview(episode) {
  playingEpisodeId.value = playingEpisodeId.value === episode.id ? null : episode.id
}

async function onVideoFileSelected(file) {
  videoUploadError.value = ''
  if (!file) return

  uploadingVideo.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const { data } = await api.post('/uploads/episode-video', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.value.videoUrl = data.url
  } catch (err) {
    videoUploadError.value = err?.response?.data?.error || 'Unable to upload video'
  } finally {
    uploadingVideo.value = false
  }
}

async function onSubmit() {
  formError.value = ''
  if (!form.value.episodeNumber) {
    formError.value = 'Episode number is required'
    return
  }

  saving.value = true
  try {
    const payload = {
      episodeNumber: form.value.episodeNumber,
      title: form.value.title || null,
      description: form.value.description || null,
      durationMinutes: form.value.durationMinutes || null,
      airDate: form.value.airDate || null,
      videoUrl: form.value.videoUrl || null,
    }

    if (editingId.value) {
      await api.put(`/watchlist/${props.anime.id}/episodes/${editingId.value}`, payload)
    } else {
      await api.post(`/watchlist/${props.anime.id}/episodes`, payload)
    }

    resetForm()
    await loadEpisodes()
    emit('updated')
  } catch (err) {
    formError.value = err?.response?.data?.error || 'Unable to save episode'
  } finally {
    saving.value = false
  }
}

function confirmDeleteEpisode(episode) {
  $q.dialog({
    title: 'Delete Episode',
    message: `Delete episode ${episode.episodeNumber}${episode.title ? ` - ${episode.title}` : ''}?`,
    cancel: true,
    persistent: true,
    dark: true,
  }).onOk(async () => {
    await api.delete(`/watchlist/${props.anime.id}/episodes/${episode.id}`)
    if (editingId.value === episode.id) {
      resetForm()
    }
    if (playingEpisodeId.value === episode.id) {
      playingEpisodeId.value = null
    }
    await loadEpisodes()
    emit('updated')
  })
}
</script>

<style>
.episode-modal-card {
  max-width: 640px;
  width: 100%;
}

.episode-header {
  margin-bottom: 16px;
}

.episode-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.episode-subtitle {
  color: #9a9a9a;
  margin: 4px 0 0;
  font-size: 14px;
}

.episode-form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.episode-input .q-field__control {
  background-color: #242424;
}

.episode-number-input {
  max-width: 110px;
}

.episode-duration-input {
  max-width: 150px;
}

.episode-date-input {
  max-width: 170px;
}

.episode-form-row .episode-input {
  flex: 1;
  min-width: 120px;
}

.episode-error {
  color: #ff6b6b;
  font-size: 13px;
  margin-top: 4px;
}

.episode-video-upload {
  margin-top: 4px;
}

.episode-video-progress {
  margin-top: 6px;
}

.episode-video-preview {
  width: 100%;
  max-height: 220px;
  margin-top: 10px;
  border-radius: 8px;
  background-color: #000000;
}

.episode-video-inline {
  width: 100%;
  max-height: 260px;
  margin: 0 0 8px;
  border-radius: 8px;
  background-color: #000000;
}

.episode-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.episode-cancel {
  color: #9a9a9a;
}

.episode-submit {
  background-color: #b47fff;
  color: #1c1c1c;
  font-weight: 600;
  border-radius: 6px;
}

.episode-separator {
  margin: 20px 0 12px;
}

.episode-loading,
.episode-empty {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  color: #9a9a9a;
}

.episode-list {
  max-height: 320px;
  overflow-y: auto;
  background: transparent;
}

.episode-item {
  background-color: #1c1c1c;
  border-radius: 8px;
  margin-bottom: 8px;
}

.episode-number-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #7c4dff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.episode-item-title {
  color: #ffffff;
  font-weight: 500;
}

.episode-item-meta {
  color: #9a9a9a;
}

.episode-item-actions {
  display: flex;
  gap: 4px;
}
</style>
