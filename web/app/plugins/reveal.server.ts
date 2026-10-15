export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', { getSSRProps: () => ({}) })
})
