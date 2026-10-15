<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const { data, error } = await useFetch(`/api/articles/${slug}`)
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
const a = computed(() => data.value!.article)
const { data: home } = await useFetch('/api/home', { key: 'home' })
const cfg = useRuntimeConfig()
const minutes = computed(() => a.value.minutes || readingMinutes(a.value.body))
useSeoMeta({
  title: () => `${a.value.seo_title || a.value.title} | Datuk Dr Inder`,
  description: () => a.value.seo_description || a.value.excerpt,
  ogType: 'article', ogImage: () => a.value.cover?.url, twitterCard: 'summary_large_image',
})
useHead({
  link: [{ rel: 'canonical', href: `${cfg.public.siteUrl}/journal/${slug}` }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', headline: a.value.title, description: a.value.excerpt,
    image: a.value.cover?.url, datePublished: a.value.date, dateModified: a.value.updated,
    author: { '@type': 'Person', name: a.value.author || 'Datuk Dr Inder' },
    reviewedBy: { '@type': 'Physician', name: 'Datuk Dr Inderjit Kaur (DPSM)' },
    publisher: { '@type': 'Person', name: 'Datuk Dr Inder', url: cfg.public.siteUrl },
  }) }],
})
</script>
<template>
  <div v-if="data">
    <section class="page-hero">
      <div class="wrap">
        <div class="crumbs"><NuxtLink to="/">Home</NuxtLink> / <NuxtLink to="/journal">Journal</NuxtLink></div>
        <div class="eyebrow">{{ a.category?.name || 'Journal' }} · {{ fmtDate(a.date) }} · {{ minutes }} min read</div>
        <h1>{{ a.title }}</h1>
        <p v-if="a.excerpt" class="lede">{{ a.excerpt }}</p>
      </div>
    </section>
    <section class="sec" style="border-top:0;padding-top:10px">
      <div class="wrap article-wrap">
        <article class="article">
          <div v-if="a.cover" class="article-cover"><img :src="a.cover.url" :alt="a.cover.alt || a.title"></div>
          <div class="reviewed">
            <img :src="home?.site.hero_photo?.url" alt="">
            <div><b>Medically reviewed by Datuk Dr Inderjit Kaur</b><span>{{ a.reviewed_by }}</span></div>
          </div>
          <RichBlocks :blocks="a.body" />
          <p class="disclaimer">This article is for general education and is not medical advice. Hair loss has many causes; please see a doctor for a diagnosis. Results vary by individual. Consultation required.</p>
        </article>
        <aside class="side-card">
          <h4>Talk to Datuk Dr Inder’s team</h4>
          <p>Questions about hair loss or treatment? Book a consultation or send photos for a virtual pre-assessment.</p>
          <NuxtLink class="btn btn-red" to="/#consult">Book a consultation</NuxtLink>
        </aside>
      </div>
      <div v-if="data.more.length" class="wrap" style="margin-top:70px">
        <h2 class="eyebrow">More from the journal</h2>
        <div class="j-grid" style="margin-top:24px"><JournalCard v-for="m in data.more" :key="m.slug" :a="m" /></div>
      </div>
    </section>
  </div>
</template>
