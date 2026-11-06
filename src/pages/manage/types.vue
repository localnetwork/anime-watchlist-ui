<template>
  <NameManager endpoint="/types" singular="Type" plural="Types" />
</template>

<script setup>
import NameManager from '@/components/manage/NameManager.vue'
</script>

<route>
{
  "meta": {
    "requiresAuth": true,
    "permissions": ["type.manage"]
  }
}
</route>
