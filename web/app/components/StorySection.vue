<script setup lang="ts">
const props = defineProps<{ site: any; home: any; awardsCount: number; awardYears: number }>()
const arch = ref<HTMLElement | null>(null)
useTilt(arch, 10)
</script>
<template>
  <section id="story" class="sec">
    <div class="wrap bio">
      <div v-reveal class="arch-wrap rv">
        <div ref="arch" class="arch" role="img" aria-label="Portrait of Datuk Dr Inderjit Kaur">
          <img class="ph" :src="site.hero_photo?.url" alt="" aria-hidden="true" loading="lazy">
        </div>
        <div class="float-card"><span class="n">{{ site.stat_years?.replace('+', '') }}<span style="color:var(--crimson)">+</span></span><span class="t">years diagnosing and treating hair loss</span></div>
      </div>
      <div v-reveal class="rv">
        <div class="eyebrow">The Founder</div>
        <h2 class="h2"><AccentText :text="home.story_title" /></h2>
        <RichBlocks :blocks="home.story_body" style="margin-top:24px" />
        <div class="stats">
          <div class="stat"><div class="v">{{ site.stat_years?.replace('+', '') }}<em>+</em></div><div class="k">Years in clinical practice</div></div>
          <div class="stat"><div class="v">3</div><div class="k">Hair restoration boards &amp; fellowships</div></div>
          <div class="stat"><div class="v">{{ awardsCount }}</div><div class="k">Awards since 2020</div></div>
          <div class="stat"><div class="v">{{ awardYears }}</div><div class="k">Award years</div></div>
        </div>
      </div>
    </div>
  </section>
</template>
