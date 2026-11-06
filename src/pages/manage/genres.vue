<template>
  <NameManager endpoint="/genres" singular="Genre" plural="Genres" />
</template>

<script setup>
import NameManager from '@/components/manage/NameManager.vue'
</script>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["genre.manage"]
  }
}
</route>
