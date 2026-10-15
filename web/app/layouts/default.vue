<script setup lang="ts">
const route = useRoute()
const home = computed(() => route.path === '/')
const h = (id: string) => (home.value ? `#${id}` : `/#${id}`)
const solid = ref(false)
const progress = ref(0)
const cur = ref<HTMLElement | null>(null)
const { data } = await useFetch('/api/home', { key: 'home' })
const site = computed(() => data.value?.site || {})
const wa = computed(() => waLink(site.value.whatsapp_number || '60125174606', 'Hello, I would like to arrange a consultation with Datuk Dr Inder.'))

function onScroll() {
  const d = document.documentElement
  const max = d.scrollHeight - d.clientHeight
  progress.value = max > 0 ? (d.scrollTop / max) * 100 : 0
  solid.value = d.scrollTop > 40 || !home.value
}
let raf = 0
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  const fine = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
  if (fine && cur.value) {
    let x = 0, y = 0, cx = 0, cy = 0
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.value!.style.opacity = '1' })
    document.addEventListener('pointerover', (e) => {
      const t = (e.target as HTMLElement)?.closest?.('a,button,.card,.ring-stage,.g-item,.ig-post')
      cur.value?.classList.toggle('big', !!t)
    })
    const loop = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; if (cur.value) cur.value.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop) }
    loop()
  }
})
watch(() => route.path, () => nextTick(onScroll))
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) })
</script>

<template>
  <div>
    <div id="progress" :style="{ width: progress + '%' }" />
    <div id="cur" ref="cur" aria-hidden="true" />
    <nav class="nav" :class="{ solid }" aria-label="Main">
      <div class="wrap">
        <NuxtLink class="mark" to="/">Datuk Dr <i>Inder</i></NuxtLink>
        <ul>
          <li><a :href="h('story')">Story</a></li>
          <li><a :href="h('credentials')">Credentials</a></li>
          <li><a :href="h('expertise')">Expertise</a></li>
          <li><a :href="h('awards')">Awards</a></li>
          <li><NuxtLink to="/seminars">Seminars</NuxtLink></li>
          <li><NuxtLink to="/journal">Journal</NuxtLink></li>
        </ul>
        <div class="nav-r">
          <a class="btn btn-red" :href="h('consult')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2L4 20z" /></svg><span>Consultation</span></a>
        </div>
      </div>
    </nav>

    <main id="top"><slot /></main>

    <footer>
      <div class="wrap">
        <span>© {{ new Date().getFullYear() }} Datuk Dr Inder · <NuxtLink class="foot-admin" to="/privacy">Privacy</NuxtLink></span>
        <span class="disc">Information on this website is for general education and does not replace a medical consultation. Results vary by individual. Consultation required.</span>
      </div>
    </footer>

    <div class="mbar">
      <a class="btn btn-ghost" :href="wa" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-red" :href="h('consult')">Book</a>
    </div>
    <TheLightbox />
    <FilmModal />
  </div>
</template>
