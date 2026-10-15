<script setup lang="ts">
const props = defineProps<{ quote: string }>()
const RED = ['artificial', 'naturally']
const words = computed(() => (props.quote || '').split(/\s+/).filter(Boolean).map((w) => ({ w, red: RED.includes(w.replace(/[^a-z]/gi, '').toLowerCase()) })))
const el = ref<HTMLElement | null>(null)
const lit = ref(9999)
function scan() {
  if (!el.value) return
  const r = el.value.getBoundingClientRect()
  const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)))
  lit.value = Math.round(p * words.value.length)
}
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lit.value = 0; scan(); window.addEventListener('scroll', scan, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', scan))
</script>
<template>
  <section class="sec alt philo" aria-label="Philosophy">
    <div class="wrap">
      <div class="eyebrow">Philosophy</div>
      <blockquote ref="el"><template v-for="(x, i) in words" :key="i"><span class="w" :class="{ red: x.red, on: i < lit }">{{ x.w }}</span>{{ ' ' }}</template></blockquote>
      <cite>— Datuk Dr Inder</cite>
    </div>
  </section>
</template>
