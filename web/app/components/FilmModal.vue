<script setup lang="ts">
const { film, closeFilm } = useFilm()
const src = computed(() => videoSource(film.value.url))
function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && film.value.open) closeFilm() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
<template>
  <div v-if="film.open" class="lb film-modal" role="dialog" aria-modal="true" aria-label="Introduction film" @click.self="closeFilm()">
    <button class="icon-btn lb-close" style="border-color:rgba(255,255,255,.4);color:#fff" type="button" aria-label="Close" @click="closeFilm()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
    <iframe v-if="src?.kind === 'iframe'" :src="src.src" title="Datuk Dr Inder introduction film" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen />
    <video v-else-if="src" :src="src.src" controls autoplay playsinline />
  </div>
</template>
