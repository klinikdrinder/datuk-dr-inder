<script setup lang="ts">
const props = defineProps<{ home: any }>()
// photoKey = which "Card photos" slot in the admin belongs to this card
const cards = [
  { art: 'igraft', photoKey: 'fue', title: 'iGraft Long-Hair FUE', text: 'FUE performed with the hair left long, so there is no need to shave the head and the design can be judged on the day.', unit: 'Unshaven · ', unitB: 'Same-day preview' },
  { art: 'hairline', photoKey: 'hairline', title: 'Hairline Design & Temple Blending', text: 'Hairlines designed to fit the face and age, with soft, irregular edges blended into the temples.', unit: 'Design · ', unitB: 'Density · Direction' },
  { art: 'donor', photoKey: 'brow', title: 'Donor Assessment & Long-Term Planning', text: 'The donor area is mapped and protected, so grafts are used wisely and future hair loss is planned for.', unit: 'Donor mapping · ', unitB: 'Graft budget' },
  { art: 'corrective', photoKey: 'beard', title: 'Corrective Hair Transplantation', text: 'Repair of earlier transplants: unnatural hairlines, pluggy grafts or visible scars refined to look natural.', unit: 'Repair · ', unitB: 'Refinement' },
]
/** Photo uploaded in the admin for this card (Page sections → Expertise → Card photos), if any. */
const photoFor = (key: string) => props.home?.[`expertise_${key}_photo`] || null
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
            <figure v-if="photoFor(c.photoKey)" class="card-photo">
              <img :src="photoFor(c.photoKey).url" :alt="photoFor(c.photoKey).alt || c.title" loading="lazy" decoding="async">
            </figure>
            <canvas v-else :data-art="c.art" aria-hidden="true" />
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
