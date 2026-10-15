<script setup lang="ts">
const { state, close, go } = useLightbox()
const cur = computed(() => state.value.items[state.value.index])
function onKey(e: KeyboardEvent) {
  if (!state.value.open) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(() => state.value.open, (o) => { if (import.meta.client) document.body.style.overflow = o ? 'hidden' : '' })
</script>
<template>
  <div v-if="state.open && cur" class="lbx" role="dialog" aria-modal="true" :aria-label="cur.caption || 'Photo viewer'" @click.self="close()">
    <button class="lbx-btn lbx-close" type="button" aria-label="Close" @click="close()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
    <figure @click.self="close()">
      <img :src="cur.full || cur.url" :alt="cur.alt || cur.caption || ''">
    </figure>
    <div>
      <figcaption v-if="cur.caption">{{ cur.caption }}</figcaption>
      <div v-if="state.items.length > 1" class="lbx-count">{{ state.index + 1 }} / {{ state.items.length }}</div>
    </div>
    <template v-if="state.items.length > 1">
      <button class="lbx-btn lbx-prev" type="button" aria-label="Previous" @click="go(-1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7" /></svg></button>
      <button class="lbx-btn lbx-next" type="button" aria-label="Next" @click="go(1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7" /></svg></button>
    </template>
  </div>
</template>
