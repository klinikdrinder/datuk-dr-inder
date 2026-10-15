<script setup lang="ts">
const props = defineProps<{ home: any; awards: any[] }>()
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty', 'Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five']
const word = (n: number) => WORDS[n] || String(n)
const ring = computed(() => props.awards.filter((a) => a.ring))
const certs = computed(() => props.awards.filter((a) => a.cert).map((a) => ({ ...a.cert, caption: a.cert.caption || `${a.title} · ${a.by} ${a.year}` })))
const years = computed(() => [...new Set(props.awards.map((a) => String(a.year).slice(0, 4)))].sort())

const stage = ref<HTMLElement | null>(null)
const ringEl = ref<HTMLElement | null>(null)
const idx = ref(0)
let angle = 0, target = 0, radius = 0, step = 0, raf = 0, dragging = false, lastX = 0, vel = 0, hover = false

function layout() {
  const cards = [...(ringEl.value?.children || [])] as HTMLElement[]
  if (!cards.length || !cards[0]!.offsetWidth) return
  const n = cards.length; step = 360 / n
  radius = Math.round((cards[0]!.offsetWidth + 18) / (2 * Math.tan(Math.PI / n)))
  cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)` })
}
function paint() {
  if (!ringEl.value) return
  ringEl.value.style.transform = `translateZ(${-radius}px) rotateX(-4deg) rotateY(${angle}deg)`
  const n = ring.value.length || 1
  idx.value = ((Math.round(-angle / step) % n) + n) % n
}
const prev = () => { target = Math.round(angle / step) * step + step }
const next = () => { target = Math.round(angle / step) * step - step }
onMounted(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  layout(); paint()
  window.addEventListener('resize', () => { layout(); paint() })
  const s = stage.value!
  s.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; vel = 0; s.setPointerCapture(e.pointerId) })
  s.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; angle += dx * 0.25; vel = dx * 0.25; target = angle; paint() })
  const end = () => { if (!dragging) return; dragging = false; target = Math.round((angle + vel * 6) / step) * step }
  s.addEventListener('pointerup', end); s.addEventListener('pointercancel', end)
  s.addEventListener('pointerenter', () => (hover = true)); s.addEventListener('pointerleave', () => (hover = false))
  s.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { prev(); e.preventDefault() } if (e.key === 'ArrowRight') { next(); e.preventDefault() } })
  let visible = true
  const io = new IntersectionObserver((es) => { visible = es[0]!.isIntersecting }); io.observe(s)
  const spin = () => {
    raf = requestAnimationFrame(spin)
    if (!visible || dragging) return
    if (!reduce && !hover) target -= 0.06
    angle += (target - angle) * (reduce ? 1 : 0.08)
    paint()
  }
  spin()
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>
<template>
  <section id="awards" class="sec alt">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Recognition</div><h2 class="h2" style="margin-top:22px">{{ word(awards.length) }} awards across <span class="accent">{{ word(years.length).toLowerCase() }} years</span></h2></div>
        <div class="lede"><RichBlocks :blocks="home.awards_body" /></div>
      </div>
      <div ref="stage" class="ring-stage" tabindex="0" aria-label="Awards carousel, use left and right arrow keys">
        <div ref="ringEl" class="ring" role="list">
          <article v-for="(a, i) in ring" :key="i" class="award" :class="{ front: i === idx }" role="listitem">
            <svg class="laurel" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20 34c-7-2-12-8-12-16M20 34c7-2 12-8 12-16" /><path d="M9 25c-3 0-5-2-5-4 3 0 5 2 5 4zM8 19c-3-1-4-3-4-5 3 1 4 3 4 5zM9 13c-2-2-2-4-1-6 2 2 2 4 1 6zM31 25c3 0 5-2 5-4-3 0-5 2-5 4zM32 19c3-1 4-3 4-5-3 1-4 3-4 5zM31 13c2-2 2-4 1-6-2 2-2 4-1 6z" /></svg>
            <div class="yr">{{ a.year }}</div>
            <h3>{{ a.title }}</h3>
            <div class="by">{{ a.by }}</div>
          </article>
        </div>
      </div>
      <div class="ring-ctrl">
        <button class="icon-btn" type="button" aria-label="Previous award" @click="prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7" /></svg></button>
        <span class="ring-count" aria-live="polite">{{ String(idx + 1).padStart(2, '0') }} / {{ ring.length }}</span>
        <button class="icon-btn" type="button" aria-label="Next award" @click="next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <GalleryGrid v-if="home.award_photos?.length" v-reveal class="rv" :items="home.award_photos" :cols="4" />
      <template v-if="certs.length">
        <h3 class="eyebrow" style="margin-top:56px">Award certificates</h3>
        <GalleryGrid :items="certs" :cols="4" shape="doc" />
      </template>
    </div>
  </section>
</template>
