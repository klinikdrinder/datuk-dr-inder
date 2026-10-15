<script setup lang="ts">
defineProps<{ home: any }>()
const cards = [
  { art: 'hairline', title: 'Hairline restoration', text: 'Hairlines designed to fit the face and the patient’s age, with the irregular edge of a natural hairline.', unit: 'Design · ', unitB: 'Density · Direction' },
  { art: 'fue', title: 'FUE hair transplantation', text: 'Follicular Unit Extraction, which removes grafts one unit at a time and leaves no linear scar.', unit: 'Grafts of ', unitB: '1–4 hairs' },
  { art: 'brow', title: 'Eyebrow design & restoration', text: 'Brows planned hair by hair, following the angle and direction of natural growth.', unit: 'Facial hair · ', unitB: 'Single-hair grafts' },
  { art: 'beard', title: 'Beard restoration', text: 'Fuller, even beards and moustaches for patchy or scarred areas.', unit: 'Facial hair · ', unitB: 'Contour · Coverage' },
]
const root = ref<HTMLElement | null>(null)
let timer: any
onMounted(() => {
  const canv = [...(root.value?.querySelectorAll('canvas[data-art]') || [])] as HTMLCanvasElement[]
  const draw = (t: number) => canv.forEach((c) => drawArt(c, t))
  draw(0)
  window.addEventListener('resize', () => draw(0))
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { let t = 0; timer = setInterval(() => { t += 0.25; draw(t) }, 120) }
  const fine = matchMedia('(pointer: fine)').matches
  if (fine) root.value?.querySelectorAll<HTMLElement>('.card').forEach((e) => {
    e.addEventListener('pointermove', (ev) => {
      const r = e.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height
      e.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 14}deg)`
      e.style.setProperty('--mx', px * 100 + '%'); e.style.setProperty('--my', py * 100 + '%')
    })
    e.addEventListener('pointerleave', () => { e.style.transform = '' })
  })
})
onBeforeUnmount(() => clearInterval(timer))
</script>
<template>
  <section id="expertise" ref="root" class="sec alt">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Expertise</div><h2 class="h2" style="margin-top:22px"><AccentText :text="home.expertise_title" /></h2></div>
        <RichBlocks :blocks="home.expertise_body" class="lede" />
      </div>
      <div class="cards">
        <div v-for="c in cards" :key="c.art" v-reveal class="tilt rv">
          <article class="card">
            <span class="glare" />
            <canvas :data-art="c.art" aria-hidden="true" />
            <h3>{{ c.title }}</h3>
            <p>{{ c.text }}</p>
            <div class="unit">{{ c.unit }}<b>{{ c.unitB }}</b></div>
          </article>
        </div>
      </div>
      <GalleryGrid v-if="home.expertise_photos?.length" v-reveal class="rv" :items="home.expertise_photos" :cols="4" />
    </div>
  </section>
</template>
