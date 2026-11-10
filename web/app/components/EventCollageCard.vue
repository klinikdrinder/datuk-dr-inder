<script setup lang="ts">
const props = defineProps<{ ev: any }>()
const { openEvent, loading } = useEventPhotos()
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const when = computed(() => {
  const [y, m] = String(props.ev.date || '').split('-')
  return y && m ? `${MONTHS[Number(m) - 1] || ''} ${y}`.trim() : ''
})
const place = computed(() => [props.ev.city, props.ev.international ? props.ev.country : ''].filter(Boolean).join(', '))
// 5+ photos → 5-tile collage, 3–4 → 3 tiles, 1–2 → one photo
const tiles = computed(() => {
  const p = (props.ev.preview || []).filter(Boolean)
  return p.slice(0, p.length >= 5 ? 5 : p.length >= 3 ? 3 : 1)
})
const more = computed(() => Math.max(0, (props.ev.photo_count || 0) - tiles.value.length))
</script>
<template>
  <article class="evc">
    <div class="evc-col" :class="`t${tiles.length}`">
      <button v-for="(p, i) in tiles" :key="p.url + i" type="button" class="evc-tile"
        :aria-label="`Open photo ${i + 1} of ${ev.photo_count}: ${ev.title}`" @click="openEvent(ev, i)">
        <img :src="p.url" :alt="p.alt || ev.title" loading="lazy" decoding="async">
        <span v-if="more && i === tiles.length - 1" class="evc-more" aria-hidden="true">+{{ more }}</span>
      </button>
      <span v-if="loading === ev.id" class="evc-loading" role="status">Opening photos…</span>
    </div>
    <div class="evc-body">
      <div class="evc-tags">
        <span v-if="ev.role" class="evc-tag red">{{ ev.role }}</span>
        <span v-if="ev.international" class="evc-tag">International</span>
        <span v-if="ev.highlight" class="evc-tag">{{ ev.highlight }}</span>
      </div>
      <h3 class="evc-title">{{ ev.title }}</h3>
      <p class="evc-sub">
        <span v-if="place"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></svg>{{ place }}</span>
        <span v-if="when"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>{{ when }}</span>
      </p>
      <p v-if="ev.summary" class="evc-sum">{{ ev.summary }}</p>
      <button type="button" class="evc-link" @click="openEvent(ev, 0)">View all {{ ev.photo_count }} photo{{ ev.photo_count === 1 ? '' : 's' }} →</button>
    </div>
  </article>
</template>
