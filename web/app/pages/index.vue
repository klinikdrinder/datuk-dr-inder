<script setup lang="ts">
const { data } = await useFetch('/api/home', { key: 'home' })
const d = computed(() => data.value!)
const awardsCount = computed(() => d.value.awards.length)
const awardYears = computed(() => new Set(d.value.awards.map((a: any) => String(a.year).slice(0, 4))).size)
const cfg = useRuntimeConfig()
useSeoMeta({
  title: () => d.value.site.seo_title,
  description: () => d.value.site.seo_description,
  ogTitle: () => d.value.site.seo_title,
  ogDescription: () => d.value.site.seo_description,
  ogType: 'profile',
  ogImage: () => d.value.site.og_image?.url || `${cfg.public.siteUrl}/images/datuk-dr-inder-hero.webp`,
  twitterCard: 'summary_large_image',
})
useHead({
  link: [{ rel: 'canonical', href: cfg.public.siteUrl + '/' }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Physician',
      name: 'Datuk Dr Inderjit Kaur (DPSM)', alternateName: 'Datuk Dr Inder', url: cfg.public.siteUrl,
      image: `${cfg.public.siteUrl}/images/datuk-dr-inder-hero.webp`,
      medicalSpecialty: 'Dermatology', description: d.value.site.seo_description,
      address: { '@type': 'PostalAddress', streetAddress: d.value.site.address_line1, addressLocality: 'Petaling Jaya', postalCode: '46000', addressRegion: 'Selangor', addressCountry: 'MY' },
      telephone: '+' + d.value.site.whatsapp_number,
      memberOf: ['International Society of Hair Restoration Surgery', 'Asian Association of Hair Restoration Surgeons', 'FUE Society Malaysia'].map((name) => ({ '@type': 'Organization', name })),
      sameAs: [`https://www.instagram.com/${d.value.home.instagram_handle}/`],
    }),
  }],
})
</script>

<template>
  <div v-if="d">
    <HeroSection :site="d.site" :logos="d.logos" :awards-count="awardsCount" />
    <StorySection :site="d.site" :home="d.home" :awards-count="awardsCount" :award-years="awardYears" />
    <PhilosophySection :quote="d.home.philosophy_quote" />
    <CredentialsSection :home="d.home" :certificates="d.certificates" />
    <ExpertiseSection :home="d.home" />
    <LeadershipSection :home="d.home" />
    <AwardsSection :home="d.home" :awards="d.awards" />
    <PublicationSection :publications="d.publications" />
    <ClinicSection :home="d.home" :site="d.site" />
    <PressSection :home="d.home" :press="d.press" />
    <InstagramSection :home="d.home" :instagram="d.instagram" />
    <SeminarsSection :seminars="d.seminars" :site="d.site" />
    <JournalSection :articles="d.articles" />
    <ConsultSection :site="d.site" />
  </div>
</template>
