<script setup lang="ts">
const props = defineProps<{ site: any; home: any; awardsCount: number; awardYears: number }>()
const arch = ref<HTMLElement | null>(null)
useTilt(arch, 10)
const { open } = useLightbox()
const { openFilm } = useFilm()
const vid = ref<HTMLVideoElement | null>(null)
const fullFilm = computed(() => props.site.story_video_url || props.site.intro_video_url || props.site.story_video?.full || '')
const cert = computed(() => props.site.lcp_certificate)
function openCert() {
  if (cert.value) open([{ url: cert.value.full || cert.value.url, alt: cert.value.alt || 'LCP certificate', caption: props.site.lcp_label }], 0)
}
onMounted(() => {
  // play the silent loop only when visible, and never for reduced-motion users
  const v = vid.value
  if (!v) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return }
  const io = new IntersectionObserver(([e]) => { e!.isIntersecting ? v.play().catch(() => {}) : v.pause() }, { threshold: 0.2 })
  io.observe(v)
})
</script>
<template>
  <section id="story" class="sec">
    <div class="wrap bio">
      <div v-reveal class="arch-wrap rv">
        <div ref="arch" class="arch" :class="{ 'has-video': site.story_video }" role="img" aria-label="Datuk Dr Inderjit Kaur">
          <video v-if="site.story_video" ref="vid" class="arch-video" :src="site.story_video.url" :poster="site.hero_photo?.url" muted loop playsinline preload="metadata" aria-hidden="true" />
          <img v-else class="ph" :src="site.hero_photo?.url" alt="" aria-hidden="true" loading="lazy">
          <button v-if="fullFilm" class="arch-play" type="button" aria-label="Watch Datuk Dr Inder’s video with sound" @click="openFilm(fullFilm)">
            <span class="pc"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg></span>
            <span>Watch</span>
          </button>
        </div>
        <button v-if="cert" type="button" class="cert-card" :aria-label="`View certificate: ${site.lcp_label}`" @click="openCert">
          <span class="cc-frame"><img :src="cert.url" :alt="cert.alt || site.lcp_label" loading="lazy"></span>
          <span class="cc-text"><b>LCP Certified</b><span>{{ site.lcp_label }}</span><em>View certificate →</em></span>
        </button>
        <div v-else class="float-card"><span class="n">{{ site.stat_years?.replace('+', '') }}<span style="color:var(--crimson)">+</span></span><span class="t">years diagnosing and treating hair loss</span></div>
      </div>
      <div v-reveal class="rv">
        <div class="eyebrow">The Founder</div>
        <h2 class="h2"><AccentText :text="home.story_title" /></h2>
        <RichBlocks :blocks="home.story_body" style="margin-top:24px" />
        <div class="stats">
          <div class="stat"><div class="v">{{ site.stat_years?.replace('+', '') }}<em>+</em></div><div class="k">Years in clinical practice</div></div>
          <div class="stat"><div class="v">3</div><div class="k">Hair restoration boards &amp; fellowships</div></div>
          <div class="stat"><div class="v">{{ awardsCount }}</div><div class="k">Awards since 2020</div></div>
          <div class="stat"><div class="v">{{ awardYears }}</div><div class="k">Award years</div></div>
        </div>
      </div>
    </div>
  </section>
</template>
