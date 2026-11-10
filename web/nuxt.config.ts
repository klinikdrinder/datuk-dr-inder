// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css', '~/assets/css/sections.css'],

  runtimeConfig: {
    // server-only (set in Vercel → Settings → Environment Variables)
    cmsUrl: process.env.NUXT_CMS_URL || 'http://localhost:1337', // NUXT_CMS_URL
    formSecret: '', // NUXT_FORM_SECRET (same value as FORM_SECRET in the CMS)
    revalidateSecret: '', // NUXT_REVALIDATE_SECRET (same value as REVALIDATE_SECRET in the admin)
    public: {
      siteUrl: 'https://datukdrinder.com', // NUXT_PUBLIC_SITE_URL
      mediaUrl: '', // NUXT_PUBLIC_MEDIA_URL e.g. https://cms.datukdrinder.com
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [{ name: 'theme-color', content: '#FCFAF7' }],
    },
  },

  // Pages are cached on Vercel's CDN. The admin refreshes them the moment something is saved
  // (server/api/revalidate.post.ts); the timers below are only a safety net.
  routeRules: {
    '/': { isr: 600 },
    '/events': { isr: 600 },
    '/seminars': { isr: 600 },
    '/seminars/**': { isr: 600 },
    '/journal': { isr: { expiration: 600, allowQuery: ['page', 'category'] } },
    '/journal/**': { isr: 600 },
    '/privacy': { isr: 86400 },
  },

  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
    // lets /api/revalidate rebuild cached pages on demand
    vercel: { config: { bypassToken: process.env.VERCEL_BYPASS_TOKEN } },
  },
})
