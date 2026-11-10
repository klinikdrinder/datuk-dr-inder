<script setup lang="ts">
const props = defineProps<{ ev: any; big?: boolean }>()
const { openEvent, loading } = useEventPhotos()
// Fixed month names: server and browser can disagree on short months ("Sep" vs "Sept"), which breaks hydration.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const when = computed(() => {
  const [y, m] = String(props.ev.date || '').split('-')
  return y && m ? `${MONTHS[Number(m) - 1] || ''} ${y}`.trim() : ''
})
const place = computed(() => [props.ev.city, props.ev.international ? props.ev.country : ''].filter(Boolean).join(', '))
</script>
<template>
  <button type="button" class="ev-card" :class="{ big }" :aria-label="`View ${ev.photo_count} photos: ${ev.title}`" @click="openEvent(ev)">
    <img v-if="ev.cover" class="ev-img" :src="ev.cover.url" :alt="ev.cover.alt || ev.title" loading="lazy" decoding="async">
    <span v-else class="ev-img ev-empty" aria-hidden="true" />
    <span class="ev-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></svg>{{ loading === ev.id ? 'Opening…' : `${ev.photo_count} photo${ev.photo_count === 1 ? '' : 's'}` }}</span>
    <span class="ev-meta">
      <span class="ev-tags">
        <span v-if="ev.role" class="ev-tag red">{{ ev.role }}</span>
        <span v-if="ev.international" class="ev-tag">International</span>
        <span v-if="ev.highlight" class="ev-tag">{{ ev.highlight }}</span>
      </span>
      <span class="ev-title">{{ ev.title }}</span>
      <span class="ev-sub"><span v-if="place">{{ place }}</span><span v-if="when">{{ when }}</span></span>
      <span v-if="big && ev.summary" class="ev-sum">{{ ev.summary }}</span>
    </span>
  </button>
</template>
