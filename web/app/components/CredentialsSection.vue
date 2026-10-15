<script setup lang="ts">
const props = defineProps<{ home: any; certificates: any[] }>()
const { open } = useLightbox()
const items = computed(() => props.certificates.map((c) => ({ url: c.image.full || c.image.url, alt: c.image.alt || c.title, caption: [c.title, c.issuer, c.year].filter(Boolean).join(' · ') })))
const ledger = [
  ['i.', 'Diplomate, American Board of Hair Restoration Surgery', 'The ABHRS examination is the specialty’s benchmark for surgical competence.', 'ABHRS'],
  ['ii.', 'Board Certified, International Board of Hair Restoration Surgery', 'International certification covering hair restoration technique and safety.', 'IBHRS'],
  ['iii.', 'Fellow, International Society of Hair Restoration Surgery', 'Fellowship status, and a life member of the ISHRS.', 'FISHRS'],
  ['iv.', 'Life Member, Asian Association of Hair Restoration Surgeons', 'A regional society advancing hair restoration standards across Asia.', 'AAHRS'],
  ['v.', 'Board Certified in Aesthetic Medicine', 'American Academy of Aesthetic Medicine (USA).', 'AAAM'],
  ['vi.', 'Licensed by the Ministry of Health Malaysia', 'MBBS. LCP-certified to practise aesthetic medicine.', 'KKM · LCP'],
]
</script>
<template>
  <section id="credentials" class="sec">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Credentials</div><h2 class="h2" style="margin-top:22px"><AccentText :text="home.credentials_title" /></h2></div>
        <RichBlocks :blocks="home.credentials_body" class="lede" />
      </div>
      <ol v-reveal class="ledger rv">
        <li v-for="l in ledger" :key="l[0]"><span class="num">{{ l[0] }}</span><h3>{{ l[1] }}</h3><p>{{ l[2] }}</p><span class="tag">{{ l[3] }}</span></li>
      </ol>
      <div v-if="certificates.length" v-reveal class="cert-grid rv">
        <button v-for="(c, i) in certificates" :key="i" type="button" class="cert" :aria-label="`View certificate: ${c.title}`" @click="open(items, i)">
          <span class="frame"><img :src="c.image.url" :alt="c.image.alt || c.title" loading="lazy"></span>
          <b>{{ c.title }}</b><span>{{ [c.issuer, c.year].filter(Boolean).join(' · ') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
