<template>
  <div class="anime-logo">
    <q-icon name="movie" />
  </div>

  <h1 class="anime-title">{{ isEditing ? 'Edit Anime' : 'Add Anime' }}</h1>
  <p class="anime-subtitle">
    {{ isEditing ? 'Update the details of this watchlist entry.' : 'Add a new anime to the watchlist.' }}
  </p>

  <q-form class="q-gutter-md" @submit.prevent="onSubmit">
    <div class="cover-upload">
      <q-avatar square size="120px" class="cover-preview">
        <img v-if="form.coverImageUrl" :src="form.coverImageUrl" alt="Cover preview" />
        <q-icon v-else name="image" size="48px" color="grey-6" />
      </q-avatar>

      <div class="cover-upload-actions">
        <q-file
          v-model="coverFile"
          label="Cover image"
          dark
          filled
          dense
          accept="image/png,image/jpeg,image/webp,image/gif"
          class="anime-input cover-input"
          :loading="uploading"
          @update:model-value="onCoverFileSelected"
        >
          <template #prepend>
            <q-icon name="upload" />
          </template>
        </q-file>
        <div v-if="uploadError" class="anime-error">{{ uploadError }}</div>
      </div>
    </div>

    <q-input
      v-model="form.title"
      label="Title"
      dark
      filled
      class="anime-input"
      :rules="[(val) => !!val || 'Title is required']"
    />

    <q-input
      v-model="form.description"
      label="Description"
      type="textarea"
      dark
      filled
      class="anime-input"
      :rules="[(val) => !!val || 'Description is required']"
    />

    <div class="anime-row">
      <q-select
        v-model="form.status"
        :options="statusOptions"
        label="Status"
        dark
        filled
        emit-value
        map-options
        class="anime-input"
      />

      <q-select
        v-model="form.typeId"
        :options="typeOptions"
        label="Type"
        dark
        filled
        emit-value
        map-options
        clearable
        class="anime-input"
      />

      <q-input
        v-model.number="form.rating"
        label="Rating (1-10)"
        type="number"
        min="1"
        max="10"
        dark
        filled
        clearable
        class="anime-input"
      />
    </div>

    <q-select
      v-model="form.genreIds"
      :options="genreOptions"
      label="Genres"
      dark
      filled
      multiple
      emit-value
      map-options
      use-chips
      class="anime-input"
    />

    <q-select
      v-model="form.authorIds"
      :options="authorOptions"
      label="Authors"
      dark
      filled
      multiple
      emit-value
      map-options
      use-chips
      class="anime-input"
    />

    <q-input v-model="form.notes" label="Notes" type="textarea" dark filled class="anime-input" />

    <div v-if="errorMessage" class="anime-error">{{ errorMessage }}</div>

    <div class="anime-actions">
      <q-btn label="Cancel" flat no-caps class="anime-cancel" @click="emit('cancel')" />
      <q-btn
        type="submit"
        :label="isEditing ? 'Save Changes' : 'Add Anime'"
        class="anime-submit"
        :loading="loading"
        no-caps
        unelevated
      />
    </div>
  </q-form>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '@/boot/axios'

const props = defineProps({
  anime: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success', 'cancel'])

const isEditing = computed(() => Boolean(props.anime?.id))

const statusOptions = [
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Dropped', value: 'DROPPED' },
]

const genreOptions = ref([])
const authorOptions = ref([])
const typeOptions = ref([])

const coverFile = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  title: props.anime?.title || '',
  description: props.anime?.description || '',
  coverImageUrl: props.anime?.coverImageUrl || '',
  status: props.anime?.status || 'PLANNED',
  typeId: props.anime?.type?.id || null,
  rating: props.anime?.rating ?? null,
  notes: props.anime?.notes || '',
  genreIds: props.anime?.genres?.map((genre) => genre.id) || [],
  authorIds: props.anime?.authors?.map((author) => author.id) || [],
})

async function loadOptions() {
  const [genresRes, authorsRes, typesRes] = await Promise.all([
    api.get('/genres'),
    api.get('/authors'),
    api.get('/types'),
  ])

  genreOptions.value = genresRes.data.map((genre) => ({ label: genre.name, value: genre.id }))
  authorOptions.value = authorsRes.data.map((author) => ({ label: author.name, value: author.id }))
  typeOptions.value = typesRes.data.map((type) => ({ label: type.name, value: type.id }))
}

onMounted(loadOptions)

async function onCoverFileSelected(file) {
  uploadError.value = ''
  if (!file) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    const { data } = await api.post('/uploads/cover', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.coverImageUrl = data.url
  } catch (err) {
    uploadError.value = err?.response?.data?.error || 'Unable to upload image'
  } finally {
    uploading.value = false
  }
}

async function onSubmit() {
  errorMessage.value = ''

  if (!form.coverImageUrl) {
    errorMessage.value = 'Please upload a cover image'
    return
  }

  loading.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description,
      coverImageUrl: form.coverImageUrl,
      status: form.status,
      typeId: form.typeId || null,
      rating: form.rating === '' ? null : form.rating,
      notes: form.notes,
      genreIds: form.genreIds,
      authorIds: form.authorIds,
    }

    const { data } = isEditing.value
      ? await api.put(`/watchlist/${props.anime.id}`, payload)
      : await api.post('/watchlist', payload)

    emit('success', data)
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || 'Unable to save anime'
  } finally {
    loading.value = false
  }
}
</script>
