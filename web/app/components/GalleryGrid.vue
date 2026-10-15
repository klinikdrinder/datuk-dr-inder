<script setup lang="ts">
const props = withDefaults(defineProps<{ items: any[]; cols?: 2 | 3 | 4; shape?: 'portrait' | 'land' | 'doc' }>(), { cols: 4, shape: 'portrait' })
const { open } = useLightbox()
const lbItems = computed(() => props.items.map((m) => ({ url: m.full || m.url, alt: m.alt, caption: m.caption })))
</script>
<template>
  <div v-if="items.length" class="gallery" :class="`g${cols}`">
    <button v-for="(m, i) in items" :key="m.url + i" type="button" class="g-item" :class="shape === 'land' ? 'land' : shape === 'doc' ? 'doc' : ''"
      :aria-label="`Open photo: ${m.caption || m.alt || 'photo'}`" @click="open(lbItems, i)">
      <img :src="m.url" :alt="m.alt || m.caption || ''" loading="lazy" decoding="async">
      <span v-if="m.caption" class="cap">{{ m.caption }}</span>
    </button>
  </div>
</template>
