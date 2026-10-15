<script setup lang="ts">
const props = defineProps<{ home: any; press: any[] }>()
const { open } = useLightbox()
const items = computed(() => props.press.map((p) => ({ url: p.image.full || p.image.url, alt: p.image.alt || p.publication, caption: [p.publication, p.headline, p.date && fmtDate(p.date)].filter(Boolean).join(' · ') })))
</script>
<template>
  <section v-if="press.length" id="press" class="sec">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Media</div><h2 class="h2" style="margin-top:22px"><AccentText :text="home.press_title" /></h2></div>
        <p class="lede">Features and interviews in newspapers and magazines. Tap a clipping to read it.</p>
      </div>
      <div class="press-grid">
        <button v-for="(p, i) in press" :key="i" type="button" class="press-item" :aria-label="`Read clipping: ${p.publication}`" @click="open(items, i)">
          <img :src="p.image.url" :alt="p.image.alt || p.publication" loading="lazy">
          <span class="pm"><b>{{ p.publication }}</b>{{ [p.headline, p.date && fmtDate(p.date)].filter(Boolean).join(' · ') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
