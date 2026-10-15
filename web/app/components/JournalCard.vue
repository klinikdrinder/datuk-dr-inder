<script setup lang="ts">
defineProps<{ a: any }>()
</script>
<template>
  <NuxtLink class="j-card" :to="`/journal/${a.slug}`">
    <div class="j-cover"><img v-if="a.cover" :src="a.cover.url" :alt="a.cover.alt || ''" loading="lazy"><span v-else class="ph">I</span></div>
    <div class="j-body">
      <span class="j-meta">{{ a.category?.name || 'Journal' }} · {{ fmtDate(a.date) }}</span>
      <h3>{{ a.title }}</h3>
      <p v-if="a.excerpt">{{ a.excerpt }}</p>
      <span class="j-more">Read article →</span>
    </div>
  </NuxtLink>
</template>
