<template>
  <q-page class="q-pa-lg manage-page">
    <div class="manage-header">
      <div>
        <h1 class="manage-title">Manage {{ plural }}</h1>
        <p class="manage-subtitle">Add, rename, or remove {{ plural.toLowerCase() }}.</p>
      </div>

      <q-btn
        :label="`Add ${singular}`"
        icon="add"
        no-caps
        unelevated
        class="add-btn"
        @click="openCreate"
      />
    </div>

    <q-input
      v-model="search"
      :label="`Search ${plural.toLowerCase()}`"
      dark
      filled
      dense
      clearable
      class="search-input"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <div v-if="loading" class="manage-empty">
      <q-spinner color="primary" size="32px" />
    </div>
    <div v-else-if="!filteredItems.length" class="manage-empty">
      No {{ plural.toLowerCase() }} found.
    </div>
    <div v-else class="item-list">
      <div v-for="item in filteredItems" :key="item.id" class="item-row">
        <span class="item-name">{{ item.name }}</span>
        <div class="item-actions">
          <q-btn flat dense round icon="edit" @click="openEdit(item)" />
          <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(item)" />
        </div>
      </div>
    </div>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card dark class="name-dialog">
        <q-card-section>
          <div class="text-h6">{{ editing ? `Edit ${singular}` : `Add ${singular}` }}</div>
        </q-card-section>

        <q-form @submit.prevent="save">
          <q-card-section class="q-pt-none">
            <q-input
              v-model="name"
              label="Name"
              dark
              filled
              autofocus
              :rules="[(val) => !!val?.trim() || 'Name is required']"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat no-caps label="Cancel" :disable="saving" @click="dialogOpen = false" />
            <q-btn
              unelevated
              no-caps
              type="submit"
              label="Save"
              class="add-btn"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

const props = defineProps({
  endpoint: { type: String, required: true },
  singular: { type: String, required: true },
  plural: { type: String, required: true },
})

const $q = useQuasar()

const items = ref([])
const loading = ref(false)
const search = ref('')
const dialogOpen = ref(false)
const editing = ref(null)
const name = ref('')
const saving = ref(false)

const filteredItems = computed(() => {
  const term = (search.value || '').trim().toLowerCase()
  return term ? items.value.filter((item) => item.name.toLowerCase().includes(term)) : items.value
})

function notifyError(err) {
  $q.notify({
    type: 'negative',
    message: err.response?.data?.error || `Failed to save ${props.singular.toLowerCase()}`,
  })
}

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await api.get(props.endpoint)
    items.value = data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  name.value = ''
  dialogOpen.value = true
}

function openEdit(item) {
  editing.value = item
  name.value = item.name
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = { name: name.value.trim() }
    if (editing.value) {
      await api.put(`${props.endpoint}/${editing.value.id}`, payload)
    } else {
      await api.post(props.endpoint, payload)
    }
    dialogOpen.value = false
    await fetchItems()
  } catch (err) {
    notifyError(err)
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: `Delete ${props.singular}`,
    message: `Are you sure you want to delete "${item.name}"? It will be removed from all anime.`,
    cancel: true,
    persistent: true,
    dark: true,
  }).onOk(async () => {
    try {
      await api.delete(`${props.endpoint}/${item.id}`)
      await fetchItems()
    } catch (err) {
      notifyError(err)
    }
  })
}

onMounted(fetchItems)
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

.search-input {
  margin-bottom: 20px;
}

.search-input :deep(.q-field__control) {
  background-color: #242424;
}

.manage-empty {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  color: #9a9a9a;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1c1c1c;
  border-radius: 10px;
  padding: 8px 8px 8px 16px;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.name-dialog {
  min-width: 320px;
  background-color: #1c1c1c;
}

@media (max-width: 768px) {
  .manage-page {
    padding: 12px;
  }

  .manage-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .manage-header .add-btn {
    width: 100%;
  }
}
</style>
