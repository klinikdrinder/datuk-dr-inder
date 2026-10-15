<script setup lang="ts">
defineProps<{ home: any }>()
</script>
<template>
  <section id="leadership" class="sec">
    <div class="wrap">
      <div class="lead-grid">
        <div v-reveal class="rv">
          <div class="eyebrow">Leadership</div>
          <h2 class="h2" style="margin-top:22px"><AccentText :text="home.leadership_title" /></h2>
          <RichBlocks :blocks="home.leadership_body" style="margin-top:24px" />
          <div class="mentors"><span class="mchip">Dr John Cole</span><span class="mchip">Dr Sanusi Umar</span><span class="mchip">ISHRS World Congress</span></div>
        </div>
        <ol v-reveal class="timeline rv" aria-label="Recent milestones">
          <li class="now"><span class="y">2025</span><h3>ISHRS World Congress, Berlin</h3><p>Attended the annual congress of the International Society of Hair Restoration Surgery.</p></li>
          <li class="now"><span class="y">2025</span><h3>Aesthetic &amp; Anti-Aging Medicine World Congress, South Asia</h3><p>Continued education in aesthetic and regenerative medicine.</p></li>
          <li><span class="y">Ongoing</span><h3>President, FUE Society Malaysia</h3><p>Leads the national society for follicular unit extraction.</p></li>
          <li><span class="y">Recognition</span><h3>Featured by Cole Instruments</h3><p>Her testimonial and results are published by the inventor of widely used FUE instruments.</p></li>
        </ol>
      </div>
      <GalleryGrid v-if="home.leadership_photos?.length" v-reveal class="rv" :items="home.leadership_photos" :cols="4" shape="land" />
    </div>
  </section>
</template>
