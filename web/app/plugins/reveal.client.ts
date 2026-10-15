/** v-reveal: content is visible by default; only elements below the fold animate in. */
export default defineNuxtPlugin((nuxtApp) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const io = 'IntersectionObserver' in window && !reduce
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io!.unobserve(e.target) } }), { threshold: 0.1 })
    : null
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement) {
      if (!io) return
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('armed'); io.observe(el)
        setTimeout(() => el.classList.add('in'), 4000)
      }
    },
  })
})
