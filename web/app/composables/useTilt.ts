export function useTilt(el: Ref<HTMLElement | null>, max = 14) {
  onMounted(() => {
    const e = el.value
    if (!e || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.addEventListener('pointermove', (ev) => {
      const r = e.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height
      e.style.transform = `rotateY(${(px - 0.5) * max}deg) rotateX(${(0.5 - py) * max}deg)`
      e.style.setProperty('--mx', px * 100 + '%'); e.style.setProperty('--my', py * 100 + '%')
    })
    e.addEventListener('pointerleave', () => { e.style.transform = '' })
  })
}
