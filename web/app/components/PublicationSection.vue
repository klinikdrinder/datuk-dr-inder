<script setup lang="ts">
defineProps<{ publications: any[] }>()
const openIdx = ref<number | null>(null)
</script>
<template>
  <section v-if="publications.length" id="publications" class="sec">
    <div class="wrap">
      <div v-reveal class="sec-head rv">
        <div><div class="eyebrow">Published research</div><h2 class="h2" style="margin-top:22px">Contributing to the <span class="accent">science</span></h2></div>
        <p class="lede">Case reports and papers by Datuk Dr Inder in peer-reviewed aesthetic medicine journals.</p>
      </div>
      <article v-for="(p, i) in publications" :key="i" v-reveal class="pub rv" :style="i ? 'margin-top:20px' : ''">
        <div class="paper" aria-hidden="true">
          <img v-if="p.cover" :src="p.cover.url" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
          <template v-else>
            <div class="j">EXTENDED ABSTRACT</div><div class="t">{{ p.title }}</div><div class="a">{{ p.authors }}</div>
            <div v-for="n in 9" :key="n" class="l" :class="{ s: n % 3 === 0 }" />
          </template>
        </div>
        <div>
          <div class="meta">{{ p.journal }}</div>
          <h3>{{ p.title }}</h3>
          <div class="by">{{ p.authors }} · {{ p.citation }}</div>
          <p class="abs">{{ p.abstract }}</p>
          <div class="acts">
            <button v-if="p.pdf" class="btn btn-red" type="button" @click="openIdx = openIdx === i ? null : i">{{ openIdx === i ? 'Close paper' : 'Read the paper' }}</button>
            <a v-if="p.pdf" class="btn btn-ghost" :href="p.pdf.url" target="_blank" rel="noopener">Download PDF</a>
            <a v-if="p.link" class="btn btn-ghost" :href="p.link" target="_blank" rel="noopener">View at the journal ↗</a>
          </div>
        </div>
        <div v-if="openIdx === i && p.pdf" class="pdf-view" style="grid-column:1/-1">
          <object :data="p.pdf.url" type="application/pdf"><p style="padding:20px">Your browser can’t show the PDF here. <a :href="p.pdf.url" target="_blank" rel="noopener">Open the PDF</a>.</p></object>
        </div>
      </article>
    </div>
  </section>
</template>
