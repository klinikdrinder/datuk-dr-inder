<script setup lang="ts">
const props = defineProps<{ home: any; press: any[] }>()
const { open } = useLightbox()
const LIMIT = 12
const showAll = ref(false)
const shown = computed(() => (showAll.value ? props.press : props.press.slice(0, LIMIT)))
const year = (d?: string) => String(d || '').slice(0, 4)
const since = computed(() => props.press.map((p) => year(p.date)).filter(Boolean).sort()[0] || '')
const label = (p: any) => [p.publication, p.headline, year(p.date)].filter(Boolean).join(' · ')
// open every page of one clipping in the viewer
function read(p: any) {
  const pages = (p.pages?.length ? p.pages : [p.image]).map((m: any, i: number, a: any[]) => ({
    url: m.full || m.url, alt: m.alt || p.publication, caption: a.length > 1 ? `${label(p)} — page ${i + 1} of ${a.length}` : label(p),
  }))
  open(pages, 0)
}
</script>
<template>
  <section v-if="press.length" id="press" class="sec mag-sec">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Datuk Dr Inder in magazines</div><h2 class="h2" style="margin-top:22px"><AccentText :text="home.press_title" /></h2></div>
        <div class="mag-side">
          <p class="lede">Interviews and features in newspapers and magazines. Select a clipping to read it.</p>
          <div class="mag-count"><b>{{ press.length }}</b><span>feature{{ press.length === 1 ? '' : 's' }}{{ since ? ` since ${since}` : '' }}</span></div>
        </div>
      </div>
      <div class="mag-wall">
        <figure v-for="(p, i) in shown" :key="i" class="mag">
          <button type="button" class="mag-paper" :aria-label="`Read: ${label(p)}`" @click="read(p)">
            <img :src="p.image.url" :alt="p.image.alt || `${p.publication} feature on Datuk Dr Inder`" loading="lazy" decoding="async">
            <span v-if="p.pages?.length > 1" class="mag-pages">{{ p.pages.length }} pages</span>
            <span class="mag-read" aria-hidden="true">Read</span>
          </button>
          <figcaption>
            <b>{{ p.publication }}</b>
            <span v-if="p.headline" class="h">{{ p.headline }}</span>
            <span class="y"><template v-if="year(p.date)">{{ year(p.date) }}</template><a v-if="p.link" :href="p.link" target="_blank" rel="noopener">Read online ↗</a></span>
          </figcaption>
        </figure>
      </div>
      <div v-if="press.length > LIMIT" class="ev-more">
        <button type="button" class="btn btn-ghost" @click="showAll = !showAll">{{ showAll ? 'Show fewer' : `Show all ${press.length} features` }}</button>
      </div>
    </div>
  </section>
</template>
